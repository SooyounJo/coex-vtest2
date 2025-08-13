import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Camera() {
  const router = useRouter()
  const [hasPermission, setHasPermission] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(true)
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [frameImageLoaded, setFrameImageLoaded] = useState(false)
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const frameImageRef = useRef(null)

  const frames = [
    { id: 1, name: '서울타워 프레임', image: '/fre.png', description: '남산타워와 함께하는 추억' },
    { id: 2, name: '한강 프레임', image: '/fre.png', description: '한강변의 아름다운 순간' },
    { id: 3, name: '경복궁 프레임', image: '/fre.png', description: '전통의 아름다움' },
    { id: 4, name: '홍대 프레임', image: '/fre.png', description: '젊음의 거리' },
    { id: 5, name: '강남 프레임', image: '/fre.png', description: '현대 서울의 중심' },
    { id: 6, name: '북촌 프레임', image: '/fre.png', description: '한옥마을의 정취' }
  ]

  useEffect(() => {
    // URL에서 프레임 ID 가져오기
    const frameId = router.query.frame
    if (frameId) {
      const frame = frames.find(f => f.id === parseInt(frameId))
      if (frame) {
        setSelectedFrame(frame)
        // 프레임 이미지 미리 로드
        preloadFrameImage(frame.image)
      }
    }
  }, [router.query])

  useEffect(() => {
    if (hasPermission && selectedFrame) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [hasPermission, selectedFrame])

  const preloadFrameImage = (imageSrc) => {
    const img = new Image()
    img.onload = () => {
      frameImageRef.current = img
      setFrameImageLoaded(true)
      console.log('프레임 이미지 로드 완료:', imageSrc)
    }
    img.onerror = (error) => {
      console.error('프레임 이미지 로드 실패:', imageSrc, error)
    }
    img.src = imageSrc
  }

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      streamRef.current = stream
      setHasPermission(true)
      setShowPermissionModal(false)
      
      // 프레임이 이미 선택되어 있으면 바로 카메라 화면으로
      if (selectedFrame) {
        setShowFrameSelector(false)
      } else {
        setShowFrameSelector(true)
      }
    } catch (error) {
      console.error('카메라 접근 권한이 필요합니다:', error)
      alert('카메라 접근 권한을 허용해주세요.')
    }
  }

  const startCamera = () => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      setIsCameraActive(true)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  const selectFrame = (frame) => {
    setSelectedFrame(frame)
    setShowFrameSelector(false)
    // 프레임 선택 시 이미지 미리 로드
    preloadFrameImage(frame.image)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !selectedFrame) {
      console.log('촬영 조건 확인:', {
        video: !!videoRef.current,
        canvas: !!canvasRef.current,
        frame: !!selectedFrame
      })
      return
    }

    setIsCapturing(true)
    console.log('촬영 시작...')
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // 비디오 크기에 맞춰 캔버스 설정
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    console.log('캔버스 크기:', canvas.width, 'x', canvas.height)

    // 비디오 프레임을 캔버스에 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    console.log('비디오 프레임을 캔버스에 그림')

    // 프레임 이미지가 로드되었는지 확인
    if (frameImageRef.current && frameImageLoaded) {
      console.log('프레임 이미지 합성 시작')
      
      // 프레임을 캔버스 위에 그리기 (투명도 적용)
      context.globalAlpha = 0.7
      context.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height)
      context.globalAlpha = 1.0
      
      console.log('프레임 이미지 합성 완료')
    } else {
      console.log('프레임 이미지가 로드되지 않음, 다시 로드 시도...')
      // 프레임 이미지가 로드되지 않은 경우 다시 로드
      preloadFrameImage(selectedFrame.image)
      
      // 잠시 대기 후 다시 시도
      setTimeout(() => {
        if (frameImageRef.current) {
          context.globalAlpha = 0.7
          context.drawImage(frameImageRef.current, 0, 0, canvas.width, canvas.height)
          context.globalAlpha = 1.0
          console.log('지연된 프레임 이미지 합성 완료')
        }
      }, 500)
    }

    // 합성된 이미지를 데이터 URL로 변환
    const imageDataUrl = canvas.toDataURL('image/png')
    setCapturedImage(imageDataUrl)
    console.log('최종 이미지 생성 완료')
    
    setIsCapturing(false)
    stopCamera()
  }

  const saveImage = () => {
    if (!capturedImage) return

    // 이미지 다운로드 링크 생성
    const link = document.createElement('a')
    link.download = `seoul-memory-${selectedFrame?.name || 'frame'}-${Date.now()}.png`
    link.href = capturedImage
    link.click()
    console.log('이미지 저장 완료')
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    if (selectedFrame) {
      setShowFrameSelector(false)
    } else {
      setShowFrameSelector(true)
    }
  }

  return (
    <>
      <Head>
        <title>서울 추억 촬영</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="camera-page">
        {/* 촬영 허가 모달 */}
        {showPermissionModal && (
          <div className="permission-modal">
            <div className="modal-content">
              <h2>📸 카메라 접근 권한</h2>
              <p>서울 추억을 촬영하기 위해 카메라 접근 권한이 필요합니다.</p>
              <button 
                className="permission-button"
                onClick={requestCameraPermission}
              >
                카메라 허용
              </button>
            </div>
          </div>
        )}

        {/* 프레임 선택 화면 */}
        {showFrameSelector && (
          <div className="frame-selector">
            <header className="frame-header">
              <Link href="/" className="back-button">
                ← 돌아가기
              </Link>
              <h1>프레임 선택</h1>
            </header>
            
            <div className="frame-grid">
              {frames.map((frame) => (
                <div
                  key={frame.id}
                  className={`frame-option ${selectedFrame?.id === frame.id ? 'selected' : ''}`}
                  onClick={() => selectFrame(frame)}
                >
                  <img 
                    src={frame.image} 
                    alt={frame.name}
                    className="frame-preview"
                    onLoad={() => console.log('프레임 미리보기 로드:', frame.name)}
                    onError={(e) => console.error('프레임 미리보기 로드 실패:', frame.name, e)}
                  />
                  <span className="frame-name">{frame.name}</span>
                  <p className="frame-description">{frame.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 카메라 촬영 화면 */}
        {!showFrameSelector && selectedFrame && !capturedImage && (
          <div className="camera-view">
            <header className="camera-header">
              <Link href="/" className="back-button">
                ← 돌아가기
              </Link>
              <h2>📸 촬영하기</h2>
              <div className="selected-frame-info">
                선택된 프레임: {selectedFrame.name}
                {frameImageLoaded && <span style={{color: '#4ecdc4'}}> ✓</span>}
              </div>
            </header>

            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              
              {/* 프레임 오버레이 - 촬영 전에 미리보기 */}
              {frameImageLoaded && (
                <div className="frame-preview-overlay">
                  <img 
                    src={selectedFrame.image} 
                    alt="프레임 미리보기"
                    className="frame-preview-image"
                  />
                  <div className="frame-preview-text">
                    <p>프레임이 적용된 모습입니다</p>
                    <p>촬영하면 이 프레임과 함께 저장됩니다</p>
                  </div>
                </div>
              )}
            </div>

            <div className="camera-controls">
              <button 
                className="capture-button"
                onClick={capturePhoto}
                disabled={isCapturing || !frameImageLoaded}
              >
                {isCapturing ? '촬영 중...' : 
                 !frameImageLoaded ? '프레임 로딩 중...' : '📸 촬영'}
              </button>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        )}

        {/* 촬영 결과 화면 */}
        {capturedImage && (
          <div className="result-view">
            <header className="result-header">
              <Link href="/" className="back-button">
                ← 돌아가기
              </Link>
              <h2>📸 촬영 완료!</h2>
            </header>

            <div className="result-container">
              <div className="result-info">
                <h3>프레임과 함께 촬영된 사진</h3>
                <p>프레임: {selectedFrame?.name}</p>
              </div>
              <img 
                src={capturedImage} 
                alt="프레임이 적용된 촬영 사진"
                className="captured-image"
              />
            </div>

            <div className="result-controls">
              <button 
                className="retake-button"
                onClick={retakePhoto}
              >
                다시 촬영
              </button>
              <button 
                className="save-button"
                onClick={saveImage}
              >
                💾 프레임과 함께 저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
