# Reverb

A genre-reactive music player. Pick a track and the whole interface shifts its colours,
motion and audio visualiser to match the genre. Connect Spotify to browse your own top
tracks and search the full catalogue, or explore the built-in demo where every track is
synthesised live in the browser.

**Live demo:** https://curtisdablorh.github.io/reverb/ ·
**Storybook:** https://curtisdablorh.github.io/reverb/storybook/

## Features

- **Genre-reactive UI** – the backdrop, cover art, visualiser and accent colours crossfade per genre, and the backdrop pulses on the beat.
- **Live audio visualiser (D3)** – radial bars, layered waves or orbiting particles driven by a Web Audio `AnalyserNode`. Full-screen mode lets you switch styles.
- **Generative demo audio** – a Web Audio step sequencer voices drums, bass, pads and leads per genre, seeded so every track has its own pattern.
- **Spotify integration** – Authorization Code + PKCE entirely in the browser (no backend, no secret). Top tracks, top artists and search via RTK Query, with automatic token refresh and a seamless fallback to demo data.
- **Playlists** – create, rename, delete, drag-to-reorder, plus genre-aware suggestions. Liked songs and recently played. Everything persists to `localStorage`.
- **Listening stats (D3)** – interactive genre donut that filters the whole dashboard, an artist force graph you can drag, a calendar heatmap and a 24-hour radial chart.
- **Power-user controls** – command palette (<kbd>Ctrl</kbd>+<kbd>K</kbd>), keyboard shortcuts for everything (<kbd>?</kbd> to list them), queue sheet, shuffle and repeat modes.
- **Polished details** – 3D tilt cards, shared-layout animations, light and dark themes, reduced-motion support, mobile navigation.

## Tech stack

| Area      | Tools                                                                     |
| --------- | ------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, static export), React 19, TypeScript              |
| Styling   | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com) on Base UI, Motion    |
| State     | Redux Toolkit, RTK Query, listener middleware for persistence             |
| Data viz  | D3 v7                                                                     |
| Testing   | Jest + React Testing Library (unit), Playwright (e2e, desktop and mobile) |
| Tooling   | Storybook 10, ESLint, Prettier, Husky + lint-staged                       |
| CI/CD     | GitHub Actions: lint, typecheck, test, e2e, then deploy to GitHub Pages   |

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

### Connecting Spotify (optional)

1. Create an app at the [Spotify developer dashboard](https://developer.spotify.com/dashboard).
2. Add redirect URIs `http://127.0.0.1:3000/callback/` and `https://<you>.github.io/reverb/callback/`.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`.
4. Open the app at `http://127.0.0.1:3000` (Spotify doesn't accept `localhost` redirects).

For the deployed site, add the client ID as a repository secret named `SPOTIFY_CLIENT_ID`.

> Spotify restricts new apps: audio features are unavailable and apps in development mode
> only allow allow-listed users. Reverb estimates tempo and energy from the genre, plays
> 30-second previews where Spotify provides them, and otherwise falls back to a
> genre-matched generative loop.

## Scripts

| Command                              | Description                                   |
| ------------------------------------ | --------------------------------------------- |
| `npm run dev`                        | Start the dev server                          |
| `npm run build`                      | Static export to `out/`                       |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript                           |
| `npm test` / `npm run test:coverage` | Jest unit tests                               |
| `npm run e2e`                        | Playwright tests against the production build |
| `npm run storybook`                  | Component workshop on port 6006               |

Husky runs lint-staged on commit and typecheck plus unit tests on push.

## Project structure

```
src/
  app/            routes (home, search, library, playlist, stats, OAuth callback)
  components/
    charts/       D3 dashboard components
    player/       player bar, controls, queue, full-screen view
    visualizer/   D3 visualiser, spectrum, backdrop, generative cover art
    tracks/       track rows, cards, like and actions menu
    ui/           shadcn/ui primitives
  hooks/          playback controller, keyboard shortcuts
  lib/            audio engine, Spotify auth and mappers, stats, demo catalog
  store/          Redux slices, RTK Query API, persistence
e2e/              Playwright specs
```
