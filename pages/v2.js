import { useState } from 'react'
import Head from 'next/head'
import { Canvas } from '@react-three/fiber'
import Shader1 from '../components/ver2/1'
import Shader2 from '../components/ver2/2'
import Shader3 from '../components/ver2/3'
import Shader4 from '../components/ver2/4'
import Shader5 from '../components/ver2/5'
import { useRouter } from 'next/router'

export default function V2Page() {
  const [style, setStyle] = useState(2)
  const router = useRouter()

  const goV1 = () => {
    if (router.pathname !== '/') router.push('/')
  }
  const goV2 = () => {
    if (router.pathname !== '/v2') router.push('/v2')
  }

  return (
    <>
      <Head>
        <title>Shader Bubble - ver.2</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      {/* 상단 ver.1 / ver.2 */}
      <div className="version-switcher" role="navigation" aria-label="Version Switcher">
        <button className={`ver-button ${router.pathname === '/' ? 'active' : ''}`} onClick={goV1}>ver.1</button>
        <button className={`ver-button ${router.pathname === '/v2' ? 'active' : ''}`} onClick={goV2}>ver.2</button>
      </div>

      <div className="app-container">
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
            {style === 1 ? <Shader1 styleType={1} /> :
             style === 2 ? <Shader2 styleType={2} /> :
             style === 3 ? <Shader3 /> :
             style === 4 ? <Shader4 /> :
             <Shader5 />}
          </Canvas>
          <div className="title-overlay">
            <h1 className="style-title">ver.2</h1>
          </div>
        </div>

        {/* 하단 1-5 버튼 */}
        <div className="version-switcher-bottom" role="navigation" aria-label="Style Switcher 1-5">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              className={`ver-button ${style === num ? 'active' : ''}`}
              onClick={() => setStyle(num)}
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
          font-size: 2.2rem;
          margin: 0;
          text-align: center;
        }
        @media (max-width: 768px) {
          .style-title { font-size: 1.8rem; }
          .title-overlay { top: 68px; }
        }
      `}</style>
    </>
  )
}
