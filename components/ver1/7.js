import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function ShaderBubble7() {
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
        
        // 컬러 뭉침 효과 - 매우 불규칙하게
        float clumpNoise1 = noise(vec2(uv.y * 8.0 + time * 0.15, t * 4.0));
        float clumpNoise2 = noise(vec2(uv.y * 12.0 - time * 0.12, t * 6.0 + 10.0));
        float clumpNoise3 = noise(vec2(uv.y * 6.0 + time * 0.08, t * 3.0 + 20.0));
        
        // 뭉침 강도 (0.5 = 균일, 0.0 = 압축, 1.0 = 확장)
        float clumpFactor = clumpNoise1 * 0.5 + clumpNoise2 * 0.3 + clumpNoise3 * 0.2;
        clumpFactor = pow(clumpFactor, 1.5); // 압축 영역을 매우 불규칙하게
        
        // t값을 뭉침에 따라 비선형 변환 (더 극단적으로)
        t = pow(t, mix(0.3, 2.5, clumpFactor)); // 뭉치거나 펼쳐짐
        
        // 노이즈로 컬러 위치 왜곡 (더 강하게)
        t = fract(t + n1 * 0.25 + sin(time * 0.3 + uv.y * 8.0) * 0.12 + n2 * 0.18);
        
        // 이미지 기반 네온 그라디언트 컬러 팔레트
        vec3 c1 = vec3(0.75, 1.00, 0.30); // 네온 라임 그린
        vec3 c2 = vec3(0.95, 1.00, 0.35); // 브라이트 라임 옐로우
        vec3 c3 = vec3(1.00, 0.95, 0.30); // 브라이트 옐로우
        vec3 c4 = vec3(0.30, 0.90, 0.95); // 시안
        vec3 c5 = vec3(0.40, 0.70, 1.00); // 스카이 블루
        vec3 c6 = vec3(0.55, 0.50, 1.00); // 코발트 블루
        vec3 c7 = vec3(0.85, 0.55, 1.00); // 라벤더
        
        // 매우 랜덤한 경계값들 (노이즈 기반, 극도로 불규칙하게)
        float b1 = 0.08 + n1 * 0.20;
        float b2 = 0.22 + n2 * 0.22;
        float b3 = 0.38 + n3 * 0.18;
        float b4 = 0.52 + n1 * 0.20;
        float b5 = 0.68 + n2 * 0.18;
        float b6 = 0.84 + n3 * 0.15;
        
        // 색상 간 그라데이션을 매우 블러리하게 (제대로 된 블렌딩)
        float blendRange = 0.20; // 블렌딩 범위
        
        vec3 color;
        // 각 구간의 중점을 찾아서 블렌딩
        float mid1 = (0.0 + b1) / 2.0;
        float mid2 = (b1 + b2) / 2.0;
        float mid3 = (b2 + b3) / 2.0;
        float mid4 = (b3 + b4) / 2.0;
        float mid5 = (b4 + b5) / 2.0;
        float mid6 = (b5 + b6) / 2.0;
        float mid7 = (b6 + 1.0) / 2.0;
        
        if (t < mid2) {
          float blend = smoothstep(mid1 - blendRange, mid1 + blendRange, t);
          color = mix(c1, c2, blend);
        } else if (t < mid3) {
          float blend = smoothstep(mid2 - blendRange, mid2 + blendRange, t);
          color = mix(c2, c3, blend);
        } else if (t < mid4) {
          float blend = smoothstep(mid3 - blendRange, mid3 + blendRange, t);
          color = mix(c3, c4, blend);
        } else if (t < mid5) {
          float blend = smoothstep(mid4 - blendRange, mid4 + blendRange, t);
          color = mix(c4, c5, blend);
        } else if (t < mid6) {
          float blend = smoothstep(mid5 - blendRange, mid5 + blendRange, t);
          color = mix(c5, c6, blend);
        } else if (t < mid7) {
          float blend = smoothstep(mid6 - blendRange, mid6 + blendRange, t);
          color = mix(c6, c7, blend);
        } else {
          float blend = smoothstep(mid7 - blendRange, mid7 + blendRange, t);
          color = mix(c7, c1, blend);
        }
        
        // 랜덤한 컬러 변화 추가 (매우 미묘하게)
        color += vec3(n2 * 0.01, n3 * 0.01, n1 * 0.01);
        
        // 추가 랜덤 컬러 노이즈 (매우 약하게)
        float colorNoise = noise(vec2(t * 10.0 + time * 0.2, uv.y * 5.0));
        color += vec3(colorNoise * 0.02);
        
        return color;
      }
      
      void main() {
        // 촘촘하고 랜덤한 그라데이션
        float flow = vUv.y * 3.5 - time * 0.2;
        
        // 노이즈로 매우 불규칙한 흐름 추가
        float organicFlow1 = noise(vec2(vUv.y * 5.0 + time * 0.15, vUv.x * 3.0));
        float organicFlow2 = noise(vec2(vUv.y * 7.5 - time * 0.12, vUv.x * 4.0 + 5.0));
        float organicFlow3 = noise(vec2(vUv.y * 9.0 + time * 0.08, vUv.x * 2.5 + 10.0));
        flow += organicFlow1 * 0.4 + organicFlow2 * 0.35 + organicFlow3 * 0.25;
        flow = fract(flow); // 0~1 사이로 순환
        
        // 고급스러운 파스텔 색상 (랜덤 간격)
        vec3 color = getColor(flow, vUv);
        
        // 블러 강도가 변하는 패턴 생성 (노이즈 기반)
        float blurPattern1 = noise(vec2(vUv.y * 8.0 + time * 0.3, vUv.x * 5.0));
        float blurPattern2 = noise(vec2(vUv.y * 12.0 - time * 0.2, vUv.x * 8.0 + 10.0));
        float blurPattern3 = noise(vec2(vUv.y * 15.0 + time * 0.4, vUv.x * 10.0 + 20.0));
        
        // 전체적으로 극도로 블러리하게
        float baseBlur = blurPattern1 * 0.5 + blurPattern2 * 0.3 + blurPattern3 * 0.2;
        float blurIntensity = 0.95 + baseBlur * 0.05; // 극강 블러 (0.95~1.0)
        
        // 전체적으로 매우 부드러운 glow 적용
        float centerGlow = 1.0 - abs(vUv.x - 0.5) * 0.5; // 중앙에서 외곽까지 매우 부드럽게
        
        // 극도로 블러리한 glow
        float extremeBlur = pow(max(centerGlow, 0.0), 7.0);  // 극강 블러
        float maxBlur = pow(max(centerGlow, 0.0), 10.0); // 최대 블러
        float glow = mix(extremeBlur, maxBlur, blurIntensity);
        glow = max(glow, 0.15); // 최소 glow 값 낮춤
        
        // 부드러운 일렁이는 효과
        float ripple = sin(vUv.y * 6.0 + time * 2.0) * 0.05 + 
                       cos(vUv.y * 8.0 - time * 1.5) * 0.03;
        color += ripple;
        
        // 가장자리 페이드 - 극도로 부드럽게
        float dreamyEdge = smoothstep(0.0, 0.50, vUv.x) * smoothstep(1.0, 0.50, vUv.x);
        float ultraBlur = smoothstep(0.0, 0.60, vUv.x) * smoothstep(1.0, 0.40, vUv.x);
        float edgeFade = mix(dreamyEdge, ultraBlur, blurIntensity);
        edgeFade = max(edgeFade, 0.08); // 가장자리 최소값 매우 낮춤
        
        // 테두리에 핑크/마젠타 추가 (부드럽게)
        float pinkDistance = min(vUv.x, 1.0 - vUv.x); // 양쪽 가장자리까지의 거리
        float pinkEdge = smoothstep(0.4, 0.0, pinkDistance); // 가장자리로 갈수록 강해짐
        vec3 pinkTint = vec3(1.00, 0.55, 0.90); // 부드러운 핑크/마젠타
        color = mix(color, pinkTint, pinkEdge * 0.3); // 핑크를 부드럽게 블렌드
        
        // 밝기 조절 (극강 블러 효과)
        color *= 1.3; // 밝기 증가
        color = pow(color, vec3(1.2)); // 대비 부드럽게
        
        // 채도 높이기 (생생한 컬러)
        vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
        color = mix(gray, color, 1.3); // 채도 증가
        
        // 추가 블러 효과 (색상 확산 강화)
        float blurNoise1 = noise(vec2(vUv.x * 3.0 + time * 0.1, vUv.y * 3.0));
        float blurNoise2 = noise(vec2(vUv.x * 6.0 - time * 0.08, vUv.y * 6.0 + 10.0));
        color += vec3(blurNoise1 * 0.12 + blurNoise2 * 0.08) * blurIntensity;
        
        // 알파값 (블러 패턴에 따라 변화) - 극강 블러
        float softAlpha = 0.60;
        float ultraBlurAlpha = 0.35;
        float alpha = mix(softAlpha, ultraBlurAlpha, blurIntensity) * glow * edgeFade;
        
        // 전체적으로 매우 부드럽게 (극강 블러)
        float ultraSoft = smoothstep(0.0, 0.35, vUv.x) * smoothstep(1.0, 0.65, vUv.x);
        alpha *= ultraSoft;
        
        alpha = clamp(alpha, 0.1, 0.65); // 극강 블러 opacity
        
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
  
  // 리본 크기 설정 - 더 두껍게
  const width = 2.5
  const height = viewport.height * 1.5

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[width, height, 64, 256]} />
        <primitive object={material} attach="material" />
      </mesh>
  )
}
