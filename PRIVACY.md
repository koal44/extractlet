# Privacy

Extractlet exists for one purpose: to let you convert content from supported sites into Markdown.

There is no 3rd-party whatever, no trackers, no ads.

## What the Extension Does

When you trigger Extractlet on a page:

- It reads the current page.
- On MathJax-supported pages, the page DOM is annotated with MathML or TeX to preserve mathematical content.
- On MediaWiki sites, it sends a same-origin request to retrieve the page's associated wikitext content.
- It generates Markdown locally and displays it to you.

All processing happens entirely within your browser.

## Storage

Extractlet stores two things:

- User settings (in browser sync storage).
- Extracted page snapshots (in browser local storage).

Snapshots are stored locally so pages can be revisited during navigation or session restore. Only the 10 most recent snapshots are retained. Storage can be cleared at any time from the settings page.

## Permissions

Extractlet requests only the permissions necessary to function:

- `activeTab` and `scripting` to access and transform the page you explicitly choose to process.
- `storage` to save settings and cached snapshots.
- `notifications` to alert you if local storage reaches its quota limit.

The extension does not access pages unless you invoke it.

## Open Source

The full source code is available in this repository:  
https://github.com/koal44/extractlet
