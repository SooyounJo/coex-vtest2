import { useState, useEffect, useRef } from 'react'

// 감정과 색상 정보 (긍정/부정 정도에 따른 4가지 컬러)
const emotions = [
  // 매우 긍정적 (따뜻한 오렌지/핑크)
  { text: 'JOY', color: '#FF6B6B', category: 'very_positive' },
  { text: 'HAPPINESS', color: '#FF8E8E', category: 'very_positive' },
  { text: 'DELIGHT', color: '#FFA8A8', category: 'very_positive' },
  { text: 'LOVE', color: '#FF6B9D', category: 'very_positive' },
  { text: 'WARMTH', color: '#FF8EB3', category: 'very_positive' },
  { text: 'GRATITUDE', color: '#FFA8C7', category: 'very_positive' },
  { text: 'AFFECTION', color: '#FF6B85', category: 'very_positive' },
  { text: 'ACHIEVEMENT', color: '#FF8E9E', category: 'very_positive' },
  
  // 긍정적 (밝은 파란색/보라)
  { text: 'HOPE', color: '#4ECDC4', category: 'positive' },
  { text: 'POSITIVE', color: '#45B7B8', category: 'positive' },
  { text: 'CONFIDENCE', color: '#26D0CE', category: 'positive' },
  { text: 'EXCITED', color: '#4ECDC4', category: 'positive' },
  { text: 'INTEREST', color: '#45B7B8', category: 'positive' },
  { text: 'CURIOSITY', color: '#26D0CE', category: 'positive' },
  { text: 'ENGAGED', color: '#4ECDC4', category: 'positive' },
  { text: 'FOCUSED', color: '#45B7B8', category: 'positive' },
  
  // 중립적 (부드러운 그린/옐로우)
  { text: 'PEACE', color: '#95E1D3', category: 'neutral' },
  { text: 'COMFORT', color: '#A8E6CF', category: 'neutral' },
  { text: 'SECURITY', color: '#B8E6B8', category: 'neutral' },
  { text: 'SATISFACTION', color: '#C7E6C7', category: 'neutral' },
  { text: 'TOUCHED', color: '#95E1D3', category: 'neutral' },
  { text: 'CALM', color: '#A8E6CF', category: 'neutral' },
  { text: 'RELAXED', color: '#B8E6B8', category: 'neutral' },
  { text: 'FREE', color: '#C7E6C7', category: 'neutral' },
  
  // 활발한 (에너지틱한 퍼플/마젠타)
  { text: 'PASSION', color: '#A8A8FF', category: 'energetic' },
  { text: 'MOTIVATED', color: '#B8B8FF', category: 'energetic' },
  { text: 'ABSORBED', color: '#C7C7FF', category: 'energetic' },
  { text: 'REFRESHED', color: '#A8A8FF', category: 'energetic' },
  { text: 'ENERGETIC', color: '#B8B8FF', category: 'energetic' },
  { text: 'VIBRANT', color: '#C7C7FF', category: 'energetic' }
]

