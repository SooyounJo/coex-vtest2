import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 8, cameraMode = 'default' }) {
  const meshRef = useRef()
  const [metaballs, setMetaballs] = useState([])
  const [time, setTime] = useState(0)

  // Create 3 simple metaballs
  useEffect(() => {
    const balls = [
      {
        x: 1.2,
        y: 0.5,
        z: 0,
        radius: 0.6,
        vx: -0.008,
        vy: 0.005,
        vz: 0,
      },
      {
        x: -1.2,
        y: -0.5,
        z: 0,
        radius: 0.7,
        vx: 0.008,
        vy: -0.005,
        vz: 0,
      },
      {
        x: 0,
        y: 0,
        z: 0,
        radius: 0.5,
        vx: 0.003,
        vy: -0.003,
        vz: 0,
      }
    ]
    setMetaballs(balls)
  }, [])

  // Simple liquid material
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0xff6b9d,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.3,
    thickness: 0.5,
    ior: 1.33,
    envMapIntensity: 1.0
  }), [])

  // Animation
  useFrame((state, delta) => {
    setTime(prev => prev + delta)
    
    setMetaballs(prev => prev.map(ball => {
      let newX = ball.x + ball.vx
      let newY = ball.y + ball.vy
      let newZ = ball.z + ball.vz
      
      // Bounce off walls
      if (newX > 2 || newX < -2) ball.vx *= -0.9
      if (newY > 2 || newY < -2) ball.vy *= -0.9
      if (newZ > 2 || newZ < -2) ball.vz *= -0.9
      
      return {
        ...ball,
        x: Math.max(-2, Math.min(2, newX)),
        y: Math.max(-2, Math.min(2, newY)),
        z: Math.max(-2, Math.min(2, newZ)),
      }
    }))
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.2} />
      <pointLight position={[-2, 2, 2]} intensity={0.8} color="#ff6b9d" />
      <pointLight position={[2, -2, -2]} intensity={0.6} color="#87ceeb" />

      {/* Render individual spheres that will blend together */}
      {metaballs.map((ball, i) => (
        <mesh 
          key={i} 
          position={[ball.x, ball.y + yBottom, ball.z]}
          material={material}
        >
          <sphereGeometry args={[ball.radius, 32, 32]} />
        </mesh>
      ))}
    </>
  )
}
