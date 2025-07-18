import { ExtractletMessage } from './types/extractlet-message.js';
import { extractFromDoc as seExtraction } from './se.js';
import { extractFromDoc as wikiExtraction } from './wiki.js';
import browser from 'webextension-polyfill';

const root = document;

(async () => {
  if (root.getElementById('question-header') && root.getElementById('question') && root.getElementById('answers')) {
    const result = seExtraction(root);
    if (result) {
      try {
      await browser.runtime.sendMessage<ExtractletMessage>({ type: 'seResult', result });
      } catch (error) {
        console.error('Error sending SE message:', error);
        alert('Error sending SE message. Check console for details.');
      }
    } else {
      alert('Extractlet couldn\'t extract the Stack Exchange page. Sorry!');
    }
  } else if (root.getElementById('mw-content-text') && root.querySelector('main#content')) {
    const result = await wikiExtraction(root);
    if (result) {
      try {
        await browser.runtime.sendMessage<ExtractletMessage>({ type: 'wikiResult', result });
      } catch (error) {
        console.error('Error sending Wiki message:', error);
        alert('Error sending Wiki message. Check console for details.');
      }
    } else {
      alert('Extractlet couldn\'t extract the Wiki page. Sorry!');
    }
  } else {
    alert('Extractlet doesn\'t recogonize this page. Sorry!');
  }
})();