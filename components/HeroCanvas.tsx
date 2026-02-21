'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import EnergyScene from './EnergyScene'

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <EnergyScene />
      </Suspense>
    </Canvas>
  )
}
