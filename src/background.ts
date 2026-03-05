import browser from 'webextension-polyfill';
import { isXletContentMsg } from './extractlet';
import { loadSnapshot, tryStoreSnapshot } from './snapshot-store';
import { repr } from './utils/logging';
import { toKebabCase } from './utils/strings';

const ACTION_ICONS = {
  enable: {
    16: 'icons/icon-head-16.png',
    32: 'icons/icon-head-32.png',
  },
  disable: {
    16: 'icons/icon-head-grey-16.png',
    32: 'icons/icon-head-grey-32.png',
  },
};

browser.action.onClicked.addListener((tab) => {
  // when the user clicks the extension icon, run the extractlet script in the current tab
  void (async () => {
    if ((tab.id === undefined) || !tab.url || !tab.url.match(/^https?:\/\//i)) {
      await disableIcon(tab);
      return;
    }
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
  if (!isXletContentMsg(msg)) {
    console.error(`[xlet:browser-onMessage] Received invalid message: ${repr(msg)}`);
    return;
  }

  switch (msg.type) {
    case 'xlet-snapshot': {
      const snapshot = msg.snapshot;

      // store the snapshot (the loader will retrieve it when opening the page)
      const uuid = crypto.randomUUID();
      const ok = await tryStoreSnapshot(uuid, snapshot);
      if (!ok) return;

      // open the snapshot page in a new tab
      const url = `${toKebabCase(snapshot.site)}-page.html?uuid=${uuid}`;
      await browser.tabs.create({
        url: browser.runtime.getURL(url),
        active: true,
        index: sender.tab ? sender.tab.index + 1 : undefined, // open tab next to the current one
        windowId: sender.tab?.windowId, // so incognito works
      });
      return;
    }

    case 'unsupported-page': {
      if (!sender.tab) {
        console.warn('[xlet:browser-onMessage] unsupported-page message received from non-tab context');
        return;
      }
      await disableIcon(sender.tab);
      return;
    }

    case 'loadSnapshot': {
      const snap = loadSnapshot(msg.uuid);
      return snap;
    }

    default:
      throw new Error(`unhandled message type: ${(String(msg satisfies never))}`);
  }
});

browser.tabs.onActivated.addListener(({ tabId }) => {
  void enableIcon(tabId);
});

browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    void enableIcon(tab);
  }
});

async function enableIcon(tabOrId: browser.Tabs.Tab | number) {
  let tab: browser.Tabs.Tab;
  try {
    tab = typeof tabOrId === 'number' ? await browser.tabs.get(tabOrId) : tabOrId;
  } catch (err) {
    return console.warn('[xlet:enableIcon] failed to get tab', tabOrId, err);
  }

  if (tab.id === undefined) return console.warn('[xlet:enableIcon] tab has no id');

  const title = browser.runtime.getManifest().action?.default_title;
  if (!title) console.warn('[xlet:enableIcon] no default_title in manifest');

  await browser.action.setTitle({
    tabId: tab.id,
    title: title ?? 'Extract with extractlet',
  });
  await browser.action.setIcon({
    tabId: tab.id,
    path: ACTION_ICONS.enable,
  });
}

async function disableIcon(tabOrId: browser.Tabs.Tab | number) {
  let tab: browser.Tabs.Tab;
  try {
    tab = typeof tabOrId === 'number' ? await browser.tabs.get(tabOrId) : tabOrId;
  } catch (err) {
    return console.warn('[xlet:enableIcon] failed to get tab', tabOrId, err);
  }

  if (tab.id === undefined) return console.warn('[xlet:disableIcon] tab has no id');
  await browser.action.setTitle({
    tabId: tab.id,
    title: 'Unsupported page',
  });
  await browser.action.setIcon({
    tabId: tab.id,
    path: ACTION_ICONS.disable,
  });
}
