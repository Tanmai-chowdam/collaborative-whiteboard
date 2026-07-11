import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const createRoom = () => {
    if (!username.trim()) return;
    // Generate a random room ID
    const newRoomId = Math.random().toString(36).substring(2, 10);
    navigate(`/room/${newRoomId}`, { state: { username: username.trim() } });
  };

  const joinRoom = () => {
    if (!username.trim() || !roomId.trim()) return;
    navigate(`/room/${roomId.trim()}`, { state: { username: username.trim() } });
  };

  return (
    <div className="home">
      <div className="home-card">
        <div className="home-header">
          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#4A90D9" />
              <path
                d="M12 28C14 20 18 14 22 16C26 18 20 24 24 20C28 16 30 12 32 14"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1>Collaborative Whiteboard</h1>
          <p className="subtitle">Draw together in real-time with anyone, anywhere</p>
        </div>

        <div className="home-form">
          <div className="input-group">
            <label htmlFor="username">Your Name</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
            />
          </div>

          <button className="btn btn-primary" onClick={createRoom} disabled={!username.trim()}>
            Create New Room
          </button>

          <div className="divider">
            <span>or join existing</span>
          </div>

          <div className="input-group">
            <label htmlFor="roomId">Room ID</label>
            <input
              id="roomId"
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <button
            className="btn btn-secondary"
            onClick={joinRoom}
            disabled={!username.trim() || !roomId.trim()}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
