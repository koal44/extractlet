# Privacy

Extractlet exists for one purpose: to let you convert content from supported sites into Markdown.

No trackers, no ads, no analytics, nor any collection or sharing of your data.

## What the Extension Does

When you trigger Extractlet on a page:

- It reads the current page.
- On MathJax-supported pages, the page DOM may be annotated with MathML or TeX to preserve mathematical content.
- On MediaWiki sites, it may send a same-origin request to retrieve the page's associated wikitext content.
- It generates Markdown locally and displays it to you.

All processing happens entirely within your browser.

## Storage

Extractlet stores two things:

1) User settings (in browser sync storage).
2) Extracted page snapshots (in browser local storage), if enabled.
   Snapshot storage supports navigation and session restore. Only the 10 most recent snapshots are retained and can be cleared from the settings page.

## Permissions

Extractlet requests only the permissions necessary to function:

- `activeTab` and `scripting` to access and transform the page you explicitly choose to process.
- `storage` to save settings and, if enabled, to cache snapshots.
- `notifications` to alert you if local storage reaches its quota limit.

The extension does not access pages unless you invoke it.

## Configurable Settings

Fetching missing content and local snapshot storage can be disabled from the general options settings.

## Open Source

The full source code is available in this repository:  
https://github.com/koal44/extractlet
