'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    gsap.fromTo(
      el,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      }
    )
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

function Shell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  )
}

type WorkItem = {
  title: string
  description: string
  tags: string[]
}

function WorkCard({
  title,
  description,
  tags,
  index,
}: WorkItem & { index: number }) {
  return (
    <Reveal delay={index * 0.08}>
      <article className="group relative overflow-hidden rounded-2xl border border-white/12 bg-black/40 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 hover:border-white/28 hover:bg-black/55 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(136,0,255,0.15),transparent_55%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
        <h3 className="relative mb-3 font-display text-2xl font-bold tracking-tight text-white/94">
          {title}
        </h3>
        <p className="relative mb-6 text-sm leading-relaxed text-white/58 md:text-[0.96rem]">
          {description}
        </p>
        <div className="relative flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/14 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-white/62"
            >
              {tag}
            </span>
          ))}
        </div>
      </article>
    </Reveal>
  )
}

function Column({
  label,
  items,
  startIndex,
}: {
  label: string
  items: WorkItem[]
  startIndex: number
}) {
  return (
    <Reveal className="relative rounded-[1.6rem] border border-white/10 bg-black/45 p-6 backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] bg-[linear-gradient(130deg,rgba(136,0,255,0.12),rgba(10,10,20,0)_52%)]" />
      <div className="relative mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#c9a6ff]">
          {label}
        </p>
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/38">
          {items.length} items
        </span>
      </div>
      <div className="relative grid gap-4">
        {items.map((item, i) => (
          <WorkCard key={item.title} index={startIndex + i} {...item} />
        ))}
      </div>
    </Reveal>
  )
}

const PROJECTS: WorkItem[] = [
  {
    title: 'Realtime Memory Atlas',
    description:
      'Interactive map that indexes notes, papers, and experiments into a graph you can query in natural language.',
    tags: ['Next.js', 'RAG', 'WebGL'],
  },
  {
    title: 'Latency Lab',
    description:
      'Benchmark suite for end-to-end AI response quality under real traffic, with automated regression diffing.',
    tags: ['TypeScript', 'Observability', 'LLMOps'],
  },
  {
    title: 'Domain Animator',
    description:
      'Tooling to choreograph shader scenes with section-aware progress curves and timeline scrubbing.',
    tags: ['Three.js', 'GSAP', 'Shaders'],
  },
]

const RESEARCH: WorkItem[] = [
  {
    title: 'Grounded Generation',
    description:
      'Reducing hallucination via retrieval confidence and citation-aware decoding in constrained contexts.',
    tags: ['LLM', 'Evaluation', 'Safety'],
  },
  {
    title: 'Visual Reasoning Interfaces',
    description:
      'Designing spatial UI metaphors that improve human understanding of model chains and uncertainty.',
    tags: ['HCI', 'Visualization', 'UX'],
  },
]

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8.2 10.3V16.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="8.2" cy="7.8" r="1.15" fill="currentColor" />
        <path
          d="M11.6 10.3V16.5M11.6 12.9C11.6 11.6 12.5 10.3 14.4 10.3C16.3 10.3 16.9 11.5 16.9 13.3V16.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:hello@example.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2.4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4.8 7L12 12.6L19.2 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function Sections() {
  return (
    <>
      <section className="relative pb-28 pt-24 md:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-8 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#6500ff]/[0.16] blur-[150px]" />
          <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#0080ff]/[0.09] blur-[120px]" />
          <div className="absolute -right-24 bottom-6 h-72 w-72 rounded-full bg-[#ff296d]/[0.08] blur-[120px]" />
        </div>

        <Shell className="relative">
          <Reveal className="rounded-[2rem] border border-white/12 bg-black/45 px-6 py-10 text-center backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:px-10 sm:py-12 md:px-14 md:py-14">
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.48em] text-[#c6a2ff]">
              Projects + Research
            </p>
            <h2 className="mx-auto max-w-4xl font-display text-[clamp(2.7rem,8vw,6.3rem)] font-black leading-[0.92] tracking-[-0.04em] text-white">
              Built Work,
              <br />
              Active Inquiry
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/60">
              A focused snapshot of what I am building and what I am actively
              investigating, presented as one continuous, scene-connected
              surface.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Column label="Projects" items={PROJECTS} startIndex={0} />
            <Column
              label="Research"
              items={RESEARCH}
              startIndex={PROJECTS.length}
            />
          </div>
        </Shell>
      </section>

      <footer className="pb-16">
        <Shell>
          <Reveal className="flex w-full flex-col gap-5 rounded-[1.7rem] border border-white/12 bg-black/45 px-6 py-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/38">
              Connect
            </p>
            <p className="mt-2 text-sm text-white/60">
              Instagram, LinkedIn, and email
            </p>
          </div>
          <div className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={social.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                aria-label={social.label}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/80 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d6b6ff] hover:text-white hover:shadow-[0_0_36px_rgba(136,0,255,0.38)]"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </Reveal>
        </Shell>
      </footer>
    </>
  )
}
