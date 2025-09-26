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

  // 연쇄 반응 시작
  const startChainReaction = useCallback((e) => {
    if (chainReaction) return; // 이미 진행 중이면 무시
    
    setChainReaction(true);
    createRipple(e, 'chain');
    createParticles(e.clientX, e.clientY);
    
    // 모든 버튼을 순차적으로 활성화
    const buttons = ['morph', 'glitch', 'neon', 'liquid', 'magnetic'];
    
    buttons.forEach((button, index) => {
      setTimeout(() => {
        switch(button) {
          case 'morph':
            setMorphing(true);
            setTimeout(() => setMorphing(false), 2000);
            break;
          case 'glitch':
            setGlitch(true);
            setTimeout(() => setGlitch(false), 1000);
            break;
          case 'neon':
            setNeon(true);
            break;
          case 'liquid':
            setLiquid(true);
            setTimeout(() => setLiquid(false), 1500);
            break;
          case 'magnetic':
            setMagnetic(true);
            break;
        }
      }, index * 300); // 300ms 간격으로 순차 실행
    });
    
    // 5초 후 모든 효과 리셋
    setTimeout(() => {
      setMorphing(false);
      setGlitch(false);
      setNeon(false);
      setLiquid(false);
      setMagnetic(false);
      setChainReaction(false);
    }, 5000);
  }, [chainReaction, createRipple, createParticles]);

  // 개별 버튼 클릭 핸들러 (연쇄 반응 중에는 비활성화)
  const handleButtonClick = useCallback((e, buttonType) => {
    if (chainReaction) return; // 연쇄 반응 중에는 개별 클릭 무시
    
    createRipple(e, buttonType);
    
    switch(buttonType) {
      case 'morph':
        setMorphing(true);
        setTimeout(() => setMorphing(false), 2000);
        break;
      case 'glitch':
        setGlitch(true);
        setTimeout(() => setGlitch(false), 1000);
        break;
      case 'neon':
        setNeon(!neon);
        break;
      case 'liquid':
        setLiquid(true);
        setTimeout(() => setLiquid(false), 1500);
        break;
      case 'magnetic':
        setMagnetic(!magnetic);
        break;
    }
  }, [chainReaction, createRipple, neon, magnetic]);

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
          animation: background-pulse 2s ease-in-out infinite alternate;
        }

        @keyframes background-pulse {
          from { filter: hue-rotate(0deg) brightness(1); }
          to { filter: hue-rotate(30deg) brightness(1.2); }
        }

        .button {
          position: relative;
          padding: 15px 30px;
          border: none;
          border-radius: 50px;
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

        .chain-trigger {
          background: linear-gradient(45deg, #ff9a9e, #fecfef, #a8edea, #fed6e3);
          background-size: 400% 400%;
          animation: gradient-shift 3s ease infinite;
          color: #333;
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
          background: #000;
          color: #00ff00;
          font-family: 'Courier New', monospace;
          border: 2px solid #00ff00;
          box-shadow: 0 0 10px #00ff00;
        }

        .glitch-button:hover {
          background: #00ff00;
          color: #000;
          box-shadow: 0 0 20px #00ff00;
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

      <div className={`button-container ${chainReaction ? 'chain-active' : ''}`}>
        {/* 연쇄 반응 트리거 버튼 */}
        <button
          className="button chain-trigger"
          onClick={startChainReaction}
          disabled={chainReaction}
        >
          {chainReaction ? 'Chain Reaction Active!' : 'Start Chain Reaction!'}
        </button>

        {/* 1. 모핑 버튼 */}
        <button
          className={`button morph-button ${morphing ? 'morphing' : ''} ${chainReaction ? 'disabled' : ''}`}
          onClick={(e) => handleButtonClick(e, 'morph')}
          disabled={chainReaction}
        >
          Morphing Button
        </button>

        {/* 2. 글리치 버튼 */}
        <button
          className={`button glitch-button ${glitch ? 'glitching' : ''} ${chainReaction ? 'disabled' : ''}`}
          onClick={(e) => handleButtonClick(e, 'glitch')}
          disabled={chainReaction}
        >
          Glitch Effect
        </button>

        {/* 3. 네온 버튼 */}
        <button
          className={`button neon-button ${neon ? 'neon-active' : ''} ${chainReaction ? 'disabled' : ''}`}
          onClick={(e) => handleButtonClick(e, 'neon')}
          disabled={chainReaction}
        >
          Neon Toggle
        </button>

        {/* 4. 리퀴드 버튼 */}
        <button
          className={`button liquid-button ${liquid ? 'liquid-active' : ''} ${chainReaction ? 'disabled' : ''}`}
          onClick={(e) => handleButtonClick(e, 'liquid')}
          disabled={chainReaction}
        >
          Liquid Morph
        </button>

        {/* 5. 매그네틱 버튼 */}
        <button
          className={`button magnetic-button ${magnetic ? 'magnetic-active' : ''} ${chainReaction ? 'disabled' : ''}`}
          onClick={(e) => handleButtonClick(e, 'magnetic')}
          disabled={chainReaction}
        >
          Magnetic Field
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