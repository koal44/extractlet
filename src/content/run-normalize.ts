import { getSite, normalizeDoc } from '../normalize';
import { repr } from '../utils/logging';

// Page-side bootstrap: used when this module is loaded via <script src="...normalize.js">
(function runPageNorm() {
  try {
    const doc = document;
    const target = doc.documentElement as HTMLElement | null;
    if (!target) return;

    const attr = getSite(target);
    if (!attr) return;

    normalizeDoc(attr);
  } catch (err) {
    console.error(`[xlet:norm] normalize bootstrap failed: ${repr(err)}`);
  }
})();
