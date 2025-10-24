import browser from 'webextension-polyfill';
import { createPage } from './hub';
import { isExtractedDataMessage } from './types/extracted-data-message.js';
import { EXTRACTED_DATA_STORAGE_PREFIX } from './constants.js';

(async () => {
  const params = new URLSearchParams(window.location.search);
  const uuid = params.get('uuid');
  if (!uuid) {
    console.error('No UUID provided in URL');
    return;
  }

  const key = `${EXTRACTED_DATA_STORAGE_PREFIX}${uuid}`;
  const storageData = await browser.storage.local.get(key);
  const msg = storageData[key];

  if (!msg) {
    console.error('No message found for key:', key);
    return;
  }
  if (!isExtractedDataMessage(msg)) {
    console.error('Invalid message format:', msg);
    return;
  }
  if (msg.type !== 'hubResult') {
    console.error('Expected hubResult, but received:', msg.type);
    return;
  }

  createPage(msg.result, document);

})().catch((error) => {
  console.error('Error in hub page script:', error);
});
