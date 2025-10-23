import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function RibbonShader() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float time;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // 외곽 일렁임 감소 - 중앙만 일렁임 (가장자리로 갈수록 감소)
        float edgeFactor = 1.0 - abs(uv.x - 0.5) * 2.0; // 중앙 1.0, 가장자리 0.0
        edgeFactor = pow(edgeFactor, 2.0); // 가장자리 감소를 더 강하게
        
        // 리본의 웨이브 효과 (외곽은 거의 없음)
        float wave1 = sin(pos.y * 2.0 + time * 1.5) * 0.2 * edgeFactor;
        float wave2 = cos(pos.y * 3.0 + time * 2.0) * 0.1 * edgeFactor;
        float wave3 = sin(pos.y * 5.0 - time * 1.0) * 0.05 * edgeFactor;
        
        pos.x += wave1 + wave2 + wave3;
        pos.z += cos(pos.y * 2.5 + time * 1.8) * 0.15 * edgeFactor;
        
        // DNA처럼 회전하는 스프링 효과 (유지)
        float twist = pos.y * 0.5 + time * 0.8;
        float x = pos.x * cos(twist) - pos.z * sin(twist);
        float z = pos.x * sin(twist) + pos.z * cos(twist);
        pos.x = x;
        pos.z = z;
        
        vPosition = pos;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      // 노이즈 함수
      float hash(float n) { 
        return fract(sin(n) * 43758.5453123); 
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 57.0;
        return mix(mix(hash(n), hash(n + 1.0), f.x),
                   mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y);
      }
      
      // 생생하고 명확한 그라데이션 색상 (이미지 기반)
      vec3 getColor(float t, vec2 uv) {
        // 위치와 시간에 따른 노이즈로 컬러 변화
        float n1 = noise(vec2(t * 3.0 + time * 0.1, uv.y * 2.0));
        float n2 = noise(vec2(t * 5.0 - time * 0.15, uv.y * 3.0 + 10.0));
        float n3 = noise(vec2(t * 4.0 + time * 0.08, uv.y * 1.5 + 20.0));
        
        // 컬러 뭉침 효과 - 특정 영역에서 압축/확장
        float clumpNoise1 = noise(vec2(uv.y * 4.0 + time * 0.1, t * 2.0));
        float clumpNoise2 = noise(vec2(uv.y * 6.0 - time * 0.08, t * 3.0 + 10.0));
        
        // 뭉침 강도 (0.5 = 균일, 0.0 = 압축, 1.0 = 확장)
        float clumpFactor = clumpNoise1 * 0.6 + clumpNoise2 * 0.4;
        clumpFactor = pow(clumpFactor, 2.0); // 압축 영역을 더 뚜렷하게
        
        // t값을 뭉침에 따라 비선형 변환
        t = pow(t, mix(0.5, 2.0, clumpFactor)); // 뭉치거나 펼쳐짐
        
        // 노이즈로 컬러 위치 왜곡 (더 미묘하게)
        t = fract(t + n1 * 0.12 + sin(time * 0.2 + uv.y * 5.0) * 0.05);
        
        // 이미지 기반 네온 그라디언트 컬러 팔레트
        vec3 c1 = vec3(0.75, 1.00, 0.30); // 네온 라임 그린
        vec3 c2 = vec3(0.95, 1.00, 0.35); // 브라이트 라임 옐로우
        vec3 c3 = vec3(1.00, 0.95, 0.30); // 브라이트 옐로우
        vec3 c4 = vec3(0.30, 0.90, 0.95); // 시안
        vec3 c5 = vec3(0.40, 0.70, 1.00); // 스카이 블루
        vec3 c6 = vec3(0.55, 0.50, 1.00); // 코발트 블루
        vec3 c7 = vec3(0.85, 0.55, 1.00); // 라벤더
        
        // 랜덤한 경계값들 (노이즈 기반, 더 불규칙하게)
        float b1 = 0.12 + n1 * 0.12;
        float b2 = 0.25 + n2 * 0.15;
        float b3 = 0.42 + n3 * 0.12;
        float b4 = 0.58 + n1 * 0.12;
        float b5 = 0.72 + n2 * 0.10;
        float b6 = 0.86 + n3 * 0.08;
        
        vec3 color;
        if (t < b1) {
          color = mix(c1, c2, smoothstep(0.0, b1, t));
        } else if (t < b2) {
          color = mix(c2, c3, smoothstep(b1, b2, t));
        } else if (t < b3) {
          color = mix(c3, c4, smoothstep(b2, b3, t));
        } else if (t < b4) {
          color = mix(c4, c5, smoothstep(b3, b4, t));
        } else if (t < b5) {
          color = mix(c5, c6, smoothstep(b4, b5, t));
        } else if (t < b6) {
          color = mix(c6, c7, smoothstep(b5, b6, t));
        } else {
          color = mix(c7, c1, smoothstep(b6, 1.0, t));
        }
        
        // 미묘한 컬러 변화 추가 (더 적게)
        color += vec3(n2 * 0.015, n3 * 0.015, n1 * 0.015);
        
        return color;
      }
      
      void main() {
        // 유기적으로 천천히 흐르는 그라데이션
        float flow = vUv.y * 1.2 - time * 0.15;
        
        // 노이즈로 유기적인 흐름 추가
        float organicFlow1 = noise(vec2(vUv.y * 2.0 + time * 0.1, vUv.x * 1.5));
        float organicFlow2 = noise(vec2(vUv.y * 3.5 - time * 0.08, vUv.x * 2.0 + 5.0));
        flow += organicFlow1 * 0.3 + organicFlow2 * 0.2;
        flow = fract(flow); // 0~1 사이로 순환
        
        // 고급스러운 파스텔 색상 (랜덤 간격)
        vec3 color = getColor(flow, vUv);
        
        // 블러 강도가 변하는 패턴 생성 (노이즈 기반)
        float blurPattern1 = noise(vec2(vUv.y * 8.0 + time * 0.3, vUv.x * 5.0));
        float blurPattern2 = noise(vec2(vUv.y * 12.0 - time * 0.2, vUv.x * 8.0 + 10.0));
        float blurPattern3 = noise(vec2(vUv.y * 15.0 + time * 0.4, vUv.x * 10.0 + 20.0));
        
        // 블러 패턴 조합 - 블러리하게
        float blurIntensity = blurPattern1 * 0.5 + blurPattern2 * 0.3 + blurPattern3 * 0.2;
        blurIntensity = 0.6 + blurIntensity * 0.4; // 전체적으로 블러 (0.6~1.0)
        
        // 선명한 영역과 블러 영역에 따라 다른 glow 적용
        float sharpGlow = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float softGlow = 1.0 - abs(vUv.x - 0.5) * 1.5;
        
        // 블러 강도에 따라 소프트 ~ 강한 블러 glow 믹스
        float softGlow2 = pow(max(sharpGlow, 0.0), 1.5); // 소프트
        float strongBlur = pow(max(softGlow, 0.0), 2.5);  // 강한 블러
        float glow = mix(softGlow2, strongBlur, blurIntensity);
        glow = max(glow, 0.4); // 최소 glow 값
        
        // 부드러운 일렁이는 효과
        float ripple = sin(vUv.y * 6.0 + time * 2.0) * 0.05 + 
                       cos(vUv.y * 8.0 - time * 1.5) * 0.03;
        color += ripple;
        
        // 가장자리 페이드도 블러 패턴에 따라 변화 - 소프트하게
        float softEdge = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
        float blurryEdge = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
        float edgeFade = mix(softEdge, blurryEdge, blurIntensity);
        edgeFade = max(edgeFade, 0.3); // 가장자리도 최소값 보장
        
        // 테두리에 핑크/마젠타 추가 (부드럽게)
        float edgeDistance = min(vUv.x, 1.0 - vUv.x); // 양쪽 가장자리까지의 거리
        float pinkEdge = smoothstep(0.4, 0.0, edgeDistance); // 가장자리로 갈수록 강해짐
        vec3 pinkTint = vec3(1.00, 0.55, 0.90); // 부드러운 핑크/마젠타
        color = mix(color, pinkTint, pinkEdge * 0.35); // 핑크를 부드럽게 블렌드
        
        // 밝기 조절 (부드럽게)
        color *= 1.3; // 밝기 적당히 증가
        color = pow(color, vec3(0.9)); // 대비 부드럽게
        
        // 채도 적당히 증가
        vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
        color = mix(gray, color, 1.15); // 채도 적당히
        
        // 알파값 (블러 패턴에 따라 변화) - 부드럽게
        float softAlpha = 0.85;
        float blurryAlpha = 0.7;
        float alpha = mix(softAlpha, blurryAlpha, blurIntensity) * glow * edgeFade;
        alpha = clamp(alpha, 0.5, 0.95); // 부드러운 opacity
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  useFrame((state, delta) => {
    material.uniforms.time.value += delta
  })

  const { viewport } = useThree()
  
  // 리본 크기 설정
  const width = 2.0
  const height = viewport.height * 1.5

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[width, height, 64, 256]} />
        <primitive object={material} attach="material" />
      </mesh>
  )
}
