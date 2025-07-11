import { runBookmarklet as seRunBookmarklet } from './se.js';
import { runBookmarklet as wikiRunBookmarklet } from './wiki.js';

export function runBookmarklet(root = document) {
  if (root.getElementById('question-header') && root.getElementById('question') && root.getElementById('answers')) {
    seRunBookmarklet(root);
    return;
  }

  if (root.getElementById('mw-content-text') && root.querySelector('main#content')) {
    wikiRunBookmarklet(root);
    return;
  }

  alert('Extractlet doesn\'t recogonize this page. Sorry!');
}
