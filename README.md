# AppHub ✳

A mobile-first home for 13 independent products by Empyrios Studio. Each app has its own roadmap, and this hub provides a convenient way to discover and launch projects without coupling their codebases.

## Features

- Search across app names, descriptions and features, with `/` shortcut.
- Filter by project status or category.
- Favourites, saved on this device only.
- Dark and light appearance with saved preference.
- Mobile-first cards, accessible controls and zero runtime dependencies.
- Installable offline-capable Progressive Web App (PWA).
- Validated catalog, tested filters and GitHub Actions CI.

## Run locally

From the repo root:

```bash
python3 -m http.server 8000 --directory site
```

Then open `http://localhost:8000`.

Run automated checks:

```bash
node --test tests/*.test.mjs
node --check site/app.mjs
node --check site/sw.js
```

## Publish with GitHub Pages

1. Create a **public** repository named `apphub` in the `Empyrios` account.
2. Commit the contents of this project to the root of its `main` branch.
3. In the repository, open **Settings → Pages** and set source to **GitHub Actions**.
4. The included workflow tests and publishes only the `site/` folder.
5. Visit the URL shown by GitHub. If the repo stays named `apphub`, the normal GitHub Pages project URL is `https://empyrios.github.io/apphub/`.

The URL is an expected address, not a verified live deployment.

## Data and privacy

The hub stores only favourite app IDs and the appearance theme in `localStorage` under `empyrios-apphub-v1`. It does not store account data or read another app's data. The hub and app cards are public and contain no personal or secret data.

**Current publication status:** Dayforge and DuoQuest have code in GitHub, but their public website availability has not been verified. The 'Try website' links are provisional. Other projects are marked Planned or In progress without false launch buttons.

## Update the app list

Edit `site/catalog.mjs`. Keep unique IDs, unique numeric priorities and HTTPS links. Built entries may have a website URL, other statuses must not. Run tests and commit.

## Project boundaries

The AppHub repository is strictly a launcher. Dayforge, DuoQuest, JobPilot and all future apps should live in separate repositories with independent deployment pipelines. Do not migrate user content by assuming different domains share browser storage. See `MIGRATION.md`.

## No platform lock-in

AppHub runs as static HTML, CSS and JavaScript with no backend or ChatGPT dependency. Google Fonts are optional and have system-font fallbacks. It can also be deployed to Cloudflare Pages, Netlify or any static host.
