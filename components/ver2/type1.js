import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function Type1() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
      ringDir: { value: new THREE.Vector3(0.08, 0.56, 0.86).normalize() },
      rotationPhase: { value: 0.0 },
    },
        vertexShader: `
          uniform float time;
          uniform float rotationPhase;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            // 시간에 따른 형태 변화 (10초 주기)
            float cycle = mod(time, 10.0) / 10.0;
            vec3 pos = position;
            
            // 완전히 부드러운 정사각형 변형 (구겨짐 완전 제거)
            vec2 xy = pos.xy;
            float radius = length(xy);
            float angle = atan(xy.y, xy.x);
            
            // 매우 부드러운 정사각형 변형 (구겨짐 완전 제거)
            float cosAngle = abs(cos(angle));
            float sinAngle = abs(sin(angle));
            float squareRadius = max(cosAngle, sinAngle);
            
            // 정사각형 변형 시 크기 보정 (원형과 비슷한 크기 유지)
            squareRadius = squareRadius * 1.414; // sqrt(2)로 크기 보정
            
            vec2 squareXY = xy / max(radius, 0.001) * squareRadius;
            
            // 자연스러운 형태 변화 (원래 트랜지션 복원)
            float shapeTransition = 0.0;
            
            if (cycle < 0.1) {
              // 0-1초: 기본형 유지
              shapeTransition = 0.0;
            } else if (cycle < 0.25) {
              // 1-2.5초: 원 → 정사각형 (부드럽게)
              float t = (cycle - 0.1) / 0.15;
              t = smoothstep(0.0, 1.0, t); // 부드러운 시작
              shapeTransition = t;
            } else if (cycle < 0.75) {
              // 2.5-7.5초: 정사각형 유지 (회전 중)
              shapeTransition = 1.0;
            } else if (cycle < 0.9) {
              // 7.5-9초: 정사각형 → 원 (부드럽게)
              float t = (cycle - 0.75) / 0.15;
              t = smoothstep(0.0, 1.0, t); // 부드러운 끝
              shapeTransition = 1.0 - t;
            } else {
              // 9-10초: 원형 유지
              shapeTransition = 0.0;
            }
            
            // 형태 적용
            pos.xy = mix(xy, squareXY, shapeTransition);
            
            // 자연스러운 회전 (형태 변화와 연동)
            float rotationAngle = 0.0;
            if (cycle >= 0.25 && cycle <= 0.75) {
              float rotationT = (cycle - 0.25) / 0.5; // 2.5초부터 시작
              
              // 부드러운 회전: 자연스러운 가속과 감속
              float smoothRotation = smoothstep(0.0, 1.0, rotationT);
              
              // 회전 중간에 약간의 속도 변화 (자연스러운 느낌)
              float speedVariation = 1.0 + 0.2 * sin(rotationT * 6.28318);
              
              rotationAngle = smoothRotation * 6.28318 * 1.5 * speedVariation;
            }
            
            // 회전 적용 (rotationPhase uniform 사용)
            float finalRotation = rotationAngle + rotationPhase;
            float cosR = cos(finalRotation);
            float sinR = sin(finalRotation);
            pos.xy = vec2(
              pos.x * cosR - pos.y * sinR,
              pos.x * sinR + pos.y * cosR
            );
            
            // 회전하는 순간 Y축으로 살짝 기울기
            if (rotationAngle > 0.0) {
              float tiltAmount = sin(rotationAngle * 0.5) * 0.3; // 회전 중에만 기울기
              pos.z += pos.x * tiltAmount; // X 위치에 따라 Z축 기울기
            }
            
            vec4 worldPos = modelMatrix * vec4(pos, 1.0);
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
    fragmentShader: `
      precision highp float;
      uniform float time;
      uniform vec3 lightDir;
      uniform vec3 ringDir;
      varying vec2 vUv;
      varying vec3 vNormal;

      float hash(vec2 p){
        p = fract(p*vec2(123.34, 345.45));
        p += dot(p, p+34.345);
        return fract(p.x*p.y);
      }
      float n2(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i+vec2(1.0,0.0));
        float c = hash(i+vec2(0.0,1.0));
        float d = hash(i+vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
      }

      // 일렁이는 빛을 위한 노이즈 함수
      float noise(vec2 p) {
        return sin(p.x) * cos(p.y) + sin(p.x * 2.0) * cos(p.y * 2.0) * 0.5;
      }

      // 일레스틱 효과를 위한 웨이브 함수
      float elasticWave(float x, float frequency, float amplitude) {
        float wave = sin(x * frequency) * amplitude;
        float decay = exp(-x * 0.05); // 더 천천히 감쇠
        float bounce = sin(x * frequency * 2.0) * amplitude * 0.3; // 바운스 효과
        return (wave + bounce) * decay;
      }

      float bumpMove(float center, float width, float f) {
        float d0 = abs(f - (center - 1.0));
        float d1 = abs(f - center);
        float d2 = abs(f - (center + 1.0));
        float d  = min(d0, min(d1, d2));
        float aa = fwidth(f) * 1.5;
        return smoothstep(width + aa, 0.0 + aa, d);
      }

      vec3 bandWeights(float f) {
        float width = 0.28;
        float y = bumpMove(0.18, width, f);
        float p = bumpMove(0.52, width, f);
        float u = bumpMove(0.86, width, f);
        return vec3(y, p, u);
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 L = normalize(lightDir);
        float lambert = max(dot(N, L), 0.0);

        vec2 p = vUv - 0.5;
        float r = length(p);

        float topness = clamp(dot(N, normalize(ringDir)) * 0.5 + 0.5, 0.0, 1.0);

        vec3 peach = vec3(1.00, 0.90, 0.72);
        vec3 pink  = vec3(1.00, 0.70, 0.90);
        vec3 purple= vec3(0.82, 0.68, 1.00);
        vec3 base = mix(pink, peach, clamp(0.7 + 0.3*topness, 0.0, 1.0)); // peach 비중 증가
        base = mix(base, purple, smoothstep(0.0, 0.35, 1.0 - topness));

        float speed = 0.10;
        float scale = 1.8;
        float loopSec = 10.0;
        float loopT   = mod(time, loopSec) / loopSec;
        float phase = -loopT;
        
            // 1.js와 비슷한 미세한 일렁임 효과 추가 (노란빛을 위해)
            float ripple1 = noise(vUv * 3.0 + time * 0.5) * 0.05;
            float ripple2 = noise(vUv * 5.0 + time * 0.3) * 0.025;
            float ripple3 = noise(vUv * 7.0 + time * 0.7) * 0.015;
            float totalRipple = ripple1 + ripple2 + ripple3;
            
            float elastic1 = elasticWave(topness * 2.0 + time * 0.4, 3.0, 0.08);
            float elastic2 = elasticWave(topness * 3.0 + time * 0.6, 2.0, 0.04);
            float totalElastic = elastic1 + elastic2;
            
            float perturb = 0.01 * n2(vUv * 1.5 + time * 0.05);
            
            // 블러 효과 (기본값으로 통일)
            float blurAmount = 0.02;
            float f1 = topness * scale + phase + totalRipple + totalElastic;
            float f2 = topness * scale + phase + blurAmount + totalRipple * 0.8 + totalElastic * 0.6;
            float f3 = topness * scale + phase + (blurAmount * 1.5) + totalRipple * 0.6 + totalElastic * 0.4;

            vec3 w1 = bandWeights(f1 + perturb);
            vec3 w2 = bandWeights(f2 + perturb * 0.8);
            vec3 w3 = bandWeights(f3 + perturb * 0.6);

        // wobble 효과 제거하여 완전히 매끄러운 표면

        // 1번 톤에 맞춘 팔레트 (magenta/purple 계열)
        vec3 cY = vec3(0.80, 0.40, 0.70);
        vec3 cP = vec3(0.85, 0.20, 0.75);
        vec3 cU = vec3(0.90, 0.50, 0.80);

        w1 *= vec3(0.18, 1.0, 0.95);
        w2 *= vec3(0.18, 1.0, 0.95);
        w3 *= vec3(0.18, 1.0, 0.95);

        vec3 flowColor1 = cY * w1.x + cP * w1.y + cU * w1.z;
        vec3 flowColor2 = cY * w2.x + cP * w2.y + cU * w2.z;
        vec3 flowColor3 = cY * w3.x + cP * w3.y + cU * w3.z;
        vec3 flowColor  = (0.5*flowColor1 + 0.35*flowColor2 + 0.15*flowColor3);

        float mask1 = clamp(w1.x + w1.y + w1.z, 0.0, 1.0);
        float mask2 = clamp(w2.x + w2.y + w2.z, 0.0, 1.0);
        float mask3 = clamp(w3.x + w3.y + w3.z, 0.0, 1.0);
        float flowMaskAvg = clamp((0.5*mask1 + 0.35*mask2 + 0.15*mask3), 0.0, 1.0);

        vec3 lit = base;
        lit = mix(lit, flowColor, flowMaskAvg * 0.95);
        
        // 1.js와 비슷한 노란빛 효과 추가
        vec3 rippleColor = vec3(0.8, 0.4, 0.6) * totalRipple * 0.2;
        vec3 elasticColor = vec3(0.8, 0.3, 0.7) * totalElastic * 0.15;
        lit += rippleColor + elasticColor;

        vec3 V = vec3(0.0, 0.0, 1.0);
        float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
        
        // 1.js와 비슷한 글로우 효과 추가 (노란빛 포함)
        vec3 rimGlow = vec3(0.8, 0.3, 0.7) * fres * 0.3;
        float softHalo = smoothstep(0.34, 0.10, r) * 0.08;
        vec3 glow = rimGlow + vec3(0.8, 0.4, 0.8) * softHalo;
        lit += glow;
        
        // 1.js의 bottom glow 효과 추가 (노란빛)
        lit += vec3(0.8, 0.2, 0.6) * (1.0 - topness) * 0.1;

        // 1번과 동일한 채도/밝기/대비 루프 동기화
        vec3 gray = vec3(dot(lit, vec3(0.299, 0.587, 0.114)));
        float loopPhaseColor = 0.5 + 0.5 * sin(6.28318530718 * time / 7.0);
        float sat = 1.0 + 0.85 * loopPhaseColor;
        lit = mix(gray, lit, sat);
        float brightness = 1.0 + 0.14 * loopPhaseColor;
        lit *= brightness;
        float contrast = 1.0 + 0.32 * loopPhaseColor;
        lit = (lit - 0.5) * contrast + 0.5;
        lit = pow(lit, vec3(0.86));
        lit *= 1.12;
        lit = mix(lit, vec3(1.0), 0.05);
        lit = clamp(lit, 0.0, 1.1);

        float edgeFeather = smoothstep(0.52, 0.36, r);
        float alpha = 1.0 * edgeFeather + fres*0.05; // 더 불투명하게
        
        // 투명도 효과 제거하여 더 불투명하게
        alpha = clamp(alpha, 0.95, 1.0); // 최소 투명도도 더 높게

        gl_FragColor = vec4(lit, alpha);
      }
    `,
    transparent: true,
  }), [])

  useFrame((state, delta) => {
    material.uniforms.time.value += delta
    
    // 회전 애니메이션 제거 - rotationPhase를 0으로 고정
    material.uniforms.rotationPhase.value = 0.0
  })

  const meshRef = useRef()
  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])

  // ver3 모달에서 항상 모바일 크기로 렌더링 (하단 잘리도록)
  const isVer3 = typeof window !== 'undefined' && window.location.pathname === '/ver3'
  const radius = Math.min(v.width, v.height) * (isVer3 ? 0.8 : (window.innerWidth <= 768 ? 0.5 : 0.33))
  const margin = isVer3 ? v.height * 0.01 : v.height * 0.035
  const yBottom = isVer3 ? -v.height / 2 + radius * 0.6 + margin : 
    (window.innerWidth <= 768 ? -v.height / 2 + radius + margin : -v.height / 2 + radius + margin)

  return (
    <mesh ref={meshRef} position={[0, yBottom, 0]}>
      <sphereGeometry args={[radius, 256, 256]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
