import browser from 'webextension-polyfill';
import { WikiResult, createPage } from './wiki';
import { ExtractletMessage } from './types/extractlet-message.js';

browser.runtime.sendMessage<ExtractletMessage, WikiResult>({ type: 'getLatestResult' })
  .then((response) => {
    if (!response) {
      console.error('No response received');
      return;
    }
    createPage(response, document);
  })
  .catch((error) => {
    console.error('Error fetching latest result:', error);
  });