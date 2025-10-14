import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 7, cameraMode = 'default' }) {
  const meshRef = useRef()
  const [metaballs, setMetaballs] = useState([])
  
  // Create metaball data
  useEffect(() => {
    const balls = []
    for (let i = 0; i < 6; i++) {
      balls.push({
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
        z: (Math.random() - 0.5) * 3,
        radius: Math.random() * 0.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.01,
        vy: (Math.random() - 0.5) * 0.01,
        vz: (Math.random() - 0.5) * 0.01,
      })
    }
    setMetaballs(balls)
  }, [])

  // Simple metaball field calculation
  const calculateField = (x, y, z) => {
    let field = 0
    metaballs.forEach(ball => {
      const dx = x - ball.x
      const dy = y - ball.y
      const dz = z - ball.z
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
      field += ball.radius / (distance + 0.1)
    })
    return field
  }

  // Generate geometry using simple approach
  const generateGeometry = useMemo(() => {
    const vertices = []
    const normals = []
    const indices = []
    
    const resolution = 20
    const step = 6 / resolution
    const threshold = 0.8
    
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        for (let z = 0; z < resolution; z++) {
          const worldX = (x / resolution - 0.5) * 6
          const worldY = (y / resolution - 0.5) * 6
          const worldZ = (z / resolution - 0.5) * 6
          
          const field = calculateField(worldX, worldY, worldZ)
          
          if (field > threshold) {
            // Add vertex
            const vertexIndex = vertices.length / 3
            vertices.push(worldX, worldY, worldZ)
            
            // Calculate normal (simplified)
            const normalX = (calculateField(worldX + step, worldY, worldZ) - calculateField(worldX - step, worldY, worldZ)) / (2 * step)
            const normalY = (calculateField(worldX, worldY + step, worldZ) - calculateField(worldX, worldY - step, worldZ)) / (2 * step)
            const normalZ = (calculateField(worldX, worldY, worldZ + step) - calculateField(worldX, worldY, worldZ - step)) / (2 * step)
            
            const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ)
            normals.push(
              length > 0 ? normalX / length : 0,
              length > 0 ? normalY / length : 1,
              length > 0 ? normalZ / length : 0
            )
            
            // Add faces (simplified cube)
            if (x < resolution - 1 && y < resolution - 1 && z < resolution - 1) {
              const nextX = vertexIndex + 1
              const nextY = vertexIndex + resolution
              const nextZ = vertexIndex + resolution * resolution
              
              // Front face
              indices.push(vertexIndex, nextX, nextY)
              indices.push(nextX, nextY + 1, nextY)
              
              // Right face
              indices.push(vertexIndex, nextY, nextZ)
              indices.push(nextY, nextY + resolution, nextZ)
              
              // Top face
              indices.push(vertexIndex, nextZ, nextX)
              indices.push(nextZ, nextX + resolution * resolution, nextX)
            }
          }
        }
      }
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    geometry.setIndex(indices)
    
    return geometry
  }, [metaballs])

  // Material with smooth shading
  const material = useMemo(() => new THREE.MeshPhongMaterial({
    color: 0x4a90e2,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    shininess: 100
  }), [])

  // Animation
  useFrame((state, delta) => {
    setMetaballs(prev => prev.map(ball => {
      let newX = ball.x + ball.vx
      let newY = ball.y + ball.vy
      let newZ = ball.z + ball.vz
      
      // Bounce off walls
      if (newX > 3 || newX < -3) ball.vx *= -1
      if (newY > 3 || newY < -3) ball.vy *= -1
      if (newZ > 3 || newZ < -3) ball.vz *= -1
      
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
      <mesh ref={meshRef} position={[0, yBottom, 0]} geometry={generateGeometry} material={material} />
    </>
  )
}
