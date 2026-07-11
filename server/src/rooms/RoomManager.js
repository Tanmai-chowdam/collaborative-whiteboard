const { v4: uuidv4 } = require('uuid');

class RoomManager {
  constructor() {
    // Map of roomId -> { users: Map<socketId, userInfo>, strokes: [] }
    this.rooms = new Map();
  }

  createRoom() {
    const roomId = uuidv4().slice(0, 8); // Short readable ID
    this.rooms.set(roomId, {
      users: new Map(),
      strokes: [],
    });
    return roomId;
  }

  joinRoom(roomId, socketId, username) {
    if (!this.rooms.has(roomId)) {
      // Auto-create room if it doesn't exist
      this.rooms.set(roomId, {
        users: new Map(),
        strokes: [],
      });
    }

    const room = this.rooms.get(roomId);
    const color = this.generateUserColor();

    room.users.set(socketId, {
      id: socketId,
      username,
      color,
      cursor: { x: 0, y: 0 },
    });

    return { roomId, color, strokes: room.strokes };
  }

  leaveRoom(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.users.delete(socketId);

    // Clean up empty rooms
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  addStroke(roomId, stroke) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.strokes.push(stroke);
  }

  undoLastStroke(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Find the last stroke by this user and remove it
    for (let i = room.strokes.length - 1; i >= 0; i--) {
      if (room.strokes[i].userId === userId) {
        const removed = room.strokes.splice(i, 1)[0];
        return removed;
      }
    }
    return null;
  }

  clearRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.strokes = [];
  }

  getUsers(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
  }

  generateUserColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

module.exports = new RoomManager();
