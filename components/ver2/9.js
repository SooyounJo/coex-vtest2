import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function AboutContent() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [stretchAmount, setStretchAmount] = useState(0);
  const [stretchDirection, setStretchDirection] = useState({ x: 0, y: 0 });
  const [snappedDot, setSnappedDot] = useState(null);
  const [dots, setDots] = useState([]);
  const [springAnimation, setSpringAnimation] = useState({ isAnimating: false, targetAmount: 0, velocity: 0 });
  const circleRef = useRef(null);

  // FxFilterJS 로드 확인
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('FxFilterJS available:', !!window.FxFilter);
      if (window.FxFilter) {
        console.log('FxFilter methods:', Object.keys(window.FxFilter));
      }
    }
  }, []);

  // 레드 닷들 생성 (세로형으로 변경)
  useEffect(() => {
    const generateDots = () => {
      const newDots = [];
      const circleCenterX = window.innerWidth / 2; // 원의 중심 X (화면 중앙)
      const circleCenterY = 100; // 원의 중심 Y (더 작게)
      const circleRadius = 60; // 원의 반지름
      const minDistance = circleRadius + 40; // 최소 거리
      
      // 아래로 나란히 배치
      const startY = circleCenterY + minDistance;
      const endY = window.innerHeight - 50; // 아래에서 50px 안쪽으로
      const totalHeight = endY - startY;
      const spacing = totalHeight / 4; // 간격을 더 줄이기
      
      for (let i = 0; i < 5; i++) {
        const x = circleCenterX; // 화면 중앙으로 수정
        const y = startY + (i * spacing);
        
        newDots.push({
          id: i,
          x: x,
          y: y,
          distance: Math.sqrt(Math.pow(x - circleCenterX, 2) + Math.pow(y - circleCenterY, 2)),
          color: [
            { r: 255, g: 80, b: 80 },   // 진한 레드
            { r: 255, g: 100, b: 100 }, // 중간 레드
            { r: 255, g: 120, b: 120 }, // 밝은 레드
            { r: 255, g: 140, b: 140 }, // 연한 레드
            { r: 255, g: 160, b: 160 }  // 매우 연한 레드
          ][i]
        });
      }
      
      setDots(newDots);
    };
    
    generateDots();
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // 왼쪽 마우스 버튼만 허용
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // 드래그 거리 계산
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const newStretchAmount = Math.max(0, distance * 1.2); // 더 민감하게
    
    // 드래그 방향 계산 (마우스 커서 방향)
    const direction = {
      x: deltaX / Math.max(distance, 1),
      y: deltaY / Math.max(distance, 1)
    };
    
    // 자동 스냅 체크 (마우스 커서 기준)
    let closestDot = null;
    let minDistance = Infinity;
    
    dots.forEach(dot => {
      const dotDistance = Math.sqrt(
        Math.pow(dot.x - e.clientX, 2) + Math.pow(dot.y - e.clientY, 2)
      );
      if (dotDistance < minDistance && dotDistance < 80) { // 마우스 커서 기준으로 스냅
        minDistance = dotDistance;
        closestDot = dot;
      }
    });
    
      if (closestDot) {
        // 자동 스냅: 아래쪽 끝이 닷에 정확히 붙도록
        const dotDirection = {
          x: 0, // 세로로만 늘어나기
          y: 1
        };
        setStretchDirection(dotDirection);
        setStretchAmount(Math.max(0, closestDot.y - 110)); // 원의 중심이 닷의 중심과 맞도록
        setSnappedDot(closestDot); // 스냅된 닷 설정
      } else {
        // 자유 드래그: 마우스 커서를 따라가도록
        setStretchAmount(newStretchAmount);
        setStretchDirection(direction);
        setSnappedDot(null); // 스냅 해제
      }
  }, [isDragging, dragStart, dots]);

  // 모바일 바이브레이션 함수
  const triggerVibration = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]); // 아주 약한 바이브레이션 (0.13초)
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // 당긴 쪽 원의 중심 계산 (아래쪽 끝)
    const stretchedEndX = window.innerWidth / 2; // 화면 중앙
    const stretchedEndY = 50 + 60 + stretchAmount; // 위쪽 끝(50px) + 원 반지름(60px) + 늘어난 길이
      
      // 가장 가까운 닷 찾기 (당긴 쪽 원의 중심 기준)
      let closestDot = null;
      let minDistance = Infinity;
      
      dots.forEach(dot => {
        const distance = Math.sqrt(
          Math.pow(dot.x - stretchedEndX, 2) + Math.pow(dot.y - stretchedEndY, 2)
        );
        if (distance < minDistance && distance < 30) { // 30px 이내에서만 정확한 스냅
          minDistance = distance;
          closestDot = dot;
        }
      });
      
      if (closestDot) {
        setSnappedDot(closestDot);
        // 닷 방향으로 늘어나기
        const dotDirection = {
          x: 0, // 세로로만 늘어나기
          y: 1
        };
        setStretchDirection(dotDirection);
        
        // 모바일 바이브레이션 트리거
        triggerVibration();
        
        // 스프링 애니메이션 시작 - 원의 중심이 닷의 중심과 맞도록
        const targetAmount = Math.max(0, closestDot.y - 110);
        setSpringAnimation({
          isAnimating: true,
          targetAmount: targetAmount,
          velocity: 2.0 // 초기 속도 추가로 더 찰진 느낌
        });
      } else {
        setSnappedDot(null);
        setStretchDirection({ x: 0, y: 0 });
        
        // 스프링으로 원래 위치로 복귀
        setSpringAnimation({
          isAnimating: true,
          targetAmount: 0,
          velocity: -2.0 // 더 강한 뒤로 튀는 효과
        });
      }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // 당긴 쪽 원의 중심 계산 (아래쪽 끝)
    const stretchedEndX = window.innerWidth / 2; // 화면 중앙
    const stretchedEndY = 50 + 60 + stretchAmount; // 위쪽 끝(50px) + 원 반지름(60px) + 늘어난 길이
      
      // 가장 가까운 닷 찾기 (당긴 쪽 원의 중심 기준)
      let closestDot = null;
      let minDistance = Infinity;
      
      dots.forEach(dot => {
        const distance = Math.sqrt(
          Math.pow(dot.x - stretchedEndX, 2) + Math.pow(dot.y - stretchedEndY, 2)
        );
        if (distance < minDistance && distance < 30) { // 30px 이내에서만 정확한 스냅
          minDistance = distance;
          closestDot = dot;
        }
      });
      
      if (closestDot) {
        setSnappedDot(closestDot);
        // 닷 방향으로 늘어나기
        const dotDirection = {
          x: 0, // 세로로만 늘어나기
          y: 1
        };
        setStretchDirection(dotDirection);
        
        // 모바일 바이브레이션 트리거
        triggerVibration();
        
        // 스프링 애니메이션 시작 - 원의 중심이 닷의 중심과 맞도록
        const targetAmount = Math.max(0, closestDot.y - 110);
        setSpringAnimation({
          isAnimating: true,
          targetAmount: targetAmount,
          velocity: 2.0 // 초기 속도 추가로 더 찰진 느낌
        });
      } else {
        setSnappedDot(null);
        setStretchDirection({ x: 0, y: 0 });
        
        // 스프링으로 원래 위치로 복귀
        setSpringAnimation({
          isAnimating: true,
          targetAmount: 0,
          velocity: -2.0 // 더 강한 뒤로 튀는 효과
        });
      }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging) return;
      
      e.preventDefault();
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      // 드래그 거리 계산
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const newStretchAmount = Math.max(0, distance * 1.2); // 더 민감하게
      
      // 드래그 방향 계산 (마우스 커서 방향)
      const direction = {
        x: deltaX / Math.max(distance, 1),
        y: deltaY / Math.max(distance, 1)
      };
      
    // 자동 스냅 체크 (당긴 쪽 원의 중심 기준)
    let closestDot = null;
    let minDistance = Infinity;
    
    // 당긴 쪽 원의 중심 계산 (아래쪽 끝)
    const stretchedEndX = window.innerWidth / 2; // 화면 중앙
    const stretchedEndY = 50 + 75 + newStretchAmount; // 위쪽 끝(50px) + 원 반지름(75px) + 늘어난 길이
    
    dots.forEach(dot => {
      const dotDistance = Math.sqrt(
        Math.pow(dot.x - stretchedEndX, 2) + Math.pow(dot.y - stretchedEndY, 2)
      );
      if (dotDistance < minDistance && dotDistance < 30) { // 스냅 범위 조정
        minDistance = dotDistance;
        closestDot = dot;
      }
    });
      
      if (closestDot) {
        // 자동 스냅: 아래쪽 끝이 닷에 정확히 붙도록
        const dotDirection = {
          x: 0, // 세로로만 늘어나기
          y: 1
        };
        setStretchDirection(dotDirection);
        setStretchAmount(Math.max(0, closestDot.y - 110)); // 원의 중심이 닷의 중심과 맞도록
        setSnappedDot(closestDot); // 스냅된 닷 설정
      } else {
        // 자유 드래그: 마우스 커서를 따라가도록
        setStretchAmount(newStretchAmount);
        setStretchDirection(direction);
        setSnappedDot(null); // 스냅 해제
      }
    };

    const handleGlobalMouseUp = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
      document.addEventListener('mouseleave', handleGlobalMouseUp, { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart]);

  // 스프링 애니메이션
  useEffect(() => {
    if (!springAnimation.isAnimating) return;
    
    const springConfig = {
      stiffness: 0.5,  // 더 강한 스프링 (0.3 -> 0.5)
      damping: 0.7,    // 더 찰진 느낌 (0.8 -> 0.7)
      mass: 0.8        // 더 가벼운 질량 (1 -> 0.8)
    };
    
    let animationId;
    let currentAmount = stretchAmount;
    let velocity = springAnimation.velocity;
    
    const animate = () => {
      const force = (springAnimation.targetAmount - currentAmount) * springConfig.stiffness;
      const dampingForce = velocity * springConfig.damping;
      const acceleration = (force - dampingForce) / springConfig.mass;
      
      velocity += acceleration;
      currentAmount += velocity;
      
      // 바운스 효과 추가
      if (Math.abs(velocity) < 0.2 && Math.abs(springAnimation.targetAmount - currentAmount) < 2) {
        // 목표에 거의 도달했을 때 미세한 바운스
        if (Math.abs(springAnimation.targetAmount - currentAmount) > 0.5) {
          velocity += (springAnimation.targetAmount - currentAmount) * 0.05;
        } else {
          setStretchAmount(springAnimation.targetAmount);
          setSpringAnimation({ isAnimating: false, targetAmount: 0, velocity: 0 });
          return;
        }
      }
      
      setStretchAmount(currentAmount);
      
      // 애니메이션 종료 조건
      if (Math.abs(velocity) < 0.1 && Math.abs(springAnimation.targetAmount - currentAmount) < 0.1) {
        setStretchAmount(springAnimation.targetAmount);
        setSpringAnimation({ isAnimating: false, targetAmount: 0, velocity: 0 });
      } else {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [springAnimation.isAnimating, springAnimation.targetAmount]);

  // 컴포넌트 언마운트 시 상태 초기화
  useEffect(() => {
    return () => {
      setIsDragging(false);
      setStretchAmount(0);
    };
  }, []);
  // 전체 화면 붉어짐 계산
  const maxDistance = Math.max(...dots.map(dot => dot.distance));
  const rednessIntensity = snappedDot ? 
    Math.min(0.3, (snappedDot.distance / maxDistance) * 0.3) : 0;
  
  // 원기둥 색상 변화 계산 (스냅된 닷의 색상으로)
  const getCircleColor = () => {
    return { r: 255, g: 80, b: 80 }; // 더 강한 레드 색상
  };
  
  const circleColor = getCircleColor();

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes bounce {
          0% { transform: translate(-50%, -50%) translateY(0px); }
          100% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        
        @keyframes rotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(180deg); }
        }
        
        @keyframes scale {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.3); }
        }
        
        @keyframes glow {
          0% { 
            box-shadow: 
              0 0 20px rgba(255, 80, 80, 0.9),
              0 0 40px rgba(255, 100, 100, 0.7),
              0 0 60px rgba(255, 120, 120, 0.5),
              0 0 80px rgba(255, 140, 140, 0.3),
              0 0 100px rgba(255, 160, 160, 0.1);
          }
          100% { 
            box-shadow: 
              0 0 30px rgba(255, 80, 80, 1),
              0 0 60px rgba(255, 100, 100, 0.9),
              0 0 90px rgba(255, 120, 120, 0.7),
              0 0 120px rgba(255, 140, 140, 0.5),
              0 0 150px rgba(255, 160, 160, 0.3);
          }
        }
      `}</style>
      
      <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* 위에서 비치는 강한 빛 효과 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(
            ellipse at 50% ${isDragging ? Math.max(0, 20 - stretchAmount / 20) : 20}%,
            rgba(255, 255, 255, ${isDragging ? Math.min(0.3, stretchAmount / 200) : 0}) 0%,
            rgba(255, 255, 255, ${isDragging ? Math.min(0.2, stretchAmount / 300) : 0}) 30%,
            transparent 70%
          )
        `,
        '--fx-filter': `
          ${isDragging ? `
            blur(${Math.min(3, stretchAmount / 30)}px)
            brightness(${Math.min(1.5, 1 + stretchAmount / 100)})
            saturate(${Math.min(2, 1 + stretchAmount / 150)})
          ` : 'none'}
        `,
        zIndex: 2,
        pointerEvents: 'none',
        transition: 'all 0.2s ease-out'
      }} />
      
      {/* 왜곡 효과 오버레이 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
        '--fx-filter': `
          ${isDragging ? `
            blur(${Math.min(6, stretchAmount / 15)}px) 
            liquid-glass(${Math.min(6, stretchAmount / 15)}, ${Math.min(25, stretchAmount / 10)}, 1) 
            saturate(${Math.min(2.5, 1 + stretchAmount / 80)})
            brightness(${Math.min(1.5, 1 + stretchAmount / 150)})
          ` : 'none'}
        `,
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      
      {/* 글래스모피즘 배경 오버레이 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: `blur(${12 + (isDragging ? stretchAmount / 10 : 0)}px) saturate(${1.8 + (isDragging ? stretchAmount / 50 : 0)}) brightness(${1.2 + (isDragging ? stretchAmount / 100 : 0)})`,
        '--fx-filter': `
          blur(${12 + (isDragging ? stretchAmount / 10 : 0)}px) 
          noise(0.3, 0.8, 0.15) 
          ${isDragging ? `
            liquid-glass(${Math.min(4, stretchAmount / 25)}, ${Math.min(15, stretchAmount / 20)}, 1) 
            brightness(${Math.min(1.8, 1 + stretchAmount / 120)})
            contrast(${Math.min(1.3, 1 + stretchAmount / 300)})
          ` : ''}
        `,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 0
      }} />
      
      {/* 원 주변 왜곡 효과 */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: `${50 - stretchAmount * 0.1}px`,
        transform: 'translateX(-50%)',
        width: `${120 + stretchAmount * 0.1}px`,
        height: `${120 + stretchAmount + stretchAmount * 0.2}px`,
        background: 'transparent',
        borderRadius: '50%',
        '--fx-filter': `
          ${isDragging ? `
            blur(${Math.min(8, stretchAmount / 10)}px) 
            liquid-glass(${Math.min(8, stretchAmount / 10)}, ${Math.min(30, stretchAmount / 8)}, 1) 
            saturate(${Math.min(3, 1 + stretchAmount / 50)})
            brightness(${Math.min(2, 1 + stretchAmount / 100)})
            contrast(${Math.min(1.5, 1 + stretchAmount / 200)})
          ` : 'none'}
        `,
        zIndex: 0.5,
        pointerEvents: 'none',
        transition: 'all 0.1s ease-out'
      }} />
      
      {/* 그라데이션 원 (세로형, 위쪽 끝 좌우 중앙 배치, 드래그 인터랙션) */}
      <div
        ref={circleRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'absolute',
          width: `${120 + (isDragging ? Math.sin(Date.now() * 0.01) * 5 : 0)}px`,
          height: `${120 + stretchAmount}px`,
          background: `
            linear-gradient(
              to bottom,
              rgba(255, 80, 80, 0.9) 0%,
              rgba(255, 100, 100, 0.8) 20%,
              rgba(255, 120, 120, 0.7) 40%,
              rgba(255, 140, 140, 0.6) 60%,
              rgba(255, 160, 160, 0.5) 80%,
              rgba(255, 180, 180, 0.4) 100%
            )
          `,
          borderRadius: isDragging ? 
            `${60 + Math.sin(Date.now() * 0.02) * 10}px` : 
            (stretchAmount > 50 ? '100px' : '50%'),
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(6px) saturate(1.5) brightness(1.1)',
          boxShadow: `
            0 0 40px rgba(255, 80, 80, 0.9),
            0 0 80px rgba(255, 100, 100, 0.7),
            0 0 120px rgba(255, 120, 120, 0.5),
            0 0 160px rgba(255, 140, 140, 0.3),
            0 0 200px rgba(255, 160, 160, 0.1),
            inset 0 0 50px rgba(255, 80, 80, 0.4)
          `,
          '--fx-filter': 'blur(4px) liquid-glass(2, 10, 1) saturate(1.25)',
          left: '50%',
          top: '50px',
          transform: 'translateX(-50%)',
          zIndex: 1,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'all 0.3s ease',
          userSelect: 'none'
        }}
      />
      
      {/* 글로시 반사 오버레이 */}
      <div
        style={{
          position: 'absolute',
          width: `${120 + (isDragging ? Math.sin(Date.now() * 0.01) * 5 : 0)}px`,
          height: `${120 + stretchAmount}px`,
          background: `
            radial-gradient(
              ellipse at 30% 20%,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 255, 255, 0.6) 20%,
              rgba(255, 255, 255, 0.3) 40%,
              transparent 60%
            ),
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.8) 0%,
              rgba(255, 255, 255, 0.4) 30%,
              transparent 50%
            )
          `,
          borderRadius: isDragging ? 
            `${60 + Math.sin(Date.now() * 0.02) * 10}px` : 
            (stretchAmount > 50 ? '100px' : '50%'),
          left: '50%',
          top: '50px',
          transform: 'translateX(-50%)',
          zIndex: 2,
          pointerEvents: 'none',
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* 레드 닷들 */}
      {dots.map(dot => {
        // 각 닷마다 다른 애니메이션 효과
        const getDotAnimation = (dotId) => {
          switch(dotId) {
            case 0: return 'pulse'; // 펄스 애니메이션
            case 1: return 'bounce'; // 바운스 애니메이션
            case 2: return 'rotate'; // 로테이트 애니메이션
            case 3: return 'scale'; // 스케일 애니메이션
            case 4: return 'glow'; // 글로우 애니메이션
            default: return 'none';
          }
        };

        const animationClass = getDotAnimation(dot.id);
        const isSnapped = snappedDot?.id === dot.id;
        
        return (
          <div
            key={dot.id}
            style={{
              position: 'absolute',
              left: `${dot.x}px`,
              top: `${dot.y}px`,
              width: '24px',
              height: '24px',
              background: `rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, 0.6)`,
              borderRadius: isDragging ? 
            `${60 + Math.sin(Date.now() * 0.02) * 10}px` : 
            (stretchAmount > 50 ? '100px' : '50%'),
              border: '1px solid rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(4px) saturate(1.3) brightness(1.1)',
              boxShadow: `
                0 0 20px rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, 0.9),
                0 0 40px rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, 0.7),
                0 0 60px rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, 0.5),
                0 0 80px rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, 0.3),
                0 0 100px rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, 0.1)
              `,
              filter: 'blur(3px)',
              '--fx-filter': 'blur(3px) noise(0.3, 0.8, 0.15)',
              zIndex: 3,
              transform: 'translate(-50%, -50%)',
              opacity: isSnapped ? 0.3 : 1,
              animation: isSnapped ? `${animationClass} 0.6s ease-in-out infinite alternate` : 'none',
              transition: 'all 0.3s ease'
            }}
          />
        );
      })}
      
    </div>
    </>
  );
}
