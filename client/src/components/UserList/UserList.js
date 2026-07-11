import React from 'react';
import useStore from '../../store/useStore';
import './UserList.css';

function UserList() {
  const { users, username } = useStore();

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Online</h3>
        <span className="user-count">{users.length}</span>
      </div>
      <ul className="user-list-items">
        {users.map((user) => (
          <li key={user.id} className="user-item">
            <span className="user-dot" style={{ background: user.color }} />
            <span className="user-name">
              {user.username}
              {user.username === username && ' (you)'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
