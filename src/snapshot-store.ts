import browser from 'webextension-polyfill';
import { repr, warn } from './utils/logging';
import { type XletSnapshot, isXletSnapshot } from './extractlet';
import { isError } from './utils/typing';
import { loadSettings } from './settings';

export const SNAPSHOT_KEY_PREFIX = 'xlet:snap:';
const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_SNAPSHOT_ENTRIES = 10;
const MEMORY_SNAPSHOT_TTL_MS = 60_000;
const MAX_MEMORY_SNAPSHOTS = 3;
const memorySnapshots = new Map<string, XletSnapshot>();

export async function tryStoreSnapshot(uuid: string, msg: XletSnapshot): Promise<boolean> {
  const key = `${SNAPSHOT_KEY_PREFIX}${uuid}`;

  const settings = await loadSettings();
  const useStorage = settings.useStorage;

  if (!useStorage) {
    pruneStaleMemory();
    memorySnapshots.set(uuid, msg);
    return true;
  }

  await pruneStaleStorage();

  try {
    await browser.storage.local.set({ [key]: msg });
    return true;
  } catch (err) {
    if (isError(err) && /quota/i.test(err.message)) {
      await browser.storage.local.clear();
      await browser.notifications.create({
        type: 'basic',
        iconUrl: browser.runtime.getURL('icons/icon-head-48.png'),
        title: 'Cache cleared',
        message: 'Cache was full and has been cleared. Try again.',
      });
    }
    return warn(false, `[xlet:store] Failed to set storage for key "${key}": ${repr(err)}`);
  }
}

async function pruneStaleStorage() {
  const all = await browser.storage.local.get(null);

  const storedItems: Array<[string, XletSnapshot]> = [];
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith(SNAPSHOT_KEY_PREFIX)) {
      console.warn(`[xlet:store] ignoring non-xlet storage key "${k}"`);
      continue;
    }
    if (!isXletSnapshot(v)) {
      console.warn(`[xlet:store] bad storage value for key "${k}": ${repr(v)}`);
      await browser.storage.local.remove(k); // clear corrupted/legacy entry
      continue;
    }
    storedItems.push([k, v]);
  }

  // remove entries older than TTL
  const expired = storedItems.filter(([, v]) => Date.now() - v.timestamp > SNAPSHOT_TTL_MS).map(([k]) => k);
  if (expired.length) await browser.storage.local.remove(expired);

  // remove oldest entries until we have at most MAX_ENTRIES left
  const remaining = storedItems.filter(([, v]) => Date.now() - v.timestamp <= SNAPSHOT_TTL_MS);
  while (remaining.length > MAX_SNAPSHOT_ENTRIES) {
    const oldest = remaining.reduce((old, cur) => cur[1].timestamp < old[1].timestamp ? cur : old);
    await browser.storage.local.remove(oldest[0]);
    remaining.splice(remaining.indexOf(oldest), 1);
  }
}

function pruneStaleMemory() {
  const now = Date.now();

  for (const [uuid, snap] of memorySnapshots.entries()) {
    if (now - snap.timestamp > MEMORY_SNAPSHOT_TTL_MS) {
      memorySnapshots.delete(uuid);
    }
  }

  while (memorySnapshots.size > MAX_MEMORY_SNAPSHOTS) {
    const oldest = [...memorySnapshots.entries()]
      .reduce((a, b) => a[1].timestamp < b[1].timestamp ? a : b)[0];
    memorySnapshots.delete(oldest);
  }
}

export async function loadSnapshot(uuid: string): Promise<XletSnapshot | null> {
  const settings = await loadSettings();
  const useStorage = settings.useStorage;

  if (!useStorage) {
    const snap = memorySnapshots.get(uuid);
    if (snap) memorySnapshots.delete(uuid);
    return snap ?? null;
  }

  const key = `${SNAPSHOT_KEY_PREFIX}${uuid}`;
  const data = await browser.storage.local.get(key);
  const raw = data[key];
  if (!isXletSnapshot(raw)) return null;
  return raw;
}
