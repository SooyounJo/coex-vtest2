import { useState, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const [selectedFrame, setSelectedFrame] = useState(null)
  const sliderRef = useRef(null)

  const frames = [
    { id: 1, name: '서울타워 프레임', image: '/fre.png', description: '남산타워와 함께하는 추억' },
    { id: 2, name: '한강 프레임', image: '/fre.png', description: '한강변의 아름다운 순간' },
    { id: 3, name: '경복궁 프레임', image: '/fre.png', description: '전통의 아름다움' },
    { id: 4, name: '홍대 프레임', image: '/fre.png', description: '젊음의 거리' },
    { id: 5, name: '강남 프레임', image: '/fre.png', description: '현대 서울의 중심' },
    { id: 6, name: '북촌 프레임', image: '/fre.png', description: '한옥마을의 정취' }
  ]

  const handleFrameSelect = (frame) => {
    setSelectedFrame(frame)
  }

  const handleStartShooting = () => {
    if (selectedFrame) {
      router.push(`/camera?frame=${selectedFrame.id}`)
    }
  }

  const scrollToFrame = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300
      const currentScroll = sliderRef.current.scrollLeft
      
      if (direction === 'left') {
        sliderRef.current.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: 'smooth'
        })
      } else {
        sliderRef.current.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        })
      }
    }
  }

  return (
    <>
      <Head>
        <title>서울 추억 촬영</title>
        <meta name="description" content="프레임을 골라 서울의 한 공간과의 기억을 남겨보세요!" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mobile-camera-app">
        <div className="app-background">
          {/* 배경 장식 요소들 */}
          <div className="floating-element element-1">🏛️</div>
          <div className="floating-element element-2">🗼</div>
          <div className="floating-element element-3">🌸</div>
          <div className="floating-element element-4">🌊</div>
          <div className="floating-element element-5">✨</div>
          
          <main className="app-content">
            <div className="title-section">
              <h1 className="main-title">
                <span className="title-text">서울 추억 촬영</span>
                <div className="title-decoration"></div>
              </h1>
              <p className="subtitle">프레임을 골라 서울의 한 공간과의 기억을 남겨보세요!</p>
            </div>

            <div className="frame-selector-section">
              <div className="frame-selector-header">
                <h2>📸 프레임 선택하기</h2>
                <p>마음에 드는 프레임을 선택해주세요</p>
              </div>

              <div className="frame-slider-container">
                <button 
                  className="slider-nav-button left"
                  onClick={() => scrollToFrame('left')}
                >
                  ‹
                </button>
                
                <div className="frame-slider" ref={sliderRef}>
                  {frames.map((frame) => (
                    <div
                      key={frame.id}
                      className={`frame-card ${selectedFrame?.id === frame.id ? 'selected' : ''}`}
                      onClick={() => handleFrameSelect(frame)}
                    >
                      <div className="frame-image-container">
                        <img 
                          src={frame.image} 
                          alt={frame.name}
                          className="frame-image"
                        />
                        <div className="frame-overlay">
                          <div className="frame-check">✓</div>
                        </div>
                      </div>
                      <div className="frame-info">
                        <h3 className="frame-name">{frame.name}</h3>
                        <p className="frame-description">{frame.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="slider-nav-button right"
                  onClick={() => scrollToFrame('right')}
                >
                  ›
                </button>
              </div>

              {selectedFrame && (
                <div className="selected-frame-info">
                  <div className="selected-frame-badge">
                    <span className="selected-icon">✓</span>
                    <span className="selected-text">선택됨: {selectedFrame.name}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="action-section">
              <button 
                className={`shoot-button ${!selectedFrame ? 'disabled' : ''}`}
                onClick={handleStartShooting}
                disabled={!selectedFrame}
              >
                <span className="button-icon">📸</span>
                <span className="button-text">
                  {selectedFrame ? '촬영 시작하기' : '프레임을 먼저 선택해주세요'}
                </span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </>
  )
} 