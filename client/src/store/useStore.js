import { create } from 'zustand';

const useStore = create((set, get) => ({
  // User info
  username: '',
  userColor: '#4A90D9',
  roomId: null,

  // Tool settings
  tool: 'pen', // pen, rectangle, circle, line, eraser
  color: '#000000',
  brushSize: 3,

  // Canvas state
  strokes: [],
  undoneStrokes: [], // for redo

  // Connected users
  users: [],

  // Actions
  setUsername: (username) => set({ username }),
  setUserColor: (color) => set({ userColor: color }),
  setRoomId: (roomId) => set({ roomId }),

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setBrushSize: (size) => set({ brushSize: size }),

  // Stroke management
  addStroke: (stroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
      undoneStrokes: [], // clear redo stack on new stroke
    })),

  setStrokes: (strokes) => set({ strokes }),

  undo: () => {
    const { strokes } = get();
    if (strokes.length === 0) return null;

    const lastStroke = strokes[strokes.length - 1];
    set((state) => ({
      strokes: state.strokes.slice(0, -1),
      undoneStrokes: [...state.undoneStrokes, lastStroke],
    }));
    return lastStroke;
  },

  redo: () => {
    const { undoneStrokes } = get();
    if (undoneStrokes.length === 0) return null;

    const strokeToRedo = undoneStrokes[undoneStrokes.length - 1];
    set((state) => ({
      strokes: [...state.strokes, strokeToRedo],
      undoneStrokes: state.undoneStrokes.slice(0, -1),
    }));
    return strokeToRedo;
  },

  removeStrokeByUser: (userId) =>
    set((state) => {
      const idx = state.strokes.findLastIndex((s) => s.userId === userId);
      if (idx === -1) return state;
      const newStrokes = [...state.strokes];
      newStrokes.splice(idx, 1);
      return { strokes: newStrokes };
    }),

  clearStrokes: () => set({ strokes: [], undoneStrokes: [] }),

  // User management
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),
}));

export default useStore;
