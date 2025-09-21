import { useEffect, useRef } from 'react'
import Head from 'next/head'
import GooeyShader from '../components/8'

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

        {/* 버튼 컨트롤 */}
        <div className="controls">
          <div className="button-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                className={`style-button ${num === 8 ? 'active' : ''}`}
                onClick={() => {
                  if (num === 8) return; // 8번은 현재 페이지
                  window.location.href = `/?style=${num}`;
                }}
              >
                {num}
              </button>
            ))}
          </div>
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
          width: 50px;
          height: 40px;
          border: none;
          border-radius: 8px;
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
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .style-button.active {
          background: rgba(255, 182, 193, 0.8);
          color: #fff;
        }

        @media (max-width: 768px) {
          .style-title {
            font-size: 1.4rem;
          }

          .controls {
            bottom: 8px;
            left: 50%;
            transform: translateX(-50%);
            padding: 14px 16px;
            width: calc(100vw - 20px);
            max-width: 100%;
            min-width: 0;
          }
          
          .button-grid {
            gap: 8px;
            justify-content: space-between;
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 0 4px;
            width: 100%;
            display: flex;
            align-items: center;
          }
          
          .style-button {
            width: 44px;
            height: 36px;
            font-size: 0.9rem;
            min-width: 44px;
            flex-shrink: 0;
            margin: 0 2px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
          }
        }

        @media (max-width: 480px) {
          .controls {
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 14px;
            width: calc(100vw - 16px);
            max-width: 100%;
            min-width: 0;
          }
          
          .button-grid {
            gap: 6px;
            justify-content: space-between;
            flex-wrap: nowrap;
            overflow-x: auto;
            padding: 0 2px;
            width: 100%;
            display: flex;
            align-items: center;
          }
          
          .style-button {
            width: 40px;
            height: 32px;
            font-size: 0.8rem;
            min-width: 40px;
            flex-shrink: 0;
            margin: 0 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 5px;
          }
        }
      `}</style>
    </>
  )
}
