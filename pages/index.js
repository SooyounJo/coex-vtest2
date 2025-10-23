import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import ShaderBubble from '../components/ver1/1'
import ShaderBubble2 from '../components/ver1/2'
import ShaderBubble3 from '../components/ver1/3'
import ShaderBubble4 from '../components/ver1/4'
import ShaderBubble5 from '../components/ver1/5'
import ShaderBubble6 from '../components/ver1/6'
import ShaderBubble7 from '../components/ver1/7'
import ShaderBubble8 from '../components/ver1/8'
import ShaderBubble9 from '../components/ver1/9'
// import ShaderBubble10 from '../components/ver1/10'
import { useRouter } from 'next/router'

export default function Home() {
  const [selectedVersion, setSelectedVersion] = useState('ver1')
  const [selectedStyle, setSelectedStyle] = useState(1)
  const [isActive6, setIsActive6] = useState(false)
  const [isActive7, setIsActive7] = useState(false)
  const router = useRouter()

  // 버전 변경 함수
  const handleVersionChange = (version) => {
    setSelectedVersion(version)
    // 버전 변경 시 기본 스타일로 리셋
    if (version === 'ver1') {
      setSelectedStyle(1)
    }
    // 6, 7번 상태 리셋
    setIsActive6(false)
    setIsActive7(false)
  }

  // 스타일 변경 시 6, 7번을 비활성화 상태로 리셋
  const handleStyleChange = (style) => {
    setSelectedStyle(style)
    if (style === 6) {
      setIsActive6(false)
    } else if (style === 7) {
      setIsActive7(false)
    }
  }

  // URL 파라미터 처리
  useEffect(() => {
    if (router.query.style) {
      const style = parseInt(router.query.style)
      if (style >= 1 && style <= 9) {
        setSelectedStyle(style)
      }
    }
  }, [router.query.style])



  return (
    <>
      <Head>
        <title>Shader Bubble</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>


      <div className="app-container">
        {/* 버전 선택 버튼 (좌측 위) */}
        <div className="version-selector">
          <button 
            className={`version-btn ${selectedVersion === 'ver1' ? 'active' : ''}`}
            onClick={() => handleVersionChange('ver1')}
          >
            Ver.1
          </button>
        </div>

        {/* 3D Canvas */}
        <div className="canvas-container">
          <Canvas 
            className="r3f-canvas"
            dpr={[1, 3]}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 6], fov: 50 }}
          >
            <color attach="background" args={["#F5F5DC"]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[2, 3, 2]} intensity={0.5} />
            {selectedStyle === 1 ? <ShaderBubble /> : 
             selectedStyle === 2 ? <ShaderBubble2 /> : 
             selectedStyle === 3 ? <ShaderBubble3 /> : 
             selectedStyle === 4 ? <ShaderBubble4 /> : 
             selectedStyle === 5 ? <ShaderBubble5 /> : 
             selectedStyle === 6 ? <ShaderBubble6 /> :
             selectedStyle === 7 ? <ShaderBubble7 isActive={isActive7} /> :
             selectedStyle === 8 ? <ShaderBubble8 /> :
             selectedStyle === 9 ? <ShaderBubble9 /> :
             <ShaderBubble />}
          </Canvas>
        </div>

        {/* 하단 버튼 - 버전에 따라 조건부 표시 */}
        {selectedVersion === 'ver1' && (
          <div className="version-switcher-bottom" role="navigation" aria-label="Style Switcher ver1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                className={`ver-button ${selectedStyle === num ? 'active' : ''}`}
                onClick={() => handleStyleChange(num)}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .app-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .version-selector {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .version-btn {
          padding: 8px 16px;
          background: #ffffff;
          color: #333333;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 80px;
        }

        .version-btn:hover {
          background: #f5f5f5;
          border-color: #d0d0d0;
          transform: translateY(-1px);
        }

        .version-btn.active {
          background: #333333;
          color: white;
          border-color: #222222;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .canvas-container {
          flex: 1;
          position: relative;
        }

        .toggle-controls {
          margin-top: 10px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .toggle-btn {
          padding: 8px 16px;
          background: #888888;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
        }


        .activate-btn.active {
          background: #000000;
          border-radius: 20px;
        }

        .deactivate-btn.active {
          background: #000000;
          border-radius: 20px;
        }

        .toggle-btn:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }

        .red-button {
          background: #ff9999 !important;
          color: white !important;
        }

        .red-button:hover {
          background: #ff7777 !important;
        }

        .red-button.active {
          background: #ff0000 !important;
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
        }

        .blue-button {
          background: #87ceeb !important;
          color: white !important;
        }

        .blue-button:hover {
          background: #5dade2 !important;
        }

        .blue-button.active {
          background: #0077be !important;
          box-shadow: 0 0 15px rgba(0, 119, 190, 0.7);
        }


        .title-overlay {
          position: absolute;
          top: 72px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
        }

        .style-title {
          color: #000000;
          font-family: 'Poppins', sans-serif;
          font-weight: 300;
          font-size: 2.5rem;
          margin: 0;
          text-align: center;
        }

        .r3f-canvas {
          width: 100% !important;
          height: 100% !important;
        }

        /* 모바일 반응형 */
        @media (max-width: 768px) {
          .app-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          .canvas-container {
            flex: 1;
            width: 100%;
            height: 100%;
          }
          
          .version-selector {
            top: 10px;
            left: 10px;
            gap: 8px;
          }
          
          .version-btn {
            padding: 8px 14px;
            font-size: 12px;
            min-width: 65px;
          }
          
          .style-title {
            font-size: 1.8rem;
          }
          .title-overlay {
            top: 68px;
          }
        }

        @media (max-width: 480px) {
          .style-title {
            font-size: 1.5rem;
          }
          .title-overlay {
            top: 64px;
          }
        }
      `}</style>
    </>
  )
}