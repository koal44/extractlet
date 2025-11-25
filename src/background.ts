import browser from 'webextension-polyfill';
import { isXletSnapshot } from './extractlet';
import { tryStoreSnapshot } from './snapshot-store';
import { repr } from './utils/logging';
import { toKebabCase } from './utils/strings';

browser.action.onClicked.addListener((tab) => {
  // when the user clicks the extension icon, run the extractlet script in the current tab
  void (async () => {
    if (tab.id === undefined) return;
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['browser-polyfill.js', 'run-extractlet.js'],
      });
    } catch (err) {
      console.error(`[xlet:browser-action] Error executing content script for tab ${tab.id}: ${repr(err)}`);
    }
  })();
});

browser.runtime.onMessage.addListener(async (msg: unknown, sender: browser.Runtime.MessageSender) => {
  if (!isXletSnapshot(msg)) {
    console.error(`[xlet:browser-onMessage] Received unknown message: ${repr(msg)}`);
    return;
  }

  // store the snapshot (the loader will retrieve it when opening the page)
  const uuid = crypto.randomUUID();
  const ok = await tryStoreSnapshot(uuid, msg);
  if (!ok) return;

  // open the snapshot page in a new tab
  const url = `${toKebabCase(msg.site)}-page.html?uuid=${uuid}`;
  await browser.tabs.create({
    url: browser.runtime.getURL(url),
    active: true,
    index: sender.tab ? sender.tab.index + 1 : undefined, // open tab next to the current one
    windowId: sender.tab?.windowId, // so incognito works
  });
  return;
});
