import { useState } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import ShaderBubble from '../components/1'
import ShaderBubble2 from '../components/2'
import ShaderBubble3 from '../components/3'
import ShaderBubble4 from '../components/4'
import ShaderBubble5 from '../components/5'
import AgenticBubble from '../components/7'
import { useRouter } from 'next/router'

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState(1)
  const router = useRouter()

  const handleStyleChange = (style) => {
    if (style === 6) {
      router.push('/gooey')
    } else {
      setSelectedStyle(style)
    }
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
            selectedStyle === 7 ? <AgenticBubble styleType={7} /> :
            <ShaderBubble styleType={selectedStyle} />}
          </Canvas>
          
        {/* 6번 버튼은 별도 페이지로 이동 */}
          
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
          {selectedStyle === 7 && (
            <div className="title-overlay">
              <h1 className="style-title">Agentic Glow</h1>
            </div>
          )}
        </div>

        {/* 버튼 컨트롤 */}
        <div className="controls">
          <div className="button-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
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
          font-size: 1.8rem;
          font-weight: 300;
          margin: 0;
          text-align: center;
          letter-spacing: 0.1em;
        }


        .r3f-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }

        .controls {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px) saturate(1.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          padding: 20px 30px;
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            0 0 20px rgba(255, 255, 255, 0.1);
          z-index: 10;
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
        }

        .button-grid {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .style-button {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(15px) saturate(1.5);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 6px 20px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            0 0 15px rgba(255, 255, 255, 0.1);
          -webkit-backdrop-filter: blur(15px) saturate(1.5);
        }

        .style-button:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            0 0 25px rgba(255, 255, 255, 0.2);
        }

        .style-button.active {
          background: linear-gradient(135deg, 
            rgba(255, 20, 147, 0.9), 
            rgba(219, 112, 147, 0.9));
          color: white;
          transform: translateY(-3px) scale(1.1);
          box-shadow: 
            0 15px 40px rgba(255, 20, 147, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 0 30px rgba(255, 20, 147, 0.3);
          border: 1px solid rgba(255, 20, 147, 0.6);
        }

        @media (max-width: 768px) {
          .app-container {
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .canvas-container {
            flex: 1;
            width: 100%;
            height: calc(100vh - 90px);
            margin-bottom: 0;
          }

          .controls {
            position: fixed;
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            padding: 6px 8px;
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

          .title-overlay {
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            z-index: 5;
          }

          .style-title {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .app-container {
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .canvas-container {
            flex: 1;
            width: 100%;
            height: calc(100vh - 80px);
            margin-bottom: 0;
          }

          .controls {
            position: fixed;
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
            padding: 4px 6px;
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

          .title-overlay {
            top: 15px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            z-index: 5;
          }

          .style-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  )
}