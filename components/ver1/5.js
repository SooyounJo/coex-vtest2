import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function ShaderBubble5({ styleType = 5 }) {
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

      float noise(vec2 p) { return sin(p.x) * cos(p.y); }

      void main() {
        vec2 uv = vUv * 2.0 - 1.0;
        float r = length(uv);
        float wave = 0.05 * sin(u_time + uv.x * 4.0 + uv.y * 3.0);
        float n = noise(uv * 3.0 + u_time * 0.4);
        float bands = 0.5 + 0.5 * sin(r * 8.0 - u_time * 1.2 + n * 1.5);
        vec3 pink   = vec3(1.0, 0.4, 0.8);
        vec3 purple = vec3(0.65, 0.42, 1.0);
        vec3 yellow = vec3(1.0, 0.75, 0.3);
        vec3 color = mix(pink, purple, bands);
        float topBand = smoothstep(0.2, 0.8, uv.y + 0.3 + 0.1 * sin(u_time + uv.x * 2.0));
        color = mix(color, yellow, topBand * 0.6);
        float edge = smoothstep(0.6, 0.95, r + wave);
        color += edge * vec3(0.15, 0.05, 0.2);
        gl_FragColor = vec4(color, 1.0);
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

  const radius = Math.min(v.width, v.height) * (window.innerWidth <= 768 ? 0.5 : 0.33)
  const margin = v.height * 0.035
  const yBottom = window.innerWidth <= 768 ? -v.height / 2 + radius + margin : -v.height / 2 + radius + margin

  return (
    <>
      <mesh ref={meshRef} position={[0, yBottom, 0]}>
        <sphereGeometry args={[radius, 128, 128]} />
        <primitive object={material} attach="material" />
      </mesh>
    </>
  )
}

