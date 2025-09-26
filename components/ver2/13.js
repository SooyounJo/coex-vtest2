import React, { useState, useRef, useCallback } from 'react';

export default function FunButtons() {
  const [ripples, setRipples] = useState([]);
  const [morphing, setMorphing] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [neon, setNeon] = useState(false);
  const [liquid, setLiquid] = useState(false);
  const [magnetic, setMagnetic] = useState(false);
  const [chainReaction, setChainReaction] = useState(false);
  const [particles, setParticles] = useState([]);
  const [activatingButton, setActivatingButton] = useState(null);
  const [activeButtons, setActiveButtons] = useState([]);

  // 리플 효과 생성
  const createRipple = useCallback((e, buttonType) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      buttonType: buttonType,
      timestamp: Date.now()
    };
    
    setRipples(prev => [...prev.slice(-5), newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
  }, []);

  // 파티클 생성
  const createParticles = useCallback((x, y) => {
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      const distance = 50 + Math.random() * 100;
      const randomX = Math.cos(angle) * distance;
      const randomY = Math.sin(angle) * distance;
      
      newParticles.push({
        id: Date.now() + Math.random() + i,
        x: x,
        y: y,
        randomX: randomX,
        randomY: randomY,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // 2초 후 파티클 제거
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 2000);
  }, []);

  // 연쇄 반응 시작/중지
  const toggleChainReaction = useCallback((e) => {
    if (chainReaction) {
      // 체인 리액션 중지 - 모든 효과 리셋
      setMorphing(false);
      setGlitch(false);
      setNeon(false);
      setLiquid(false);
      setMagnetic(false);
      setChainReaction(false);
      setActivatingButton(null);
      setActiveButtons([]);
      return;
    }
    
    // 체인 리액션 시작 - 모든 효과 동시 활성화
    setChainReaction(true);
    createRipple(e, 'chain');
    createParticles(e.clientX, e.clientY);
    
    // 모든 버튼을 동시에 활성화
    setMorphing(true);
    setGlitch(true);
    setNeon(true);
    setLiquid(true);
    setMagnetic(true);
    setActiveButtons(['morph', 'glitch', 'neon', 'liquid', 'magnetic']);
    
    // 순차적으로 비활성화 (시각적 효과를 위해)
    const buttons = ['morph', 'glitch', 'neon', 'liquid', 'magnetic'];
    
    buttons.forEach((button, index) => {
      setTimeout(() => {
        // 체인 리액션이 중지되었으면 실행하지 않음
        if (!chainReaction) return;
        
        // 버튼 비활성화 애니메이션 시작
        setActivatingButton(button);
        
        setTimeout(() => {
          // 체인 리액션이 중지되었으면 실행하지 않음
          if (!chainReaction) return;
          
          switch(button) {
            case 'morph':
              setMorphing(false);
              setActiveButtons(prev => prev.filter(b => b !== 'morph'));
              break;
            case 'glitch':
              setGlitch(false);
              setActiveButtons(prev => prev.filter(b => b !== 'glitch'));
              break;
            case 'neon':
              setNeon(false);
              setActiveButtons(prev => prev.filter(b => b !== 'neon'));
              break;
            case 'liquid':
              setLiquid(false);
              setActiveButtons(prev => prev.filter(b => b !== 'liquid'));
              break;
            case 'magnetic':
              setMagnetic(false);
              setActiveButtons(prev => prev.filter(b => b !== 'magnetic'));
              break;
          }
          setActivatingButton(null);
        }, 200); // 비활성화 애니메이션 시간
      }, index * 300); // 300ms 간격으로 순차 비활성화
    });
    
    // 5초 후 모든 효과 리셋
    setTimeout(() => {
      if (chainReaction) { // 아직 체인 리액션이 활성화되어 있을 때만 리셋
        setMorphing(false);
        setGlitch(false);
        setNeon(false);
        setLiquid(false);
        setMagnetic(false);
        setChainReaction(false);
        setActivatingButton(null);
        setActiveButtons([]);
      }
    }, 5000);
  }, [chainReaction, createRipple, createParticles]);

  // 개별 버튼 클릭 핸들러
  const handleButtonClick = useCallback((e, buttonType) => {
    if (chainReaction) return; // 연쇄 반응 중에는 개별 클릭 무시
    
    createRipple(e, buttonType);
    
    switch(buttonType) {
      case 'morph':
        setMorphing(true);
        setActiveButtons(prev => [...prev, 'morph']);
        setTimeout(() => {
          setMorphing(false);
          setActiveButtons(prev => prev.filter(b => b !== 'morph'));
        }, 2000);
        break;
      case 'glitch':
        setGlitch(true);
        setActiveButtons(prev => [...prev, 'glitch']);
        setTimeout(() => {
          setGlitch(false);
          setActiveButtons(prev => prev.filter(b => b !== 'glitch'));
        }, 1000);
        break;
      case 'neon':
        setNeon(!neon);
        if (neon) {
          setActiveButtons(prev => prev.filter(b => b !== 'neon'));
        } else {
          setActiveButtons(prev => [...prev, 'neon']);
        }
        break;
      case 'liquid':
        setLiquid(true);
        setActiveButtons(prev => [...prev, 'liquid']);
        setTimeout(() => {
          setLiquid(false);
          setActiveButtons(prev => prev.filter(b => b !== 'liquid'));
        }, 1500);
        break;
      case 'magnetic':
        setMagnetic(!magnetic);
        if (magnetic) {
          setActiveButtons(prev => prev.filter(b => b !== 'magnetic'));
        } else {
          setActiveButtons(prev => [...prev, 'magnetic']);
        }
        break;
    }
  }, [chainReaction, createRipple, neon, magnetic]);

  // 배경 스타일 계산 함수
  const getBackgroundStyle = useCallback(() => {
    const activeCount = activeButtons.length;
    
    // 특별한 조합들
    if (activeButtons.includes('morph') && activeButtons.includes('liquid')) {
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
        animation: 'morph-liquid 2s ease-in-out infinite alternate',
        filter: 'hue-rotate(0deg) saturate(1.5) brightness(1.2)'
      };
    }
    
    if (activeButtons.includes('glitch') && activeButtons.includes('neon')) {
      return {
        background: 'linear-gradient(45deg, #000 0%, #ff0080 25%, #00ff80 50%, #8000ff 75%, #000 100%)',
        animation: 'glitch-neon 0.5s ease-in-out infinite alternate',
        filter: 'contrast(1.5) brightness(1.3)'
      };
    }
    
    if (activeButtons.includes('magnetic') && activeButtons.includes('neon')) {
      return {
        background: 'radial-gradient(circle, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #feca57 100%)',
        animation: 'magnetic-neon 1s ease-in-out infinite alternate',
        filter: 'hue-rotate(30deg) saturate(1.8)'
      };
    }
    
    // 3개 이상 조합
    if (activeCount >= 3) {
      return {
        background: 'conic-gradient(from 0deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff, #ff6b6b)',
        animation: 'rainbow-spin 3s linear infinite',
        filter: 'brightness(1.4) saturate(2)'
      };
    }
    
    // 2개 조합
    if (activeCount === 2) {
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        animation: 'dual-pulse 1.5s ease-in-out infinite alternate',
        filter: 'hue-rotate(60deg) brightness(1.3)'
      };
    }
    
    // 단일 버튼별 스타일
    if (activeButtons.includes('morph')) {
      return {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        animation: 'morph-pulse 2s ease-in-out infinite alternate',
        filter: 'hue-rotate(0deg) saturate(1.2)'
      };
    }
    
    if (activeButtons.includes('glitch')) {
      return {
        background: 'linear-gradient(90deg, #1a1a1a 0%, #00ff88 30%, #ff0080 50%, #00ff88 70%, #1a1a1a 100%)',
        animation: 'glitch-flicker 0.5s ease-in-out infinite alternate',
        filter: 'contrast(1.2) brightness(1.1)'
      };
    }
    
    if (activeButtons.includes('neon')) {
      return {
        background: 'linear-gradient(135deg, #ff0080, #00ff80, #8000ff)',
        animation: 'neon-glow 1s ease-in-out infinite alternate',
        filter: 'brightness(1.4) saturate(1.8)'
      };
    }
    
    if (activeButtons.includes('liquid')) {
      return {
        background: 'linear-gradient(45deg, #667eea, #764ba2)',
        animation: 'liquid-flow 3s ease-in-out infinite alternate',
        filter: 'hue-rotate(30deg) saturate(1.3)'
      };
    }
    
    if (activeButtons.includes('magnetic')) {
      return {
        background: 'radial-gradient(circle, #ff9a9e, #fecfef)',
        animation: 'magnetic-pulse 1.5s ease-in-out infinite alternate',
        filter: 'hue-rotate(45deg) brightness(1.2)'
      };
    }
    
    // 기본 스타일
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'none',
      filter: 'none'
    };
  }, [activeButtons]);

  return (
    <>
      <style jsx>{`
        .button-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
          padding: 20px;
          transition: all 0.5s ease;
        }

        .button-container.chain-active {
          background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%);
          animation: background-pulse 0.5s ease-in-out infinite alternate;
          position: relative;
          overflow: hidden;
        }

        .button-container:not(.chain-active) {
          animation: none;
        }

        .button-container.chain-active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
          animation: shimmer 2s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes background-pulse {
          from { 
            filter: hue-rotate(0deg) brightness(1) saturate(1);
            transform: scale(1);
          }
          to { 
            filter: hue-rotate(60deg) brightness(1.3) saturate(1.5);
            transform: scale(1.02);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* 특별한 조합 애니메이션들 */
        @keyframes morph-liquid {
          from { 
            background-position: 0% 50%;
            filter: hue-rotate(0deg) saturate(1.5) brightness(1.2);
          }
          to { 
            background-position: 100% 50%;
            filter: hue-rotate(60deg) saturate(2) brightness(1.4);
          }
        }

        @keyframes glitch-neon {
          from { 
            filter: contrast(1.5) brightness(1.3) hue-rotate(0deg);
            transform: scale(1);
          }
          to { 
            filter: contrast(2.5) brightness(1.8) hue-rotate(180deg);
            transform: scale(1.02);
          }
        }

        @keyframes magnetic-neon {
          from { 
            filter: hue-rotate(30deg) saturate(1.8) brightness(1);
            transform: rotate(0deg);
          }
          to { 
            filter: hue-rotate(210deg) saturate(2.5) brightness(1.3);
            transform: rotate(5deg);
          }
        }

        @keyframes rainbow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes dual-pulse {
          from { 
            filter: hue-rotate(60deg) brightness(1.3) saturate(1.2);
            transform: scale(1);
          }
          to { 
            filter: hue-rotate(120deg) brightness(1.6) saturate(1.8);
            transform: scale(1.05);
          }
        }

        /* 단일 버튼 애니메이션들 */
        @keyframes morph-pulse {
          from { 
            filter: hue-rotate(0deg) saturate(1.2) brightness(1);
            transform: scale(1);
          }
          to { 
            filter: hue-rotate(30deg) saturate(1.5) brightness(1.2);
            transform: scale(1.02);
          }
        }

        @keyframes glitch-flicker {
          from { 
            filter: contrast(1.2) brightness(1.1) hue-rotate(0deg);
            transform: translateX(0);
          }
          to { 
            filter: contrast(1.5) brightness(1.3) hue-rotate(30deg);
            transform: translateX(1px);
          }
        }

        @keyframes neon-glow {
          from { 
            filter: brightness(1.4) saturate(1.8) hue-rotate(0deg);
            box-shadow: 0 0 20px rgba(255, 0, 128, 0.5);
          }
          to { 
            filter: brightness(1.8) saturate(2.5) hue-rotate(60deg);
            box-shadow: 0 0 40px rgba(255, 0, 128, 0.8);
          }
        }

        @keyframes liquid-flow {
          from { 
            filter: hue-rotate(30deg) saturate(1.3) brightness(1);
            background-position: 0% 50%;
          }
          to { 
            filter: hue-rotate(90deg) saturate(1.8) brightness(1.2);
            background-position: 100% 50%;
          }
        }

        @keyframes magnetic-pulse {
          from { 
            filter: hue-rotate(45deg) brightness(1.2) saturate(1);
            transform: scale(1) rotate(0deg);
          }
          to { 
            filter: hue-rotate(135deg) brightness(1.5) saturate(1.5);
            transform: scale(1.03) rotate(2deg);
          }
        }

        .button {
          position: relative;
          padding: 15px 30px;
          border: none;
          border-radius: 50px;
          font-family: 'Arial', sans-serif;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
          user-select: none;
          min-width: 200px;
          text-align: center;
        }

        .button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: scale(0.95);
        }

        .button.chain-activating {
          animation: chain-activate 0.3s ease-in-out;
          transform: scale(1.2);
          z-index: 10;
        }

        @keyframes chain-activate {
          0% { 
            transform: scale(1);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          50% { 
            transform: scale(1.3);
            box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.4);
          }
          100% { 
            transform: scale(1.2);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
          }
        }

        .chain-trigger {
          background: linear-gradient(45deg, #ff9a9e, #fecfef, #a8edea, #fed6e3);
          background-size: 400% 400%;
          animation: gradient-shift 3s ease infinite;
          color: #333;
          font-family: 'Arial', sans-serif;
          font-size: 18px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .chain-trigger:hover {
          transform: scale(1.1) rotate(2deg);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* 1. 모핑 버튼 */
        .morph-button {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .morph-button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .morph-button.morphing {
          animation: morph 2s ease-in-out;
        }

        @keyframes morph {
          0%, 100% { border-radius: 50px; }
          25% { border-radius: 20px; }
          50% { border-radius: 0px; }
          75% { border-radius: 20px; }
        }

        /* 2. 글리치 버튼 */
        .glitch-button {
          background: linear-gradient(45deg, #1a1a1a, #2d2d2d);
          color: #00ff88;
          font-family: 'Arial', sans-serif;
          border: 2px solid #00ff88;
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
        }

        .glitch-button:hover {
          background: linear-gradient(45deg, #00ff88, #00cc6a);
          color: #000;
          box-shadow: 0 0 25px rgba(0, 255, 136, 0.6);
        }

        .glitch-button.glitching {
          animation: glitch 0.3s ease-in-out;
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        /* 3. 네온 버튼 */
        .neon-button {
          background: transparent;
          color: #ff0080;
          border: 2px solid #ff0080;
          text-shadow: 0 0 5px #ff0080;
        }

        .neon-button:hover {
          background: #ff0080;
          color: #000;
          box-shadow: 0 0 20px #ff0080, 0 0 40px #ff0080;
        }

        .neon-button.neon-active {
          animation: neon-pulse 1s ease-in-out infinite alternate;
        }

        @keyframes neon-pulse {
          from { 
            box-shadow: 0 0 10px #ff0080, 0 0 20px #ff0080;
            text-shadow: 0 0 5px #ff0080;
          }
          to { 
            box-shadow: 0 0 20px #ff0080, 0 0 40px #ff0080, 0 0 60px #ff0080;
            text-shadow: 0 0 10px #ff0080, 0 0 20px #ff0080;
          }
        }

        /* 4. 리퀴드 버튼 */
        .liquid-button {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          position: relative;
        }

        .liquid-button:hover {
          transform: translateY(-2px);
        }

        .liquid-button.liquid-active {
          animation: liquid 1.5s ease-in-out;
        }

        @keyframes liquid {
          0%, 100% { border-radius: 50px; }
          25% { border-radius: 60% 40% 30% 70%; }
          50% { border-radius: 30% 60% 70% 40%; }
          75% { border-radius: 40% 30% 60% 70%; }
        }

        /* 5. 매그네틱 버튼 */
        .magnetic-button {
          background: linear-gradient(45deg, #ff9a9e, #fecfef);
          color: #333;
          transition: all 0.1s ease;
        }

        .magnetic-button:hover {
          transform: scale(1.1);
        }

        .magnetic-button.magnetic-active {
          animation: magnetic 0.5s ease-in-out infinite alternate;
        }

        @keyframes magnetic {
          from { 
            transform: scale(1) rotate(0deg);
            box-shadow: 0 0 0 rgba(255, 154, 158, 0.4);
          }
          to { 
            transform: scale(1.05) rotate(2deg);
            box-shadow: 0 0 20px rgba(255, 154, 158, 0.8);
          }
        }

        /* 리플 효과 */
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 1s ease-out;
          pointer-events: none;
        }

        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        /* 파티클 효과 */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
          pointer-events: none;
          animation: particle-float 2s ease-out forwards;
        }

        @keyframes particle-float {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--random-x), var(--random-y)) scale(0);
          }
        }
      `}</style>

      <div 
        className={`button-container ${chainReaction ? 'chain-active' : ''}`}
        style={getBackgroundStyle()}
      >
        {/* 연쇄 반응 트리거 버튼 */}
        <button
          className="button chain-trigger"
          onClick={toggleChainReaction}
        >
          {chainReaction ? 'Stop Chain Reaction!' : 'Start Chain Reaction!'}
        </button>

        {/* 1. 모핑 버튼 */}
        <button
          className={`button morph-button ${morphing ? 'morphing' : ''} ${chainReaction ? 'disabled' : ''} ${activatingButton === 'morph' ? 'chain-activating' : ''}`}
          onClick={(e) => handleButtonClick(e, 'morph')}
          disabled={chainReaction}
        >
          {activatingButton === 'morph' ? '🔥 ACTIVATING!' : 'Morphing Button'}
        </button>

        {/* 2. 글리치 버튼 */}
        <button
          className={`button glitch-button ${glitch ? 'glitching' : ''} ${chainReaction ? 'disabled' : ''} ${activatingButton === 'glitch' ? 'chain-activating' : ''}`}
          onClick={(e) => handleButtonClick(e, 'glitch')}
          disabled={chainReaction}
        >
          {activatingButton === 'glitch' ? '⚡ ACTIVATING!' : 'Glitch Effect'}
        </button>

        {/* 3. 네온 버튼 */}
        <button
          className={`button neon-button ${neon ? 'neon-active' : ''} ${chainReaction ? 'disabled' : ''} ${activatingButton === 'neon' ? 'chain-activating' : ''}`}
          onClick={(e) => handleButtonClick(e, 'neon')}
          disabled={chainReaction}
        >
          {activatingButton === 'neon' ? '💡 ACTIVATING!' : 'Neon Toggle'}
        </button>

        {/* 4. 리퀴드 버튼 */}
        <button
          className={`button liquid-button ${liquid ? 'liquid-active' : ''} ${chainReaction ? 'disabled' : ''} ${activatingButton === 'liquid' ? 'chain-activating' : ''}`}
          onClick={(e) => handleButtonClick(e, 'liquid')}
          disabled={chainReaction}
        >
          {activatingButton === 'liquid' ? '🌊 ACTIVATING!' : 'Liquid Morph'}
        </button>

        {/* 5. 매그네틱 버튼 */}
        <button
          className={`button magnetic-button ${magnetic ? 'magnetic-active' : ''} ${chainReaction ? 'disabled' : ''} ${activatingButton === 'magnetic' ? 'chain-activating' : ''}`}
          onClick={(e) => handleButtonClick(e, 'magnetic')}
          disabled={chainReaction}
        >
          {activatingButton === 'magnetic' ? '🧲 ACTIVATING!' : 'Magnetic Field'}
        </button>

        {/* 리플 효과들 */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="ripple"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
              width: '20px',
              height: '20px',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}

        {/* 파티클 효과들 */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              backgroundColor: particle.color,
              '--random-x': `${particle.randomX}px`,
              '--random-y': `${particle.randomY}px`
            }}
          />
        ))}
      </div>
    </>
  );
}