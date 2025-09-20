import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GooeyShader() {
  const meshRef = useRef()
  const materialRef = useRef()
  const [isExpanded, setIsExpanded] = useState(false)

  // 쉐이더 유니폼
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uExpanded: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), [])

  // 버텍스 쉐이더
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // 프래그먼트 쉐이더 - 진짜 Gooey Effect
  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uExpanded;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // 노이즈 함수
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // 스무스 노이즈
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    // 구이 블롭 생성 (더 자연스러운 형태)
    float blob(vec2 uv, vec2 center, float radius, float time) {
      float dist = length(uv - center);
      
      // 더 부드러운 유기적 변형
      float noise1 = noise(uv * 2.0 + time * 0.3) * 0.05;
      float noise2 = noise(uv * 4.0 + time * 0.2) * 0.03;
      float wave = sin(dist * 6.0 - time * 1.5) * 0.01;
      
      // 중심에서의 거리에 따른 변형 강도 조절
      float noiseStrength = 1.0 - smoothstep(0.0, radius, dist);
      float finalRadius = radius + (noise1 + noise2 + wave) * noiseStrength;
      
      return 1.0 - smoothstep(finalRadius - 0.03, finalRadius + 0.03, dist);
    }

    // 구이 블렌딩
    float gooeyBlend(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;
      
      float time = uTime * 0.3;
      
      // 간단한 테스트 - 중앙에 원 하나만 그리기
      float dist = length(uv);
      float circle = 1.0 - smoothstep(0.2, 0.25, dist);
      
      // 색상
      vec3 color = vec3(1.0, 0.4, 0.7); // 마젠타
      
      // 최종 색상
      gl_FragColor = vec4(color, circle);
    }
  `

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      
      // 부드러운 전환을 위한 애니메이션
      const targetExpanded = isExpanded ? 1.0 : 0.0
      materialRef.current.uniforms.uExpanded.value += (targetExpanded - materialRef.current.uniforms.uExpanded.value) * 0.05
      
      // 마우스 위치 업데이트
      if (state.mouse) {
        materialRef.current.uniforms.uMouse.value.set(state.mouse.x, state.mouse.y)
      }
    }
  })

  const handleClick = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        precision="highp"
        antialias={true}
      />
    </mesh>
  )
}
