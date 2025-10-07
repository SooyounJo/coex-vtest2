import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function Type3() {

  // 미니 구들 셰이더 (Type2의 블러리한 미니 구 셰이더 사용)
  const miniMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      alpha: { value: 1.0 },
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
      uniform float time;
      uniform float alpha;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv - 0.5;
        float r = length(p);
        
        // 작은 구들의 컬러 (메인 구와 비슷하지만 더 밝게)
        vec3 color = vec3(1.0, 0.8, 0.9);
        
        // 더 블러리한 외곽 (투명도 올려서 더 잘 보이게)
        float baseAlpha = 1.0 - smoothstep(0.25, 0.6, r); // 더 넓은 범위로 블러
        baseAlpha = clamp(baseAlpha, 0.6, 1.0); // 투명도를 올려서 더 잘 보이게
        
        // 외부에서 제어하는 투명도 적용
        float finalAlpha = baseAlpha * alpha;
        
        gl_FragColor = vec4(color, finalAlpha);
      }
    `,
    transparent: true,
  }), [])

  const miniRefs = [useRef(), useRef(), useRef(), useRef(), useRef()]
  const { viewport } = useThree()
  const v = viewport.getCurrentViewport()
  
  // ver3 모달에서 항상 모바일 크기로 렌더링 (하단 잘리도록)
  const isVer3 = typeof window !== 'undefined' && window.location.pathname === '/ver3'
  const radius = Math.min(v.width, v.height) * (isVer3 ? 0.8 : 0.33)
  const miniRadius = radius * 0.06 // 미니 구 크기를 더 작게 조정
  const margin = isVer3 ? v.height * 0.01 : v.height * 0.035
  const yBottom = isVer3 ? -v.height / 2 + radius * 0.6 + margin : -v.height / 2 + radius + margin

  useFrame((state) => {
    const time = state.clock.elapsedTime
    miniMaterial.uniforms.time.value = time

    // 6초 주기 애니메이션 (돌고>모이고>퍼지고의 자연스러운 루프)
    const cycle = (time % 6.0) / 6.0
    const orbitRadius = 1.0 // 더 가까운 간격으로 조정
    
    // ver3 모달에서는 미니 구들을 블러리하게 (투명도 올려서 더 잘 보이게)
    const baseAlpha = isVer3 ? 0.7 : 1.0

    miniRefs.forEach((ref, index) => {
      if (ref.current) {
        // 기본 각도 (지속적으로 회전)
        const baseAngle = (time * 2.0) + (index * Math.PI * 2 / 5)
        
        if (cycle < 0.4) {
          // 0-2.4초: 로딩하듯 돌아가는 애니메이션
          const x = Math.cos(baseAngle) * orbitRadius
          const y = Math.sin(baseAngle) * orbitRadius
          const z = Math.sin(time * 3 + index) * 0.2
          
          ref.current.position.set(x, y, z)
          ref.current.visible = true
          ref.current.scale.setScalar(1.0)
          miniMaterial.uniforms.alpha.value = baseAlpha
        } else if (cycle < 0.6) {
          // 2.4-3.6초: 중심으로 모이는 애니메이션 (부드럽게)
          const t = (cycle - 0.4) / 0.2 // 0-1
          const easeIn = t * t * (3.0 - 2.0 * t)
          
          const x = Math.cos(baseAngle) * orbitRadius * (1.0 - easeIn)
          const y = Math.sin(baseAngle) * orbitRadius * (1.0 - easeIn)
          const z = Math.sin(time * 3 + index) * 0.2 * (1.0 - easeIn)
          
          ref.current.position.set(x, y, z)
          ref.current.scale.setScalar(1.0)
          miniMaterial.uniforms.alpha.value = baseAlpha
        } else {
          // 3.6-6초: 다시 퍼져나가는 애니메이션 (자연스럽게)
          const t = (cycle - 0.6) / 0.4 // 0-1
          const easeOut = t * t * (3.0 - 2.0 * t)
          
          const x = Math.cos(baseAngle) * orbitRadius * easeOut
          const y = Math.sin(baseAngle) * orbitRadius * easeOut
          const z = Math.sin(time * 3 + index) * 0.2 * easeOut
          
          ref.current.position.set(x, y, z)
          ref.current.scale.setScalar(1.0)
          miniMaterial.uniforms.alpha.value = baseAlpha
        }
      }
    })
  })

  return (
    <>
      {/* 미니 구 5개 (로딩 애니메이션) */}
      {miniRefs.map((ref, index) => (
        <mesh key={index} ref={ref} position={[0, yBottom, 0]} visible={false}>
          <sphereGeometry args={[miniRadius, 64, 64]} />
          <primitive object={miniMaterial} attach="material" />
        </mesh>
      ))}
    </>
  )
}