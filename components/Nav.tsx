'use client'

import { useState, useCallback } from 'react'

const links = ['About', 'Experience', 'Work', 'Publications', 'Contact']

export default function Nav() {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((o) => !o), [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <nav className="nav">
        {/* Desktop links */}
        <ul className="nav-links">
          {links.map((label) => (
            <li key={label}>
              <a href={`#${label.toLowerCase()}`}>{label}</a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className={`nav-burger${open ? ' open' : ''}`}
          onClick={toggle}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile overlay — outside nav to avoid mix-blend-mode */}
      <div className={`nav-mobile${open ? ' open' : ''}`}>
        <button className="nav-mobile-close" onClick={close} aria-label="Close menu">
          <span />
          <span />
        </button>
        {links.map((label) => (
          <a
            key={label}
            href={`#${label.toLowerCase()}`}
            onClick={close}
          >
            {label}
          </a>
        ))}
      </div>
    </>
  )
}
