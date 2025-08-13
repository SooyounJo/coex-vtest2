import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function Box({ position, color }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.3
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Sphere({ position, color }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.2
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function ThreeScene() {
  return (
    <>
      {/* 조명 */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* 3D 객체들 */}
      <Box position={[-2, 0, 0]} color="hotpink" />
      <Box position={[2, 0, 0]} color="lightblue" />
      <Sphere position={[0, 2, 0]} color="lightgreen" />
      <Sphere position={[0, -2, 0]} color="orange" />
      
      {/* 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </>
  )
} 