import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import { MarchingCubes } from '@react-three/drei'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 7, cameraMode = 'default' }) {
  const meshRef = useRef()
  const [metaballs, setMetaballs] = useState([])
  const [time, setTime] = useState(0)

  // Create initial metaballs
  useEffect(() => {
    const balls = []
    for (let i = 0; i < 5; i++) {
      balls.push({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 4,
        radius: Math.random() * 0.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
      })
    }
    setMetaballs(balls)
  }, [])

  // Liquid-like material
  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    roughness: 0.1,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.2,
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
      if (newX > 2 || newX < -2) ball.vx *= -1
      if (newY > 2 || newY < -2) ball.vy *= -1
      if (newZ > 2 || newZ < -2) ball.vz *= -1
      
      return {
        ...ball,
        x: newX,
        y: newY,
        z: newZ,
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
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#00ff88" />
      
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
