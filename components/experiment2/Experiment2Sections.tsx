'use client'

const PROJECTS = [
  {
    title: 'Celshade Lab',
    description:
      'A realtime NPR renderer focused on quantized light bands, ink outlines, and brush-stroke breakup for stylized scenes.',
    tags: ['WebGL', 'NPR', 'Shaders'],
  },
  {
    title: 'Crimson Arc',
    description:
      'Motion system for anime impact frames with controlled overdraw, speed lines, and frame-hold timing for dramatic beats.',
    tags: ['Animation', 'Canvas', 'Timing'],
  },
  {
    title: 'Orb Fusion Engine',
    description:
      'A merge simulation combining domain-warped color flows, hard specular bursts, and ember-based particle language.',
    tags: ['Creative Code', 'Particles', 'Art Direction'],
  },
  {
    title: 'Inkfield Toolkit',
    description:
      'Utilities for generating painterly cloud masses, paper grain overlays, and controlled rough-edge silhouettes.',
    tags: ['Tooling', 'Design Systems', 'Typescript'],
  },
]

const RESEARCH = [
  {
    title: 'Machine Learning',
    body: 'Stylization-aware generative systems, temporal coherence for animated outputs, and lightweight model serving for interactive art tools.',
  },
  {
    title: 'Computer Vision',
    body: 'Edge abstraction, motion-aware segmentation, and perception pipelines for converting natural footage into anime-like visual language.',
  },
]

const PHOTOS = [
  ['#66b7ff', '#9ae6ff'],
  ['#7e83ff', '#c5a2ff'],
  ['#ff8fa6', '#ffd2db'],
  ['#5ca6ff', '#d3edff'],
  ['#7a77ff', '#9fd5ff'],
  ['#6ac3ff', '#f4a8c7'],
]

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-10">
      <p className="mb-3 text-xs uppercase tracking-[0.45em] text-[#d7b1ff]/80">{label}</p>
      <h2 className="font-[var(--font-syne)] text-4xl font-extrabold tracking-tight text-[#f7efff] sm:text-5xl">
        {title}
      </h2>
    </div>
  )
}

export default function Experiment2Sections() {
  return (
    <div className="relative overflow-hidden bg-[#04030a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#8833ee]/20 blur-[130px]" />
        <div className="absolute bottom-0 left-[-120px] h-[340px] w-[340px] rounded-full bg-[#2288ff]/20 blur-[120px]" />
      </div>

      <section className="relative mx-auto max-w-6xl px-6 pb-28 pt-24">
        <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(20,18,36,0.95),rgba(12,11,26,0.98))] p-10 shadow-[0_0_60px_rgba(136,51,238,0.15)] sm:p-14">
          <p className="mb-4 text-center text-xs uppercase tracking-[0.55em] text-[#d6b7ff]/70">
            Domain Expansion
          </p>
          <h2 className="mx-auto max-w-4xl text-center font-[var(--font-syne)] text-5xl font-extrabold tracking-[-0.03em] text-[#f8efff] sm:text-7xl">
            Unlimited Void
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-white/65 sm:text-base">
            Painterly energy, hard light bands, and cursed gradients shape this space. Explore selected work, visuals, and research directions.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <SectionTitle label="Work" title="Projects" />
        <div className="grid gap-6 md:grid-cols-2">
          {PROJECTS.map((project) => (
            <article
              key={project.title}
              className="group rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(12,16,34,0.95),rgba(22,11,30,0.95))] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#aa66ff]/60 hover:shadow-[0_24px_70px_rgba(117,58,198,0.22)]"
            >
              <div className="mb-5 h-44 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_30%,rgba(91,174,255,0.4),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(255,73,146,0.38),transparent_50%),linear-gradient(140deg,rgba(15,21,45,0.95),rgba(27,14,42,0.95))]" />
              <h3 className="mb-3 font-[var(--font-syne)] text-2xl font-bold text-[#eef3ff]">
                {project.title}
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-white/72">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#c28cff]/35 bg-[#a457ff]/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-[#dfc6ff]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-28">
        <SectionTitle label="Gallery" title="Photos" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {PHOTOS.map((pair, index) => (
            <div
              key={`${pair[0]}-${pair[1]}`}
              className="group aspect-square overflow-hidden rounded-2xl border border-white/10"
            >
              <div
                className="relative h-full w-full scale-100 transition-transform duration-700 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${pair[0]} 0%, ${pair[1]} 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_35%),radial-gradient(circle_at_70%_70%,rgba(28,14,46,0.32),transparent_45%)]" />
                <div className="absolute bottom-3 left-3 rounded-full border border-white/35 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/80">
                  Frame {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-24">
        <SectionTitle label="Research" title="Interests" />
        <div className="grid gap-6 md:grid-cols-2">
          {RESEARCH.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-white/10 bg-[linear-gradient(170deg,rgba(13,14,28,0.98),rgba(20,10,30,0.98))] p-8"
            >
              <h3 className="mb-3 font-[var(--font-syne)] text-2xl font-bold text-[#ebebff]">{item.title}</h3>
              <p className="text-sm leading-relaxed text-white/72">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-white/10 px-6 py-14 text-center">
        <p className="text-sm tracking-[0.22em] text-[#d9c1ff]">Built with cursed energy &amp; code</p>
      </footer>
    </div>
  )
}
