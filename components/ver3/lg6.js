import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 6, cameraMode = 'default' }) {
  const [pointerTrail, setPointerTrail] = useState(Array.from({ length: 15 }, () => new THREE.Vector2(0, 0)))
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2(0, 0))
  
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointerTrail: { value: pointerTrail.map(pos => new THREE.Vector2(pos.x, pos.y)) },
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

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uPointerTrail[15];

      varying vec2 vUv;

      float metaball(vec2 p, vec2 center, float radius) {
        float dist = distance(p, center);
        return radius / (dist * dist + 0.001);
      }

      float smoothMin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }

      void main() {
        vec2 uv = (vUv - 0.5) * 2.0;
        uv.x *= uResolution.x / uResolution.y;

        float metaballField = 0.0;
        float k = 0.3;

        // Main droplet
        metaballField += metaball(uv, vec2(0.0, 0.0), 0.8);

        // Mouse trail metaballs
        for (int i = 0; i < 15; i++) {
          vec2 trailPos = uPointerTrail[i] * uResolution / min(uResolution.x, uResolution.y);
          float radius = 0.3 - float(i) * 0.015;
          metaballField += metaball(uv, trailPos, radius);
        }

        // Additional animated metaballs
        float angle1 = uTime * 0.5;
        vec2 pos1 = vec2(0.4 + 0.3 * cos(angle1), 0.4 + 0.3 * sin(angle1));
        metaballField += metaball(uv, pos1, 0.2);

        float angle2 = uTime * 0.8 + 2.0;
        vec2 pos2 = vec2(-0.4 + 0.25 * cos(angle2), 0.5 + 0.25 * sin(angle2));
        metaballField += metaball(uv, pos2, 0.15);

        float threshold = 1.0;
        float mask = smoothstep(threshold - 0.1, threshold + 0.1, metaballField);
        
        // Droplet-like colors
        vec3 color1 = vec3(0.2, 0.6, 1.0);
        vec3 color2 = vec3(0.8, 0.9, 1.0);
        vec3 color3 = vec3(0.1, 0.3, 0.8);
        
        vec3 color = mix(color3, color1, mask);
        color = mix(color, color2, mask * mask);
        
        // Add some noise for texture
        float noise = fract(sin(dot(uv * 20.0, vec2(12.9898, 78.233))) * 43758.5453);
        color += vec3(noise * 0.1) * mask;

        gl_FragColor = vec4(color, mask);
      }
    `,
    transparent: true,
  }), [pointerTrail])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      setMousePosition(new THREE.Vector2(x, y))
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Update pointer trail
  useEffect(() => {
    const updateTrail = () => {
      setPointerTrail(prev => {
        const newTrail = [...prev]
        for (let i = newTrail.length - 1; i > 0; i--) {
          newTrail[i].copy(newTrail[i - 1])
        }
        newTrail[0].copy(mousePosition)
        return newTrail
      })
    }

    const interval = setInterval(updateTrail, 16) // ~60fps
    return () => clearInterval(interval)
  }, [mousePosition])

  const { camera, viewport } = useThree()

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime()
    
    // Update resolution
    material.uniforms.uResolution.value.set(viewport.width, viewport.height)
    
    // Update pointer trail
    for (let i = 0; i < pointerTrail.length; i++) {
      material.uniforms.uPointerTrail.value[i].set(pointerTrail[i].x, pointerTrail[i].y)
    }
  })

  const v = viewport.getCurrentViewport(camera, [0, 0, 0])
  const isVer3 = typeof window !== 'undefined' && window.location.pathname === '/ver3'
  const radius = Math.min(v.width, v.height) * (isVer3 ? 0.8 : 0.33)
  const margin = isVer3 ? v.height * 0.01 : v.height * 0.035
  const yBottom = isVer3 ? -v.height / 2 + radius * 0.6 + margin : -v.height / 2 + radius + margin

  return (
    <>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width * 0.25, viewport.height * 0.25]} />
        <primitive object={material} attach="material" />
      </mesh>
    </>
  )
}
