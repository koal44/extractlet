
<!-- XLET-BEGIN -->

<!-- Extractlet -->
<!-- GitHub - koal44/extractlet: Browser extension that extracts GitHub, Stack Exchange, and MediaWiki pages into normalized Markdown · GitHub -->
<!-- https://github.com/koal44/extractlet -->

[koal44](https://github.com/koal44) / **[extractlet](https://github.com/koal44/extractlet)** Public

## About

Browser extension that extracts GitHub, Stack Exchange, and MediaWiki pages into normalized Markdown

- 0 stars
- 0 watching
- 0 forks

## Releases

1 tags

## Packages 0

No packages published

## Contributors 1

- koal44

## Languages

- TypeScript 92.6%
- HTML 4.5%
- CSS 1.7%
- JavaScript 1.2%

## Ref info

- Ref: `main`
- 1 Branch
- 1 Tag

## Latest commit

koal44

refactor: decouple htmlToElementK from DOMPurify

[da5920d](https://github.com/koal44/extractlet/commit/da5920d89a9ef76347ecd83e781a088432557184) · 2026-03-08 (19 hours ago)

## History

[105 Commits](https://github.com/koal44/extractlet/commits/main/)

## Folders and files

- `.vscode/` (break up utils and reorganize; 2025-11-25 (3 months ago))
- `media/store/` (chore: add Chrome Web Store promo images; 2026-02-28 (10 days ago))
- `public/` (refactor: migrate wiki rendering to xlet-page; 2026-03-08 (23 hours ago))
- `scripts/` (refactor: decouple htmlToElementK from DOMPurify; 2026-03-08 (19 hours ago))
- `src/` (refactor: decouple htmlToElementK from DOMPurify; 2026-03-08 (19 hours ago))
- `test/` (refactor: decouple htmlToElementK from DOMPurify; 2026-03-08 (19 hours ago))
- `vendor/_patches/` (add settings ui, mathjax support, and dom normalization; 2025-11-24 (3 months ago))
- `.env.example` (break up utils and reorganize; 2025-11-25 (3 months ago))
- `.gitattributes` (chore: prevent HTML fixtures from skewing GitHub language stats; 2026-02-25 (12 days ago))
- `.gitignore` (test(hub): add full markdown fixture specs for PRs; 2026-03-03 (6 days ago))
- `CHANGELOG.md` (emit dist/chrome and dist/firefox; 2026-02-20 (17 days ago))
- `PRIVACY.md` (fix AMO innerHTML lint warning with DOMPurify; 2026-02-27 (11 days ago))
- `README.md` (docs: add privacy policy; update readme; 2026-02-25 (12 days ago))
- `eslint.config.mjs` (feat(settings): add clear cache and reset defaults controls; 2026-03-06 (4 days ago))
- `global.d.ts` (expand TS/ESLint rules and add typing utils to tame the noise; 2025-10-29 (4 months ago))
- `package-lock.json` (fix AMO innerHTML lint warning with DOMPurify; 2026-02-27 (11 days ago))
- `package.json` (fix AMO innerHTML lint warning with DOMPurify; 2026-02-27 (11 days ago))
- `tsconfig.json` (emit dist/chrome and dist/firefox; 2026-02-20 (17 days ago))
- `vendor-lock.json` (add settings ui, mathjax support, and dom normalization; 2025-11-24 (3 months ago))
- `vitest.config.ts` (unify link/image md cases; refine redundant and generic label handlin…; 2025-11-09 (4 months ago))

## Resources

- **README**

# Extractlet

Browser extension that extracts GitHub, Stack Exchange, and MediaWiki pages into normalized Markdown.

## Demo

▸ demo.mp4

## Status

Under active development and not yet published to browser extension stores.

## Supported Sites

- GitHub (issues, pull requests, discussions)
- Stack Exchange (Stack Overflow, Math.SE, etc.)
- MediaWiki (e.g., Wikipedia)

## Installation

1. Clone the repo.
2. Install deps and build:
   ```shell
   npm install
   npm run build
   ```
3. Load the unpacked extension from `dist/chrome` (Chrome/Edge) or `dist/firefox` (Firefox).

## Feedback

If extraction output seems off, please open an issue.

<!-- XLET-END -->

