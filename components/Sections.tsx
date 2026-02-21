'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ── Animated section wrapper ─────────────────────────
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
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

// ── Project card ─────────────────────────────────────
function ProjectCard({
  title,
  description,
  tags,
  index,
}: {
  title: string
  description: string
  tags: string[]
  index: number
}) {
  return (
    <Reveal delay={index * 0.12}>
      <div className="group relative rounded-2xl p-6 border border-white/[0.04] bg-white/[0.02] backdrop-blur-sm hover:border-[#8800ff]/30 transition-all duration-500 cursor-pointer hover:shadow-[0_0_40px_rgba(136,0,255,0.12)]">
        {/* Thumbnail placeholder */}
        <div className="h-44 rounded-xl bg-gradient-to-br from-[#8800ff]/10 to-[#0088ff]/10 mb-5 flex items-center justify-center overflow-hidden group-hover:from-[#8800ff]/20 group-hover:to-[#0088ff]/20 transition-all duration-700">
          <div className="w-20 h-20 rounded-full bg-[#8800ff]/15 blur-2xl group-hover:scale-[2] transition-transform duration-1000" />
        </div>

        <h3 className="font-display text-lg font-bold text-white/90 mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-white/35 text-sm leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[11px] tracking-wide uppercase bg-[#8800ff]/8 text-[#bb88ff]/70 border border-[#8800ff]/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  )
}

// ── Section heading ──────────────────────────────────
function SectionHeading({
  label,
  title,
}: {
  label: string
  title: string
}) {
  return (
    <Reveal className="mb-14">
      <p className="text-[#8800ff] text-xs tracking-[0.3em] uppercase font-medium mb-3">
        {label}
      </p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white/90">
        {title}
      </h2>
    </Reveal>
  )
}

// ── Placeholder data ─────────────────────────────────
const PROJECTS = [
  {
    title: 'Project Alpha',
    description:
      'A brief description of this project and what makes it interesting. Replace with real content.',
    tags: ['React', 'Three.js', 'AI'],
  },
  {
    title: 'Research Beta',
    description:
      'Exploring new frontiers in machine learning and computer vision applications.',
    tags: ['Python', 'ML', 'Research'],
  },
  {
    title: 'Tool Gamma',
    description:
      'Developer tool that streamlines workflow and boosts productivity for teams.',
    tags: ['TypeScript', 'CLI', 'OSS'],
  },
  {
    title: 'Experiment Delta',
    description:
      'Creative coding experiment pushing the boundaries of web-based visualisation.',
    tags: ['WebGL', 'GLSL', 'Creative'],
  },
]

// ── Main Sections Component ──────────────────────────
export default function Sections() {
  return (
    <>
      {/* Domain Expansion banner */}
      <section className="relative py-32 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#8800ff]/[0.06] blur-[120px]" />
        </div>

        <Reveal className="text-center relative z-10">
          <p className="text-[#8800ff]/60 text-xs tracking-[0.5em] uppercase mb-4 font-medium">
            — Domain Expansion —
          </p>
          <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter text-white/90 mb-6">
            Unlimited Void
          </h2>
          <p className="text-white/30 max-w-md mx-auto leading-relaxed">
            Welcome to my domain. Explore projects, research, and experiments
            below.
          </p>
        </Reveal>
      </section>

      {/* Projects */}
      <section className="relative max-w-6xl mx-auto px-6 pb-32">
        <SectionHeading label="Work" title="Projects" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} index={i} {...project} />
          ))}
        </div>
      </section>

      {/* Photos */}
      <section className="relative max-w-6xl mx-auto px-6 pb-32">
        <SectionHeading label="Gallery" title="Photos" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="aspect-square rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-hidden group cursor-pointer hover:border-[#8800ff]/20 transition-all duration-500">
                <div className="w-full h-full bg-gradient-to-br from-[#0088ff]/5 to-[#ff0044]/5 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                  <span className="text-white/10 text-xs tracking-widest uppercase">
                    Photo {i + 1}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Research */}
      <section className="relative max-w-6xl mx-auto px-6 pb-32">
        <SectionHeading label="Research" title="Interests" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Machine Learning',
              body: 'Exploring neural network architectures and their applications in real-world systems.',
            },
            {
              title: 'Computer Vision',
              body: 'Working on perception models that understand and reason about visual data.',
            },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.12}>
              <div className="rounded-2xl p-8 border border-white/[0.04] bg-white/[0.015]">
                <h3 className="font-display text-xl font-bold text-white/90 mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-white/30 text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-16 text-center">
        <Reveal>
          <p className="text-white/20 text-sm tracking-wide">
            Built with cursed energy &amp; code
          </p>
        </Reveal>
      </footer>
    </>
  )
}
