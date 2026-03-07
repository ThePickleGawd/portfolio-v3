import Nav from '@/components/Nav'
import ScrollReveal from '@/components/ScrollReveal'
import { getRecentPosts } from '@/lib/blog'

/* ────────────────────────────────────────────────
 *  Data
 * ──────────────────────────────────────────────── */

const experience = [
  {
    date: 'Oct 2025 \u2014',
    role: 'Undergraduate Researcher \u2014 NLP',
    org: 'UCSB NLP Group \u00b7 Advisor: Xin Eric Wang',
    desc: 'Research in multimodal and agentic AI — embodied agents, language grounding, and reinforcement learning.',
    tag: 'Research',
    href: 'https://nlp.cs.ucsb.edu/',
  },
  {
    date: 'Jun \u2014 Sep 2025',
    role: 'ML Engineer Intern',
    org: 'TetraMem \u00b7 AI Chip Startup',
    desc: 'Optimized Rust-based ML compiler: 16x faster depthwise convolutions, reduced compile time from 40 min to 2 sec. Built CI/CD pipeline and custom Halide C++ autoscheduler.',
    tag: 'Industry',
    href: 'https://www.tetramem.com/',
  },
  {
    date: 'May \u2014 Aug 2022',
    role: 'Software Engineering Intern',
    org: 'Atmosic Technologies \u00b7 IoT Chip Startup',
    desc: 'Developed C-based QA pipeline accelerating IoT testing 3\u00d7. Built Python benchmarking tools for energy efficiency profiling.',
    tag: 'Industry',
    href: 'https://atmosic.com/',
  },
]

const projects = [
  {
    name: 'FaceTimeOS',
    blurb:
      'Computer-use AI agent enabling remote Mac control via FaceTime and iMessage with real-time speech interaction. Won 1st place among 695 projects at the world\u2019s largest collegiate hackathon (3,000+ participants).',
    tags: ['Flask', 'React', 'Electron', 'Speech AI'],
    award: 'Grand Prize \u2014 Cal Hacks 12.0',
    href: 'https://github.com/ThePickleGawd/FaceTimeOS',
    featured: true,
  },
  {
    name: 'AI Agents for Geometry Dash',
    blurb:
      'Mixture-of-Experts DQN agent achieving 90% human-level completion with a real-time game interaction pipeline.',
    tags: ['MoE DQN', 'OpenAI Gym', 'C++'],
    eyebrow: 'Reinforcement Learning',
    href: 'https://github.com/ThePickleGawd/geometry-dash-ai',
  },
  {
    name: 'RAG Voice AI Agents',
    blurb:
      'On-device voice agent with <1 s speech latency and +12 point answer quality improvement via GraphRAG retrieval.',
    tags: ['Voice LLM', 'LangChain', 'GraphRAG'],
    eyebrow: 'Voice AI',
    href: 'https://github.com/ThePickleGawd/realtime-speech-agents',
  },
  {
    name: 'Baddy Buddy AI Coach',
    blurb:
      'Badminton coaching system with 94% tracking precision using ViT models, deployed to 15+ athletes for real-time strategy insights.',
    tags: ['ViT', 'Next.js', 'Flask', 'Claude 3.5'],
    award: '1st Place Entertainment \u2014 SBHacks',
    href: 'https://github.com/ThePickleGawd',
  },
  {
    name: 'SLAM-TT',
    blurb:
      'Video-to-3D scene reconstruction of ping pong games using SLAM. View real matches from any angle in 3D space.',
    tags: ['PyTorch', 'OpenCV', 'SLAM'],
    eyebrow: 'Computer Vision + 3D',
    href: 'https://github.com/ThePickleGawd',
  },
]

const publications = [
  {
    title: 'Placeholder \u2014 your publications will go here',
    authors: 'Dylan Lu, et al.',
    venue: 'Venue TBD',
    year: '2026',
    status: 'coming soon',
  },
]


/* ────────────────────────────────────────────────
 *  Page
 * ──────────────────────────────────────────────── */

