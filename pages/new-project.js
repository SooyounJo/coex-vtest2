import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function NewProject() {
  const [currentStep, setCurrentStep] = useState(1)
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState('')

  const projectTypes = [
    { id: 'web', name: '웹 애플리케이션', icon: '🌐', description: '반응형 웹사이트 및 웹앱' },
    { id: 'mobile', name: '모바일 앱', icon: '📱', description: 'iOS/Android 앱 개발' },
    { id: 'game', name: '게임', icon: '🎮', description: '2D/3D 게임 개발' },
    { id: 'ai', name: 'AI/ML', icon: '🤖', description: '인공지능 및 머신러닝' },
    { id: 'data', name: '데이터 분석', icon: '📊', description: '데이터 시각화 및 분석' },
    { id: 'other', name: '기타', icon: '✨', description: '특별한 프로젝트' }
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // 프로젝트 생성 로직
    console.log('프로젝트 생성:', { projectName, projectType })
  }

  return (
    <>
      <Head>
        <title>새 프로젝트 시작</title>
        <meta name="description" content="새로운 프로젝트를 시작해보세요!" />
      </Head>

      <div className="new-project-page">
        {/* 헤더 */}
        <header className="new-project-header">
          <Link href="/" className="back-button">
            ← 홈으로
          </Link>
          <h1>🚀 새 프로젝트 시작하기</h1>
        </header>

        {/* 진행 단계 표시 */}
        <div className="progress-bar">
          <div className="progress-step active">1</div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* 메인 콘텐츠 */}
        <main className="new-project-content">
          {currentStep === 1 && (
            <div className="step-content">
              <h2>프로젝트 이름을 정해주세요</h2>
              <p>멋진 프로젝트 이름으로 시작해보세요!</p>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="예: My Awesome Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="project-name-input"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content">
              <h2>프로젝트 유형을 선택하세요</h2>
              <p>어떤 종류의 프로젝트를 만들고 싶으신가요?</p>
              <div className="project-type-grid">
                {projectTypes.map((type) => (
                  <div
                    key={type.id}
                    className={`project-type-card ${projectType === type.id ? 'selected' : ''}`}
                    onClick={() => setProjectType(type.id)}
                  >
                    <div className="type-icon">{type.icon}</div>
                    <h3>{type.name}</h3>
                    <p>{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content">
              <h2>프로젝트 설정 완료!</h2>
              <div className="project-summary">
                <div className="summary-item">
                  <span className="label">프로젝트 이름:</span>
                  <span className="value">{projectName}</span>
                </div>
                <div className="summary-item">
                  <span className="label">프로젝트 유형:</span>
                  <span className="value">
                    {projectTypes.find(t => t.id === projectType)?.name}
                  </span>
                </div>
              </div>
              <p>이제 프로젝트를 시작할 준비가 되었습니다!</p>
            </div>
          )}

          {/* 네비게이션 버튼 */}
          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button className="nav-button prev" onClick={handlePrev}>
                이전
              </button>
            )}
            {currentStep < 3 ? (
              <button 
                className="nav-button next" 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !projectName.trim()) ||
                  (currentStep === 2 && !projectType)
                }
              >
                다음
              </button>
            ) : (
              <button className="nav-button submit" onClick={handleSubmit}>
                프로젝트 시작! 🚀
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
