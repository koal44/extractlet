import browser from 'webextension-polyfill';
import { repr, toKebabCase } from './utils';
import { type XletMsg, isXletMsg } from './extractlet';
import { EXTRACTED_DATA_STORAGE_PREFIX } from './constants';
import { isError } from './typing';

browser.action.onClicked.addListener((tab) => {
  void (async () => {
    if (tab.id === undefined) return;
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['browser-polyfill.js', 'run-extractlet.js'],
      });
    } catch (err) {
      console.error(`[xlet:action] Error executing content script for tab ${tab.id}: ${repr(err)}`);
    }
  })();
});

browser.runtime.onMessage.addListener(async (msg: unknown, sender: browser.Runtime.MessageSender) => {
  if (!isXletMsg(msg)) {
    console.error(`[xlet:msg] Received unknown message from runtime: ${repr(msg)}`);
    return;
  }
  switch (msg.site) {
    case 'hub':
    case 'wiki':
    case 'se': {
      const uuid = crypto.randomUUID();
      const key = `${EXTRACTED_DATA_STORAGE_PREFIX}${uuid}`;
      await pruneStaleStorage();

      try {
        await browser.storage.local.set({ [key]: msg });
      } catch (err) {
        if (isError(err) && /quota/i.test(err.message)) {
          await browser.storage.local.clear();
          await browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('icons/icon-head-48.png'),
            title: 'Cache cleared',
            message: 'Cache was full and has been cleared. Try again.',
          });
        }
        return console.error(`[xlet:storage] Failed to set storage for key "${key}": ${repr(err)}`);
      }

      const url = `${toKebabCase(msg.site)}-page.html?uuid=${uuid}`;
      await browser.tabs.create({
        url: browser.runtime.getURL(url),
        active: true,
        index: sender.tab ? sender.tab.index + 1 : undefined, // open tab next to the current one
        windowId: sender.tab?.windowId, // so incognito works
      });
      return;
    }
  }
});

async function pruneStaleStorage() {
  const TTL = 24 * 60 * 60 * 1000;
  const MAX_ENTRIES = 10;

  const all = await browser.storage.local.get(null);

  const storedItems: Array<[string, XletMsg]> = [];
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith(EXTRACTED_DATA_STORAGE_PREFIX)) {
      console.warn(`[xlet:storage] ignoring non-xlet storage key "${k}"`);
      continue;
    }
    if (!isXletMsg(v)) {
      console.warn(`[xlet:storage] bad storage value for key "${k}": ${repr(v)}`);
      await browser.storage.local.remove(k); // clear corrupted/legacy entry
      continue;
    }
    storedItems.push([k, v]);
  }

  // remove entries older than TTL
  const expired = storedItems.filter(([, v]) => Date.now() - v.timestamp > TTL).map(([k]) => k);
  if (expired.length) await browser.storage.local.remove(expired);

  // remove oldest entries until we have at most MAX_ENTRIES left
  const remaining = storedItems.filter(([, v]) => Date.now() - v.timestamp <= TTL);
  while (remaining.length > MAX_ENTRIES) {
    const oldest = remaining.reduce((old, cur) => cur[1].timestamp < old[1].timestamp ? cur : old);
    await browser.storage.local.remove(oldest[0]);
    remaining.splice(remaining.indexOf(oldest), 1);
  }
}
