import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import Mobile1 from '../components/ver3/mobile1'
import Empty2 from '../components/ver3/empty2'
import Empty3 from '../components/ver3/empty3'
import ShaderBubble from '../components/ver1/1'
import ShaderBubble2 from '../components/ver1/2'
import ShaderBubble3 from '../components/ver1/3'
import { useRouter } from 'next/router'

export default function Ver3() {
  const [selectedStyle, setSelectedStyle] = useState(1)
  const [selectedMobile, setSelectedMobile] = useState(1)
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

  const handleMobileChange = (mobile) => {
    setSelectedMobile(mobile)
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
          {/* 상단 버튼 */}
          <div className="top-buttons">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                className={`top-button ${selectedStyle === num ? 'active' : ''}`}
                onClick={() => handleStyleChange(num)}
              >
                {num}
              </button>
            ))}
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
              {/* 상단 버튼이 선택된 경우 ver1 컴포넌트 렌더링 */}
              {selectedStyle === 1 ? <ShaderBubble /> : 
               selectedStyle === 2 ? <ShaderBubble2 /> : 
               selectedStyle === 3 ? <ShaderBubble3 /> : 
               /* 하단 버튼이 선택된 경우 mobile 컴포넌트 렌더링 */
               selectedMobile === 1 ? <Mobile1 /> : 
               selectedMobile === 2 ? <Empty2 /> : 
               selectedMobile === 3 ? <Empty3 /> : 
               <Mobile1 />}
            </Canvas>
            
          </div>

          {/* 하단 버튼 */}
          <div className="version-switcher-bottom" role="navigation" aria-label="Mobile Style Switcher">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                className={`ver-button ${selectedMobile === num ? 'active' : ''}`}
                onClick={() => handleMobileChange(num)}
              >
                M{num}
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
          max-width: 375px;
          height: 80vh;
          min-height: 600px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .top-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          padding: 15px;
          background: #ffffff;
          border-bottom: 1px solid #eaeaea;
        }

        .top-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #e0e0e0;
          background: #ffffff;
          color: #333333;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .top-button:hover {
          background: #f5f5f5;
          border-color: #d0d0d0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .top-button.active {
          background: #333333;
          color: white;
          border-color: #222222;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }


        .canvas-container {
          flex: 1;
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 450px;
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
            max-width: 360px;
            height: 85vh;
            min-height: 550px;
            border-radius: 16px;
          }
          
          .top-buttons {
            padding: 12px;
            gap: 10px;
          }
          
          .top-button {
            width: 36px;
            height: 36px;
            font-size: 14px;
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
          
          
          .canvas-container {
            min-height: 400px;
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
            max-width: 340px;
            height: 90vh;
            min-height: 500px;
            border-radius: 12px;
          }
          
          .top-buttons {
            padding: 10px;
            gap: 8px;
          }
          
          .top-button {
            width: 32px;
            height: 32px;
            font-size: 13px;
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
          
          
          .canvas-container {
            min-height: 350px;
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
