import browser from 'webextension-polyfill';
import { ExtractletMessage } from './types/extractlet-message.js';
import { SEResult, createPage } from './se';

browser.runtime.sendMessage<ExtractletMessage, SEResult>({ type: 'getLatestResult' })
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
