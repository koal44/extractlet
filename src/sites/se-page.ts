import browser from 'webextension-polyfill';
import { isExtractedDataMessage } from '../types/extracted-data-message.js';
import { createPage } from './se';
import { EXTRACTED_DATA_STORAGE_PREFIX } from '../constants.js';

(async () => {
  const params = new URLSearchParams(window.location.search);
  const uuid = params.get('uuid');
  if (!uuid) return console.error('No UUID provided in URL');

  const key = `${EXTRACTED_DATA_STORAGE_PREFIX}${uuid}`;
  const msg = (await browser.storage.local.get(key))[key];
  if (!isExtractedDataMessage(msg)) return console.error('Invalid message format:', msg);
  if (msg.type !== 'seResult') return console.error('Expected SE result, but received:', msg.type);

  createPage(msg.result, document);

})().catch((error) => {
  console.error('Error in SE page script:', error);
});
