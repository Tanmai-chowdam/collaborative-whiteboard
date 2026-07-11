import React, { useRef, useEffect, useCallback, useState } from 'react';
import useStore from '../../store/useStore';
import './Canvas.css';

function Canvas({ socket, emitStrokeStart, emitStrokeDraw, emitStrokeEnd, emitCursorMove }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const currentPath = useRef([]);
  const startPoint = useRef(null);
  const [cursors, setCursors] = useState({});

  const { tool, color, brushSize, strokes, addStroke } = useStore();

  // Set up canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  // Listen for real-time cursor and user events
  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleCursorMove = (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y, username: data.username },
      }));
    };

    const handleUserLeft = (data) => {
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[data.id];
        return updated;
      });
    };

    s.on('cursor-move', handleCursorMove);
    s.on('user-left', handleUserLeft);

    return () => {
      s.off('cursor-move', handleCursorMove);
      s.off('user-left', handleUserLeft);
    };
  }, [socket]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke);
    });
  }, [strokes]);

  const drawStroke = (ctx, stroke) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = stroke.color;
    }
    ctx.lineWidth = stroke.brushSize;

    if (stroke.tool === 'pen' || stroke.tool === 'eraser') {
      if (stroke.points && stroke.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      }
    } else if (stroke.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(stroke.startX, stroke.startY);
      ctx.lineTo(stroke.endX, stroke.endY);
      ctx.stroke();
    } else if (stroke.tool === 'rectangle') {
      ctx.beginPath();
      ctx.strokeRect(
        stroke.startX,
        stroke.startY,
        stroke.endX - stroke.startX,
        stroke.endY - stroke.startY
      );
    } else if (stroke.tool === 'circle') {
      const radiusX = Math.abs(stroke.endX - stroke.startX) / 2;
      const radiusY = Math.abs(stroke.endY - stroke.startY) / 2;
      const centerX = stroke.startX + (stroke.endX - stroke.startX) / 2;
      const centerY = stroke.startY + (stroke.endY - stroke.startY) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  };

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handlePointerDown = (e) => {
    const coords = getCoords(e);
    isDrawing.current = true;
    startPoint.current = coords;
    currentPath.current = [coords];

    emitStrokeStart({ tool, color, brushSize, x: coords.x, y: coords.y });
  };

  const handlePointerMove = (e) => {
    const coords = getCoords(e);

    // Always emit cursor position
    emitCursorMove({ x: coords.x, y: coords.y });

    if (!isDrawing.current) return;

    if (tool === 'pen' || tool === 'eraser') {
      currentPath.current.push(coords);

      // Draw in real-time locally
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
      }

      const points = currentPath.current;
      if (points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = 'source-over';
      emitStrokeDraw({ x: coords.x, y: coords.y });
    } else {
      // For shapes, redraw canvas + show preview
      redrawCanvas();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.setLineDash([5, 5]);

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.current.x, startPoint.current.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        ctx.strokeRect(
          startPoint.current.x,
          startPoint.current.y,
          coords.x - startPoint.current.x,
          coords.y - startPoint.current.y
        );
      } else if (tool === 'circle') {
        const radiusX = Math.abs(coords.x - startPoint.current.x) / 2;
        const radiusY = Math.abs(coords.y - startPoint.current.y) / 2;
        const centerX = startPoint.current.x + (coords.x - startPoint.current.x) / 2;
        const centerY = startPoint.current.y + (coords.y - startPoint.current.y) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    let stroke;

    if (tool === 'pen' || tool === 'eraser') {
      stroke = {
        id: Date.now().toString(),
        tool,
        color,
        brushSize,
        points: currentPath.current,
      };
    } else {
      const coords = getCoords(e);
      stroke = {
        id: Date.now().toString(),
        tool,
        color,
        brushSize,
        startX: startPoint.current.x,
        startY: startPoint.current.y,
        endX: coords.x,
        endY: coords.y,
      };
    }

    addStroke(stroke);
    emitStrokeEnd(stroke);
    currentPath.current = [];
    startPoint.current = null;
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      {/* Other users' cursors */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="remote-cursor"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M0 0L12 5L5 7L3 14L0 0Z" fill="#4A90D9" />
          </svg>
          <span className="cursor-label">{cursor.username}</span>
        </div>
      ))}
    </div>
  );
}

export default Canvas;