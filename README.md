# <img src="https://raw.githubusercontent.com/koal44/extractlet/3a8e0b01f/public/icons/icon-full.svg" width="40" align="top" /> Extractlet

Share GitHub, Stack Exchange, and wiki pages with your AI.

If you use these sites and want to discuss what you're looking at, click the extension, copy the result, and paste it into the conversation. This is a bespoke HTML-to-Markdown tool, built to preserve math, code, and other technical content — your LLM will dig it.

## Demo


## Supported Sites

- **GitHub:** issues, PRs, discussions, repos, code views, commits, history, checks, actions, search, owner/org, and wiki pages
- **Stack Exchange:** Stack Overflow, Math StackExchange, Super User, Server Fault, and other Stack Exchange Q&A sites
- **MediaWiki:** Wikipedia and other MediaWiki-based sites

## Install

### Chrome Web Store · Firefox Add-ons

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/ce0aac88/src/chrome/chrome.svg" alt="Chrome Web Store" width="40"> ](https://chromewebstore.google.com/detail/extractlet/cjkobbhfagjbjjllohdjabjedabjedfo)
[<img src="https://raw.githubusercontent.com/alrra/browser-logos/ce0aac88/src/firefox/firefox.svg" alt="Firefox Add-ons" width="40">](https://addons.mozilla.org/en-US/firefox/addon/extractlet/)

### From source

1. Clone the repo.
2. Install deps and build:
   ```bash
   npm install
   npm run build
   ```
3. Load the unpacked extension from `dist/chrome` (Chrome/Edge) or `dist/firefox` (Firefox).

## Status

Extractlet is still under development. If a page is missing or looks ick, please open an issue.