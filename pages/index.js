import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import ShaderBubble from '../components/1'
import ShaderBubble2 from '../components/2'
import ShaderBubble3 from '../components/3'
import ShaderBubble4 from '../components/4'
import ShaderBubble5 from '../components/5'
import AgenticBubble from '../components/6'
import SharpBubble from '../components/7'
import { useRouter } from 'next/router'

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState(1)
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
    if (style === 8) {
      router.push('/gooey')
      return
    }
    setSelectedStyle(style)
  }

  return (
    <>
      <Head>
        <title>Shader Bubble</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
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
            {selectedStyle === 1 ? <ShaderBubble styleType={selectedStyle} /> : 
             selectedStyle === 2 ? <ShaderBubble2 styleType={selectedStyle} /> : 
             selectedStyle === 3 ? <ShaderBubble3 /> : 
             selectedStyle === 4 ? <ShaderBubble4 /> : 
            selectedStyle === 5 ? <ShaderBubble5 /> : 
            selectedStyle === 6 ? <AgenticBubble styleType={6} /> :
            selectedStyle === 7 ? <SharpBubble styleType={7} /> :
            <ShaderBubble styleType={selectedStyle} />}
          </Canvas>
          
        {/* 8번 버튼은 별도 페이지로 이동 */}
          
          {/* 버튼별 제목 표시 */}
          {selectedStyle === 1 && (
            <div className="title-overlay">
              <h1 className="style-title">Origin</h1>
            </div>
          )}
          {selectedStyle === 2 && (
            <div className="title-overlay">
              <h1 className="style-title">Magenta Wave</h1>
            </div>
          )}
          {selectedStyle === 3 && (
            <div className="title-overlay">
              <h1 className="style-title">Big Wave</h1>
            </div>
          )}
          {selectedStyle === 4 && (
            <div className="title-overlay">
              <h1 className="style-title">Organic Shape</h1>
            </div>
          )}
          {selectedStyle === 5 && (
            <div className="title-overlay">
              <h1 className="style-title">Glossy Wave</h1>
            </div>
          )}
          {selectedStyle === 6 && (
            <div className="title-overlay">
              <h1 className="style-title">Smooth Glow</h1>
            </div>
          )}
          {selectedStyle === 7 && (
            <div className="title-overlay">
              <h1 className="style-title">Sharp Glow</h1>
            </div>
          )}
        </div>

        {/* 버튼 컨트롤 */}
        <div className="controls">
          <div className="button-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                className={`style-button ${selectedStyle === num ? 'active' : ''}`}
                onClick={() => handleStyleChange(num)}
              >
                {num}
              </button>
            ))}
          </div>
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

        .title-overlay {
          position: absolute;
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
        }

        .style-title {
          color: #ffb6c1;
          font-family: 'Poppins', sans-serif;
          font-weight: 300;
          font-size: 2.5rem;
          margin: 0;
          text-align: center;
        }

        .controls {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 10px 15px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        .button-grid {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .style-button {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px) saturate(180%);
          color: #333;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .style-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .style-button.active {
          background: rgba(255, 182, 193, 0.8);
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 182, 193, 0.4);
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
          
          .controls {
            position: fixed;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            padding: 16px 12px;
            width: calc(100vw - 16px);
            max-width: 100%;
            min-width: 0;
          }
          
          .button-grid {
            gap: 3px;
            justify-content: space-between;
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 0 2px;
            width: 100%;
            display: flex;
            align-items: center;
          }
          
          .style-button {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
            min-width: 28px;
            flex-shrink: 0;
            margin: 0 1px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .style-title {
            font-size: 1.8rem;
            top: 30px;
          }
        }

        @media (max-width: 480px) {
          .controls {
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
            padding: 14px 10px;
            width: calc(100vw - 12px);
            max-width: 100%;
            min-width: 0;
          }
          
          .button-grid {
            gap: 2px;
            justify-content: space-between;
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 0 1px;
            width: 100%;
            display: flex;
            align-items: center;
          }
          
          .style-button {
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
            min-width: 24px;
            flex-shrink: 0;
            margin: 0 0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .style-title {
            font-size: 1.5rem;
            top: 20px;
          }
        }
      `}</style>
    </>
  )
}