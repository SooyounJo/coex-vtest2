import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 9, cameraMode = 'default' }) {
  const meshRef = useRef()
  const [metaballs, setMetaballs] = useState([])

  // Create animated metaballs that emerge from and retract into the sphere
  useEffect(() => {
    const balls = []
    for (let i = 0; i < 8; i++) {
      balls.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2,
        radius: Math.random() * 0.3 + 0.2,
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
        vz: (Math.random() - 0.5) * 0.01,
        phase: Math.random() * Math.PI * 2, // For emergence timing
        emergenceSpeed: Math.random() * 0.02 + 0.01,
        color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6)
      })
    }
    setMetaballs(balls)
  }, [])

  // 3D Metaball Shader Material
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      metaballs: { value: Array.from({ length: 8 }, (_, i) => 
        metaballs[i] ? new THREE.Vector3(metaballs[i].x, metaballs[i].y, metaballs[i].z) : new THREE.Vector3(0, 0, 0)
      ) },
      metaballRadius: { value: Array.from({ length: 8 }, (_, i) => 
        metaballs[i] ? metaballs[i].radius : 0.1
      ) },
      metaballColors: { value: Array.from({ length: 8 }, (_, i) => 
        metaballs[i] ? metaballs[i].color : new THREE.Color(0.2, 0.6, 1.0)
      ) },
      metaballPhases: { value: Array.from({ length: 8 }, (_, i) => 
        metaballs[i] ? metaballs[i].phase : 0
      ) },
      lightPosition: { value: new THREE.Vector3(2, 2, 2) }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      
      uniform float uTime;
      uniform vec3 metaballs[8];
      uniform float metaballRadius[8];
      uniform vec3 metaballColors[8];
      uniform float metaballPhases[8];
      uniform vec3 lightPosition;
      
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      // Smooth minimum for gooey effect
      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
        return mix(b, a, h) - k * h * (1.0 - h);
      }
      
      // Metaball field calculation
      float metaballField(vec3 pos) {
        float field = 0.0;
        float k = 0.3;
        
        for (int i = 0; i < 8; i++) {
          vec3 ballPos = metaballs[i];
          float radius = metaballRadius[i];
          float phase = metaballPhases[i];
          
          // Emergence animation - balls come out and go back in
          float emergence = sin(uTime * 0.5 + phase) * 0.5 + 0.5;
          float currentRadius = radius * emergence;
          
          // Add some movement
          ballPos += vec3(
            sin(uTime * 0.3 + phase) * 0.2,
            cos(uTime * 0.4 + phase) * 0.2,
            sin(uTime * 0.2 + phase) * 0.1
          );
          
          float dist = distance(pos, ballPos);
          float metaball = currentRadius / (dist * dist + 0.001);
          
          if (i == 0) {
            field = metaball;
          } else {
            field = smin(field, metaball, k);
          }
        }
        
        return field;
      }
      
      void main() {
        vec3 pos = vPosition;
        float field = metaballField(pos);
        
        // Threshold for surface
        float threshold = 0.3;
        float mask = smoothstep(threshold - 0.1, threshold + 0.1, field);
        
        if (mask < 0.01) discard;
        
        // Color mixing based on metaball influence
        vec3 color = vec3(0.0);
        float totalInfluence = 0.0;
        
        for (int i = 0; i < 8; i++) {
          vec3 ballPos = metaballs[i];
          float radius = metaballRadius[i];
          float phase = metaballPhases[i];
          
          float emergence = sin(uTime * 0.5 + phase) * 0.5 + 0.5;
          float currentRadius = radius * emergence;
          
          ballPos += vec3(
            sin(uTime * 0.3 + phase) * 0.2,
            cos(uTime * 0.4 + phase) * 0.2,
            sin(uTime * 0.2 + phase) * 0.1
          );
          
          float dist = distance(pos, ballPos);
          float influence = currentRadius / (dist * dist + 0.001);
          
          if (influence > threshold * 0.5) {
            color += metaballColors[i] * influence;
            totalInfluence += influence;
          }
        }
        
        if (totalInfluence > 0.0) {
          color /= totalInfluence;
        } else {
          color = vec3(0.2, 0.6, 1.0); // Default cyan
        }
        
        // Add some iridescence
        float iridescence = sin(dot(normalize(vNormal), vec3(1.0, 0.0, 0.0)) * 5.0 + uTime * 2.0) * 0.3 + 0.7;
        color *= iridescence;
        
        // Lighting
        vec3 lightDir = normalize(lightPosition - vPosition);
        float lighting = max(dot(vNormal, lightDir), 0.0);
        color *= lighting * 0.8 + 0.2;
        
        // Add glow
        float glow = smoothstep(0.0, 1.0, field) * 0.3;
        color += vec3(0.5, 0.8, 1.0) * glow;
        
        gl_FragColor = vec4(color, mask);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  }), [metaballs])

  // Animation
  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime()
    
    // Update metaball positions and properties
    setMetaballs(prev => prev.map(ball => {
      let newX = ball.x + ball.vx
      let newY = ball.y + ball.vy
      let newZ = ball.z + ball.vz
      
      // Bounce off walls
      if (newX > 1.5 || newX < -1.5) ball.vx *= -0.8
      if (newY > 1.5 || newY < -1.5) ball.vy *= -0.8
      if (newZ > 1.5 || newZ < -1.5) ball.vz *= -0.8
      
      return {
        ...ball,
        x: Math.max(-1.5, Math.min(1.5, newX)),
        y: Math.max(-1.5, Math.min(1.5, newY)),
        z: Math.max(-1.5, Math.min(1.5, newZ)),
      }
    }))
    
    // Update shader uniforms
    for (let i = 0; i < 8; i++) {
      if (metaballs[i]) {
        material.uniforms.metaballs.value[i].set(metaballs[i].x, metaballs[i].y, metaballs[i].z)
        material.uniforms.metaballRadius.value[i] = metaballs[i].radius
        material.uniforms.metaballColors.value[i].copy(metaballs[i].color)
        material.uniforms.metaballPhases.value[i] = metaballs[i].phase
      }
    }
  })

  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])
  const isVer4 = typeof window !== 'undefined' && window.location.pathname === '/ver4'
  const radius = Math.min(v.width, v.height) * (isVer4 ? 0.8 : 0.33)
  const margin = isVer4 ? v.height * 0.01 : v.height * 0.035
  const yBottom = isVer4 ? -v.height / 2 + radius * 0.6 + margin : -v.height / 2 + radius + margin

  return (
    <>
      {/* Environment lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 3, 3]} intensity={1.0} />
      <pointLight position={[-2, 2, 2]} intensity={0.6} color="#ff6b9d" />
      <pointLight position={[2, -2, -2]} intensity={0.4} color="#87ceeb" />
      
      <mesh ref={meshRef} position={[0, yBottom, 0]}>
        <sphereGeometry args={[radius * 0.8, 64, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
    </>
  )
}