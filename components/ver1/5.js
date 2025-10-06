import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import AgenticBubble from './1'

export default function ShaderBubble5() {
  return <AgenticBubble cameraMode="move" />
}

