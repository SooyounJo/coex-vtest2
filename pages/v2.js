import { useState } from 'react'
import Head from 'next/head'
import V9 from '../components/ver2/9'
import V10 from '../components/ver2/10'
import V11 from '../components/ver2/11'
import V12 from '../components/ver2/12'
import V13 from '../components/ver2/13'
import V14 from '../components/ver2/14'
import { useRouter } from 'next/router'

export default function V2Page() {
  const [style, setStyle] = useState(9)
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
          {style === 9 ? <V9 /> :
           style === 10 ? <V10 /> :
           style === 11 ? <V11 /> :
           style === 12 ? <V12 /> :
           style === 13 ? <V13 /> :
           <V14 />}
          <div className="title-overlay">
            <h1 className="style-title">ver.2</h1>
          </div>
        </div>

        {/* 하단 9-14 버튼 */}
        <div className="version-switcher-bottom" role="navigation" aria-label="Style Switcher 9-14">
          {[9, 10, 11, 12, 13, 14].map((num) => (
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
