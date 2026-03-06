# Dylan Lu — Portfolio Site

## Stack
- Next.js 16 (App Router, server components by default)
- Tailwind CSS v4 (`@import "tailwindcss"`)
- Fonts: Cormorant Garamond (display) + DM Sans (body) via `next/font/google`
- **No Tailwind arbitrary values for fonts** — use plain CSS classes in `globals.css`

## Design System

### Palette
- Cream (background): `#F5F0EB`
- Paper (alt sections): `#EDE7DF`
- Charcoal (text, dark sections): `#1A1A1A`
- Terracotta (accent): `#C75B3B`
- Terracotta light: `#D4826A`
- Sage: `#8B9A7B`
- Dust: `#B8AFA6`

### Typography
- Display: `var(--font-cormorant)` — headings, hero, project names, stats
- Body: `var(--font-dm-sans)` — everything else
- Weight 300 for display, 400/500 for body
- Section labels: 0.65rem uppercase, letter-spacing 0.25em, terracotta

### Aesthetic Direction
- **Editorial minimalism** — like a printed magazine, not a tech portfolio
- Film grain overlay via SVG feTurbulence at 3% opacity
- Scroll-reveal animations via IntersectionObserver (`components/ScrollReveal.tsx`)
- Dark sections (`#1A1A1A`) for Projects and Contact
- `mix-blend-mode: difference` on nav links (white text, inverts on light/dark)

### Hero Image Treatment
- Portrait photo with CSS cinematic filters:
  - `filter: saturate(0.6) contrast(1.2) brightness(0.85) sepia(0.15)`
  - Gradient overlay (terracotta → transparent → charcoal) via `mix-blend-mode: multiply`
  - Teal-orange split tone via `mix-blend-mode: color`
  - Radial vignette darkening edges
- Background behind portrait: `#1A1A1A`
- The photo has its background removed (transparent PNG) — the CSS background/overlays create the atmosphere

### Copy Voice
- **Research-focused, understated** — modeled on Tri Dao, Karpathy, Anthropic tone
- Describe what you do, not how you feel: "I work on X" not "I'm passionate about X"
- Technical tricolons: three precise domains or adjectives
- Embed credentials through naming (advisor, institution), never claiming ("award-winning")
- No enthusiasm markers (no exclamation points, no "excited to share")
- Compress ruthlessly — fewer words, more weight per word
- Banned: passionate, excited, leverage, disrupt, journey, vibe coder energy

### Key Files
- `app/globals.css` — all styles (no Tailwind utilities for layout)
- `app/page.tsx` — main page (async server component, fetches blog RSS)
- `app/layout.tsx` — font loading
- `components/Nav.tsx` — client component, hamburger on mobile
- `components/ScrollReveal.tsx` — client component, IntersectionObserver
- `lib/blog.ts` — fetches blog.dylanlu.com/rss/, revalidates hourly
- `public/portrait.png` — hero portrait (background removed)

### Blog Integration
- Scraped from Ghost RSS feed at `blog.dylanlu.com/rss/`
- 3 most recent posts shown, clickable links to blog
- Revalidates every hour (`{ next: { revalidate: 3600 } }`)

### Nav
- Not sticky (position: absolute), scrolls with page
- No logo — links only, right-aligned
- Mobile: hamburger → full-screen dark overlay with large Cormorant links
- Desktop: horizontal links with `mix-blend-mode: difference`
