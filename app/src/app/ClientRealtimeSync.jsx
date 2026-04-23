import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  browserOffline,
  browserOnline,
  clientSynced,
  socketConnected,
  socketDisconnected,
  syncPendingChanges,
} from '../store/slices/clientsSlice';
import { getSocket, SOCKET_ENABLED } from '../services/socket';

const ClientRealtimeSync = () => {
  const dispatch = useDispatch();
  const client = useSelector((state) => state.auth.client);
  const pendingChangesCount = useSelector((state) => state.clients.pendingChanges.length);
  const isOffline = useSelector((state) => state.clients.isOffline);
  const isSocketConnected = useSelector((state) => state.clients.socketConnected);

  useEffect(() => {
    if (!client) {
      return undefined;
    }

    if (!SOCKET_ENABLED) {
      dispatch(browserOnline());
      dispatch(socketDisconnected());
      return undefined;
    }

    const socket = getSocket();
    if (!socket) {
      return undefined;
    }

    const handleConnect = () => {
      dispatch(browserOnline());
      dispatch(socketConnected());
    };

    const handleDisconnect = () => {
      dispatch(socketDisconnected());
    };

    const handleClientChanged = ({ client: changedClient }) => {
      dispatch(clientSynced(changedClient));
    };

    const handleBrowserOnline = () => {
      dispatch(browserOnline());
      socket.connect();
    };

    const handleBrowserOffline = () => {
      dispatch(browserOffline());
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('client:changed', handleClientChanged);
    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    if (navigator.onLine) {
      dispatch(browserOnline());
      socket.connect();
    } else {
      dispatch(browserOffline());
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('client:changed', handleClientChanged);
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      socket.disconnect();
      dispatch(socketDisconnected());
    };
  }, [client, dispatch]);

  useEffect(() => {
    if (!client || isOffline || !isSocketConnected || pendingChangesCount === 0) {
      return;
    }

    dispatch(syncPendingChanges());
  }, [client, dispatch, isOffline, isSocketConnected, pendingChangesCount]);

  return null;
};

export default ClientRealtimeSync;
