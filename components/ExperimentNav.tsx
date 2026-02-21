'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/experiment', label: 'Exp 1' },
  { href: '/experiment2', label: 'Exp 2' },
  { href: '/experiment3', label: 'Exp 3' },
]

export default function ExperimentNav() {
  const pathname = usePathname()

  return (
    <nav className="pointer-events-none fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl justify-end">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/20 bg-black/65 px-2 py-2 backdrop-blur-xl">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-all duration-300',
                  isActive
                    ? 'border border-[#cb9cff] bg-[#8a42ee]/45 text-[#f3e6ff]'
                    : 'border border-transparent text-white/70 hover:border-white/20 hover:bg-white/8 hover:text-white',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
