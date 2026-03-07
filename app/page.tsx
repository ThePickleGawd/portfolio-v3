import Nav from '@/components/Nav'
import ScrollReveal from '@/components/ScrollReveal'
import RoleCycler from '@/components/RoleCycler'
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
    title: 'Context Rot Bench: Measuring User Constraint Adherence in Long-Horizon Agents',
    authors: ['Dylan Lu*', 'Saaket Agashe', 'Xin Eric Wang'],
    venue: 'TBD',
    year: '2026',
    status: 'in progress',
  },
  {
    title: 'EmToM: Embodied Agent Theory of Mind Evaluation Benchmark',
    authors: ['Gurusha Juneja', 'Dylan Lu', 'Saaket Agashe', 'Parth Diwane', 'Xin Eric Wang'],
    venue: 'TBD',
    year: '2026',
    status: 'in progress',
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
          <RoleCycler />
          <p className="hero-desc">
            I research AI agents, long-horizon reasoning,
            multi-agent collaboration, and reinforcement learning.
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
              src="/portrait.webp"
              alt="Dylan Lu"
              className="hero-portrait"
            />
            <div className="hero-portrait-overlay" />
            <div className="hero-portrait-tint" />
            <div className="hero-portrait-glow" />
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
            Things I like
            <br />
            to work on.
          </h2>
        </ScrollReveal>
        <div className="about-grid">
          <ScrollReveal>
            <div className="about-text">
              <p>
                Undergraduate at UC Santa Barbara{' '}
                (<a href="https://ccs.ucsb.edu/majors/computing" target="_blank" rel="noopener noreferrer" className="about-link">College of Creative Studies</a>),
                working with the{' '}
                <a href="http://nlp.cs.ucsb.edu/" target="_blank" rel="noopener noreferrer" className="about-link">UCSB NLP Group</a> under{' '}
                <a href="https://eric-xw.github.io/" target="_blank" rel="noopener noreferrer" className="about-link">Xin Eric Wang</a>.
                I work on AI agents, long-horizon planning, and
                multi-agent collaboration.
              </p>
              <p>
                I also won the grand prize at{' '}
                <a href="https://calhacks.io/" target="_blank" rel="noopener noreferrer" className="about-link">Cal Hacks</a>,
                the world&rsquo;s largest collegiate hackathon.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="about-stats">
              {[
                ['1st Place', 'Grand Prize · Cal Hacks'],
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
            Projects and
            <br />
            hackathons.
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
              </a>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Publications ── */}
      <section
        id="publications"
        className="section bg-alt"
      >
        <span className="section-number">04</span>
        <ScrollReveal>
          <div className="section-label">Publications</div>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="section-title">
            Research I&rsquo;ve
            <br />
            worked on.
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
                    <div className="pub-authors">
                      {pub.authors.map((author, i) => (
                        <span key={author}>
                          {author.startsWith('Dylan Lu') ? (
                            <strong>{author}</strong>
                          ) : (
                            author
                          )}
                          {i < pub.authors.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
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
          <h2 className="section-title">From my blog.</h2>
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
