'use client'

import {
  useEffect,
  useRef,
  type AnimationEvent,
  type PointerEvent,
} from 'react'
import dynamic from 'next/dynamic'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { scrollProgress, sceneProgress } from '@/lib/store'

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
    <span className="hero-char inline-block" data-hero-char data-index={index}>
      {char}
    </span>
  )
}

function TriggerCordIcon() {
  return (
    <svg
      width="44"
      height="72"
      viewBox="0 0 44 72"
      fill="none"
      className="hero-trigger-icon"
      aria-hidden
    >
      <path
        d="M22 4V41"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M22 41L10 63H34L22 41Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const wiggleRafRef = useRef<Map<HTMLSpanElement, number>>(new Map())
  const autoScrollRafRef = useRef<number | null>(null)
  const autoScrollActiveRef = useRef(false)

  const cancelAutoScroll = () => {
    if (autoScrollRafRef.current !== null) {
      cancelAnimationFrame(autoScrollRafRef.current)
      autoScrollRafRef.current = null
    }
    autoScrollActiveRef.current = false
  }

  const handleTriggerPull = () => {
    if (autoScrollActiveRef.current) {
      return
    }

    const startY = window.scrollY
    const targetY =
      document.documentElement.scrollHeight - window.innerHeight
    const distance = Math.max(0, targetY - startY)

    if (distance < 8) {
      return
    }

    const durationMs = Math.min(7000, Math.max(2400, distance * 0.9))
    const startTime = performance.now()
    autoScrollActiveRef.current = true

    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / durationMs)
      const eased =
        t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      window.scrollTo(0, startY + distance * eased)

      if (t < 1 && autoScrollActiveRef.current) {
        autoScrollRafRef.current = requestAnimationFrame(step)
      } else {
        autoScrollRafRef.current = null
        autoScrollActiveRef.current = false
      }
    }

    autoScrollRafRef.current = requestAnimationFrame(step)
  }

  const triggerLetterWiggle = (letter: HTMLSpanElement) => {
    const wiggleRafs = wiggleRafRef.current
    const existing = wiggleRafs.get(letter)
    if (existing) {
      cancelAnimationFrame(existing)
    }

    letter.classList.remove('is-wiggling')
    const rafId = requestAnimationFrame(() => {
      letter.classList.add('is-wiggling')
      wiggleRafs.delete(letter)
    })
    wiggleRafs.set(letter, rafId)
  }

  const handleHeroPointerOver = (event: PointerEvent<HTMLHeadingElement>) => {
    const target = event.target as HTMLElement
    const letter = target.closest('[data-hero-char]')
    if (!(letter instanceof HTMLSpanElement)) {
      return
    }

    triggerLetterWiggle(letter)
  }

  const handleHeroAnimationEnd = (
    event: AnimationEvent<HTMLHeadingElement>
  ) => {
    const target = event.target as HTMLElement
    const letter = target.closest('[data-hero-char]')
    if (letter instanceof HTMLSpanElement) {
      letter.classList.remove('is-wiggling')
    }
  }

  useEffect(() => {
    const wiggleRafs = wiggleRafRef.current
    const cancelOnIntent = () => {
      if (autoScrollActiveRef.current) {
        cancelAutoScroll()
      }
    }

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

    // ── Scroll progress → R3F scene ──
    const trigger = ScrollTrigger.create({
      trigger: scrollRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        scrollProgress.current = self.progress
        sceneProgress.current = self.progress
      },
    })

    window.addEventListener('wheel', cancelOnIntent, { passive: true })
    window.addEventListener('touchstart', cancelOnIntent, { passive: true })
    window.addEventListener('keydown', cancelOnIntent)
    window.addEventListener('pointerdown', cancelOnIntent)

    return () => {
      wiggleRafs.forEach((rafId) => cancelAnimationFrame(rafId))
      wiggleRafs.clear()
      cancelAutoScroll()
      window.removeEventListener('wheel', cancelOnIntent)
      window.removeEventListener('touchstart', cancelOnIntent)
      window.removeEventListener('keydown', cancelOnIntent)
      window.removeEventListener('pointerdown', cancelOnIntent)
      trigger.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <main>
      {/* Fixed WebGL Canvas */}
      <div className="fixed inset-0 z-0">
        <HeroCanvas />
      </div>

      {/* Scroll spacer — drives the energy orb animation */}
      <div
        ref={scrollRef}
        className="relative z-10 h-[340vh] pointer-events-none"
      >
        <div className="h-screen flex flex-col items-center justify-center">
          <h1
            className="hero-title font-[var(--font-syne)] text-6xl sm:text-7xl md:text-9xl font-extrabold tracking-[-0.04em] text-white/90 text-center pointer-events-auto select-none"
            onPointerOver={handleHeroPointerOver}
            onAnimationEnd={handleHeroAnimationEnd}
          >
            {'DYLAN LU'.split('').map((char, i) => (
              <HeroLetter key={`${char}-${i}`} char={char} index={i} />
            ))}
          </h1>

          <button
            type="button"
            aria-label="Pull trigger to scroll to bottom"
            className="hero-trigger-button mt-8 pointer-events-auto text-white/38"
            onClick={handleTriggerPull}
          >
            <TriggerCordIcon />
          </button>
        </div>
      </div>

    </main>
  )
}
