import browser from 'webextension-polyfill';
import { setSite } from './normalize';
import { repr, warn } from './utils';
import { isObjectRecord, isNumber, hasOfType, isString } from './typing';

const _sites = {
  se: {
    isMatch: (doc) =>
      !!(doc.getElementById('question-header') && doc.getElementById('question') && doc.getElementById('answers')),
  },
  wiki: {
    isMatch: (doc) =>
      !!(doc.getElementById('mw-content-text') && doc.querySelector('main#content')) ||   // Wikipedia pages
      !!(doc.querySelector('head > meta[property="mw:htmlVersion"]')),                     // parsoid pages
  },
  hub: {
    isMatch: (doc) =>
      !!(doc.defaultView ?? window).location.hostname.toLowerCase().endsWith('github.com'),
  },
} as const satisfies Record<string, {
  isMatch: (doc: Document) => boolean;
}>;

export type SiteKind = keyof typeof _sites;

function isSiteKind(v: unknown): v is SiteKind {
  return isString(v) && v in _sites;
}

export type XletMsg = {
  site: SiteKind;
  timestamp: number;
  srcHtml: string;
  srcUrl: string;
};

export function isXletMsg(msg: unknown): msg is XletMsg {
  if (!isObjectRecord(msg)) return warn(false, `[xlet:msg] Message is not an object record: ${repr(msg)}`);
  if (!hasOfType(msg, 'site', isSiteKind)) return warn(false, `[xlet:msg] Message.site is invalid: ${repr(msg)}`);
  if (!hasOfType(msg, 'timestamp', isNumber)) return warn(false, `[xlet:msg] Message.timestamp is not a number: ${repr(msg)}`);
  if (!hasOfType(msg, 'srcHtml', isString)) return warn(false, `[xlet:msg] Message.srcHtml is not a string: ${repr(msg)}`);
  if (!hasOfType(msg, 'srcUrl', isString)) return warn(false, `[xlet:msg] Message.srcUrl is not a string: ${repr(msg)}`);
  msg satisfies XletMsg;
  return true;
}

export function detectSite(doc: Document): SiteKind | null {
  const site = (Object.keys(_sites) as SiteKind[]).find((key) => _sites[key].isMatch(doc)) ?? null;
  return site;
}

export async function injectPageNorm(site: SiteKind): Promise<void> {
  // annotate the document with the site attribute
  const target = document.documentElement as HTMLElement | null;
  if (!target) {
    return console.warn('[xlet:inject] no documentElement to annotate with site attribute');
  }
  setSite(target, site);

  // inject and wait for it to load
  await new Promise<void>((resolve, _reject) => {
    const s = document.createElement('script');
    s.src = browser.runtime.getURL('run-normalize.js');

    s.addEventListener('load', () => {
      s.remove();
      resolve();
    });

    s.addEventListener('error', (ev) => {
      console.error(`[xlet:norm] failed to load run-normalize.js: ${repr(ev)}`);
      s.remove();
      resolve();
      // reject(new Error('normalize.js failed to load'));
    });

    target.appendChild(s);
  });
}
