# Privacy

Extractlet exists for one purpose: to let you convert content from supported sites into Markdown.

There is no 3rd-party whatever, no trackers, no ads.

## What the Extension Does

When you trigger Extractlet on a page:

- It reads the current page in order to convert it to Markdown.
- On MediaWiki sites, it sends a same-site request to fetch the page's associated wikitext because that content is not included in the rendered HTML.
- It generates Markdown locally and displays it to you.

All processing happens in your browser.

## Storage

Extractlet stores two things:

- User settings (in browser sync storage).
- Extracted page snapshots (in browser local storage).

Snapshots are stored locally so pages can be revisited during navigation or session restore. Only the 10 most recent snapshots are kept. Storage can be cleared at any time from the settings page.

## Permissions

Extractlet requests only the permissions necessary to function:

- `activeTab` and `scripting` to access and transform the page you explicitly choose to process.
- `storage` to save settings and cached snapshots.
- `notifications` to alert you if local storage reaches its quota limit.
- `<all_urls>` so the extension can operate on MediaWiki and Stack Exchange installations, which may exist on many different domains.

The extension does not access pages unless you invoke it.

## Open Source

The full source code is available in this repository (https://github.com/koal44/extractlet).

If something looks wrong, open an issue.
