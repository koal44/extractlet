import browser from 'webextension-polyfill';
import { toKebabCase } from './utils';
import { ExtractedDataMessage, isExtractedDataMessage } from './types/extracted-data-message.js';
import { EXTRACTED_DATA_STORAGE_PREFIX } from './constants';

browser.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;
  try {
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['browser-polyfill.js', 'extractlet.js'],
    });
  } catch (error) {
    console.error('Error executing script:', error);
  }
});

browser.runtime.onMessage.addListener(async (msg: unknown, sender: browser.Runtime.MessageSender) => {
  if (!isExtractedDataMessage(msg)) {
    console.error('Received unknown message:', msg);
    return;
  }
  switch (msg.type) {
    case 'hubResult':
    case 'wikiResult':
    case 'seResult': {
      const uuid = crypto.randomUUID();
      const key = `${EXTRACTED_DATA_STORAGE_PREFIX}${uuid}`;
      await pruneStaleStorage();

      try {
        await browser.storage.local.set({ [key]: msg });
      } catch (err: any) {
        if (/quota/i.test(err?.message ?? String(err))) {
          await browser.storage.local.clear();
          await browser.notifications.create({
            type: "basic",
            iconUrl: browser.runtime.getURL("icons/icon-head-48.png"),
            title: "Cache cleared",
            message: "Cache was full and has been cleared. Try again.",
          });
        }
        return console.error("Failed to set storage for key:", key, err);
      }

      const url = `${toKebabCase(msg.type)}-page.html?uuid=${uuid}`;
      browser.tabs.create({
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
  
  const storedItems: Array<[string, ExtractedDataMessage]> = [];
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith(EXTRACTED_DATA_STORAGE_PREFIX)) {
      console.warn(`Unexpected key in storage: ${k}`);
      continue;
    }
    if (!isExtractedDataMessage(v)) {
      console.warn(`Unexpected storage value for key ${k}:`, v);
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
