import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function PencilSketch() {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const containerRef = useRef(null);

  // 가로 선들 생성
  useEffect(() => {
    const generateLines = () => {
      const newLines = [];
      const lineCount = 20;
      const spacing = window.innerHeight / (lineCount + 1);
      
      for (let i = 0; i < lineCount; i++) {
        newLines.push({
          id: i,
          y: spacing * (i + 1),
          width: window.innerWidth,
          isIntact: true,
          restoreTime: 0
        });
      }
      setLines(newLines);
    };

    generateLines();
    window.addEventListener('resize', generateLines);
    return () => window.removeEventListener('resize', generateLines);
  }, []);


  // 마우스 이벤트
  const handleMouseDown = useCallback((e) => {
    setIsDrawing(true);
    handleInteraction(e.clientX, e.clientY);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDrawing) {
      handleInteraction(e.clientX, e.clientY);
    }
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // 터치 이벤트
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDrawing(true);
    handleInteraction(touch.clientX, touch.clientY);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isDrawing) {
      e.preventDefault();
      const touch = e.touches[0];
      handleInteraction(touch.clientX, touch.clientY);
    }
  }, [isDrawing]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(false);
  }, []);

  // 상호작용 처리
  const handleInteraction = useCallback((x, y) => {
    const lineHeight = window.innerHeight / 21; // 20개 선 + 1개 간격
    
    lines.forEach(line => {
      if (Math.abs(y - line.y) < lineHeight / 2) {
        // 선을 휘게 만들기
        setLines(prev => prev.map(l => 
          l.id === line.id 
            ? { 
                ...l, 
                isBent: true, 
                bendX: x, 
                bendAmount: Math.min(50, Math.abs(y - line.y) * 10),
                restoreTime: Date.now() + 3000 
              }
            : l
        ));
        
      }
    });
  }, [lines]);

  // 선 복원 체크
  useEffect(() => {
    const checkRestore = () => {
      const now = Date.now();
      setLines(prev => prev.map(line => 
        line.isBent && line.restoreTime <= now
          ? { ...line, isBent: false, bendX: 0, bendAmount: 0, restoreTime: 0 }
          : line
      ));
    };

    const interval = setInterval(checkRestore, 100);
    return () => clearInterval(interval);
  }, []);

  // 글로벌 이벤트 리스너
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDrawing) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        handleMouseUp();
      }
    };

    if (isDrawing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDrawing, handleMouseMove, handleMouseUp]);

  return (
    <>
      <style jsx>{`
        .sketch-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(145deg, #f8f9fa, #e9ecef);
          cursor: crosshair;
          overflow: hidden;
        }

        .line {
          position: absolute;
          height: 4px;
          background: linear-gradient(
            to right,
            #495057 0%,
            #6c757d 20%,
            #adb5bd 40%,
            #dee2e6 60%,
            #f8f9fa 80%,
            transparent 100%
          );
          left: 0;
          transition: all 0.5s ease;
          transform-origin: left center;
          border-radius: 2px;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.15),
            0 1px 2px rgba(0, 0, 0, 0.1),
            inset 0 1px 2px rgba(255, 255, 255, 0.4),
            inset 0 -1px 1px rgba(0, 0, 0, 0.1);
        }

        .line.bent {
          filter: drop-shadow(0 3px 6px rgba(73, 80, 87, 0.3));
          box-shadow: 
            0 3px 6px rgba(0, 0, 0, 0.2),
            0 1px 3px rgba(0, 0, 0, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.5),
            inset 0 -1px 1px rgba(0, 0, 0, 0.15);
        }


        .sketch-container:active {
          cursor: grabbing;
        }
      `}</style>

      <div
        ref={containerRef}
        className="sketch-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 가로 선들 */}
        {lines.map(line => (
          <div
            key={line.id}
            className={`line ${line.isBent ? 'bent' : ''}`}
            style={{
              top: `${line.y}px`,
              width: `${line.width}px`,
              transform: line.isBent 
                ? `translateY(${Math.sin((line.bendX / line.width) * Math.PI) * line.bendAmount}px) scaleY(${1 + line.bendAmount * 0.02}) skewX(${Math.sin((line.bendX / line.width) * Math.PI) * line.bendAmount * 0.1}deg)`
                : 'none'
            }}
          />
        ))}

      </div>
    </>
  );
}