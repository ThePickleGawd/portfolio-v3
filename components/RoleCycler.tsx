'use client'

import { useState, useCallback, useEffect } from 'react'

const roles = [
  { label: 'UCSB \u00b7 Undergrad Researcher', theme: 'ucsb' },
  { label: 'ChipAgents \u00b7 AI Research', theme: 'chipagents' },
  { label: 'Simular \u00b7 AI Research', theme: 'simular' },
  // { label: 'NVIDIA · AI Research', theme: 'nvidia' },
]

export default function RoleCycler() {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  const cycle = useCallback(() => {
    if (fading) return
    const next = (index + 1) % roles.length
    document.documentElement.dataset.theme = roles[next].theme
    document.dispatchEvent(new CustomEvent('theme-cycle'))
    setFading(true)

    setTimeout(() => {
      setIndex(next)
      setFading(false)
    }, 250)
  }, [index, fading])

  // Listen for portrait clicks to trigger cycle
  useEffect(() => {
    const handler = () => cycle()
    document.addEventListener('portrait-click', handler)
    return () => document.removeEventListener('portrait-click', handler)
  }, [cycle])

  return (
    <>
      <p className="hero-eyebrow role-cycler" onClick={cycle}>
        <span className={`role-cycler-text${fading ? ' fading' : ''}`}>
          {roles[index].label}
        </span>
        <svg
          className="role-cycler-arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 6H9.5M6.5 3L9.5 6L6.5 9"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </p>
      <h1 className="hero-name role-cycler" onClick={cycle}>
        Dylan Lu.
      </h1>
    </>
  )
}
