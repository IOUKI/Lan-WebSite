# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production (static export to dist/)
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Architecture

This is a **Next.js App Router** personal portfolio/tool website, statically exported for GitHub Pages deployment.

**Key config:**
- `next.config.mjs`: `output: 'export'`, `distDir: 'dist'`, `basePath: '/my-github-pages'` (production only), images unoptimized
- Dark mode is class-based (Tailwind), theme persisted to localStorage
- Path alias `@/*` maps to the project root

**Routing structure (`app/`):**
- `/` → redirects to `/profile`
- `/profile` — GitHub profile/repo display, social links
- `/profile/about` — About page
- `/games` — Games hub
- `/games/ticTacToe` — Tic-Tac-Toe variant with limited markers
- `/kendamaTools` — Kendama utilities hub
- `/kendamaTools/blitz` — Blitz timer
- `/kendamaTools/counter` — Counter tool
- `/kendamaTools/2025SouthJam`, `/kendamaTools/2026TKO` — Event-specific tools
- `/map` — Map page

Each section (`profile/`, `games/`, `kendamaTools/`) has its own `layout.tsx` with shared navigation.

**Components (`components/`):**
- `ThemeSwitcher.tsx` — dark/light/system toggle with localStorage
- `ParticleBackground.tsx` — animated canvas particle effect
- `FloatingGlow.tsx` — glow animation
- `Blitz.tsx` — blitz timer logic
- `PrelineScript.tsx` — initializes Preline UI (must be included in root layout)
- `ticTacToe/SinglePlayer.tsx`, `TwoPlayer.tsx` — game variants

**Tech stack:** Next.js 16, React 18, TypeScript 5, Tailwind CSS 3 (class dark mode + Preline plugin), Framer Motion, Bootstrap Icons, Preline UI components

**Deployment:** GitHub Actions (`.github/workflows/nextjs.yml`) builds and deploys to GitHub Pages on push to `main`.
