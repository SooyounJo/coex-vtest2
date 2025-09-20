import { useEffect, useRef, useState } from 'react'

export default function GooeyShader() {
  const containerRef = useRef(null)
  const [isAbsorbed, setIsAbsorbed] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(true)
  const autoModeRef = useRef(true)
  const lastClickTime = useRef(0)

  useEffect(() => {
    const parent = containerRef.current
    if (!parent) return

    // 기존 동적으로 생성된 원들 제거
    const existingCircles = parent.querySelectorAll('.circle')
    existingCircles.forEach(circle => circle.remove())

    // 29개의 원 생성 (원본 Gooey Effect와 동일)
    for (let i = 1; i < 30; i++) {
      const newDIV = document.createElement("div")
      newDIV.classList.add('circle')
      newDIV.classList.add('groom-' + i)
      
      // 원본 코드와 동일한 방식으로 랜덤 값 생성
      const initX = (Math.random() * window.innerWidth) - (window.innerWidth / 2)
      const initY = (Math.random() * window.innerHeight) - (window.innerHeight / 2)
      const actionX = (Math.random() * window.innerWidth) - (window.innerWidth / 2)
      const actionY = (Math.random() * window.innerHeight) - (window.innerHeight / 2)
      const circleSize = window.innerWidth <= 768 ? 
        Math.random() * 50 + 15 : 
        Math.random() * 80 + 20
      const time = Math.random() * 15 + 8 // 더 느린 애니메이션
      
      newDIV.style.position = 'absolute'
      newDIV.style.width = `${circleSize}px`
      newDIV.style.height = `${circleSize}px`
      newDIV.style.transform = `translate(${initX}px, ${initY}px)`
      newDIV.style.borderRadius = '50%'
      newDIV.style.border = '1px solid black'
      newDIV.style.background = 'black'
      newDIV.style.animation = `groom-${i} ${time}s infinite alternate`
      
      // 동적 키프레임 생성 (흡수/확산 애니메이션 포함)
      const style = document.createElement('style')
      style.textContent = `
        @keyframes groom-${i} {
          50% {
            transform: translate(${actionX}px, ${actionY}px);
          }
        }
        @keyframes absorb-${i} {
          0% {
            transform: translate(${initX}px, ${initY}px);
          }
          100% {
            transform: translate(0px, 0px);
          }
        }
        @keyframes expand-${i} {
          0% {
            transform: translate(0px, 0px);
          }
          100% {
            transform: translate(${initX}px, ${initY}px);
          }
        }
      `
      document.head.appendChild(style)
      
      parent.appendChild(newDIV)
    }

    console.log('Gooey circles created:', parent.children.length)
  }, [])

  // 자동 모드 애니메이션
  useEffect(() => {
    const autoAnimate = () => {
      if (!autoModeRef.current) return
      
      const circles = document.querySelectorAll('.circle')
      const centerCircle = document.querySelector('.center-circle')
      
      if (circles.length === 0) return
      
      // 랜덤하게 모이거나 흩어지기
      const shouldAbsorb = Math.random() > 0.5
      
      if (shouldAbsorb) {
        // 흡수 애니메이션
        circles.forEach((circle, index) => {
          const circleClass = circle.classList[1]
          circle.style.animation = `absorb-${circleClass.split('-')[1]} 2.0s ease-in-out forwards`
        })
        
        centerCircle.style.animation = 'pulse 2.0s ease-in-out'
        setIsAbsorbed(true)
      } else {
        // 확산 애니메이션
        circles.forEach((circle, index) => {
          const circleClass = circle.classList[1]
          circle.style.animation = `expand-${circleClass.split('-')[1]} 2.0s ease-in-out forwards`
        })
        
        centerCircle.style.animation = 'none'
        setIsAbsorbed(false)
      }
    }

    // 3-6초마다 자동 애니메이션
    const interval = setInterval(autoAnimate, Math.random() * 3000 + 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleTouch = () => {
    const currentTime = Date.now()
    lastClickTime.current = currentTime
    
    // 클릭 시 자동 모드 일시 중지
    autoModeRef.current = false
    setIsAutoMode(false)
    
    const circles = document.querySelectorAll('.circle')
    const centerCircle = document.querySelector('.center-circle')
    
    if (!isAbsorbed) {
      // 흡수 애니메이션 (더 느리게)
      circles.forEach((circle, index) => {
        const circleClass = circle.classList[1] // groom-1, groom-2 등
        circle.style.animation = `absorb-${circleClass.split('-')[1]} 1.5s ease-in-out forwards`
      })
      
      // 중앙 원 확대
      centerCircle.style.animation = 'pulse 1.5s ease-in-out'
      
      setIsAbsorbed(true)
    } else {
      // 확산 애니메이션 (더 느리게)
      circles.forEach((circle, index) => {
        const circleClass = circle.classList[1]
        circle.style.animation = `expand-${circleClass.split('-')[1]} 1.5s ease-in-out forwards`
      })
      
      // 중앙 원 원래대로
      centerCircle.style.animation = 'none'
      
      setIsAbsorbed(false)
    }
    
    // 5초 후 자동 모드 재개
    setTimeout(() => {
      autoModeRef.current = true
      setIsAutoMode(true)
    }, 5000)
  }

  return (
    <div className="gooey-container" onClick={handleTouch}>
      <div className="frame">
        <div className="center">
          <div className="groom-wrap" ref={containerRef}>
            <div className="center-circle"></div>
            {/* 형제를 js에서 생성 */}
          </div>
        </div>
      </div>

      <style jsx>{`
        .gooey-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          pointer-events: auto;
          cursor: pointer;
        }

        .frame {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: white;
        }

        .center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
        }

        .groom-wrap {
          width: 100vw;
          height: 100vh;
          display: flex;
          background: white;
          justify-content: center;
          align-items: center;
          filter: blur(10px) contrast(10);
          position: relative;
          animation: rotate 20s infinite linear;
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
        }

        .center-circle {
          width: 200px;
          height: 200px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: linear-gradient(135deg, 
            rgba(200, 180, 200, 0.8), 
            rgba(180, 160, 180, 0.7),
            rgba(220, 200, 220, 0.9));
          border-radius: 50%;
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          box-shadow: 
            0 12px 40px rgba(200, 180, 200, 0.3),
            inset 0 2px 0 rgba(255, 255, 255, 0.2),
            0 0 30px rgba(200, 180, 200, 0.2);
          position: relative;
          overflow: hidden;
        }

        .center-circle::before {
          content: '';
          position: absolute;
          top: -8px;
          left: -8px;
          right: -8px;
          bottom: -8px;
          background: conic-gradient(
            from 0deg,
            rgba(255, 100, 200, 0.4),
            rgba(100, 200, 255, 0.4),
            rgba(200, 255, 100, 0.4),
            rgba(255, 200, 100, 0.4),
            rgba(255, 100, 200, 0.4)
          );
          border-radius: 50%;
          animation: chromaticRotate 12s linear infinite;
          z-index: -1;
          filter: blur(2px);
        }

        .center-circle::after {
          content: '';
          position: absolute;
          top: 20%;
          left: 20%;
          width: 30%;
          height: 30%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: shimmer 3s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .center-circle {
            width: 120px;
            height: 120px;
          }
        }

        @media (max-width: 480px) {
          .center-circle {
            width: 100px;
            height: 100px;
          }
        }

        .circle {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: linear-gradient(135deg, 
            rgba(200, 180, 200, 0.7), 
            rgba(180, 160, 180, 0.6),
            rgba(220, 200, 220, 0.8));
          border-radius: 50%;
          backdrop-filter: blur(15px) saturate(1.6);
          -webkit-backdrop-filter: blur(15px) saturate(1.6);
          box-shadow: 
            0 6px 20px rgba(200, 180, 200, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 15px rgba(200, 180, 200, 0.15);
          position: relative;
          overflow: hidden;
        }

        .circle::before {
          content: '';
          position: absolute;
          top: -6px;
          left: -6px;
          right: -6px;
          bottom: -6px;
          background: conic-gradient(
            from 0deg,
            rgba(255, 100, 200, 0.3),
            rgba(100, 200, 255, 0.3),
            rgba(200, 255, 100, 0.3),
            rgba(255, 200, 100, 0.3),
            rgba(255, 100, 200, 0.3)
          );
          border-radius: 50%;
          animation: chromaticRotate 10s linear infinite;
          z-index: -1;
          filter: blur(1px);
        }

        .circle::after {
          content: '';
          position: absolute;
          top: 25%;
          left: 25%;
          width: 20%;
          height: 20%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: shimmer 4s ease-in-out infinite;
        }

        @keyframes rotate {
          0% {
            transform: rotate(0);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes chromaticRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

      `}</style>
    </div>
  )
}
