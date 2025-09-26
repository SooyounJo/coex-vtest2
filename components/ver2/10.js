import React, { useState, useRef, useCallback } from 'react';

export default function BloomGradient() {
  const [leftLight, setLeftLight] = useState({ 
    position: 50, 
    intensity: 0.8, 
    color: [0.8, 0.9, 1.0], // 홀로그램 시안
    spread: 0.6,
    saturation: 1.0,
    brightness: 1.0,
    hologramPhase: 0,
    whiteIntensity: 0
  });
  const [rightLight, setRightLight] = useState({ 
    position: 50, 
    intensity: 0.8, 
    color: [1.0, 0.1, 0.1], // 순수 레드
    spread: 0.6,
    saturation: 1.0,
    brightness: 1.0,
    hologramPhase: 0,
    whiteIntensity: 0
  });
  const [time, setTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0, x: 0 });
  const [activeSection, setActiveSection] = useState(null);
  const [lightTrails, setLightTrails] = useState([]); // 빛의 잔상들
  const [screenFlash, setScreenFlash] = useState(false); // 화면 전체 밝기 효과
  const [movementHistory, setMovementHistory] = useState([]); // 움직임 히스토리
  const containerRef = useRef(null);

  // 빛의 잔상 추가
  const addLightTrail = useCallback((position, section) => {
    const newTrail = {
      id: Date.now() + Math.random(),
      position: position,
      section: section,
      opacity: 0.6,
      timestamp: Date.now()
    };
    setLightTrails(prev => [...prev.slice(-5), newTrail]); // 최대 5개 유지
    // 2초 후 자동 제거
    setTimeout(() => {
      setLightTrails(prev => prev.filter(trail => trail.id !== newTrail.id));
    }, 2000);
  }, []);

  // 빛의 잔상 페이드아웃
  const fadeLightTrails = useCallback(() => {
    setLightTrails(prev => 
      prev.map(trail => ({
        ...trail,
        opacity: Math.max(0, trail.opacity - 0.03)
      })).filter(trail => trail.opacity > 0)
    );
  }, []);

  // 빠른 움직임 감지 및 화면 플래시
  const detectRapidMovement = useCallback((newPosition, section) => {
    const now = Date.now();
    const newMovement = {
      position: newPosition,
      timestamp: now,
      section: section
    };
    
    setMovementHistory(prev => {
      const recentMovements = [...prev, newMovement].filter(
        move => now - move.timestamp < 1000 // 1초 이내의 움직임만 유지
      );
      
      // 빠른 위아래 움직임 감지
      if (recentMovements.length >= 4) {
        const positions = recentMovements.map(m => m.position);
        const maxPos = Math.max(...positions);
        const minPos = Math.min(...positions);
        const range = maxPos - minPos;
        
        // 1초 내에 60% 이상의 범위를 움직였으면 빠른 움직임으로 판단
        if (range > 60) {
          setScreenFlash(true);
          setTimeout(() => {
            setScreenFlash(false);
          }, 1000); // 1초 후 원래 상태로
        }
      }
      
      return recentMovements;
    });
  }, []);

  // 섹션별 마우스 드래그 이벤트 핸들러
  const handleSectionMouseDown = useCallback((e, section) => {
    setDragStart({ y: e.clientY, x: e.clientX });
    setIsDragging(true);
    setActiveSection(section);
    
    e.preventDefault();
    e.stopPropagation();
  }, []);


  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !activeSection) return;
    
    const deltaY = e.clientY - dragStart.y;
    const windowHeight = window.innerHeight;
    
    // 빛 위치 계산 (0-100% 범위)
    const newPosition = Math.max(0, Math.min(100, 50 + (deltaY / windowHeight) * 100));
    
    // 현재 섹션의 위치 계산
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // 위로 올리면 채도와 밝기 증가, 아래로 내리면 감소
    const positionFactor = (newPosition - 50) / 50; // -1 to 1
    const saturation = Math.max(0.3, Math.min(3.0, 1.0 + positionFactor * 1.5));
    const brightness = Math.max(0.2, Math.min(3.0, 1.0 + positionFactor * 1.2));
    
    // 완전 위로 올라가면 화이트 상태
    const isWhite = newPosition > 90;
    const whiteIntensity = isWhite ? 1.0 : 0.0;
    
    // 빛의 잔상 추가 (드래그 중에도)
    if (Math.random() < 0.1) { // 10% 확률로 잔상 추가
      addLightTrail(newPosition, activeSection);
    }
    
    if (activeSection === 'left') {
      setLeftLight(prev => ({ 
        ...prev, 
        position: newPosition,
        saturation: saturation,
        brightness: brightness,
        whiteIntensity: whiteIntensity
      }));
    } else if (activeSection === 'right') {
      setRightLight(prev => ({ 
        ...prev, 
        position: newPosition,
        saturation: saturation,
        brightness: brightness,
        whiteIntensity: whiteIntensity
      }));
    }
  }, [isDragging, dragStart, activeSection, addLightTrail]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveSection(null);
  }, []);

  // 섹션별 터치 이벤트 핸들러 (모바일용)
  const handleSectionTouchStart = useCallback((e, section) => {
    const touch = e.touches[0];
    
    setDragStart({ y: touch.clientY, x: touch.clientX });
    setIsDragging(true);
    setActiveSection(section);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !activeSection) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - dragStart.y;
    const windowHeight = window.innerHeight;
    
    // 빛 위치 계산 (0-100% 범위)
    const newPosition = Math.max(0, Math.min(100, 50 + (deltaY / windowHeight) * 100));
    
    // 현재 섹션의 위치 계산
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    // 위로 올리면 채도와 밝기 증가, 아래로 내리면 감소
    const positionFactor = (newPosition - 50) / 50; // -1 to 1
    const saturation = Math.max(0.3, Math.min(3.0, 1.0 + positionFactor * 1.5));
    const brightness = Math.max(0.2, Math.min(3.0, 1.0 + positionFactor * 1.2));
    
    // 완전 위로 올라가면 화이트 상태
    const isWhite = newPosition > 90;
    const whiteIntensity = isWhite ? 1.0 : 0.0;
    
    // 빛의 잔상 추가 (드래그 중에도)
    if (Math.random() < 0.1) { // 10% 확률로 잔상 추가
      addLightTrail(newPosition, activeSection);
    }
    
    if (activeSection === 'left') {
      setLeftLight(prev => ({ 
        ...prev, 
        position: newPosition,
        saturation: saturation,
        brightness: brightness,
        whiteIntensity: whiteIntensity
      }));
    } else if (activeSection === 'right') {
      setRightLight(prev => ({ 
        ...prev, 
        position: newPosition,
        saturation: saturation,
        brightness: brightness,
        whiteIntensity: whiteIntensity
      }));
    }
  }, [isDragging, dragStart, activeSection, addLightTrail]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setActiveSection(null);
  }, []);


  // 홀로그램 페이즈 업데이트
  const updateHologramPhase = useCallback(() => {
    setTime(prev => prev + 0.02);
    setLeftLight(prev => ({ ...prev, hologramPhase: time }));
    setRightLight(prev => ({ ...prev, hologramPhase: time }));
  }, [time]);

  // 빛의 잔상 페이드아웃 애니메이션
  React.useEffect(() => {
    const interval = setInterval(() => {
      fadeLightTrails();
      updateHologramPhase();
    }, 50);
    return () => clearInterval(interval);
  }, [fadeLightTrails, updateHologramPhase]);

  return (
    <>
      <style jsx>{`
        @keyframes lightPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        .container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          overflow: hidden;
        }
        
        .left-section {
          flex: 1;
          position: relative;
          background: #000;
          cursor: grab;
        }
        
        .left-section:active {
          cursor: grabbing;
        }
        
        .right-section {
          flex: 1;
          position: relative;
          background: #000;
          cursor: grab;
        }
        
        .right-section:active {
          cursor: grabbing;
        }
        
        .section-divider {
          position: absolute;
          top: 0;
          left: 50%;
          width: 2px;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0.1) 80%,
            transparent 100%
          );
          filter: blur(1px);
          z-index: 10;
        }
        
        .light-source {
          position: absolute;
          width: 100%;
          height: 300px;
          filter: blur(40px);
          animation: lightPulse 4s ease-in-out infinite;
          z-index: 1;
          left: 0;
        }
        
        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          mix-blend-mode: screen;
        }
        
        .light-control {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.8);
          padding: 15px;
          border-radius: 10px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 100;
        }
        
        .control-title {
          color: white;
          font-size: 12px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .control-slider {
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.2);
          outline: none;
          -webkit-appearance: none;
          margin-bottom: 10px;
        }
        
        .control-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        
        
        .hologram-effect {
          /* 홀로그램 효과는 유지하되 깜빡임 제거 */
        }
      `}</style>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="container"
      >
        {/* 왼쪽: 홀로그램 시안 블룸 */}
        <div 
          className="left-section"
          onMouseDown={(e) => handleSectionMouseDown(e, 'left')}
          onTouchStart={(e) => handleSectionTouchStart(e, 'left')}
        >
          <div 
            className="light-source hologram-effect"
            style={{
              background: leftLight.whiteIntensity > 0.5 ? `
                linear-gradient(
                  to bottom,
                  rgba(255, 255, 255, ${leftLight.intensity}) 0%,
                  rgba(240, 240, 240, ${leftLight.intensity * 0.8}) 20%,
                  rgba(220, 220, 220, ${leftLight.intensity * 0.6}) 40%,
                  rgba(200, 200, 200, ${leftLight.intensity * 0.4}) 60%,
                  rgba(180, 180, 180, ${leftLight.intensity * 0.2}) 80%,
                  transparent 100%
                )
              ` : `
                linear-gradient(
                  to bottom,
                  rgba(${leftLight.color[0] * 255 * leftLight.brightness}, ${leftLight.color[1] * 255 * leftLight.brightness}, ${leftLight.color[2] * 255 * leftLight.brightness}, ${leftLight.intensity}) 0%,
                  rgba(${leftLight.color[0] * 200 * leftLight.brightness}, ${leftLight.color[1] * 220 * leftLight.brightness}, ${leftLight.color[2] * 255 * leftLight.brightness}, ${leftLight.intensity * 0.8}) 20%,
                  rgba(${leftLight.color[0] * 150 * leftLight.brightness}, ${leftLight.color[1] * 180 * leftLight.brightness}, ${leftLight.color[2] * 220 * leftLight.brightness}, ${leftLight.intensity * 0.6}) 40%,
                  rgba(${leftLight.color[0] * 100 * leftLight.brightness}, ${leftLight.color[1] * 140 * leftLight.brightness}, ${leftLight.color[2] * 180 * leftLight.brightness}, ${leftLight.intensity * 0.4}) 60%,
                  rgba(${leftLight.color[0] * 50 * leftLight.brightness}, ${leftLight.color[1] * 100 * leftLight.brightness}, ${leftLight.color[2] * 140 * leftLight.brightness}, ${leftLight.intensity * 0.2}) 80%,
                  transparent 100%
                )
              `,
              top: `${leftLight.position}%`,
              filter: `blur(${40 + (1 - leftLight.spread) * 20}px) saturate(${leftLight.saturation})`,
              boxShadow: leftLight.whiteIntensity > 0.5 ? `
                0 0 100px rgba(255, 255, 255, 1.2),
                0 0 200px rgba(255, 255, 255, 0.9),
                0 0 300px rgba(255, 255, 255, 0.6),
                0 0 400px rgba(255, 255, 255, 0.3)
              ` : `
                0 0 100px rgba(${leftLight.color[0] * 255}, ${leftLight.color[1] * 255}, ${leftLight.color[2] * 255}, ${leftLight.brightness * 0.8}),
                0 0 200px rgba(${leftLight.color[0] * 255}, ${leftLight.color[1] * 255}, ${leftLight.color[2] * 255}, ${leftLight.brightness * 0.6}),
                0 0 300px rgba(${leftLight.color[0] * 255}, ${leftLight.color[1] * 255}, ${leftLight.color[2] * 255}, ${leftLight.brightness * 0.4}),
                0 0 400px rgba(${leftLight.color[0] * 255}, ${leftLight.color[1] * 255}, ${leftLight.color[2] * 255}, ${leftLight.brightness * 0.2})
              `
            }}
          />
          <div 
            className="gradient-overlay"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  rgba(${leftLight.color[0] * 255 * leftLight.brightness}, ${leftLight.color[1] * 255 * leftLight.brightness}, ${leftLight.color[2] * 255 * leftLight.brightness}, ${leftLight.intensity * 0.6}) 0%,
                  rgba(${leftLight.color[0] * 200 * leftLight.brightness}, ${leftLight.color[1] * 220 * leftLight.brightness}, ${leftLight.color[2] * 255 * leftLight.brightness}, ${leftLight.intensity * 0.4}) 15%,
                  rgba(${leftLight.color[0] * 150 * leftLight.brightness}, ${leftLight.color[1] * 180 * leftLight.brightness}, ${leftLight.color[2] * 220 * leftLight.brightness}, ${leftLight.intensity * 0.3}) 30%,
                  rgba(${leftLight.color[0] * 100 * leftLight.brightness}, ${leftLight.color[1] * 140 * leftLight.brightness}, ${leftLight.color[2] * 180 * leftLight.brightness}, ${leftLight.intensity * 0.2}) 45%,
                  rgba(${leftLight.color[0] * 50 * leftLight.brightness}, ${leftLight.color[1] * 100 * leftLight.brightness}, ${leftLight.color[2] * 140 * leftLight.brightness}, ${leftLight.intensity * 0.1}) 60%,
                  transparent 80%
                )
              `,
              filter: `saturate(${leftLight.saturation})`,
              transform: `translateY(${(leftLight.position - 50) * 0.5}px)`
            }}
          />
        </div>

        {/* 오른쪽: 홀로그램 매젠타 블룸 */}
        <div 
          className="right-section"
          onMouseDown={(e) => handleSectionMouseDown(e, 'right')}
          onTouchStart={(e) => handleSectionTouchStart(e, 'right')}
        >
          <div 
            className="light-source hologram-effect"
            style={{
              background: rightLight.whiteIntensity > 0.5 ? `
                linear-gradient(
                  to bottom,
                  rgba(255, 255, 255, ${rightLight.intensity}) 0%,
                  rgba(240, 240, 240, ${rightLight.intensity * 0.8}) 20%,
                  rgba(220, 220, 220, ${rightLight.intensity * 0.6}) 40%,
                  rgba(200, 200, 200, ${rightLight.intensity * 0.4}) 60%,
                  rgba(180, 180, 180, ${rightLight.intensity * 0.2}) 80%,
                  transparent 100%
                )
              ` : `
                linear-gradient(
                  to bottom,
                  rgba(${rightLight.color[0] * 255 * rightLight.brightness}, ${rightLight.color[1] * 255 * rightLight.brightness}, ${rightLight.color[2] * 255 * rightLight.brightness}, ${rightLight.intensity}) 0%,
                  rgba(${rightLight.color[0] * 220 * rightLight.brightness}, ${rightLight.color[1] * 50 * rightLight.brightness}, ${rightLight.color[2] * 50 * rightLight.brightness}, ${rightLight.intensity * 0.8}) 20%,
                  rgba(${rightLight.color[0] * 180 * rightLight.brightness}, ${rightLight.color[1] * 30 * rightLight.brightness}, ${rightLight.color[2] * 30 * rightLight.brightness}, ${rightLight.intensity * 0.6}) 40%,
                  rgba(${rightLight.color[0] * 140 * rightLight.brightness}, ${rightLight.color[1] * 20 * rightLight.brightness}, ${rightLight.color[2] * 20 * rightLight.brightness}, ${rightLight.intensity * 0.4}) 60%,
                  rgba(${rightLight.color[0] * 100 * rightLight.brightness}, ${rightLight.color[1] * 10 * rightLight.brightness}, ${rightLight.color[2] * 10 * rightLight.brightness}, ${rightLight.intensity * 0.2}) 80%,
                  transparent 100%
                )
              `,
              top: `${rightLight.position}%`,
              filter: `blur(${40 + (1 - rightLight.spread) * 20}px) saturate(${rightLight.saturation})`,
              boxShadow: rightLight.whiteIntensity > 0.5 ? `
                0 0 100px rgba(255, 255, 255, 1.2),
                0 0 200px rgba(255, 255, 255, 0.9),
                0 0 300px rgba(255, 255, 255, 0.6),
                0 0 400px rgba(255, 255, 255, 0.3)
              ` : `
                0 0 100px rgba(${rightLight.color[0] * 255}, ${rightLight.color[1] * 255}, ${rightLight.color[2] * 255}, ${rightLight.brightness * 0.8}),
                0 0 200px rgba(${rightLight.color[0] * 255}, ${rightLight.color[1] * 255}, ${rightLight.color[2] * 255}, ${rightLight.brightness * 0.6}),
                0 0 300px rgba(${rightLight.color[0] * 255}, ${rightLight.color[1] * 255}, ${rightLight.color[2] * 255}, ${rightLight.brightness * 0.4}),
                0 0 400px rgba(${rightLight.color[0] * 255}, ${rightLight.color[1] * 255}, ${rightLight.color[2] * 255}, ${rightLight.brightness * 0.2})
              `
            }}
          />
          <div 
            className="gradient-overlay"
            style={{
              background: `
                linear-gradient(
                  to bottom,
                  rgba(${rightLight.color[0] * 255 * rightLight.brightness}, ${rightLight.color[1] * 255 * rightLight.brightness}, ${rightLight.color[2] * 255 * rightLight.brightness}, ${rightLight.intensity * 0.6}) 0%,
                  rgba(${rightLight.color[0] * 220 * rightLight.brightness}, ${rightLight.color[1] * 100 * rightLight.brightness}, ${rightLight.color[2] * 200 * rightLight.brightness}, ${rightLight.intensity * 0.4}) 15%,
                  rgba(${rightLight.color[0] * 180 * rightLight.brightness}, ${rightLight.color[1] * 50 * rightLight.brightness}, ${rightLight.color[2] * 150 * rightLight.brightness}, ${rightLight.intensity * 0.3}) 30%,
                  rgba(${rightLight.color[0] * 140 * rightLight.brightness}, ${rightLight.color[1] * 20 * rightLight.brightness}, ${rightLight.color[2] * 100 * rightLight.brightness}, ${rightLight.intensity * 0.2}) 45%,
                  rgba(${rightLight.color[0] * 100 * rightLight.brightness}, ${rightLight.color[1] * 10 * rightLight.brightness}, ${rightLight.color[2] * 80 * rightLight.brightness}, ${rightLight.intensity * 0.1}) 60%,
                  transparent 80%
                )
              `,
              filter: `saturate(${rightLight.saturation})`,
              transform: `translateY(${(rightLight.position - 50) * 0.5}px)`
            }}
          />
        </div>

        {/* 블러 처리된 섹션 경계 */}
        <div className="section-divider" />

        {/* 빛의 잔상들 */}
        {lightTrails.map(trail => (
          <div
            key={trail.id}
            className="light-source"
            style={{
              background: trail.section === 'left' 
                ? (leftLight.whiteIntensity > 0.5 ? `
                    linear-gradient(
                      to bottom,
                      rgba(255, 255, 255, ${leftLight.intensity * trail.opacity}) 0%,
                      rgba(240, 240, 240, ${leftLight.intensity * 0.8 * trail.opacity}) 20%,
                      rgba(220, 220, 220, ${leftLight.intensity * 0.6 * trail.opacity}) 40%,
                      rgba(200, 200, 200, ${leftLight.intensity * 0.4 * trail.opacity}) 60%,
                      rgba(180, 180, 180, ${leftLight.intensity * 0.2 * trail.opacity}) 80%,
                      transparent 100%
                    )
                  ` : `
                    linear-gradient(
                      to bottom,
                      rgba(${leftLight.color[0] * 255}, ${leftLight.color[1] * 255}, ${leftLight.color[2] * 255}, ${leftLight.intensity * trail.opacity}) 0%,
                      rgba(${leftLight.color[0] * 200}, ${leftLight.color[1] * 220}, ${leftLight.color[2] * 255}, ${leftLight.intensity * 0.8 * trail.opacity}) 20%,
                      rgba(${leftLight.color[0] * 150}, ${leftLight.color[1] * 180}, ${leftLight.color[2] * 220}, ${leftLight.intensity * 0.6 * trail.opacity}) 40%,
                      rgba(${leftLight.color[0] * 100}, ${leftLight.color[1] * 140}, ${leftLight.color[2] * 180}, ${leftLight.intensity * 0.4 * trail.opacity}) 60%,
                      rgba(${leftLight.color[0] * 50}, ${leftLight.color[1] * 100}, ${leftLight.color[2] * 140}, ${leftLight.intensity * 0.2 * trail.opacity}) 80%,
                      transparent 100%
                    )
                  `)
                : (rightLight.whiteIntensity > 0.5 ? `
                    linear-gradient(
                      to bottom,
                      rgba(255, 255, 255, ${rightLight.intensity * trail.opacity}) 0%,
                      rgba(240, 240, 240, ${rightLight.intensity * 0.8 * trail.opacity}) 20%,
                      rgba(220, 220, 220, ${rightLight.intensity * 0.6 * trail.opacity}) 40%,
                      rgba(200, 200, 200, ${rightLight.intensity * 0.4 * trail.opacity}) 60%,
                      rgba(180, 180, 180, ${rightLight.intensity * 0.2 * trail.opacity}) 80%,
                      transparent 100%
                    )
                  ` : `
                    linear-gradient(
                      to bottom,
                      rgba(${rightLight.color[0] * 255}, ${rightLight.color[1] * 255}, ${rightLight.color[2] * 255}, ${rightLight.intensity * trail.opacity}) 0%,
                      rgba(${rightLight.color[0] * 220}, ${rightLight.color[1] * 50}, ${rightLight.color[2] * 50}, ${rightLight.intensity * 0.8 * trail.opacity}) 20%,
                      rgba(${rightLight.color[0] * 180}, ${rightLight.color[1] * 30}, ${rightLight.color[2] * 30}, ${rightLight.intensity * 0.6 * trail.opacity}) 40%,
                      rgba(${rightLight.color[0] * 140}, ${rightLight.color[1] * 20}, ${rightLight.color[2] * 20}, ${rightLight.intensity * 0.4 * trail.opacity}) 60%,
                      rgba(${rightLight.color[0] * 100}, ${rightLight.color[1] * 10}, ${rightLight.color[2] * 10}, ${rightLight.intensity * 0.2 * trail.opacity}) 80%,
                      transparent 100%
                    )
                  `),
              top: `${trail.position}%`,
              filter: `blur(${40 + (1 - (trail.section === 'left' ? leftLight.spread : rightLight.spread)) * 20}px) saturate(${trail.section === 'left' ? leftLight.saturation : rightLight.saturation})`,
              opacity: trail.opacity,
              zIndex: 1
            }}
          />
        ))}


        {/* 홀로그램 글로우 효과 (깜빡임 제거) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(
              ellipse at 50% ${leftLight.position}%,
              rgba(${leftLight.color[0] * 255}, ${leftLight.color[1] * 255}, ${leftLight.color[2] * 255}, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              ellipse at 50% ${rightLight.position}%,
              rgba(${rightLight.color[0] * 255}, ${rightLight.color[1] * 255}, ${rightLight.color[2] * 255}, 0.1) 0%,
              transparent 50%
            )
          `,
          pointerEvents: 'none',
          zIndex: 2
        }} />
      </div>
    </>
  );
}
