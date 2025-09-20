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
  }), [])

  // 버텍스 쉐이더
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  // 프래그먼트 쉐이더
  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uExpanded;
    varying vec2 vUv;

    // 노이즈 함수
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // 스무스 노이즈
    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // 구이 효과를 위한 거리 필드
    float gooeyDistance(vec2 p, vec2 center, float radius, float time) {
      // 중심점에서의 거리
      float dist = length(p - center);
      
      // 4번 구처럼 일렁이는 효과
      float ripple1 = sin(time * 2.0 + dist * 8.0) * 0.05;
      float ripple2 = sin(time * 1.5 + dist * 12.0) * 0.03;
      float elastic1 = sin(time * 3.0 + dist * 6.0) * 0.04;
      float elastic2 = cos(time * 2.5 + dist * 10.0) * 0.02;
      
      // 노이즈를 이용한 유기적 변형
      float noiseOffset = smoothNoise(p * 0.02 + time * 0.1) * 0.2;
      
      // 최종 반지름
      float finalRadius = radius + ripple1 + ripple2 + elastic1 + elastic2 + noiseOffset;
      
      return dist - finalRadius;
    }

    // 메인 중앙 구
    float mainCircle(vec2 p, float time) {
      vec2 center = vec2(0.0, 0.0);
      float radius = 0.15;
      return gooeyDistance(p, center, radius, time);
    }

    // 작은 구들 - 터치 인터랙션으로 붙고 떨어지는 패턴
    float smallCircle(vec2 p, vec2 center, float radius, float time, float phase) {
      // 터치 상태에 따른 거리 조절
      float baseDistance = 0.3;
      float expansionDistance = 0.6;
      float distance = mix(baseDistance, expansionDistance, uExpanded);
      
      // 추가 움직임 (터치하지 않을 때만)
      float extraMovement = (1.0 - uExpanded) * sin(time * 0.5 + phase) * 0.2;
      distance += extraMovement;
      
      float angle = phase + time * 0.2;
      
      vec2 offset = vec2(
        cos(angle) * distance,
        sin(angle) * distance
      );
      vec2 finalCenter = center + offset;
      
      // 중앙에 가까울 때는 크기가 작아지고, 멀어질 때는 커짐
      float sizeMultiplier = 1.0 + sin(time * 0.8 + phase) * 0.3;
      float finalRadius = radius * sizeMultiplier;
      
      return gooeyDistance(p, finalCenter, finalRadius, time + phase);
    }

    // 구이 블렌딩 함수
    float gooeyBlend(float d1, float d2, float k) {
      float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
      return mix(d2, d1, h) - k * h * (1.0 - h);
    }

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      uv.x *= uResolution.x / uResolution.y;
      
      float time = uTime * 0.5;
      
      // 메인 중앙 구
      float mainDist = mainCircle(uv, time);
      
      // 작은 구들 (8개)
      float smallDist = 1000.0;
      for(int i = 0; i < 8; i++) {
        float angle = float(i) * 3.14159 * 2.0 / 8.0;
        vec2 center = vec2(cos(angle), sin(angle)) * 0.4;
        float radius = 0.04 + sin(time + float(i)) * 0.01;
        float phase = float(i) * 0.5;
        
        float dist = smallCircle(uv, center, radius, time, phase);
        smallDist = gooeyBlend(smallDist, dist, 0.1);
      }
      
      // 메인 구와 작은 구들 블렌딩
      float finalDist = gooeyBlend(mainDist, smallDist, 0.15);
      
      // 거리 필드 기반 색상
      float alpha = 1.0 - smoothstep(0.0, 0.02, finalDist);
      
      // 다양한 컬러 팔레트 (블루 외에도 다양한 색상)
      vec3 color1 = vec3(0.2, 0.6, 1.0); // 밝은 오션 블루
      vec3 color2 = vec3(0.8, 0.2, 0.6); // 마젠타
      vec3 color3 = vec3(0.1, 0.8, 0.4); // 그린
      vec3 color4 = vec3(1.0, 0.4, 0.2); // 오렌지
      vec3 color5 = vec3(0.6, 0.2, 0.8); // 퍼플
      vec3 color6 = vec3(1.0, 0.8, 0.2); // 옐로우
      
      // 위치 기반 컬러 선택
      float angle = atan(uv.y, uv.x) + 3.14159;
      float normalizedAngle = angle / (2.0 * 3.14159);
      
      // 6개 섹션으로 나누어 각각 다른 컬러
      vec3 baseColor;
      if (normalizedAngle < 1.0/6.0) {
        baseColor = color1; // 블루
      } else if (normalizedAngle < 2.0/6.0) {
        baseColor = color2; // 마젠타
      } else if (normalizedAngle < 3.0/6.0) {
        baseColor = color3; // 그린
      } else if (normalizedAngle < 4.0/6.0) {
        baseColor = color4; // 오렌지
      } else if (normalizedAngle < 5.0/6.0) {
        baseColor = color5; // 퍼플
      } else {
        baseColor = color6; // 옐로우
      }
      
      // 거리 기반 그라데이션
      float gradient = length(uv) * 2.0;
      baseColor = mix(baseColor, baseColor * 0.3, smoothstep(0.0, 1.0, gradient));
      
      // 시간에 따른 컬러 변화
      float timeOffset = time * 0.5;
      float colorShift1 = sin(timeOffset + normalizedAngle * 6.28) * 0.4;
      float colorShift2 = cos(timeOffset * 1.3 + normalizedAngle * 6.28) * 0.3;
      float colorShift3 = sin(timeOffset * 0.7 + normalizedAngle * 6.28) * 0.2;
      
      baseColor.r += colorShift1;
      baseColor.g += colorShift2;
      baseColor.b += colorShift3;
      
      // 4번 구처럼 일렁이는 색상 변화
      float rippleColor = sin(time * 2.0 + gradient * 4.0) * 0.15;
      float elasticColor = cos(time * 1.5 + gradient * 6.0) * 0.08;
      baseColor += vec3(rippleColor, rippleColor * 0.8, rippleColor * 0.6);
      baseColor += vec3(elasticColor, elasticColor * 0.9, elasticColor * 0.7);
      
      // 글로우 효과
      float glow = 1.0 - smoothstep(0.0, 0.1, finalDist);
      baseColor += glow * 0.5;
      
      // 최종 색상
      vec3 finalColor = baseColor * alpha;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      
      // 부드러운 전환을 위한 애니메이션
      const targetExpanded = isExpanded ? 1.0 : 0.0
      materialRef.current.uniforms.uExpanded.value += (targetExpanded - materialRef.current.uniforms.uExpanded.value) * 0.05
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
