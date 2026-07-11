import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useSocket from '../../hooks/useSocket';
import useStore from '../../store/useStore';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar';
import UserList from '../UserList/UserList';
import './Room.css';

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;

  const { setUsername, setRoomId } = useStore();

  // Redirect if no username
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
    const link = window.location.href;
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="room">
      <div className="room-header">
        <div className="room-info">
          <h2>Room: {roomId}</h2>
          <button className="copy-btn" onClick={copyRoomLink} title="Copy room link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 4v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2zm2 0h4a2 2 0 0 1 2 2v4h2V2H6v2z"/>
            </svg>
            Copy Link
          </button>
        </div>
        <Toolbar onUndo={emitUndo} onClear={emitClear} />
      </div>

      <div className="room-body">
        <Canvas
          socket={socket}
          emitStrokeStart={emitStrokeStart}
          emitStrokeDraw={emitStrokeDraw}
          emitStrokeEnd={emitStrokeEnd}
          emitCursorMove={emitCursorMove}
        />
        <UserList />
      </div>
    </div>
  );
}

export default Room;
