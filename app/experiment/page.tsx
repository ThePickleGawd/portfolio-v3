'use client'

import dynamic from 'next/dynamic'

const BrushStrokeCanvas = dynamic(() => import('@/components/BrushStrokeCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
    </div>
  ),
})

export default function ExperimentPage() {
  return (
    <div className="w-screen h-screen bg-black">
      <div className="fixed top-4 left-4 z-10 text-white/50 text-sm font-mono">
        experiment / brush-stroke
      </div>
      <BrushStrokeCanvas />
    </div>
  )
}
