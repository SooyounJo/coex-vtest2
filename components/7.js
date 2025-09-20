import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 7 }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      lightDir: { value: new THREE.Vector3(0.2, 0.9, 0.3).normalize() },
      ringDir: { value: new THREE.Vector3(0.08, 0.56, 0.86).normalize() },
      styleType: { value: styleType },
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      
      // 노이즈 함수들
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      
      // 프랙탈 노이즈
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }
      
      // 에이전틱 변형 함수
      vec3 agenticDeform(vec3 pos, float time) {
        vec2 uv = pos.xy;
        
        // 다중 주파수 웨이브
        float wave1 = sin(uv.x * 3.0 + time * 1.5) * cos(uv.y * 2.0 + time * 1.2);
        float wave2 = sin(uv.x * 5.0 + time * 2.1) * cos(uv.y * 3.0 + time * 1.8);
        float wave3 = sin(uv.x * 7.0 + time * 0.9) * cos(uv.y * 4.0 + time * 2.3);
        
        // 프랙탈 노이즈 기반 변형
        float noise1 = fbm(uv * 2.0 + time * 0.3);
        float noise2 = fbm(uv * 4.0 + time * 0.5);
        float noise3 = fbm(uv * 8.0 + time * 0.7);
        
        // 유기적 변형 강도
        float deformStrength = 0.15 + 0.1 * sin(time * 0.8);
        
        // 방향별 변형
        vec3 deform = vec3(
          (wave1 + wave2 * 0.5 + noise1 * 0.3) * deformStrength,
          (wave2 + wave3 * 0.5 + noise2 * 0.3) * deformStrength,
          (wave3 + wave1 * 0.5 + noise3 * 0.3) * deformStrength * 0.5
        );
        
        // 거리 기반 감쇠 (중앙에서 멀어질수록 약해짐)
        float distance = length(pos);
        float decay = smoothstep(0.8, 0.0, distance);
        deform *= decay;
        
        // 물방울 같은 부드러운 변형
        float bubbleEffect = sin(distance * 8.0 + time * 2.0) * 0.05;
        deform += vec3(bubbleEffect, bubbleEffect * 0.7, bubbleEffect * 0.3);
        
        return pos + deform;
      }
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        // 에이전틱 변형 적용
        vec3 pos = agenticDeform(position, time);
        
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
      uniform float styleType;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      // 노이즈 함수들
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p * frequency);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        return value;
      }

      void main() {
        vec3 N = normalize(vNormal);
        vec3 L = normalize(lightDir);
        float lambert = max(dot(N, L), 0.0);

        vec2 p = vUv - 0.5;
        float r = length(p);

        float topness = clamp(dot(N, normalize(ringDir)) * 0.5 + 0.5, 0.0, 1.0);

        // 핑키 물방울 색상 팔레트
        vec3 hotPink = vec3(1.0, 0.2, 0.6);
        vec3 magenta = vec3(1.0, 0.0, 0.8);
        vec3 lightPink = vec3(1.0, 0.6, 0.9);
        vec3 neonPink = vec3(1.0, 0.3, 0.7);
        vec3 deepPink = vec3(0.8, 0.1, 0.5);
        
        // 핑키 색상 혼합
        vec3 base = mix(hotPink, lightPink, topness);
        base = mix(base, magenta, smoothstep(0.3, 0.8, 1.0 - topness));
        base = mix(base, neonPink, smoothstep(0.6, 1.0, 1.0 - topness));
        base = mix(base, deepPink, smoothstep(0.8, 1.0, 1.0 - topness));

        // 핑키 에이전틱 색상 변화
        float colorWave1 = sin(time * 1.2 + r * 10.0) * 0.4;
        float colorWave2 = cos(time * 0.8 + r * 15.0) * 0.3;
        float colorNoise = fbm(vUv * 3.0 + time * 0.4) * 0.5;
        
        vec3 dynamicColor = vec3(
          0.8 + 0.2 * sin(time * 1.5 + colorWave1 + colorNoise), // 핑크 강화
          0.2 + 0.3 * cos(time * 1.1 + colorWave2 + colorNoise), // 마젠타 강화
          0.6 + 0.4 * sin(time * 0.9 + colorWave1 + colorWave2)  // 핫핑크 강화
        );
        
        base = mix(base, dynamicColor, 0.7);

        // 핑키 물방울 내부 패턴
        float bubblePattern = fbm(vUv * 8.0 + time * 0.6);
        float ripplePattern = sin(r * 20.0 + time * 3.0) * 0.1;
        float flowPattern = fbm(vUv * 4.0 + time * 0.8);
        
        vec3 patternColor = vec3(0.8, 0.2, 0.6) * (bubblePattern + ripplePattern + flowPattern);
        base += patternColor * 0.4;

        // 핑키 물방울 표면 반사
        vec3 V = vec3(0.0, 0.0, 1.0);
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.0);
        
        // 핑키 물방울 하이라이트
        vec3 highlight = vec3(1.0, 0.8, 0.9) * fresnel * 0.9;
        vec3 rimLight = vec3(1.0, 0.3, 0.7) * fresnel * 0.7;
        
        base += highlight + rimLight;

        // 물방울 내부 깊이감
        float depth = smoothstep(0.0, 0.5, r);
        base = mix(base * 0.7, base, depth);

        // 핑키 물방울 표면 글로우
        float glow = smoothstep(0.4, 0.0, r) * 0.4;
        base += vec3(1.0, 0.4, 0.8) * glow;

        // 최종 색상 조정
        base = pow(base, vec3(0.9));
        base *= 1.1;
        base = clamp(base, 0.0, 1.0);

        // 투명도 (물방울 느낌)
        float alpha = smoothstep(0.5, 0.3, r) * 0.9;
        alpha += fresnel * 0.1;
        alpha = clamp(alpha, 0.3, 0.95);

        gl_FragColor = vec4(base, alpha);
      }
    `,
    transparent: true,
  }), [])

  useFrame((state, delta) => {
    material.uniforms.time.value += delta
  })

  const meshRef = useRef()
  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])

  const radius = Math.min(v.width, v.height) * (window.innerWidth <= 768 ? 0.55 : 0.33) // 모바일: 55%로 증가
  const margin = v.height * 0.035
  const yBottom = window.innerWidth <= 768 ? 
    -v.height / 2 + radius + margin + v.height * 0.05 : // 모바일: 중앙보다 5% 아래 (더 위로)
    -v.height / 2 + radius + margin // 데스크톱: 기존 위치

  return (
    <>
      {/* 메인 에이전틱 구 */}
      <mesh ref={meshRef} position={[0, yBottom, 0]}>
        <sphereGeometry args={[radius, 128, 128]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* 핑키 물방울 내부 반사 */}
      <mesh position={[0, yBottom, 0.1]}>
        <sphereGeometry args={[radius * 0.8, 64, 64]} />
        <meshBasicMaterial 
          color="#ff1493" 
          transparent 
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  )
}
