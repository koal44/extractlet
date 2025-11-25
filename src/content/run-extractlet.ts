import browser from 'webextension-polyfill';
import { repr } from '../utils/logging';
import { detectSite, injectPageNorm, type XletSnapshot } from '../extractlet';

void (async () => {
  const sourceDoc = document;

  // detect site
  const site = detectSite(sourceDoc);
  if (!site) {
    alert('Extractlet doesn\'t recognize this page. Sorry!');
    return;
  }

  // inject the run-normalize script and wait for it to load
  // MathJax norming must run before extraction
  await injectPageNorm(site);

  // create message
  const msg: XletSnapshot = {
    site,
    timestamp: Date.now(),
    srcHtml: sourceDoc.documentElement.outerHTML,
    srcUrl: sourceDoc.location.href,
  };

  // send message
  try {
    await browser.runtime.sendMessage<XletSnapshot>(msg);
  } catch (err) {
    console.error(`[xlet:msg] Error sending ${site} message: ${repr(err)}`);
    alert(`Error sending ${site} message. Check console for details.`);
  }
})();
