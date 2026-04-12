import Nav from '@/components/Nav'
import ScrollReveal from '@/components/ScrollReveal'
import RoleCycler from '@/components/RoleCycler'
import HeroPortrait from '@/components/HeroPortrait'
import { getRecentPosts } from '@/lib/blog'

/* ────────────────────────────────────────────────
 *  Data
 * ──────────────────────────────────────────────── */

const publications = [
  {
    title: 'Context Rot Bench: Measuring User Constraint Adherence in Long-Horizon Agents',
    authors: ['Dylan Lu*', 'Surya Gunukula*', 'Saaket Agashe', 'Tengxiao Liu', 'Kexun Zhang', 'Xin Eric Wang'],
    venue: 'TBD',
    year: '2026',
    thumbnail: '/pub-default.jpeg',
    links: [],
  },
  {
    title: 'EmToM: Embodied Agent Theory of Mind Evaluation Benchmark',
    authors: ['Gurusha Juneja', 'Dylan Lu', 'Saaket Agashe', 'Parth Diwane', 'Edward Gunn', 'Jayanth Srinivasa', 'Gaowen Liu', 'William Yang Wang', 'Yali Du', 'Xin Eric Wang'],
    venue: 'TBD',
    year: '2026',
    thumbnail: 'https://emtom-bench.github.io/static/images/teaser.png',
    href: 'https://emtom-bench.github.io/',
    links: [
      { label: 'Code', url: 'https://github.com/ThePickleGawd/Partnr-EmToM' },
      { label: 'Website', url: 'https://emtom-bench.github.io/' },
    ],
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
          <div className="hero-bio">
            <p>
              I am an undergraduate at UC Santa Barbara advised by{' '}
              <a href="https://eric-xw.github.io/" target="_blank" rel="noopener noreferrer" className="hero-link">Xin Eric Wang</a> in the{' '}
              <a href="http://nlp.cs.ucsb.edu/" target="_blank" rel="noopener noreferrer" className="hero-link">UCSB NLP Group</a>.
            </p>
            <p>
              I won 1st place grand prize at{' '}
              <a href="https://devpost.com/software/facetime-macos-ai-agent" target="_blank" rel="noopener noreferrer" className="hero-link">Cal Hacks</a>,
              and will be joining{' '}
              <a href="https://www.nvidia.com/en-us/ai-data-science/foundation-models/nemotron/" target="_blank" rel="noopener noreferrer" className="hero-link">NVIDIA</a> on the post-training team.
            </p>
            <div className="hero-socials">
              <a href="https://github.com/ThePickleGawd" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/dylanelu/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <span className="hero-social-icon disabled" aria-label="Google Scholar">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 100 14 7 7 0 000-14z"/></svg>
              </span>
            </div>
          </div>
          <div className="hero-scroll">
            <div className="hero-scroll-line" />
            <span className="hero-scroll-text">Scroll to explore</span>
          </div>
        </div>

        <div className="hero-right">
          <HeroPortrait />
        </div>
      </section>

      {/* ── Publications ── */}
      <section
        id="publications"
        className="section bg-alt"
      >
        <span className="section-number">01</span>
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
        <div className="pub-list">
          {publications.map((pub) => {
            const hasLinks = pub.links && pub.links.length > 0
            const Tag = pub.href && !hasLinks ? 'a' : 'div'
            const linkProps = pub.href && !hasLinks ? { href: pub.href, target: '_blank', rel: 'noopener noreferrer' } : {}
            return (
            <ScrollReveal key={pub.title}>
              <Tag className="pub-item" {...linkProps}>
                {pub.thumbnail && (
                  <div className="pub-thumb">
                    <img src={pub.thumbnail} alt="" />
                  </div>
                )}
                <div className="pub-info">
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
                  <div className="pub-meta">
                    <span className="pub-venue">
                      {pub.venue}, {pub.year}
                    </span>
                  </div>
                  {pub.links && pub.links.length > 0 && (
                    <div className="pub-links">
                      {pub.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pub-link-btn"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </Tag>
            </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* ── Blog ── */}
      <section className="section">
        <span className="section-number">02</span>
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
            ['Resume', 'https://flowcv.com/resume/wvn6su5ue1'],
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
