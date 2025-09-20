import { useEffect, useRef } from 'react'
import Head from 'next/head'
import GooeyShader from '../components/6'

export default function GooeyPage() {

  return (
    <>
      <Head>
        <title>Gooey Effect</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="gooey-page">
        <div className="title-overlay">
          <h1 className="style-title">Gooey Effect</h1>
        </div>
        
        {/* Gooey Effect (Canvas 밖) */}
        <GooeyShader />

        <div className="back-button">
          <button onClick={() => window.history.back()}>←</button>
        </div>
      </div>

      <style jsx>{`
        .gooey-page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #ffffff;
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
          color: #ff62e8;
          font-family: 'Poppins', sans-serif;
          font-size: 1.8rem;
          font-weight: 300;
          margin: 0;
          text-align: center;
          letter-spacing: 0.1em;
        }

        .gooey-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #1a0a1a, #2e162e, #4a1e4a);
        }


        .back-button {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 10;
        }

        .back-button button {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          padding: 8px 12px;
          border-radius: 50%;
          color: white;
          font-family: 'Poppins', sans-serif;
          font-weight: 300;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .back-button button:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
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
