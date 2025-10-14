import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function AgenticBubble({ styleType = 9, cameraMode = 'default' }) {
  const meshRef = useRef()
  const [metaballs, setMetaballs] = useState([])
  const [time, setTime] = useState(0)
  
  // Marching Cubes parameters
  const resolution = 32
  const size = 4
  const threshold = 0.5
  
  // Create metaball data
  useEffect(() => {
    const balls = []
    for (let i = 0; i < 8; i++) {
      balls.push({
        x: (Math.random() - 0.5) * size,
        y: (Math.random() - 0.5) * size,
        z: (Math.random() - 0.5) * size,
        radius: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
      })
    }
    setMetaballs(balls)
  }, [])

  // Marching Cubes implementation
  const generateMetaballGeometry = useMemo(() => {
    const vertices = []
    const normals = []
    const indices = []
    
    const step = size / resolution
    const grid = new Array(resolution + 1)
    
    // Initialize grid
    for (let x = 0; x <= resolution; x++) {
      grid[x] = new Array(resolution + 1)
      for (let y = 0; y <= resolution; y++) {
        grid[x][y] = new Array(resolution + 1)
        for (let z = 0; z <= resolution; z++) {
          grid[x][y][z] = 0
        }
      }
    }
    
    // Calculate field values
    for (let x = 0; x <= resolution; x++) {
      for (let y = 0; y <= resolution; y++) {
        for (let z = 0; z <= resolution; z++) {
          let value = 0
          const pos = {
            x: (x / resolution - 0.5) * size,
            y: (y / resolution - 0.5) * size,
            z: (z / resolution - 0.5) * size
          }
          
          metaballs.forEach(ball => {
            const dist = Math.sqrt(
              Math.pow(pos.x - ball.x, 2) +
              Math.pow(pos.y - ball.y, 2) +
              Math.pow(pos.z - ball.z, 2)
            )
            value += ball.radius / (dist + 0.1)
          })
          
          grid[x][y][z] = value
        }
      }
    }
    
    // Marching Cubes algorithm
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        for (let z = 0; z < resolution; z++) {
          const cube = [
            grid[x][y][z],
            grid[x + 1][y][z],
            grid[x + 1][y + 1][z],
            grid[x][y + 1][z],
            grid[x][y][z + 1],
            grid[x + 1][y][z + 1],
            grid[x + 1][y + 1][z + 1],
            grid[x][y + 1][z + 1]
          ]
          
          // Check if any vertex is above threshold
          if (cube.some(v => v > threshold)) {
            const pos = {
              x: (x / resolution - 0.5) * size,
              y: (y / resolution - 0.5) * size,
              z: (z / resolution - 0.5) * size
            }
            
            vertices.push(pos.x, pos.y, pos.z)
            
            // Calculate normal
            const normalX = (grid[x + 1][y][z] - grid[x][y][z]) / step
            const normalY = (grid[x][y + 1][z] - grid[x][y][z]) / step
            const normalZ = (grid[x][y][z + 1] - grid[x][y][z]) / step
            
            const length = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ)
            normals.push(
              length > 0 ? normalX / length : 0,
              length > 0 ? normalY / length : 1,
              length > 0 ? normalZ / length : 0
            )
          }
        }
      }
    }
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    
    return geometry
  }, [metaballs, resolution, size, threshold])

  // Material with animated colors
  const material = useMemo(() => new THREE.MeshPhongMaterial({
    color: 0xff6b6b,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    shininess: 100
  }), [])

  // Animation
  useFrame((state, delta) => {
    setTime(prev => prev + delta)
    
    setMetaballs(prev => prev.map(ball => ({
      ...ball,
      x: ball.x + ball.vx,
      y: ball.y + ball.vy,
      z: ball.z + ball.vz,
      vx: ball.x > size/2 || ball.x < -size/2 ? -ball.vx : ball.vx,
      vy: ball.y > size/2 || ball.y < -size/2 ? -ball.vy : ball.vy,
      vz: ball.z > size/2 || ball.z < -size/2 ? -ball.vz : ball.vz,
    })))
  })

  const { camera, viewport } = useThree()
  const v = viewport.getCurrentViewport(camera, [0, 0, 0])
  const isVer4 = typeof window !== 'undefined' && window.location.pathname === '/ver4'
  const radius = Math.min(v.width, v.height) * (isVer4 ? 0.8 : 0.33)
  const margin = isVer4 ? v.height * 0.01 : v.height * 0.035
  const yBottom = isVer4 ? -v.height / 2 + radius * 0.6 + margin : -v.height / 2 + radius + margin

  return (
    <>
      <mesh ref={meshRef} position={[0, yBottom, 0]} geometry={generateMetaballGeometry} material={material} />
    </>
  )
}
