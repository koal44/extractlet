import browser from 'webextension-polyfill';
import { toKebabCase } from './utils';
import { isExtractedDataMessage } from './types/extracted-data-message.js';
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
    case 'wikiResult':
    case 'seResult': {
      const uuid = crypto.randomUUID();
      const key = `${EXTRACTED_DATA_STORAGE_PREFIX}${uuid}`;
      try {
        await browser.storage.local.set({ [key]: msg });
      } catch (err) {
        return console.error("Failed to set storage for key:", key, err);
      }
      const url = `${toKebabCase(msg.type)}-page.html?uuid=${uuid}`;
      browser.tabs.create({
        url: browser.runtime.getURL(url),
        active: true,
        index: sender.tab ? sender.tab.index + 1 : undefined, // open tab next to the current one
        windowId: sender.tab?.windowId, // so incognito works
      });
      await pruneStaleStorage();
      return;
    }
  }
});

async function pruneStaleStorage() {
  const TTL = 24 * 60 * 60 * 1000; // 24 hours
  const all = await browser.storage.local.get(null);
  const now = Date.now();
  const keysToRemove: string[] = [];
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith(EXTRACTED_DATA_STORAGE_PREFIX)) continue;
    if (!isExtractedDataMessage(v)) {
      console.warn(`Skipping invalid storage value for key ${k}:`, v);
      continue;
    }
    if (now - v.timestamp > TTL) keysToRemove.push(k);
  }
  if (keysToRemove.length > 0) {
    browser.storage.local.remove(keysToRemove);
  }
}
