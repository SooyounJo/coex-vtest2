import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 7 }) {
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      styleType: { value: styleType },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float styleType;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vWorldPos;

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float r = length(uv);

        // 이미지와 정확히 동일한 색상 (왼쪽 상단 → 오른쪽 하단 대각선)
        vec3 darkPlum = vec3(0.25, 0.15, 0.35);    // 어두운 자줏빛 회색 (검정이 아닌)
        vec3 brightPink = vec3(1.0, 0.6, 0.8);     // 밝은 핑크/마젠타

        // 대각선 그라디언트 (왼쪽 상단에서 오른쪽 하단으로)
        float diagonal = (uv.x + uv.y + 2.0) / 4.0;
        diagonal = smoothstep(0.0, 1.0, diagonal);

        // 기본 색상 혼합
        vec3 color = mix(darkPlum, brightPink, diagonal);

        // 중간 영역의 풍부한 색상 변화
        float midTransition = smoothstep(0.1, 0.9, diagonal);
        vec3 midLavender = vec3(0.5, 0.3, 0.6);    // 라벤더
        vec3 midPurple = vec3(0.7, 0.4, 0.7);      // 연한 보라
        vec3 midPink = vec3(0.9, 0.5, 0.75);       // 중간 톤 핑크
        
        color = mix(color, midLavender, midTransition * 0.4);
        color = mix(color, midPurple, midTransition * 0.3);
        color = mix(color, midPink, midTransition * 0.2);

        // 구 자체에서 발산되는 은은한 광택 효과
        float innerGlow = smoothstep(0.0, 0.8, r);
        color += vec3(0.08, 0.05, 0.12) * innerGlow;

        // 중앙에서 외곽으로의 부드러운 그라디언트 (덜 어둡게)
        float centerGradient = smoothstep(0.0, 0.7, r);
        color = mix(color, color * 0.6, centerGradient);

        // 매우 부드러운 가장자리 (feathered edge)
        float edge = smoothstep(1.0, 0.8, r);
        color *= edge;

        // 가장자리 글로우 (배경에 자연스럽게 스며드는 효과)
        float edgeGlow = smoothstep(0.95, 0.7, r) * 0.12;
        color += vec3(0.04, 0.02, 0.06) * edgeGlow;

        // 색상 채도와 명도 조정 (더 밝고 생생하게)
        color = pow(color, vec3(0.9));
        color *= 1.3;
        color = clamp(color, 0.0, 1.0);

        // 부드러운 투명도
        float alpha = smoothstep(1.0, 0.8, r) * 0.98;
        alpha = clamp(alpha, 0.0, 1.0);

        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
  }), [])

  useFrame((state, delta) => {
    material.uniforms.u_time.value += delta
  })

  const meshRef = useRef()
  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])

  const radius = Math.min(v.width, v.height) * (window.innerWidth <= 768 ? 0.6 : 0.33) // 모바일: 60%로 증가 (좌우, 하단 5%씩 잘림)
  const margin = v.height * 0.035
  const yBottom = window.innerWidth <= 768 ? 
    -v.height / 2 + radius + margin + v.height * 0.05 : // 모바일: 중앙보다 5% 아래 (더 위로)
    -v.height / 2 + radius + margin // 데스크톱: 기존 위치

  return (
    <>
      {/* 메인 부드러운 그라디언트 구 */}
      <mesh ref={meshRef} position={[0, yBottom, 0]}>
        <sphereGeometry args={[radius, 256, 256]} />
        <primitive object={material} attach="material" />
      </mesh>
    </>
  )
}