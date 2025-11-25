import browser from 'webextension-polyfill';
import { EXTRACTED_DATA_STORAGE_PREFIX } from './constants';
import { type SiteKind, isXletMsg } from './extractlet';
import {
  loadSettings, observeSettings, settingsToContexts,
  type XletContexts,
} from './settings';
import { h } from './utils';

const ROOT_ID = 'xlet-root';

export type PageState = {
  viewIdx: number;
}

function parseUuidFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('uuid');
}

async function fetchXletMessage(uuid: string): Promise<unknown> {
  const key = `${EXTRACTED_DATA_STORAGE_PREFIX}${uuid}`;
  const storageData = await browser.storage.local.get(key);
  return storageData[key];
}

function getOrCreateRoot(doc: Document): HTMLElement {
  let root = doc.getElementById(ROOT_ID);
  if (!root) {
    root = h('div', { id: ROOT_ID });
    doc.body.prepend(root);
  }
  return root;
}

function ensureBaseUrl(doc: Document, baseUrl: string): void {
  let head = doc.querySelector('head');
  if (!head) {
    head = h('head');
    doc.documentElement.prepend(head);
  }

  let base = head.querySelector(':scope > base');
  if (!base) {
    base = h('base');
    head.prepend(base);
  }

  base.setAttribute('href', baseUrl);
}

export type CreatePage = (
  { sourceDoc, targetDoc, ctxs, root, state }:
  {
    sourceDoc: Document;
    targetDoc: Document;
    ctxs: XletContexts;
    root: HTMLElement;
    state: PageState;
  }
) => void | Promise<void>;

export async function loadResultsPage<K extends SiteKind>(
  site: K,
  createPage: CreatePage,
): Promise<void> {
  const uuid = parseUuidFromUrl();
  if (!uuid) {
    return console.warn('[xlet:results-loader] No UUID provided in URL');
  }

  const msg = await fetchXletMessage(uuid);
  if (!isXletMsg(msg)) { return; }

  // rehydrate the snapshot page
  const parser = new DOMParser();
  const sourceDoc = parser.parseFromString(msg.srcHtml, 'text/html');
  try {
    ensureBaseUrl(sourceDoc, msg.srcUrl);
  } catch (err) {
    console.warn('[xlet:results-loader] Error setting sourceDoc location.href:', err);
  }

  // target document is the current document
  const targetDoc = document;

  // shared state
  const pageState: PageState = {
    viewIdx: 0,
  };

  let settings = await loadSettings();

  const render = async () => {
    const ctxs = settingsToContexts(settings);
    const root = getOrCreateRoot(targetDoc);

    // const prevHeight = root.offsetHeight;
    const prevHeight = root.getBoundingClientRect().height;
    root.style.minHeight = `${prevHeight}px`; // prevent layout shift

    // reset
    root.innerHTML = '';

    // create the page
    await createPage({ sourceDoc, targetDoc, ctxs, root, state: pageState });

    // remove minHeight after render
    root.style.minHeight = '';
  };

  await render();

  // live update on settings change
  const stopObserving = observeSettings(async (newSettings, _patch) => {
    settings = newSettings;
    await render();
  });

  // cleanup on unload
  window.addEventListener('beforeunload', () => {
    stopObserving();
  });
}
