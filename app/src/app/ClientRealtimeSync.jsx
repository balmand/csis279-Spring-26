import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clientSynced, socketConnected, socketDisconnected } from '../store/slices/clientsSlice';
import { getSocket } from '../services/socket';

const ClientRealtimeSync = () => {
  const dispatch = useDispatch();
  const client = useSelector((state) => state.auth.client);

  useEffect(() => {
    if (!client) {
      return undefined;
    }

    const socket = getSocket();

    const handleConnect = () => {
      dispatch(socketConnected());
    };

    const handleDisconnect = () => {
      dispatch(socketDisconnected());
    };

    const handleClientChanged = ({ client: changedClient }) => {
      dispatch(clientSynced(changedClient));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('client:changed', handleClientChanged);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('client:changed', handleClientChanged);
      socket.disconnect();
      dispatch(socketDisconnected());
    };
  }, [client, dispatch]);

  return null;
};

export default ClientRealtimeSync;
