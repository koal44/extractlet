# Extractlet

Browser extension that extracts GitHub, Stack Exchange, and MediaWiki pages into normalized Markdown.

## Demo

https://github.com/user-attachments/assets/8b9e1daa-2be6-4b34-914e-67631d8fadf1

## Status

Under active development and not yet published to browser extension stores.

## Supported Sites

- GitHub (issues, pull requests, discussions)
- Stack Exchange (Stack Overflow, Math.SE, etc.)
- MediaWiki (e.g., Wikipedia)

## Installation

1. Clone the repo.
2. Install deps and build:
   ```bash
   npm install
   npm run build
   ```
3. Load the unpacked extension from `dist/chrome` (Chrome/Edge) or `dist/firefox` (Firefox).

## Feedback

If extraction output seems off, please open an issue.
