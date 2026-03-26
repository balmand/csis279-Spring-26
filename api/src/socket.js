let io;

const initializeSocket = (server) => {
  const { Server } = require('socket.io');

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => io;

const emitClientChanged = (type, client) => {
  if (!io) {
    return;
  }

  io.emit('client:changed', { type, client });
};

module.exports = {
  emitClientChanged,
  getIo,
  initializeSocket,
};