export default async function Home() {
  const recentPosts = await getRecentPosts(3)
  return (
    <main>
      {/* ── Nav ── */}
      <Nav />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">
            UCSB &middot; Undergrad Researcher
          </p>
          <h1 className="hero-name">
            Dylan Lu.
          </h1>
          <p className="hero-desc">
            I study how language models become{' '}
            <em>agents</em> &mdash; systems that reason,
            plan, and act in both virtual and physical environments.
          </p>
          <div className="hero-meta">
            {[
              ['Affiliation', 'UC Santa Barbara'],
              ['Program', 'CCS Computer Science'],
              ['Focus', 'NLP, RL, Agents'],
            ].map(([label, value]) => (
              <div key={label} className="hero-meta-item">
                <span className="hero-meta-label">{label}</span>
                <span className="hero-meta-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="hero-scroll">
            <div className="hero-scroll-line" />
            <span className="hero-scroll-text">Scroll to explore</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-portrait-wrap">
            <img
              src="/portrait.png"
              alt="Dylan Lu"
              className="hero-portrait"
            />
            <div className="hero-portrait-overlay" />
            <div className="hero-portrait-dof" />
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="about section">
        <span className="section-number">01</span>
        <ScrollReveal>
          <div className="section-label">About</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="section-title">
            Language, agents,
            <br />
            and the physical world.
          </h2>
        </ScrollReveal>
        <div className="about-grid">
          <ScrollReveal>
            <div className="about-text">
              <p>
                Undergraduate at UC Santa Barbara (College of Creative
                Studies), working with the UCSB NLP Group under Xin Eric
                Wang. My research interests span natural language
                processing, computer vision, and reinforcement
                learning &mdash; with an emphasis on multimodal and
                agentic AI.
              </p>
              <p>
                Previously ML compiler optimization at TetraMem and
                software engineering at Atmosic Technologies. I also build
                systems outside the lab and write about them.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="about-stats">
              {[
                ['1st', 'Grand Prize · Cal Hacks 12'],
                ['4.0', 'GPA'],
              ].map(([num, label]) => (
                <div key={label} className="stat">
                  <div className="stat-number">{num}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className="section">
        <span className="section-number">02</span>
        <ScrollReveal>
          <div className="section-label">Experience</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="section-title">
            Research and
            <br />
            industry.
          </h2>
        </ScrollReveal>
        <div style={{ marginTop: '1rem' }}>
          {experience.map((exp) => (
            <ScrollReveal key={exp.role}>
              <a
                href={exp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="exp-item"
              >
                <span className="exp-date">{exp.date}</span>
                <div>
                  <div className="exp-role">{exp.role}</div>
                  <div className="exp-org">{exp.org}</div>
                  <div className="exp-desc">{exp.desc}</div>
                </div>
                <span className="exp-tag">{exp.tag}</span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Projects ── */}
      <section id="work" className="projects-section section">
        <span className="section-number">03</span>
        <ScrollReveal>
          <div className="section-label">Selected Work</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="section-title">
            Systems and
            <br />
            artifacts.
          </h2>
        </ScrollReveal>
        <div className="project-grid">
          {projects.map((project) => (
            <ScrollReveal key={project.name}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`project-card${
                  project.featured ? ' featured' : ''
                }`}
              >
                <div>
                  {project.award && (
                    <div className="project-award">
                      &#9733; {project.award}
                    </div>
                  )}
                  {project.eyebrow && (
                    <div className="project-eyebrow">{project.eyebrow}</div>
                  )}
                  <div className="project-name">{project.name}</div>
                  <p className="project-blurb">{project.blurb}</p>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {project.featured && (
                  <div className="project-visual">
                    <span
                      style={{
                        fontSize: '3rem',
                        opacity: 0.6,
                        color: '#F5F0EB',
                      }}
                    >
                      &#128187;
                    </span>
                  </div>
                )}
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Publications ── */}
      <section
        id="publications"
        className="section"
        style={{ background: '#EDE7DF' }}
      >
        <span className="section-number">04</span>
        <ScrollReveal>
          <div className="section-label">Publications</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="section-title">
            Research I&rsquo;ve
            <br />
            contributed to.
          </h2>
        </ScrollReveal>
        <div style={{ maxWidth: 700 }}>
          {publications.map((pub) => (
            <ScrollReveal key={pub.title}>
              <div className="pub-item">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1.5rem',
                  }}
                >
                  <div>
                    <div className="pub-title">{pub.title}</div>
                    <div className="pub-authors">{pub.authors}</div>
                    <div className="pub-venue">
                      {pub.venue}, {pub.year}
                    </div>
                  </div>
                  {pub.status && (
                    <span className="pub-status">{pub.status}</span>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Blog ── */}
      <section className="section">
        <span className="section-number">05</span>
        <ScrollReveal>
          <div className="section-label">Writing</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="section-title">From the blog.</h2>
        </ScrollReveal>
        <div style={{ maxWidth: 700 }}>
          {recentPosts.map((post) => (
            <ScrollReveal key={post.title}>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="writing-item"
              >
                <span className="writing-title">{post.title}</span>
                <span className="writing-date">{post.date}</span>
              </a>
            </ScrollReveal>
          ))}
          <ScrollReveal>
            <a
              href="https://blog.dylanlu.com"
              target="_blank"
              rel="noopener noreferrer"
              className="blog-link"
            >
              Read more on the blog <span aria-hidden="true">&rarr;</span>
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="contact-section">
        <div className="section-label">Contact</div>
        <h2 className="contact-heading">
          Interested in
          <br />
          <em>collaborating</em>?
        </h2>
        <div className="contact-links">
          {[
            ['LinkedIn', 'https://www.linkedin.com/in/dylanelu/'],
            ['GitHub', 'https://github.com/ThePickleGawd'],
            ['Blog', 'https://blog.dylanlu.com'],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <span className="footer-text">&copy; 2026 Dylan Lu</span>
        <span className="footer-text">Designed with vibes</span>
      </footer>
    </main>
  )
}
