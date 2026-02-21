'use client'

import { useEffect, useMemo, useState } from 'react'
import AnimePainterCanvas from '@/components/experiment2/AnimePainterCanvas'
import Experiment2Sections from '@/components/experiment2/Experiment2Sections'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export default function Experiment2Page() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const heroHeight = window.innerHeight * 3.1
      const next = clamp(window.scrollY / heroHeight, 0, 1)
      setProgress(next)
    }

    const onScroll = () => {
      if (raf === 0) {
        raf = window.requestAnimationFrame(update)
      }
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf !== 0) {
        window.cancelAnimationFrame(raf)
      }
    }
  }, [])

  const heroStyle = useMemo(
    () => ({
      opacity: 1 - progress * 1.3,
      transform: `translateY(${-progress * 140}px) scale(${1 - progress * 0.09})`,
    }),
    [progress]
  )

  const canvasStyle = useMemo(
    () => ({
      opacity: 1 - progress * 0.55,
      filter: `saturate(${1 + progress * 0.4})`,
    }),
    [progress]
  )

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#04040c] text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={canvasStyle}
      >
        <AnimePainterCanvas progress={progress} />
      </div>

      <section className="relative z-10 h-[360vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center px-6">
          <div
            className="mx-auto max-w-4xl text-center"
            style={heroStyle}
          >
            <p className="mb-4 text-xs uppercase tracking-[0.5em] text-[#ddc0ff]/80 sm:mb-5">
              Experiment 2
            </p>
            <h1 className="font-[var(--font-syne)] text-5xl font-extrabold tracking-[-0.04em] text-white sm:text-7xl md:text-8xl lg:text-9xl">
              DYLAN LU
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              Hand-drawn anime energy study: cel-shaded forms, painted skies, ember sparks, and cursed flow dynamics.
            </p>
            <p className="mt-10 text-[11px] uppercase tracking-[0.35em] text-[#d9b5ff]/75">
              Scroll to enter the domain
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-20">
        <Experiment2Sections />
      </div>
    </main>
  )
}
