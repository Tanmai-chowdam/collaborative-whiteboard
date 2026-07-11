import React, { useState, useRef } from 'react';
import './StickyNotes.css';

const COLORS = ['#FFEAA7', '#DFE6E9', '#81ECEC', '#FAB1A0', '#A29BFE'];

function StickyNotes({ notes, onAddNote, onUpdateNote, onDeleteNote }) {
  const [dragging, setDragging] = useState(null);
  const offset = useRef({ x: 0, y: 0 });

  const startDrag = (e, noteId) => {
    if (e.target.tagName === 'TEXTAREA') return;
    const note = notes.find((n) => n.id === noteId);
    offset.current = { x: e.clientX - note.x, y: e.clientY - note.y };
    setDragging(noteId);
  };

  const onDrag = (e) => {
    if (!dragging) return;
    onUpdateNote(dragging, {
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const stopDrag = () => setDragging(null);

  return (
    <div
      className="sticky-layer"
      onMouseMove={onDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {notes.map((note) => (
        <div
          key={note.id}
          className="sticky-note"
          style={{ left: note.x, top: note.y, background: note.color }}
          onMouseDown={(e) => startDrag(e, note.id)}
        >
          <div className="sticky-header">
            <button className="sticky-delete" onClick={() => onDeleteNote(note.id)}>
              &times;
            </button>
          </div>
          <textarea
            className="sticky-text"
            value={note.text}
            onChange={(e) => onUpdateNote(note.id, { text: e.target.value })}
            placeholder="Type here..."
          />
        </div>
      ))}
    </div>
  );
}


export default StickyNotes;
