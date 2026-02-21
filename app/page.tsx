'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollProgress } from '@/lib/store'
import Sections from '@/components/Sections'

gsap.registerPlugin(ScrollTrigger)

const HeroCanvas = dynamic(() => import('@/components/HeroCanvas'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-3 h-3 rounded-full bg-[#8800ff] animate-pulse" />
    </div>
  ),
})

function HeroLetter({ char, index }: { char: string; index: number }) {
  if (char === ' ') {
    return <span className="inline-block w-[0.28em]" aria-hidden />
  }

  return (
    <span
      className="hero-char inline-block"
      style={{ animationDelay: `${index * 26}ms` } as CSSProperties}
    >
      {char}
    </span>
  )
}

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // ── Hero text fade on scroll ──
    gsap.to('.hero-title', {
      opacity: 0,
      y: -60,
      scale: 0.95,
      scrollTrigger: {
        trigger: scrollRef.current,
        start: 'top top',
        end: '9% top',
        scrub: true,
      },
    })

    gsap.to('.hero-subtitle', {
      opacity: 0,
      y: -30,
      scrollTrigger: {
        trigger: scrollRef.current,
        start: 'top top',
        end: '6% top',
        scrub: true,
      },
    })

    // ── Canvas fade near end — GSAP on DOM, no React state ──
    gsap.to(canvasRef.current, {
      opacity: 0,
      scrollTrigger: {
        trigger: scrollRef.current,
        start: '85% top',
        end: 'bottom bottom',
        scrub: true,
      },
    })

    // ── Scroll progress → R3F scene ──
    const trigger = ScrollTrigger.create({
      trigger: scrollRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        scrollProgress.current = self.progress
      },
    })

    return () => {
      trigger.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <main>
      {/* Fixed WebGL Canvas */}
      <div ref={canvasRef} className="fixed inset-0 z-0">
        <HeroCanvas />
      </div>

      {/* Scroll spacer — drives the energy orb animation */}
      <div
        ref={scrollRef}
        className="relative z-10 h-[700vh] pointer-events-none"
      >
        <div className="h-screen flex flex-col items-center justify-center">
          <h1
            className="hero-title font-[var(--font-syne)] text-6xl sm:text-7xl md:text-9xl font-extrabold tracking-[-0.04em] text-white/90 text-center pointer-events-auto select-none"
          >
            {'DYLAN LU'.split('').map((char, i) => (
              <HeroLetter key={`${char}-${i}`} char={char} index={i} />
            ))}
          </h1>
          <p className="hero-subtitle mt-5 text-sm text-white/25 tracking-[0.35em] uppercase pointer-events-auto select-none">
            Scroll to begin
          </p>
          <div className="scroll-indicator mt-10 pointer-events-auto">
            <svg
              width="20"
              height="30"
              viewBox="0 0 20 30"
              fill="none"
              className="text-white/20"
            >
              <rect
                x="1"
                y="1"
                width="18"
                height="28"
                rx="9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="10" cy="10" r="2.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content — Domain Expansion */}
      <div className="relative z-20 bg-black">
        <Sections />
      </div>
    </main>
  )
}
