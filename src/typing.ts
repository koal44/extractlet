export type Key = string | number | symbol;

// export function hasAllOfType<K extends Key, V>(
//   obj: unknown,
//   keys: readonly K[],
//   isV: (v: unknown) => v is V
// ): obj is { [P in K]: V } {
//   if (!isObjectLike(obj)) return false;
//   for (const k of keys) {
//     if (!(k in obj)) return false;
//     if (!isV(obj[k])) return false;
//   }
//   return true;
// }

export function hasProp<K1 extends Key>(
  obj: unknown, key: K1
): obj is Record<K1, unknown>;
export function hasProp<K1 extends Key>(
  obj: unknown, path: readonly [k1: K1]
): obj is Record<K1, unknown>;
export function hasProp<K1 extends Key, K2 extends Key>(
  obj: unknown, path: readonly [k1: K1, k2: K2]
): obj is Record<K1, Record<K2, unknown>>;
export function hasProp<K1 extends Key, K2 extends Key, K3 extends Key>(
  obj: unknown, path: readonly [k1: K1, k2: K2, k3: K3]
): obj is Record<K1, Record<K2, Record<K3, unknown>>>;
export function hasProp(obj: unknown, keyOrPath: Key | readonly Key[]): boolean {
  if (!isROArray(keyOrPath)) {
    return _hasProp(obj, keyOrPath);
  }

  if (keyOrPath.length === 0 || keyOrPath.length > 3) return false;

  let cur: unknown = obj;
  for (let i = 0; i < keyOrPath.length; i++) {
    const k = keyOrPath[i];
    if (!_hasProp(cur, k)) return false;
    cur = cur[k];
  }

  return true;

  function _hasProp<K extends Key>(o: unknown, k: K): o is Record<K, unknown> {
    return isObjectLike(o) && k in o;
  }
}

export function hasOfType<K1 extends Key, V>(
  obj: unknown, key: K1, isV: (v: unknown) => v is V
): obj is Record<K1, V>;
export function hasOfType<K1 extends Key, V>(
  obj: unknown, path: readonly [k1: K1], isV: (v: unknown) => v is V
): obj is Record<K1, V>;
export function hasOfType<K1 extends Key, K2 extends Key, V>(
  obj: unknown, path: readonly [k1: K1, k2: K2], isV: (v: unknown) => v is V
): obj is Record<K1, Record<K2, V>>;
export function hasOfType<K1 extends Key, K2 extends Key, K3 extends Key, V>(
  obj: unknown, path: readonly [k1: K1, k2: K2, k3: K3], isV: (v: unknown) => v is V
): obj is Record<K1, Record<K2, Record<K3, V>>>;
export function hasOfType<V>(
  obj: unknown, keyOrPath: Key | readonly Key[], isV: (v: unknown) => v is V
): boolean {
  if (!isROArray(keyOrPath)) {
    if (!_hasProp(obj, keyOrPath)) return false;
    return isV(obj[keyOrPath]);
  }

  if (keyOrPath.length === 0 || keyOrPath.length > 3) return false;

  let cur: unknown = obj;
  for (let i = 0; i < keyOrPath.length - 1; i++) {
    const k = keyOrPath[i];
    if (!_hasProp(cur, k)) return false;
    cur = cur[k];
  }

  const last = keyOrPath[keyOrPath.length - 1];
  if (!_hasProp(cur, last)) return false;
  const terminal = cur[last];
  return isV(terminal);

  function _hasProp<K extends Key>(o: unknown, k: K): o is Record<K, unknown> {
    return isObjectLike(o) && k in o;
  }
}

// predicates
export const isObjectLike = (x: unknown): x is Record<Key, unknown> =>
  typeof x === 'object' && x !== null;
export const isObjectRecord = (x: unknown): x is Record<PropertyKey, unknown> =>
  isObjectLike(x) && !Array.isArray(x);
export const isOneOf = <T extends readonly string[]>(val: string, choices: T): val is T[number] =>
  (choices as readonly string[]).includes(val);
export const isString = (v: unknown): v is string => typeof v === 'string';
export const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() !== '';
export const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
export const isBoolean = (v: unknown): v is boolean => typeof v === 'boolean';
export const isFunction = (v: unknown): v is (...args: unknown[]) => unknown =>
  typeof v === 'function';
export const isArray = (v: unknown): v is unknown[] => Array.isArray(v);
export const isROArray = (v: unknown): v is readonly unknown[] => Array.isArray(v);
export const isRecord = (v: unknown): v is Record<Key, unknown> => isObjectLike(v);

export const isNumericString = (v: unknown): v is `${number}` =>
  typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v));
export const isBooleanString = (v: unknown): v is 'true' | 'false' =>
  typeof v === 'string' && (v === 'true' || v === 'false');

export const isNumberish = (v: unknown): v is number | `${number}` =>
  isNumber(v) || isNumericString(v);
export const isBooleanish = (v: unknown): v is boolean | 'true' | 'false' =>
  isBoolean(v) || isBooleanString(v);

// combinator for optional fields (T | undefined)
export const isOptional = <T>(pred: (v: unknown) => v is T) =>
  (v: unknown): v is T | undefined => v === undefined || pred(v);

export function parseJsonAs<T>(text: string, guard: (u: unknown) => u is T): T | undefined {
  try {
    const u = JSON.parse(text) as unknown;
    return guard(u) ? u : undefined;
  } catch {
    return undefined;
  }
}
