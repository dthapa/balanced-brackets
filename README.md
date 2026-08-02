# Balanced Brackets

An interactive web app that teaches the stack-based balanced brackets algorithm with animated visualizations and hands-on practice challenges.

## Features

- **Learn Mode**: Step-by-step animated walkthrough of the algorithm with push/pop animations, code panel sync, and plain-English captions
- **Practice Mode**: Four challenge types — Push or Pop (drag & drop), Code Fill-In, Reconstruct Steps, and Full Trace Challenge

## Tech Stack

- React + Vite (TypeScript)
- Tailwind CSS v3
- Framer Motion (animations)
- @dnd-kit (drag and drop)
- Playwright (screenshot tests)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173/balanced-brackets/](http://localhost:5173/balanced-brackets/)

## Running Tests

First build the app, then run Playwright:

```bash
npm run build
npx playwright test
```

Screenshots are saved to `tests/screenshots/`.

## Deploying to GitHub Pages

```bash
npm run deploy
```

This runs `npm run build` then publishes the `dist/` folder to the `gh-pages` branch.

Live at: `https://<username>.github.io/balanced-brackets/`
