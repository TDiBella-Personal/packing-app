# CLAUDE.md

## Project Overview

This repository contains two static web applications served via GitHub Pages:

1. **Epic Packing List** (`index.html`) — A mobile-first packing checklist app with trip templates, progress tracking, and a learning system that remembers unused items.
2. **The Morning Rundown** (`newsletter.html`) — A daily news aggregator that pulls content from Reddit, Hacker News, and weather APIs, with configurable sections and preferences.

Both apps are **standalone HTML files** with no build system, no bundler, and no package manager. All CSS and JavaScript is inline within each HTML file.

## Repository Structure

```
packing-app/
├── index.html          # Epic Packing List app (966 lines)
├── newsletter.html     # The Morning Rundown news aggregator (613 lines)
├── preferences.md      # User-editable config for the newsletter (sections, location, custom topics)
├── manifest.json       # PWA manifest (targets newsletter.html as start_url)
├── sw.js               # Service worker for offline caching (network-first for APIs, cache-first for shell)
├── icon-192.png        # PWA icon (192x192)
├── icon-512.png        # PWA icon (512x512)
└── CLAUDE.md           # This file
```

## Architecture & Key Patterns

### No Build System
- There is no `package.json`, no bundler, no transpilation. Edit the HTML files directly.
- CSS is embedded in `<style>` tags; JavaScript is embedded in `<script>` tags.
- Do **not** introduce a build system, framework, or package manager unless explicitly requested.

### Single-File Apps
- Each app is entirely self-contained in one HTML file. Keep it that way.
- When adding features, add CSS to the existing `<style>` block and JS to the existing `<script>` block.

### State Management
- **Packing app**: Uses `localStorage` for dark mode preference, trip history (`tripHistory`), and learning data (`learningData`). State is held in module-level JS variables (`currentTrip`, `tripHistory`, `learningData`, `collapsedCategories`).
- **Newsletter app**: Fetches `preferences.md` at load time to configure sections, article count, and location. Uses `localStorage` for dark mode and collapsed section state.

### PWA Support
- The newsletter is installable as a PWA via `manifest.json` and `sw.js`.
- The service worker uses **network-first** for external API calls (Reddit, HN, weather) and **cache-first with background update** (stale-while-revalidate) for app shell assets.
- Cache name: `morning-rundown-v1`. Bump the version suffix when making breaking changes to cached assets.

### External APIs Used (Newsletter)
- **Reddit JSON API**: `https://www.reddit.com/r/{subreddit}/hot.json`
- **Hacker News API**: `https://hacker-news.firebaseio.com/v0/`
- **wttr.in**: `https://wttr.in/{location}?format=j1` for weather data

### Packing App Templates
The packing app ships four built-in trip templates: `work`, `gig`, `weekend`, `vacation`. Each defines item lists per category (clothes, toiletries, electronics, band-gear, work, documents, misc). The learning system tracks items marked as unused across trips and automatically removes items unused 2+ times.

## Development Workflow

### Hosting
- Deployed via **GitHub Pages** from the `main` branch root directory.
- Live URL pattern: `https://tdibella-personal.github.io/packing-app/`

### Testing
- There are no automated tests. Verify changes by opening the HTML files in a browser.
- For the newsletter, test with and without network connectivity (service worker offline mode).
- For the packing app, test localStorage persistence by completing a trip and reloading.

### Making Changes
1. Edit the relevant HTML file directly.
2. For newsletter configuration changes, edit `preferences.md`.
3. If modifying cached assets, consider bumping `CACHE_NAME` in `sw.js`.
4. Commit and push to deploy via GitHub Pages.

## Coding Conventions

- **Vanilla JS only** — no frameworks, no libraries, no jQuery.
- **Inline everything** — CSS in `<style>`, JS in `<script>`, no external files beyond icons and manifest.
- **Mobile-first design** — max-width containers, touch-friendly tap targets, `-webkit-tap-highlight-color: transparent`.
- **Dark mode support** — both apps support dark mode via a `body.dark-mode` class with CSS overrides. Respect `prefers-color-scheme` in the newsletter; the packing app uses a manual toggle.
- **Emoji as icons** — UI icons are emoji characters, not icon libraries.
- **Gradient styling** — the primary palette uses `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` throughout. Maintain visual consistency.
- **No semicolons in CSS property names** — standard CSS conventions apply.
- **Functions use camelCase** — e.g., `renderPackingScreen()`, `toggleDarkMode()`, `loadTripHistory()`.
- **DOM rendering** — uses `innerHTML` with template literals for rendering. Re-renders the full section on state change rather than patching individual elements.

## Important Notes

- The `preferences.md` file is fetched at runtime by the newsletter app. Its markdown format is parsed by the app — changes to its structure may break parsing.
- Trip history in the packing app is capped at 10 entries (oldest removed first).
- The packing app's review screen inverts the packed/unpacked semantics — items shown as "packed" in review means they were **not** used.
