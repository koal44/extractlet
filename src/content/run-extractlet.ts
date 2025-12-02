import browser from 'webextension-polyfill';
import { repr } from '../utils/logging';
import { detectSite, injectPageNorm } from '../extractlet';
import type { XletSnapshot, XletSnapshotMsg, UnsupportedPageMsg } from '../extractlet';

void (async () => {
  const sourceDoc = document;

  // detect site
  const site = detectSite(sourceDoc);
  if (!site) {
    await browser.runtime.sendMessage<UnsupportedPageMsg>({
      type: 'unsupported-page',
      srcUrl: location.href,
    });
    return;
  }

  // inject the run-normalize script and wait for it to load
  // MathJax norming must run before extraction
  await injectPageNorm(site);

  // create message
  const snapshot: XletSnapshot = {
    site,
    timestamp: Date.now(),
    srcHtml: sourceDoc.documentElement.outerHTML,
    srcUrl: sourceDoc.location.href,
  };

  // send message
  try {
    await browser.runtime.sendMessage<XletSnapshotMsg>({
      type: 'xlet-snapshot',
      snapshot,
    });
  } catch (err) {
    console.error(`[xlet:msg] Error sending ${site} message: ${repr(err)}`);
    alert(`Error sending ${site} message. Check console for details.`);
  }
})();
