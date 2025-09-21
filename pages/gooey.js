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
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                className={`style-button ${num === 6 ? 'active' : ''}`}
                onClick={() => {
                  if (num === 6) return; // 6번은 현재 페이지
                  if (num === 7) {
                    window.location.href = '/?style=7';
                  } else {
                    window.location.href = `/?style=${num}`;
                  }
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
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px) saturate(1.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          padding: 15px 25px;
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
            rgba(255, 20, 147, 0.3), 
            rgba(255, 105, 180, 0.2));
          border: 1px solid rgba(255, 20, 147, 0.5);
          box-shadow: 
            0 8px 25px rgba(255, 20, 147, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 0 30px rgba(255, 20, 147, 0.3);
          border: 1px solid rgba(255, 20, 147, 0.6);
        }

        @media (max-width: 768px) {
          .style-title {
            font-size: 1.4rem;
          }

          .controls {
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
        }

        @media (max-width: 480px) {
          .controls {
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
        }
      `}</style>
    </>
  )
}
