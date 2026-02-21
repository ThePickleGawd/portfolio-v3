import type { CSSProperties } from 'react'

type CardFormat = 'portrait' | 'landscape' | 'tall'
type MemoryCard = {
  name: string
  image: string
  format: CardFormat
}
type MemoryRing = {
  id: string
  radius: number
  duration: number
  reverse: boolean
  cards: MemoryCard[]
}

function getCardSize(format: CardFormat) {
  if (format === 'landscape') {
    return { width: 138, height: 94 }
  }
  if (format === 'tall') {
    return { width: 110, height: 170 }
  }
  return { width: 98, height: 146 }
}

const MEMORY_RINGS: MemoryRing[] = [
  {
    id: 'outer',
    radius: 340,
    duration: 28,
    reverse: false,
    cards: [
      { name: 'Goku Arc', image: '/domain/dragon-ball-super.jpg', format: 'portrait' },
      { name: 'JJK Arc', image: '/domain/jujutsu-kaisen.jpg', format: 'landscape' },
      { name: 'Chainsaw Arc', image: '/domain/chainsaw-man.jpg', format: 'tall' },
      { name: 'Demon Arc', image: '/domain/demon-slayer.jpg', format: 'landscape' },
      { name: 'Naruto Arc', image: '/domain/naruto.jpg', format: 'portrait' },
      { name: 'Titan Arc', image: '/domain/attack-on-titan.jpg', format: 'tall' },
    ],
  },
  {
    id: 'mid',
    radius: 248,
    duration: 20,
    reverse: true,
    cards: [
      { name: 'Bleach Arc', image: '/domain/bleach.jpg', format: 'landscape' },
      { name: 'Death Arc', image: '/domain/death-note.jpg', format: 'portrait' },
      { name: 'Hero Arc', image: '/domain/my-hero-academia.jpg', format: 'tall' },
      { name: 'Hunter Arc', image: '/domain/hunter-x-hunter.jpg', format: 'landscape' },
      { name: 'Ghoul Arc', image: '/domain/tokyo-ghoul.jpg', format: 'portrait' },
    ],
  },
  {
    id: 'inner',
    radius: 166,
    duration: 14,
    reverse: false,
    cards: [
      { name: 'Geass Arc', image: '/domain/code-geass.jpg', format: 'portrait' },
      { name: 'Spy Arc', image: '/domain/spy-x-family.jpg', format: 'landscape' },
      { name: 'Vinland Arc', image: '/domain/vinland-saga.jpg', format: 'tall' },
      { name: 'One Piece Arc', image: '/domain/one-piece.jpg', format: 'landscape' },
    ],
  },
]

export default function Experiment3Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="anime-domain-bg absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(206,139,255,0.2),transparent_42%),radial-gradient(circle_at_50%_70%,rgba(86,164,255,0.12),transparent_48%)]" />
        <div className="anime-noise absolute inset-0 opacity-45" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 sm:px-6">
        <div className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d9b6ff]/30 bg-[radial-gradient(circle,rgba(176,116,255,0.5),rgba(110,57,224,0.18)_60%,transparent)] blur-[1px]" />
        <div className="domain-pulse-ring absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b98bff]/35" />
        <div className="domain-pulse-ring-alt absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#8ab7ff]/25" />

        {MEMORY_RINGS.map((ring) => (
          <div
            key={ring.id}
            className={[
              'memory-ring absolute left-1/2 top-1/2',
              ring.reverse ? 'memory-ring-reverse' : '',
            ].join(' ')}
            style={
              {
                width: `${ring.radius * 2}px`,
                height: `${ring.radius * 2}px`,
                marginLeft: `${-ring.radius}px`,
                marginTop: `${-ring.radius}px`,
                animationDuration: `${ring.duration}s`,
              } as CSSProperties
            }
          >
            {ring.cards.map((card, index) => {
              const angle = (360 / ring.cards.length) * index
              const size = getCardSize(card.format)
              return (
                <article
                  key={`${ring.id}-${card.name}`}
                  className="memory-card absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-white/25 shadow-[0_14px_35px_rgba(0,0,0,0.55)]"
                  style={
                    {
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${ring.radius}px) rotate(-${angle}deg)`,
                      backgroundImage: `linear-gradient(160deg, rgba(8, 8, 18, 0.16), rgba(5, 3, 12, 0.48)), url(${card.image})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      width: `${size.width}px`,
                      height: `${size.height}px`,
                    } as CSSProperties
                  }
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_38%),linear-gradient(to_top,rgba(0,0,0,0.48),transparent_50%)]" />
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/35 bg-black/35 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/90">
                    {card.name}
                  </div>
                </article>
              )
            })}
          </div>
        ))}

        <div className="relative z-20 mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.52em] text-[#e4caff]/80">
            Experiment 3
          </p>
          <h1 className="font-[var(--font-syne)] text-5xl font-extrabold tracking-[-0.04em] text-[#f7efff] sm:text-7xl md:text-8xl">
            Domain Shrine
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Anime background plate in the far back, with rotating memory layers
            meant for your personal photos. Replace each ring tile with your own
            image assets to make the domain unmistakably yours.
          </p>
          <div className="mx-auto mt-8 w-fit rounded-full border border-[#d3b2ff]/40 bg-black/40 px-5 py-2 text-[10px] uppercase tracking-[0.26em] text-[#f2ddff]">
            Drop images into /public/domain and swap tile backgrounds
          </div>
        </div>
      </section>
    </main>
  )
}
