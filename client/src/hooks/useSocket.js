import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';

const SERVER_URL = 'http://localhost:3001';

function useSocket(roomId, username) {
  const socketRef = useRef(null);
  const {
    setUserColor,
    setStrokes,
    setUsers,
    addUser,
    removeUser,
    addStroke,
    removeStrokeByUser,
    clearStrokes,
  } = useStore();

  useEffect(() => {
    if (!roomId || !username) return;

    // Connect to server
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    // Join room once connected
    socket.on('connect', () => {
      socket.emit('join-room', { roomId, username });
    });

    // Room joined — receive existing state
    socket.on('room-joined', (data) => {
      setUserColor(data.color);
      setStrokes(data.strokes);
      setUsers(data.users);
    });

    // Another user joined
    socket.on('user-joined', (user) => {
      addUser(user);
    });

    // A user left
    socket.on('user-left', (user) => {
      removeUser(user.id);
    });

    // Receive completed stroke from another user
    socket.on('stroke-end', (stroke) => {
      addStroke(stroke);
    });

    // Someone undid their stroke
    socket.on('undo', ({ userId }) => {
      removeStrokeByUser(userId);
    });

    // Canvas cleared
    socket.on('canvas-cleared', () => {
      clearStrokes();
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId, username]);

  // Emit stroke start
  const emitStrokeStart = useCallback((data) => {
    socketRef.current?.emit('stroke-start', data);
  }, []);

  // Emit stroke draw (intermediate points)
  const emitStrokeDraw = useCallback((data) => {
    socketRef.current?.emit('stroke-draw', data);
  }, []);

  // Emit stroke end (final stroke data)
  const emitStrokeEnd = useCallback((data) => {
    socketRef.current?.emit('stroke-end', data);
  }, []);

  // Emit cursor position
  const emitCursorMove = useCallback((data) => {
    socketRef.current?.emit('cursor-move', data);
  }, []);

  // Emit undo
  const emitUndo = useCallback(() => {
    socketRef.current?.emit('undo');
  }, []);

  // Emit clear canvas
  const emitClear = useCallback(() => {
    socketRef.current?.emit('clear-canvas');
  }, []);

  return {
    socket: socketRef,
    emitStrokeStart,
    emitStrokeDraw,
    emitStrokeEnd,
    emitCursorMove,
    emitUndo,
    emitClear,
  };
}

export default useSocket;
