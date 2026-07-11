const roomManager = require('../rooms/RoomManager');

function handleSocketConnection(io, socket) {
  console.log(`User connected: ${socket.id}`);

  // Join a room
  socket.on('join-room', ({ roomId, username }) => {
    const result = roomManager.joinRoom(roomId, socket.id, username);

    // Join the socket.io room
    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;

    // Send existing strokes to the new user
    socket.emit('room-joined', {
      roomId: result.roomId,
      color: result.color,
      strokes: result.strokes,
      users: roomManager.getUsers(roomId),
    });

    // Notify others that a new user joined
    socket.to(roomId).emit('user-joined', {
      id: socket.id,
      username,
      color: result.color,
    });

    console.log(`${username} joined room ${roomId}`);
  });

  // Handle drawing strokes
  socket.on('stroke-start', (data) => {
    socket.to(socket.roomId).emit('stroke-start', {
      ...data,
      userId: socket.id,
    });
  });

  socket.on('stroke-draw', (data) => {
    socket.to(socket.roomId).emit('stroke-draw', {
      ...data,
      userId: socket.id,
    });
  });

  socket.on('stroke-end', (data) => {
    const stroke = {
      ...data,
      userId: socket.id,
      timestamp: Date.now(),
    };

    // Save stroke to room history
    roomManager.addStroke(socket.roomId, stroke);

    // Broadcast to others
    socket.to(socket.roomId).emit('stroke-end', stroke);
  });

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    socket.to(socket.roomId).emit('cursor-move', {
      userId: socket.id,
      username: socket.username,
      x: data.x,
      y: data.y,
    });
  });

  // Handle undo
  socket.on('undo', () => {
    const removed = roomManager.undoLastStroke(socket.roomId, socket.id);
    if (removed) {
      // Tell everyone to redraw without that stroke
      const users = roomManager.getUsers(socket.roomId);
      io.to(socket.roomId).emit('undo', {
        userId: socket.id,
        strokeId: removed.id,
      });
    }
  });

  // Handle clear canvas
  socket.on('clear-canvas', () => {
    roomManager.clearRoom(socket.roomId);
    io.to(socket.roomId).emit('canvas-cleared');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.roomId) {
      roomManager.leaveRoom(socket.roomId, socket.id);

      socket.to(socket.roomId).emit('user-left', {
        id: socket.id,
        username: socket.username,
      });

      console.log(`${socket.username} left room ${socket.roomId}`);
    }
  });
}

module.exports = { handleSocketConnection };
