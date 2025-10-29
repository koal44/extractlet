import browser from 'webextension-polyfill';
import { createPage } from './wiki';
import { isExtractedDataMessage } from './types/extracted-data-message.js';
import { EXTRACTED_DATA_STORAGE_PREFIX } from './constants';

(async () => {
  const params = new URLSearchParams(window.location.search);
  const uuid = params.get('uuid');
  if (!uuid) return console.error('No UUID provided in URL');

  const key = `${EXTRACTED_DATA_STORAGE_PREFIX}${uuid}`;
  const storageData = await browser.storage.local.get(key);
  if (!storageData[key]) return console.error('No message found for key:', key);
  const msg = storageData[key];
  if (!isExtractedDataMessage(msg)) return console.error('Invalid message format:', msg);
  if (msg.type !== 'wikiResult') return console.error('Expected wikiResult, but received:', msg.type);

  await createPage(msg.result, document);

})().catch((error) => {
  console.error('Error in SE page script:', error);
});
