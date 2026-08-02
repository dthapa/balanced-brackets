# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## Build & Test

```bash
npm run build              # tsc -b && vite build — must pass with zero TS errors
npm run build && npx playwright test   # screenshots saved to tests/screenshots/
npm run deploy             # predeploy=build, publishes dist/ to gh-pages branch
```

Playwright runs `vite preview` on port 4173. App base is `/balanced-brackets/`.

## Architecture

- `src/utils/algorithm.ts` — core algorithm, step computation, preset strings
- `src/components/learn/` — Learn Mode (animated step-by-step with code panel)
- `src/components/practice/` — 4 challenges: PushOrPop (dnd-kit), CodeFillIn, ReconstructSteps (dnd-kit sortable), FullTrace
- `vite.config.ts` — `base: '/balanced-brackets/'` required for GitHub Pages

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
