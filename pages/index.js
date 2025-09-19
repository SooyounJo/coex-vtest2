import { useState } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import ShaderBubble from '../components/ShaderBubble'
import ShaderBubble2 from '../components/ShaderBubble2'

export default function Home() {
  const [selectedStyle, setSelectedStyle] = useState(1)

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
            <color attach="background" args={["#f3f4f6"]} />
            <ambientLight intensity={0.3} />
            <directionalLight position={[2, 3, 2]} intensity={0.5} />
            {selectedStyle === 2 ? <ShaderBubble2 /> : <ShaderBubble styleType={selectedStyle} />}
          </Canvas>
        </div>

        {/* 버튼 컨트롤 */}
        <div className="controls">
          <div className="button-grid">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className={`style-button ${selectedStyle === num ? 'active' : ''}`}
                onClick={() => setSelectedStyle(num)}
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
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 25px;
          padding: 20px 30px;
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            0 0 20px rgba(255, 255, 255, 0.1);
          z-index: 10;
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
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 6px 20px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.4),
            0 0 15px rgba(255, 255, 255, 0.1);
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
          .controls {
            bottom: 20px;
            padding: 15px 20px;
          }
          
          .button-grid {
            gap: 10px;
          }
          
          .style-button {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  )
}