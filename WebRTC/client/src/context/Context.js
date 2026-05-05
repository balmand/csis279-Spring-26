import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SIGNAL_URL =
  process.env.REACT_APP_SIGNALING_URL || 'http://127.0.0.1:3001';

const SocketContext = createContext();

const socket = io(SIGNAL_URL, { transports: ['websocket', 'polling'] });

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [userStream, setUserStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const [mediaError, setMediaError] = useState(null);
  const [remoteName, setRemoteName] = useState('');

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef(null);
  const remoteIdRef = useRef(null);
  const callRef = useRef({});
  const callEndedRef = useRef(false);
  const userStreamRef = useRef(undefined);
  const meRef = useRef('');

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  useEffect(() => {
    callEndedRef.current = callEnded;
  }, [callEnded]);

  useEffect(() => {
    userStreamRef.current = userStream;
  }, [userStream]);

  const destroyPeer = useCallback(() => {
    if (!connectionRef.current) return;
    const peer = connectionRef.current;
    connectionRef.current = null;
    try {
      peer.removeAllListeners();
      peer.destroy();
    } catch (e) {
      console.warn('Peer cleanup:', e);
    }
  }, []);

  const resetCallUi = useCallback(() => {
    setCallAccepted(false);
    setCallEnded(false);
    setCall({});
    setUserStream(undefined);
    setRemoteName('');
    remoteIdRef.current = null;
  }, []);

  const ensureLocalStream = useCallback(async () => {
    const hasLiveTrack =
      stream &&
      stream.getTracks().some((t) => t.readyState === 'live');
    if (hasLiveTrack) return stream;
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaError(null);
      setStream(currentStream);
      return currentStream;
    } catch (err) {
      const message =
        err?.message || 'Could not access camera or microphone';
      setMediaError(message);
      console.error(err);
      throw err;
    }
  }, [stream]);

  const attachPeerHooks = useCallback(
    (peer) => {
      peer.on('stream', (currentStream) => {
        setUserStream(currentStream);
      });
      peer.on('close', () => {
        if (connectionRef.current === peer) {
          connectionRef.current = null;
        }
        resetCallUi();
      });
      peer.on('error', (err) => {
        console.error('Peer error:', err);
      });
    },
    [resetCallUi],
  );

  const answerCall = useCallback(async () => {
    const incoming = callRef.current;
    if (!incoming?.signal || !incoming.from) return;

    let media;
    try {
      media = await ensureLocalStream();
    } catch {
      return;
    }

    setCallAccepted(true);
    remoteIdRef.current = incoming.from;

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: media,
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: incoming.from });
    });

    attachPeerHooks(peer);
    peer.signal(incoming.signal);
    connectionRef.current = peer;
  }, [attachPeerHooks, ensureLocalStream]);

  const callUser = useCallback(
    async (id) => {
      const trimmed = typeof id === 'string' ? id.trim() : '';
      if (!trimmed) return;

      let media;
      try {
        media = await ensureLocalStream();
      } catch {
        return;
      }

      destroyPeer();
      setCallEnded(false);
      setUserStream(undefined);
      setCallAccepted(false);
      remoteIdRef.current = trimmed;
      setRemoteName('Remote peer');

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: media,
      });

      peer.on('signal', (data) => {
        socket.emit('callUser', {
          userToCall: trimmed,
          signalData: data,
          from: meRef.current,
          name,
        });
      });

      attachPeerHooks(peer);
      connectionRef.current = peer;
    },
    [attachPeerHooks, destroyPeer, ensureLocalStream, name],
  );

  const leaveCall = useCallback(() => {
    const to = remoteIdRef.current;
    if (to) {
      socket.emit('endCall', { to });
    }

    setCallEnded(true);
    destroyPeer();

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(undefined);
    }
    const remote = userStreamRef.current;
    if (remote) {
      remote.getTracks().forEach((t) => t.stop());
    }

    resetCallUi();
  }, [destroyPeer, resetCallUi, stream]);

  const rejectCall = useCallback(() => {
    const from = callRef.current?.from;
    if (from) {
      socket.emit('callRejected', { to: from });
    }
    setCall({});
    setRemoteName('');
  }, []);

  useEffect(() => {
    const onMe = (id) => {
      meRef.current = id;
      setMe(id);
    };

    const onCallUser = ({ from, name: callerName, signal }) => {
      setRemoteName(callerName || 'Someone');
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    };

    const onCallAccepted = (signal) => {
      if (!connectionRef.current || callEndedRef.current) return;
      setCallAccepted(true);
      try {
        connectionRef.current.signal(signal);
      } catch (e) {
        console.error(e);
      }
    };

    const onCallEnded = () => {
      destroyPeer();
      const remote = userStreamRef.current;
      if (remote) {
        remote.getTracks().forEach((t) => t.stop());
      }
      setUserStream(undefined);
      resetCallUi();
    };

    const onCallRejected = () => {
      destroyPeer();
      resetCallUi();
    };

    socket.on('me', onMe);
    socket.on('callUser', onCallUser);
    socket.on('callAccepted', onCallAccepted);
    socket.on('callEnded', onCallEnded);
    socket.on('callRejected', onCallRejected);

    return () => {
      socket.off('me', onMe);
      socket.off('callUser', onCallUser);
      socket.off('callAccepted', onCallAccepted);
      socket.off('callEnded', onCallEnded);
      socket.off('callRejected', onCallRejected);
    };
  }, [destroyPeer, resetCallUi]);

  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        setStream,
        userStream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
        rejectCall,
        mediaError,
        setMediaError,
        remoteName,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
