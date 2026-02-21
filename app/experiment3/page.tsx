import type { CSSProperties } from 'react'

const MEMORY_RINGS = [
  {
    id: 'outer',
    radius: 340,
    duration: 28,
    reverse: false,
    cards: [
      { name: 'Builder Arc', hueA: '#4f98ff', hueB: '#75d6ff' },
      { name: 'Campus Arc', hueA: '#7868ff', hueB: '#b892ff' },
      { name: 'Lab Arc', hueA: '#ff6f90', hueB: '#ffd0e0' },
      { name: 'Vision Arc', hueA: '#4d89ff', hueB: '#8bd9ff' },
      { name: 'Travel Arc', hueA: '#7a62ff', hueB: '#b0a2ff' },
      { name: 'Creator Arc', hueA: '#ff7f9f', hueB: '#ffd8e5' },
    ],
  },
  {
    id: 'mid',
    radius: 248,
    duration: 20,
    reverse: true,
    cards: [
      { name: 'Design Arc', hueA: '#5aabff', hueB: '#9be0ff' },
      { name: 'Research Arc', hueA: '#8a63ff', hueB: '#d2acff' },
      { name: 'Speaker Arc', hueA: '#ff6f9f', hueB: '#ffc2db' },
      { name: 'Team Arc', hueA: '#4f98ff', hueB: '#9ad3ff' },
      { name: 'Growth Arc', hueA: '#8c73ff', hueB: '#c7bcff' },
    ],
  },
  {
    id: 'inner',
    radius: 166,
    duration: 14,
    reverse: false,
    cards: [
      { name: 'Core Arc', hueA: '#4ea5ff', hueB: '#91d9ff' },
      { name: 'Focus Arc', hueA: '#a25aff', hueB: '#e0adff' },
      { name: 'Future Arc', hueA: '#ff688c', hueB: '#ffc2d7' },
      { name: 'Legacy Arc', hueA: '#5e99ff', hueB: '#9dbfff' },
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
              return (
                <article
                  key={`${ring.id}-${card.name}`}
                  className="memory-card absolute left-1/2 top-1/2 h-28 w-20 overflow-hidden rounded-2xl border border-white/25 shadow-[0_14px_35px_rgba(0,0,0,0.55)] sm:h-36 sm:w-24"
                  style={
                    {
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${ring.radius}px) rotate(-${angle}deg)`,
                      background: `linear-gradient(150deg, ${card.hueA}, ${card.hueB})`,
                    } as CSSProperties
                  }
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_42%),radial-gradient(circle_at_70%_80%,rgba(22,10,38,0.35),transparent_45%)]" />
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
