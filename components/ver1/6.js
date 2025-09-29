import { useFrame } from '@react-three/fiber'
import AgenticBubble from './1'

export default function Style6Zoom() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const period = 11.0
    const baseZ = 6.0
    const amplitudeZ = 0.6
    const z = baseZ + amplitudeZ * Math.sin((2 * Math.PI * t) / period)
    state.camera.position.z = z
    state.camera.updateProjectionMatrix()
  })

  return <AgenticBubble styleType={6} />
}

