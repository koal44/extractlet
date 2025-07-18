import browser from 'webextension-polyfill';
import { WikiResult } from './wiki';
import { SEResult } from './se';
import { toKebabCase } from './utils';
import { isExtractletMessage } from './types/extractlet-message.js';

let latestResult: SEResult | WikiResult | undefined;

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

browser.runtime.onMessage.addListener((msg: unknown, sender: browser.Runtime.MessageSender, sendResponse) => {
  /* note: the while the code is sync, we return true to silence TS errors. it should be harmless */
  if (!isExtractletMessage(msg)) {
    console.error('Received unknown message:', msg);
    sendResponse(null);
    return true;
  }
  switch (msg.type) {
    case 'wikiResult':
    case 'seResult': {
      latestResult = msg.result;
      const url = `${toKebabCase(msg.type)}-page.html`;
      browser.tabs.create({
        url: browser.runtime.getURL(url),
        active: true,
        index: sender.tab ? sender.tab.index + 1 : undefined,
      });
      sendResponse(null);
      return true;
    }
    case 'getLatestResult': {
      if (!latestResult) {
        console.error('No latest result available');
        sendResponse(null);
        return true;
      }
      if (!sender.tab || typeof sender.tab.id !== 'number') {
        console.error('sender.tab is undefined');
        sendResponse(null);
        return true;
      }
      sendResponse(latestResult);
      latestResult = undefined;
      return true;
    }
  }
});
