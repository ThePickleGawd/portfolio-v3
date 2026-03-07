'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export default function HeroPortrait() {
  const [fog, setFog] = useState<'in' | 'out'>('in')
  const [cycling, setCycling] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const animate = useCallback(() => {
    setFog('in')
    setCycling(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setFog('out')
      setCycling(false)
    }, 600)
  }, [])

  // Initial load: fog clears, portrait zooms in gently
  useEffect(() => {
    const t = setTimeout(() => setFog('out'), 1500)
    return () => {
      clearTimeout(t)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  // Listen for theme cycle events from RoleCycler
  useEffect(() => {
    const handler = () => animate()
    document.addEventListener('theme-cycle', handler)
    return () => document.removeEventListener('theme-cycle', handler)
  }, [animate])

  const handleClick = () => {
    document.dispatchEvent(new CustomEvent('portrait-click'))
  }

  const wrapClass = `hero-portrait-wrap${cycling ? ' cycling' : ''}`

  return (
    <div className={wrapClass} onClick={handleClick}>
      <img
        src="/portrait.webp"
        alt="Dylan Lu"
        className="hero-portrait"
      />
      <div className="hero-portrait-overlay" />
      <div className="hero-portrait-tint" />
      <div className="hero-portrait-glow" />
      <div className="hero-portrait-dof" />
      <div className="portrait-crop-mark portrait-crop-mark--tl" />
      <div className="portrait-crop-mark portrait-crop-mark--tr" />
      <div className="portrait-crop-mark portrait-crop-mark--br" />
      <div className="portrait-crop-mark portrait-crop-mark--bl" />
      <div className={`hero-fog hero-fog-left fog-${fog}`} />
      <div className={`hero-fog hero-fog-right fog-${fog}`} />
    </div>
  )
}
