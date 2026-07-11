import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useStore from '../../store/useStore';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';
import UserList from '../UserList/UserList';
import StickyNotes from '../StickyNotes/StickyNotes';
import './Room.css';

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;
  const [notes, setNotes] = useState([]);

  const { setUsername, setRoomId } = useStore();

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    setUsername(username);
    setRoomId(roomId);
  }, [username, roomId, navigate, setUsername, setRoomId]);

  const {
    emitStrokeStart,
    emitStrokeDraw,
    emitStrokeEnd,
    emitCursorMove,
    emitUndo,
    emitClear,
    socket,
  } = useSocket(roomId, username);

  if (!username) return null;

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const addNote = () => {
    const colors = ['#FFEAA7', '#DFE6E9', '#81ECEC', '#FAB1A0', '#A29BFE'];
    const newNote = {
      id: Date.now().toString(),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      text: '',
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = (id, updates) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates } : n))
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="room">
      <div className="room-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <button className="copy-btn" onClick={copyRoomLink} title="Copy room link">
            📋 Copy Link
          </button>
        </div>
        <Toolbar onUndo={emitUndo} onClear={emitClear} onAddNote={addNote} />
      </div>

      <div className="room-body">
        <div className="canvas-wrapper">
          <Canvas
            socket={socket}
            emitStrokeStart={emitStrokeStart}
            emitStrokeDraw={emitStrokeDraw}
            emitStrokeEnd={emitStrokeEnd}
            emitCursorMove={emitCursorMove}
          />
          <StickyNotes
            notes={notes}
            onAddNote={addNote}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        </div>
        <UserList />
      </div>
    </div>
  );
}

export default Room;
