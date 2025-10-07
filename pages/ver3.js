import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import Mobile1 from '../components/ver3/mobile1'
import Mobile2 from '../components/ver3/mobile2'
import Mobile3 from '../components/ver3/mobile3'
import { useRouter } from 'next/router'

export default function Ver3() {
  const [selectedStyle, setSelectedStyle] = useState(1)
  const router = useRouter()

  // URL 파라미터 처리
  useEffect(() => {
    if (router.query.style) {
      const style = parseInt(router.query.style)
      if (style >= 1 && style <= 3) {
        setSelectedStyle(style)
      }
    }
  }, [router.query.style])


  const handleStyleChange = (style) => {
    setSelectedStyle(style)
    // URL 업데이트
    router.push(`/ver3?style=${style}`, undefined, { shallow: true })
  }

  return (
    <>
      <Head>
        <title>Shader Bubble - Mobile</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 모달 오버레이 */}
      <div className="modal-overlay">
        {/* 뒤로가기 버튼 (좌측 위) */}
        <div className="back-button-container">
          <button 
            className="back-button"
            onClick={() => router.push('/')}
          >
            ← Back
          </button>
        </div>
        
        <div className="modal-container">
          {/* 모달 헤더 */}
          <div className="modal-header">
            <h2 className="modal-title">Mobile Shader Effects</h2>
            <button 
              className="close-button"
              onClick={() => router.push('/')}
            >
              ✕
            </button>
          </div>

          {/* 3D Canvas */}
          <div className="canvas-container">
            <Canvas 
              className="r3f-canvas"
              dpr={[1, 2]}
              gl={{ antialias: true, powerPreference: 'high-performance' }}
              camera={{ position: [0, 0, 6], fov: 50 }}
            >
              <color attach="background" args={["#ffffff"]} />
              <ambientLight intensity={0.3} />
              <directionalLight position={[2, 3, 2]} intensity={0.5} />
              {selectedStyle === 1 ? <Mobile1 /> : 
               selectedStyle === 2 ? <Mobile2 /> : 
               selectedStyle === 3 ? <Mobile3 /> : 
               <Mobile1 />}
            </Canvas>
            
            {/* 버튼별 제목 표시 */}
            {selectedStyle === 1 && (
              <div className="title-overlay">
                <h1 className="style-title">Mobile 1</h1>
              </div>
            )}
            {selectedStyle === 2 && (
              <div className="title-overlay">
                <h1 className="style-title">Mobile 2</h1>
              </div>
            )}
            {selectedStyle === 3 && (
              <div className="title-overlay">
                <h1 className="style-title">Mobile 3</h1>
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="version-switcher-bottom" role="navigation" aria-label="Mobile Style Switcher">
            {[1, 2, 3].map((num) => (
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
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .back-button-container {
          position: absolute;
          top: 20px;
          left: 20px;
          z-index: 1001;
        }

        .back-button {
          padding: 12px 20px;
          background: #ffffff;
          color: #333333;
          border: 2px solid #e0e0e0;
          border-radius: 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .back-button:hover {
          background: #f5f5f5;
          border-color: #d0d0d0;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .modal-container {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 400px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eaeaea;
          background: #fafafa;
        }

        .modal-title {
          color: #333333;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.4rem;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: #666666;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          background: #f0f0f0;
          color: #333333;
        }

        .canvas-container {
          flex: 1;
          position: relative;
          width: 100%;
          min-height: 400px;
          max-height: 500px;
        }

        .title-overlay {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
        }

        .style-title {
          color: #000000;
          font-family: 'Poppins', sans-serif;
          font-weight: 300;
          font-size: 1.6rem;
          margin: 0;
          text-align: center;
        }

        .version-switcher-bottom {
          display: flex;
          justify-content: center;
          padding: 20px;
          background: #ffffff;
          border-top: 1px solid #eaeaea;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ver-button {
          padding: 14px 24px;
          background: #ffffff;
          color: #333333;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 60px;
        }

        .ver-button:hover {
          background: #f5f5f5;
          border-color: #d0d0d0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .ver-button.active {
          background: #333333;
          color: white;
          border-color: #222222;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .r3f-canvas {
          width: 100% !important;
          height: 100% !important;
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }
          
          .modal-container {
            max-width: 350px;
            max-height: 85vh;
            border-radius: 16px;
          }
          
          .back-button-container {
            top: 15px;
            left: 15px;
          }
          
          .back-button {
            padding: 10px 16px;
            font-size: 13px;
            border-radius: 12px;
          }
          
          .modal-header {
            padding: 16px 20px;
          }
          
          .modal-title {
            font-size: 1.2rem;
          }
          
          .canvas-container {
            min-height: 350px;
            max-height: 450px;
          }
          
          .style-title {
            font-size: 1.4rem;
          }
          
          .title-overlay {
            top: 15px;
          }

          .version-switcher-bottom {
            padding: 16px;
            gap: 8px;
          }

          .ver-button {
            padding: 12px 20px;
            font-size: 15px;
            min-width: 50px;
            border-radius: 16px;
          }
        }

        @media (max-width: 480px) {
          .modal-overlay {
            padding: 5px;
          }
          
          .modal-container {
            max-width: 320px;
            border-radius: 12px;
          }
          
          .back-button-container {
            top: 10px;
            left: 10px;
          }
          
          .back-button {
            padding: 8px 14px;
            font-size: 12px;
            border-radius: 10px;
          }
          
          .modal-header {
            padding: 12px 16px;
          }
          
          .modal-title {
            font-size: 1.1rem;
          }
          
          .canvas-container {
            min-height: 300px;
            max-height: 400px;
          }
          
          .style-title {
            font-size: 1.2rem;
          }
          
          .title-overlay {
            top: 12px;
          }

          .ver-button {
            padding: 10px 16px;
            font-size: 14px;
            min-width: 45px;
            border-radius: 14px;
          }

          .version-switcher-bottom {
            padding: 12px;
            gap: 6px;
          }
        }
      `}</style>
    </>
  )
}
