'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import EnergyScene from './EnergyScene'
import { isMobile } from '@/lib/store'

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'low-power',
      }}
      dpr={isMobile ? [1, 1] : [1, 1.25]}
    >
      <Suspense fallback={null}>
        <EnergyScene />
      </Suspense>
    </Canvas>
  )
}
