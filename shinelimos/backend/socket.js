let io;

module.exports = {
  init: (httpServer) => {
    const socketIo = require('socket.io');
    io = socketIo(httpServer, {
      cors: {
        origin: '*', // Adjust to your allowed origins if needed
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
