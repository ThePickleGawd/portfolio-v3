'use client'

import { useState, useCallback } from 'react'

const links = [
  { label: 'Publications', href: '#publications' },
  { label: 'Resume', href: 'https://flowcv.com/resume/wvn6su5ue1' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((o) => !o), [])
  const close = useCallback(() => setOpen(false), [])

  return (
    <>
      <nav className="nav">
        {/* Desktop links */}
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </a>
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
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={close}
            {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  )
}