export default function EmotionList({ onColorChange }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef(null)
  const itemHeight = 80 // 각 아이템의 높이 (모달에 맞게 조정)
  const containerHeight = 500 // 컨테이너 높이 (모달에 맞게 조정)

  // 스크롤 이벤트 처리 (모바일 터치 최적화)
  useEffect(() => {
    let scrollTimeout
    let isScrolling = false

    const handleScroll = (e) => {
      const newScrollY = e.target.scrollTop
      setScrollY(newScrollY)
      
      // 스크롤 중임을 표시
      isScrolling = true
      clearTimeout(scrollTimeout)
      
      // 스크롤이 멈춘 후 스냅 처리
      scrollTimeout = setTimeout(() => {
        isScrolling = false
        snapToNearestItem(e.target)
      }, 150) // 150ms 후 스냅
    }

    const snapToNearestItem = (container) => {
      const scrollTop = container.scrollTop
      const centerPosition = containerHeight / 2
      const adjustedScrollY = scrollTop + centerPosition - (containerHeight / 2)
      const itemIndex = Math.round(adjustedScrollY / itemHeight)
      const targetIndex = Math.max(0, Math.min(emotions.length - 1, itemIndex))
      
      // 부드러운 스냅 애니메이션
      const targetScrollY = targetIndex * itemHeight
      
      container.scrollTo({
        top: targetScrollY,
        behavior: 'smooth'
      })
      
      // 선택된 아이템 업데이트
      setSelectedIndex(targetIndex)
      
      // 중앙 아이템의 색상을 블롭에 전달
      if (onColorChange && emotions[targetIndex]) {
        onColorChange(emotions[targetIndex].color, emotions[targetIndex].category)
      }
    }

    const handleTouchEnd = (e) => {
      // 터치 종료 시 즉시 스냅 처리
      setTimeout(() => {
        if (!isScrolling && containerRef.current) {
          snapToNearestItem(containerRef.current)
        }
      }, 100)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      container.addEventListener('touchend', handleTouchEnd)
      
      return () => {
        container.removeEventListener('scroll', handleScroll)
        container.removeEventListener('touchend', handleTouchEnd)
        clearTimeout(scrollTimeout)
      }
    }
  }, [])

  // 각 아이템의 스타일 계산
  const getItemStyle = (index) => {
    // 상단 패딩을 고려한 아이템 위치 계산
    const itemCenterY = (containerHeight / 2) + (index * itemHeight) + (itemHeight / 2)
    const containerCenterY = containerHeight / 2
    const actualItemCenterY = itemCenterY - scrollY // 스크롤 오프셋 적용
    const distance = Math.abs(actualItemCenterY - containerCenterY)
    const maxDistance = containerHeight / 2
    
    // 룰렛 효과: 거리에 따라 점진적으로 크기와 진하기 변화
    const normalizedDistance = distance / maxDistance // 0~1 정규화
    const inverseDistance = 1 - normalizedDistance // 중앙일수록 1에 가까움
    
        // 폰트 사이즈 계산 (최소 12px, 최대 48px) - 거리에 따라 점진적 변화
        const fontSize = 12 + (inverseDistance * 36) // 12px ~ 48px
    
    // 스케일 제거 - fontSize만으로 크기 조절
    const scale = 1.0 // 항상 1.0으로 고정
    
    // 거리에 따른 투명도 조절 (0.3 ~ 1.0)
    const opacity = Math.max(0.3, 1 - (distance / maxDistance) * 0.7)
    
    // 블러 계산 - 중앙일수록 선명, 멀수록 블러
    const blurAmount = normalizedDistance * 8 // 0~8px 블러
    
    // 색상 계산 - 중앙일수록 진한 검정, 멀수록 연한 그레이 퍼플
    const colorIntensity = inverseDistance // 0~1, 중앙일수록 1에 가까움
    const red = Math.round(139 * (1 - colorIntensity)) // 그레이 퍼플에서 검정으로
    const green = Math.round(125 * (1 - colorIntensity))
    const blue = Math.round(155 * (1 - colorIntensity))
    const color = `rgb(${red}, ${green}, ${blue})`
    
    return {
      transform: 'none', // transform 제거
      opacity: opacity,
      color: color, // 거리에 따라 점진적으로 진해지는 색상
      fontWeight: 'bold', // 모든 아이템 볼드체
      fontSize: `${fontSize}px`, // 계산된 폰트 사이즈 (최소 20px, 최대 40px)
      textAlign: 'left', // 좌측 정렬
      height: `${itemHeight}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start', // 좌측 정렬
          paddingLeft: '50px', // 좌측 패딩 더 넓게 조정
          transition: 'all 0.1s ease-out',
          cursor: 'pointer',
          textTransform: 'uppercase', // 모든 텍스트 대문자로
          filter: `blur(${blurAmount}px)`, // 거리에 따른 블러 효과
          scrollSnapAlign: 'center', // 스크롤 스냅 포인트
          scrollSnapStop: 'always' // 항상 스냅
    }
  }

  return (
    <div 
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '360px', // 더 넓게 조정하여 좌우 패딩 줄임
        height: `${containerHeight}px`,
        overflow: 'visible', // 오버플로우를 visible로 변경
        zIndex: 100,
      }}
    >
          <div
            ref={containerRef}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
              scrollSnapType: 'y mandatory', // 세로 스크롤 스냅
              WebkitOverflowScrolling: 'touch', // iOS 부드러운 스크롤
            }}
            onScroll={(e) => {
              e.target.style.scrollbarWidth = 'none'
              e.target.style.msOverflowStyle = 'none'
            }}
          >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none; /* Chrome, Safari */
        }
      `}</style>
      
      {/* 상단 패딩 */}
      <div style={{ height: `${containerHeight / 2}px` }} />
      
      {/* 감정 리스트 */}
      {emotions.map((emotion, index) => (
        <div
          key={index}
          style={getItemStyle(index)}
              onClick={() => {
                // 클릭 시 해당 아이템으로 스크롤 (스냅 효과)
                const targetScrollY = index * itemHeight
                containerRef.current.scrollTo({
                  top: targetScrollY,
                  behavior: 'smooth'
                })
                
                // 선택된 아이템 업데이트
                setSelectedIndex(index)
                
                // 중앙 아이템의 색상을 블롭에 전달
                if (onColorChange && emotions[index]) {
                  onColorChange(emotions[index].color, emotions[index].category)
                }
              }}
        >
          {emotion.text}
        </div>
      ))}
      
      {/* 하단 패딩 - 30개 모두 스크롤 가능하도록 충분한 공간 */}
      <div style={{ height: `${containerHeight * 1.2}px` }} />
      </div>
    </div>
  )
}
