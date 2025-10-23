import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function RibbonShader4() {
  const meshRef = useRef()
  const { viewport } = useThree()
  
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
        
        // 외곽 일렁임 감소 - 중앙만 일렁임
        float edgeFactor = 1.0 - abs(uv.x - 0.5) * 2.0;
        edgeFactor = pow(edgeFactor, 2.0);
        
        // 리본의 웨이브 효과
        float wave1 = sin(pos.y * 2.0 + time * 1.5) * 0.2 * edgeFactor;
        float wave2 = cos(pos.y * 3.0 + time * 2.0) * 0.1 * edgeFactor;
        float wave3 = sin(pos.y * 5.0 - time * 1.0) * 0.05 * edgeFactor;
        
        pos.x += wave1 + wave2 + wave3;
        pos.z += cos(pos.y * 2.5 + time * 1.8) * 0.15 * edgeFactor;
        
        // DNA처럼 회전하는 스프링 효과
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
      
      // 생생하고 명확한 그라데이션 색상
      vec3 getColor(float t, vec2 uv) {
        float n1 = noise(vec2(t * 3.0 + time * 0.1, uv.y * 2.0));
        float n2 = noise(vec2(t * 5.0 - time * 0.15, uv.y * 3.0 + 10.0));
        float n3 = noise(vec2(t * 4.0 + time * 0.08, uv.y * 1.5 + 20.0));
        
        float clumpNoise1 = noise(vec2(uv.y * 4.0 + time * 0.1, t * 2.0));
        float clumpNoise2 = noise(vec2(uv.y * 6.0 - time * 0.08, t * 3.0 + 10.0));
        
        float clumpFactor = clumpNoise1 * 0.6 + clumpNoise2 * 0.4;
        clumpFactor = pow(clumpFactor, 2.0);
        
        t = pow(t, mix(0.5, 2.0, clumpFactor));
        t = fract(t + n1 * 0.12 + sin(time * 0.2 + uv.y * 5.0) * 0.05);
        
        vec3 c1 = vec3(1.00, 0.98, 0.45);
        vec3 c2 = vec3(0.85, 0.95, 0.50);
        vec3 c3 = vec3(0.50, 0.92, 0.55);
        vec3 c4 = vec3(0.45, 0.88, 0.75);
        vec3 c5 = vec3(0.40, 0.75, 0.95);
        vec3 c6 = vec3(0.35, 0.60, 0.98);
        
        float b1 = 0.12 + n1 * 0.15;
        float b2 = 0.28 + n2 * 0.18;
        float b3 = 0.48 + n3 * 0.12;
        float b4 = 0.65 + n1 * 0.15;
        float b5 = 0.82 + n2 * 0.12;
        
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
        } else {
          color = mix(c6, c1, smoothstep(b5, 1.0, t));
        }
        
        color += vec3(n2 * 0.015, n3 * 0.015, n1 * 0.015);
        
        return color;
      }
      
      void main() {
        float flow = vUv.y * 0.3 - time * 0.15;
        vec3 color = getColor(flow, vUv);
        
        float blurPattern1 = noise(vec2(vUv.y * 8.0 + time * 0.3, vUv.x * 5.0));
        float blurPattern2 = noise(vec2(vUv.y * 12.0 - time * 0.2, vUv.x * 8.0 + 10.0));
        float blurPattern3 = noise(vec2(vUv.y * 15.0 + time * 0.4, vUv.x * 10.0 + 20.0));
        
        float blurIntensity = blurPattern1 * 0.5 + blurPattern2 * 0.3 + blurPattern3 * 0.2;
        blurIntensity = 0.5 + blurIntensity * 0.5;
        
        float sharpGlow = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float softGlow = 1.0 - abs(vUv.x - 0.5) * 1.5;
        
        float mediumBlur = pow(max(sharpGlow, 0.0), 1.5);
        float strongBlur = pow(max(softGlow, 0.0), 2.5);
        float glow = mix(mediumBlur, strongBlur, blurIntensity);
        glow = max(glow, 0.45);
        
        float ripple = sin(vUv.y * 10.0 + time * 3.0) * 0.1 + 
                       cos(vUv.y * 15.0 - time * 2.0) * 0.05;
        color += ripple;
        
        float mediumEdge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
        float softEdge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
        float edgeFade = mix(mediumEdge, softEdge, blurIntensity);
        edgeFade = max(edgeFade, 0.35);
        
        float edgeDistance = min(vUv.x, 1.0 - vUv.x);
        float pinkEdge = smoothstep(0.3, 0.0, edgeDistance);
        vec3 pinkTint = vec3(1.0, 0.7, 0.85);
        color = mix(color, pinkTint, pinkEdge * 0.6);
        
        color *= 1.5;
        color = pow(color, vec3(0.8));
        
        vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
        color = mix(gray, color, 1.4);
        
        float sharpAlpha = 0.98;
        float softAlpha = 0.85;
        float alpha = mix(sharpAlpha, softAlpha, blurIntensity) * glow * edgeFade;
        alpha = clamp(alpha, 0.6, 1.0);
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    material.uniforms.time.value += delta
    
    if (!meshRef.current) return
    
    // 유기적이고 불규칙한 3D 움직임
    
    // 노이즈 기반 랜덤 움직임 (더 불규칙하게)
    const noise1 = Math.sin(time * 0.47) * Math.cos(time * 0.73)
    const noise2 = Math.sin(time * 0.61) * Math.cos(time * 0.89)
    const noise3 = Math.sin(time * 0.53) * Math.cos(time * 0.97)
    const noise4 = Math.sin(time * 0.83) * Math.cos(time * 1.13)
    const noise5 = Math.sin(time * 0.71) * Math.cos(time * 1.31)
    
    // 1. 불규칙한 궤도 이동 (원형이 아닌 타원 + 랜덤)
    const radiusX = 1.8 + noise1 * 0.8
    const radiusZ = 1.2 + noise2 * 0.6
    meshRef.current.position.x = Math.sin(time * 0.35 + noise3 * 0.5) * radiusX
    meshRef.current.position.z = Math.cos(time * 0.42 + noise4 * 0.5) * radiusZ
    
    // 2. 불규칙한 상하 움직임 (부드러운 파동 + 급격한 변화)
    meshRef.current.position.y = Math.sin(time * 0.53) * 1.0 + 
                                   Math.cos(time * 1.23) * 0.4 + 
                                   noise5 * 0.3
    
    // 3. 유기적인 회전 (각 축마다 다른 속도와 방향)
    // X축: 느리고 부드러운 회전
    meshRef.current.rotation.x = Math.sin(time * 0.31 + noise1) * 0.5 + 
                                  Math.cos(time * 0.77) * 0.25
    
    // Y축: 불규칙한 회전 (앞뒤로 왔다갔다)
    meshRef.current.rotation.y = time * 0.15 + 
                                  Math.sin(time * 0.43 + noise2) * 0.8 + 
                                  Math.cos(time * 0.91) * 0.4
    
    // Z축: 급격한 변화가 있는 회전
    meshRef.current.rotation.z = Math.sin(time * 0.67 + noise3) * 0.4 + 
                                  Math.cos(time * 1.19) * 0.3 + 
                                  noise4 * 0.2
  })

  const width = 2.0
  const height = viewport.height * 1.5

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[width, height, 64, 256]} />
        <primitive object={material} attach="material" />
      </mesh>
  )
}
