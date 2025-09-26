import React, { useState, useRef, useCallback, useEffect } from 'react';

export default function NewDial() {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ angle: 0, rotation: 0 });
  const [dialValue, setDialValue] = useState(0); // -100 to 100
  const dialRef = useRef(null);
  const centerRef = useRef(null);

  // 마우스 다운 이벤트
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    
    setIsDragging(true);
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    setDragStart({ angle, rotation });
    e.preventDefault();
  }, [rotation]);

  // 마우스 이동 이벤트
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    
    let deltaAngle = currentAngle - dragStart.angle;
    
    // 각도 정규화 (-π to π)
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
    
    const newRotation = dragStart.rotation + (deltaAngle * 180 / Math.PI);
    const newValue = Math.max(-100, Math.min(100, newRotation));
    
    setRotation(newValue);
    setDialValue(newValue);
  }, [isDragging, dragStart]);

  // 마우스 업 이벤트
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 터치 이벤트
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    
    setDragStart({ angle, rotation });
    e.preventDefault();
  }, [rotation]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const currentAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    
    let deltaAngle = currentAngle - dragStart.angle;
    
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
    
    const newRotation = dragStart.rotation + (deltaAngle * 180 / Math.PI);
    const newValue = Math.max(-100, Math.min(100, newRotation));
    
    setRotation(newValue);
    setDialValue(newValue);
    e.preventDefault();
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 글로벌 이벤트 리스너
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 다이얼 값에 따른 배경 색상 계산
  const getBackgroundColor = () => {
    if (dialValue >= 0) {
      // 오른쪽 회전 - 빨간색
      const intensity = Math.min(1, dialValue / 100);
      return `rgba(${255 * intensity}, ${100 * intensity}, ${100 * intensity}, ${0.3 + intensity * 0.7})`;
    } else {
      // 왼쪽 회전 - 화이트
      const intensity = Math.min(1, Math.abs(dialValue) / 100);
      return `rgba(255, 255, 255, ${0.3 + intensity * 0.7})`;
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes neonPulse {
          0%, 100% { 
            box-shadow: 
              0 0 20px currentColor,
              0 0 40px currentColor,
              0 0 60px currentColor;
          }
          50% { 
            box-shadow: 
              0 0 30px currentColor,
              0 0 60px currentColor,
              0 0 90px currentColor;
          }
        }

        @keyframes dialGlow {
          0%, 100% { 
            filter: brightness(1) saturate(1);
          }
          50% { 
            filter: brightness(1.2) saturate(1.5);
          }
        }

        .dial-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: background 0.5s ease;
        }

        .dial-outer {
          position: relative;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: linear-gradient(145deg, #ffffff, #e0e0e0);
          cursor: grab;
          user-select: none;
          transition: all 0.3s ease;
          box-shadow: 
            20px 20px 60px rgba(0, 0, 0, 0.1),
            -20px -20px 60px rgba(255, 255, 255, 0.8),
            inset 5px 5px 15px rgba(0, 0, 0, 0.05),
            inset -5px -5px 15px rgba(255, 255, 255, 0.9);
        }

        .dial-outer:active {
          cursor: grabbing;
        }

        .dial-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200px;
          height: 200px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: linear-gradient(145deg, #f8f9fa, #e9ecef);
          box-shadow: 
            8px 8px 20px rgba(0, 0, 0, 0.1),
            -8px -8px 20px rgba(255, 255, 255, 0.8),
            inset 3px 3px 8px rgba(0, 0, 0, 0.1),
            inset -3px -3px 8px rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
        }

        .dial-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 80px;
          height: 80px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: linear-gradient(145deg, #ffffff, #f1f3f4);
          box-shadow: 
            4px 4px 12px rgba(0, 0, 0, 0.15),
            -4px -4px 12px rgba(255, 255, 255, 0.9),
            inset 2px 2px 6px rgba(0, 0, 0, 0.1),
            inset -2px -2px 6px rgba(255, 255, 255, 0.8);
        }

        .dial-indicator {
          position: absolute;
          top: 20px;
          left: 50%;
          width: 8px;
          height: 35px;
          background: linear-gradient(145deg, #ff6b6b, #ff5252);
          transform: translateX(-50%);
          border-radius: 4px;
          box-shadow: 
            2px 2px 6px rgba(255, 107, 107, 0.3),
            -1px -1px 3px rgba(255, 255, 255, 0.8),
            inset 1px 1px 2px rgba(255, 255, 255, 0.6),
            inset -1px -1px 2px rgba(0, 0, 0, 0.1);
        }



      `}</style>

      <div 
        className="dial-container"
        style={{ backgroundColor: getBackgroundColor() }}
      >
        <div
          ref={dialRef}
          className="dial-outer"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `rotate(${rotation}deg)`
          }}
        >

          {/* 내부 화이트 링 */}
          <div className="dial-inner">
            {/* 중앙 인디케이터 */}
            <div className="dial-indicator" />
            
            {/* 중앙 원 */}
            <div className="dial-center" />
          </div>

        </div>
      </div>
    </>
  );
}