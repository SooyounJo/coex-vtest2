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
import { useRouter } from 'next/router'

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState(1)
  const [isActive6, setIsActive6] = useState(false)
  const [isActive7, setIsActive7] = useState(false)
  const router = useRouter()

  // URL 파라미터 처리
  useEffect(() => {
    if (router.query.style) {
      const style = parseInt(router.query.style)
      if (style >= 1 && style <= 7) {
        setSelectedStyle(style)
      }
    }
  }, [router.query.style])

  const handleStyleChange = (style) => {
    setSelectedStyle(style)
  }


  return (
    <>
      <Head>
        <title>Shader Bubble</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>


      <div className="app-container">
        {/* 3D Canvas */}
        <div className="canvas-container">
          <Canvas 
            className="r3f-canvas"
            dpr={[1, 3]}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 6], fov: 50 }}
          >
            <color attach="background" args={["#ffffff"]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[2, 3, 2]} intensity={0.5} />
            {selectedStyle === 1 ? <ShaderBubble /> : 
             selectedStyle === 2 ? <ShaderBubble2 /> : 
             selectedStyle === 3 ? <ShaderBubble3 /> : 
             selectedStyle === 4 ? <ShaderBubble4 /> : 
             selectedStyle === 5 ? <ShaderBubble5 /> : 
             selectedStyle === 6 ? <ShaderBubble6 isActive={isActive6} /> :
             selectedStyle === 7 ? <ShaderBubble7 isActive={isActive7} /> :
             <ShaderBubble />}
          </Canvas>
          
          {/* 버튼별 제목 표시 */}
          {selectedStyle === 1 && (
            <div className="title-overlay">
              <h1 className="style-title">Main State</h1>
            </div>
          )}
          {selectedStyle === 2 && (
            <div className="title-overlay">
              <h1 className="style-title">Thinking</h1>
            </div>
          )}
          {selectedStyle === 3 && (
            <div className="title-overlay">
              <h1 className="style-title">Speaking</h1>
            </div>
          )}
          {selectedStyle === 4 && (
            <div className="title-overlay">
              <h1 className="style-title">Magenta Wave</h1>
            </div>
          )}
          {selectedStyle === 5 && (
            <div className="title-overlay">
              <h1 className="style-title">Glossy Wave</h1>
            </div>
          )}
          {selectedStyle === 6 && (
            <div className="title-overlay">
              <h1 className="style-title">Water Drop Effect</h1>
              <div className="toggle-controls">
                <button 
                  className={`toggle-btn ${isActive6 ? 'active' : ''}`}
                  onClick={() => setIsActive6(!isActive6)}
                >
                  {isActive6 ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )}
          {selectedStyle === 7 && (
            <div className="title-overlay">
              <h1 className="style-title">Hologram Wave</h1>
              <div className="toggle-controls">
                <button 
                  className={`toggle-btn ${isActive7 ? 'active' : ''}`}
                  onClick={() => setIsActive7(!isActive7)}
                >
                  {isActive7 ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 1-7 버튼 */}
        <div className="version-switcher-bottom" role="navigation" aria-label="Style Switcher 1-7">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              className={`ver-button ${selectedStyle === num ? 'active' : ''}`}
              onClick={() => handleStyleChange(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .app-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .canvas-container {
          flex: 1;
          position: relative;
        }

        .toggle-controls {
          margin-top: 10px;
          display: flex;
          justify-content: center;
        }

        .toggle-btn {
          padding: 8px 16px;
          background: #4ecdc4;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.3s ease;
        }

        .toggle-btn.active {
          background: #ff6b6b;
        }

        .toggle-btn:hover {
          opacity: 0.8;
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