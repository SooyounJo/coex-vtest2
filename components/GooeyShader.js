import { useEffect, useRef } from 'react'

export default function GooeyShader() {
  const containerRef = useRef(null)

  useEffect(() => {
    const parent = containerRef.current
    if (!parent) return

    // 기존 동적으로 생성된 원들 제거
    const existingCircles = parent.querySelectorAll('.circle')
    existingCircles.forEach(circle => circle.remove())

    // 29개의 원 생성 (원래 Gooey Effect 코드)
    for (let i = 1; i < 30; i++) {
      const newDIV = document.createElement("div")
      newDIV.classList.add('circle')
      newDIV.classList.add('groom-' + i)
      
      // 인라인 스타일로 직접 적용 - 페이지 전반 크기
      const size = 30 + Math.random() * 20
      const initX = (Math.random() - 0.5) * window.innerWidth
      const initY = (Math.random() - 0.5) * window.innerHeight
      const actionX = (Math.random() - 0.5) * window.innerWidth
      const actionY = (Math.random() - 0.5) * window.innerHeight
      const duration = 3 + Math.random() * 7
      
      newDIV.style.position = 'absolute'
      newDIV.style.width = `${size}px`
      newDIV.style.height = `${size}px`
      newDIV.style.transform = `translate(${initX}px, ${initY}px)`
      newDIV.style.borderRadius = '50%'
      newDIV.style.border = '1px solid #ff62e8'
      newDIV.style.background = '#ff62e8'
      newDIV.style.animation = `groom-${i} ${duration}s infinite alternate`
      
      // 동적 키프레임 생성 - CSS-in-JS 방식으로 변경
      const style = document.createElement('style')
      style.textContent = `@keyframes groom-${i} {
        50% {
          transform: translate(${actionX}px, ${actionY}px);
        }
      }`
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
          background: transparent;
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
          background: transparent;
          justify-content: center;
          align-items: center;
          filter: contrast(8);
          position: relative;
        }

        .center-circle {
          width: 150px;
          height: 150px;
          border: 1px solid #ff62e8;
          background: #ff62e8;
          border-radius: 50%;
        }

        .circle {
          border: 1px solid #ff62e8;
          background: #ff62e8;
          border-radius: 50%;
        }

      `}</style>
    </div>
  )
}
