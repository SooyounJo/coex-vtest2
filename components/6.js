import { useEffect, useRef } from 'react'

export default function GooeyShader() {
  const containerRef = useRef(null)

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
      const circleSize = Math.random() * 80 + 20
      const time = Math.random() * 10 + 3
      
      newDIV.style.position = 'absolute'
      newDIV.style.width = `${circleSize}px`
      newDIV.style.height = `${circleSize}px`
      newDIV.style.transform = `translate(${initX}px, ${initY}px)`
      newDIV.style.borderRadius = '50%'
      newDIV.style.border = '1px solid black'
      newDIV.style.background = 'black'
      newDIV.style.animation = `groom-${i} ${time}s infinite alternate`
      
      // 동적 키프레임 생성 (원본과 동일)
      const style = document.createElement('style')
      style.textContent = `
        @keyframes groom-${i} {
          50% {
            transform: translate(${actionX}px, ${actionY}px);
          }
        }
      `
      document.head.appendChild(style)
      
      parent.appendChild(newDIV)
    }

    console.log('Gooey circles created:', parent.children.length)
  }, [])

  return (
    <div className="gooey-container">
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
          pointer-events: none;
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

      `}</style>
    </div>
  )
}
