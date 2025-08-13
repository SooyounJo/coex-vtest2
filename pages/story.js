import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function Story() {
  const [showModal, setShowModal] = useState(true)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef(null)
  const contextRef = useRef(null)

  const materials = [
    { id: 1, name: '나무', color: '#8B4513', texture: 'wood' },
    { id: 2, name: '돌', color: '#696969', texture: 'stone' },
    { id: 3, name: '금속', color: '#C0C0C0', texture: 'metal' },
    { id: 4, name: '유리', color: '#87CEEB', texture: 'glass' },
    { id: 5, name: '천', color: '#F5DEB3', texture: 'fabric' },
    { id: 6, name: '마법', color: '#9370DB', texture: 'magic' }
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    canvas.style.width = `${canvas.offsetWidth}px`
    canvas.style.height = `${canvas.offsetHeight}px`

    const context = canvas.getContext('2d')
    context.scale(2, 2)
    context.lineCap = 'round'
    context.strokeStyle = '#000'
    context.lineWidth = 3
    contextRef.current = context
  }, [])

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    contextRef.current.beginPath()
    contextRef.current.moveTo(offsetX, offsetY)
    setIsDrawing(true)
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return
    const { offsetX, offsetY } = nativeEvent
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()
  }

  const finishDrawing = () => {
    contextRef.current.closePath()
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const applyMaterial = (material) => {
    setSelectedMaterial(material)
    // 여기에 재질 적용 로직을 추가할 수 있습니다
  }

  const animateDrawing = () => {
    if (!selectedMaterial) return
    
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // 간단한 애니메이션 효과
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 0) { // 투명하지 않은 픽셀
        data[i] = Math.min(255, data[i] + 50)     // R
        data[i + 1] = Math.min(255, data[i + 1] + 30) // G
        data[i + 2] = Math.min(255, data[i + 2] + 20) // B
      }
    }
    
    context.putImageData(imageData, 0, 0)
  }

  return (
    <>
      <Head>
        <title>나의 동화 주인공 만들기</title>
        <meta name="description" content="나만의 동화 주인공을 만들어보세요!" />
      </Head>

      <div className="story-page">
        {/* 모달 */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-content">
                <h2>🎭 내 동화의 주인공을 만들어보자!</h2>
                <p>좌측에서 그림을 그린 후, 우측의 재질 버튼을 눌러 주인공에게 생명을 불어넣어보세요!</p>
                <button 
                  className="modal-button"
                  onClick={() => setShowModal(false)}
                >
                  시작하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 헤더 */}
        <header className="story-header">
          <Link href="/" className="back-button">
            ← 돌아가기
          </Link>
          <h1>나의 동화 주인공 만들기</h1>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="story-container">
          {/* 좌측 - 그림 그리기 영역 */}
          <div className="drawing-section">
            <div className="drawing-header">
              <h3>🎨 그림 그리기</h3>
              <button className="clear-button" onClick={clearCanvas}>
                지우기
              </button>
            </div>
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={finishDrawing}
                onMouseLeave={finishDrawing}
                className="drawing-canvas"
              />
            </div>
          </div>

          {/* 우측 - 재질 선택 영역 */}
          <div className="material-section">
            <div className="material-header">
              <h3>✨ 재질 선택</h3>
              <p>그림에 재질을 적용하여 생명을 불어넣어보세요!</p>
            </div>
            
            <div className="material-grid">
              {materials.map((material) => (
                <button
                  key={material.id}
                  className={`material-button ${selectedMaterial?.id === material.id ? 'selected' : ''}`}
                  onClick={() => applyMaterial(material)}
                  style={{ backgroundColor: material.color }}
                >
                  <span className="material-name">{material.name}</span>
                  <div className="material-preview"></div>
                </button>
              ))}
            </div>

            {selectedMaterial && (
              <div className="selected-material">
                <h4>선택된 재질: {selectedMaterial.name}</h4>
                <button 
                  className="animate-button"
                  onClick={animateDrawing}
                >
                  생명 불어넣기 ✨
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 