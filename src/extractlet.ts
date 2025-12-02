import browser from 'webextension-polyfill';
import { setSite } from './normalize';
import { repr, warn } from './utils/logging';
import { isObjectRecord, isNumber, hasOfType, isString } from './utils/typing';

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
      !!(doc.defaultView?.location.href.match(/^https:\/\/(?:www\.)?github\.com\/[^/]+\/[^/]+\/(?:issues|pull|discussions)\/\d+(?:[/?#].*)?$/i)),
  },
} as const satisfies Record<string, {
  isMatch: (doc: Document) => boolean;
}>;

export type SiteKind = keyof typeof _sites;

function isSiteKind(v: unknown): v is SiteKind {
  return isString(v) && v in _sites;
}

export type XletSnapshot = {
  site: SiteKind;
  timestamp: number;
  srcHtml: string;
  srcUrl: string;
};

export function isXletSnapshot(msg: unknown): msg is XletSnapshot {
  if (!isObjectRecord(msg)) return warn(false, `[xlet:snap] Message is not an object record: ${repr(msg)}`);
  if (!hasOfType(msg, 'site', isSiteKind)) return warn(false, `[xlet:snap] Message.site is invalid: ${repr(msg)}`);
  if (!hasOfType(msg, 'timestamp', isNumber)) return warn(false, `[xlet:snap] Message.timestamp is not a number: ${repr(msg)}`);
  if (!hasOfType(msg, 'srcHtml', isString)) return warn(false, `[xlet:snap] Message.srcHtml is not a string: ${repr(msg)}`);
  if (!hasOfType(msg, 'srcUrl', isString)) return warn(false, `[xlet:snap] Message.srcUrl is not a string: ${repr(msg)}`);
  msg satisfies XletSnapshot;
  return true;
}

const _msgTypes = ['xlet-snapshot', 'unsupported-page'] as const;
export type XletMsgType = typeof _msgTypes[number];
type MsgType<T extends XletMsgType> = T

export type XletSnapshotMsg = {
  type: MsgType<'xlet-snapshot'>;
  snapshot: XletSnapshot;
}

function isXletSnapshotMsg(msg: unknown): msg is XletSnapshotMsg {
  if (!hasOfType(msg, 'type', (v): v is MsgType<'xlet-snapshot'> => v === 'xlet-snapshot')) {
    return warn(false, `[xlet:msg] Message.type is invalid: ${repr(msg)}`);
  }
  if (!hasOfType(msg, 'snapshot', isXletSnapshot)) {
    return warn(false, `[xlet:msg] XletSnapshotMsg.snapshot is invalid: ${repr(msg)}`);
  }
  msg satisfies XletSnapshotMsg;
  return true;
}

export type UnsupportedPageMsg = {
  type: MsgType<'unsupported-page'>;
  srcUrl: string;
}

function isUnsupportedPageMsg(msg: unknown): msg is UnsupportedPageMsg {
  if (!hasOfType(msg, 'type', (v): v is MsgType<'unsupported-page'> => v === 'unsupported-page')) {
    return warn(false, `[xlet:msg] Message.type is invalid: ${repr(msg)}`);
  }
  if (!hasOfType(msg, 'srcUrl', isString)) {
    return warn(false, `[xlet:msg] UnsupportedPageMsg.srcUrl is not a string: ${repr(msg)}`);
  }
  msg satisfies UnsupportedPageMsg;
  return true;
}

export type XletContentMsg =
  | XletSnapshotMsg
  | UnsupportedPageMsg;

export function isXletMsgType(v: unknown): v is XletMsgType {
  return isString(v) && _msgTypes.includes(v as XletMsgType);
}

export function isXletContentMsg(msg: unknown): msg is XletContentMsg {
  if (!hasOfType(msg, 'type', (v): v is XletMsgType => isXletMsgType(v))) {
    return warn(false, `[xlet:msg] Message.type is invalid: ${repr(msg)}`);
  }

  switch (msg.type) {
    case 'xlet-snapshot':
      if (!isXletSnapshotMsg(msg)) return false;
      break;
    case 'unsupported-page':
      if (!isUnsupportedPageMsg(msg)) return false;
      break;
    default:
      throw new Error(`unhandled message type: ${(String(msg.type satisfies never))}`);
  }

  msg satisfies XletContentMsg;
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
