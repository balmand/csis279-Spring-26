const videoCallSocketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('A client connected. Socket ID:', socket.id);

    socket.emit('me', socket.id);

    socket.on('disconnect', () => {
      console.log('A client disconnected. Socket ID:', socket.id);
    });

    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit('callUser', {
        signal: signalData,
        from,
        name,
      });
    });

    socket.on('answerCall', (data) => {
      io.to(data.to).emit('callAccepted', data.signal);
    });

    socket.on('endCall', ({ to }) => {
      if (to) {
        io.to(to).emit('callEnded');
      }
    });

    socket.on('callRejected', ({ to }) => {
      if (to) {
        io.to(to).emit('callRejected');
      }
    });
  });
};

module.exports = videoCallSocketHandler;
