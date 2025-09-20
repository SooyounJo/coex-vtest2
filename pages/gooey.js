import { useEffect, useRef } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import GooeyShader from '../components/GooeyShader'

export default function GooeyPage() {

  return (
    <>
      <Head>
        <title>Gooey Effect</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="gooey-page">
        <div className="title-overlay">
          <h1 className="style-title">Gooey Effect</h1>
        </div>
        
        <Canvas
          className="gooey-canvas"
          dpr={[2, 3]}
          gl={{ 
            antialias: true, 
            powerPreference: 'high-performance',
            precision: 'highp',
            alpha: true,
            stencil: false,
            depth: false
          }}
          camera={{ position: [0, 0, 1], fov: 50 }}
        >
          <GooeyShader />
        </Canvas>

        <div className="back-button">
          <button onClick={() => window.history.back()}>← 뒤로가기</button>
        </div>
      </div>

      <style jsx>{`
        .gooey-page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .title-overlay {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .style-title {
          color: #ffb6c1;
          font-family: 'Noto Sans KR', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0;
          text-align: center;
          text-shadow: 0 2px 4px rgba(255, 182, 193, 0.3);
          letter-spacing: 0.1em;
        }

        .gooey-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #0a1a2e, #16213e, #1e3a8a);
        }


        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }

        .back-button button {
          background: rgba(255, 182, 193, 0.9);
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          color: white;
          font-family: 'Noto Sans KR', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 10px rgba(255, 182, 193, 0.3);
        }

        .back-button button:hover {
          background: rgba(255, 182, 193, 1);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(255, 182, 193, 0.4);
        }

        @media (max-width: 768px) {
          .style-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </>
  )
}
