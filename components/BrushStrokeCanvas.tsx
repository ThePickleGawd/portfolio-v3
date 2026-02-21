'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import BrushStrokeScene from './BrushStrokeScene'

export default function BrushStrokeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <BrushStrokeScene />
      </Suspense>
    </Canvas>
  )
}
