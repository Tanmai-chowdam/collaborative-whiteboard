import React from 'react';
import useStore from '../../store/useStore';
import './Toolbar.css';

function Toolbar({ onUndo, onClear, onAddNote }) {
  const { tool, setTool, color, setColor, brushSize, setBrushSize, undo } = useStore();

  const tools = [
    { id: 'pen', label: 'Pen', icon: '✏️' },
    { id: 'line', label: 'Line', icon: '📏' },
    { id: 'rectangle', label: 'Rectangle', icon: '⬜' },
    { id: 'circle', label: 'Circle', icon: '⭕' },
    { id: 'eraser', label: 'Eraser', icon: '🧹' },
  ];

  const presetColors = [
    '#000000', '#FF0000', '#FF6B00', '#FFD700',
    '#00C853', '#2196F3', '#9C27B0', '#FFFFFF',
  ];

  const handleUndo = () => {
    undo();
    onUndo();
  };

  const handleClear = () => {
    if (window.confirm('Clear the entire canvas for everyone?')) {
      onClear();
    }
  };

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        {tools.map((t) => (
          <button
            key={t.id}
            className={`tool-btn ${tool === t.id ? 'active' : ''}`}
            onClick={() => setTool(t.id)}
            title={t.label}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section colors">
        {presetColors.map((c) => (
          <button
            key={c}
            className={`color-btn ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            title={c}
            aria-label={`Color ${c}`}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="color-picker"
          title="Custom color"
          aria-label="Custom color picker"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section size-section">
        <label htmlFor="brush-size" className="size-label">
          {brushSize}px
        </label>
        <input
          id="brush-size"
          type="range"
          min="1"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="size-slider"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button className="action-btn" onClick={onAddNote} title="Add sticky note">
          📝
        </button>
        <button className="action-btn" onClick={handleUndo} title="Undo">
          ↩️
        </button>
        <button className="action-btn" onClick={handleClear} title="Clear all">
          🗑️
        </button>
        <button className="action-btn" onClick={handleExport} title="Export as PNG">
          💾
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
