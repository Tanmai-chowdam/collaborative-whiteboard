# Collaborative Whiteboard

A real-time collaborative whiteboard where multiple users can draw together, see each other's cursors, and collaborate on a shared canvas.

## Architecture

```
┌─────────────────┐     WebSocket      ┌─────────────────┐
│  React Frontend │◄──────────────────►│  Node.js Backend │
│  (Canvas + UI)  │                    │  (Socket.io)     │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                         ┌──────▼──────┐
                                         │   Redis     │
                                         │  (optional) │
                                         └─────────────┘
```

## Tech Stack

- **Frontend:** React 18, Canvas API, Socket.io-client, Zustand
- **Backend:** Node.js, Express, Socket.io
- **State Management:** Zustand (local) + Socket.io (shared)
- **Styling:** CSS Modules

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd client
npm install
```

### Running the app

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm start
```

The app will be available at http://localhost:3000

## Features

- Freehand drawing with customizable brush
- Shape tools (rectangle, circle, line)
- Color picker and brush size
- Real-time collaboration via WebSockets
- Live cursor tracking (see other users)
- Room-based sessions (shareable links)
- Undo/Redo support
- Export to PNG

## Project Structure

```
collaborative-whiteboard/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand state management
│   │   ├── utils/          # Helper functions
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── socket/         # Socket.io event handlers
│   │   ├── rooms/          # Room management
│   │   └── index.js
│   └── package.json
└── README.md
```
