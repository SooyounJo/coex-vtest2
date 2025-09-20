import { useEffect, useRef, useState } from 'react'

export default function GooeyShader() {
  const containerRef = useRef(null)
  const [isAbsorbed, setIsAbsorbed] = useState(false)

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
      const time = Math.random() * 10 + 3
      
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

  const handleTouch = () => {
    const circles = document.querySelectorAll('.circle')
    const centerCircle = document.querySelector('.center-circle')
    
    if (!isAbsorbed) {
      // 흡수 애니메이션
      circles.forEach((circle, index) => {
        const circleClass = circle.classList[1] // groom-1, groom-2 등
        circle.style.animation = `absorb-${circleClass.split('-')[1]} 0.8s ease-in-out forwards`
      })
      
      // 중앙 원 확대
      centerCircle.style.animation = 'pulse 0.8s ease-in-out'
      
      setIsAbsorbed(true)
    } else {
      // 확산 애니메이션
      circles.forEach((circle, index) => {
        const circleClass = circle.classList[1]
        circle.style.animation = `expand-${circleClass.split('-')[1]} 0.8s ease-in-out forwards`
      })
      
      // 중앙 원 원래대로
      centerCircle.style.animation = 'none'
      
      setIsAbsorbed(false)
    }
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
          animation: rotate 12s infinite linear;
        }

        .center-circle {
          width: 200px;
          height: 200px;
          border: 1px solid black;
          background: black;
          border-radius: 50%;
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
          border: 1px solid black;
          background: black;
          border-radius: 50%;
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

      `}</style>
    </div>
  )
}
