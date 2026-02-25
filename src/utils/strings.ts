export function escapeRegExp(pattern: string): string {
  return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeHtml(html: string): string {
  return html.replace(/[&<>]/g, (ch) => ( // /[&<>"']/
    {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      // '"': '&quot;',
      // "'": '&#39;',
    }[ch] ?? (() => { throw new Error(`Unexpected character in escapeHtml: ${ch}`); })()
  ));
}

export function toKebabCase(str: string, opts: { splitNumbers?: boolean; } = {}): string {
  const { splitNumbers = true } = opts;
  const re = splitNumbers
    ? /([A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+)/g
    : /([A-Z]?[a-z0-9]+|[A-Z0-9]+(?![a-z]))/g;

  return str
    .match(re)
    ?.map((w) => w.toLowerCase())
    .join('-') ?? '';
}

export function toKebabCaseI18n(str: string): string {
  return str
    .normalize('NFC')
    // Insert a separator when switching between CJK and Latin
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])(?=[A-Za-z])/gu, '$1 ')
    .replace(/([A-Za-z])(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu, '$1 ')
    .match(/([\p{Lu}]?[\p{Ll}]+|[\p{Lu}]+(?![\p{Ll}])|[\p{L}]+|\p{N}+)/gu)
    ?.map((w) => w.toLocaleLowerCase())
    .join('-') ?? '';
}

export function toPascalCase(str: string, keepAcronyms = false): string {
  const re = keepAcronyms
    ? /([A-Z][a-z]+|[A-Z](?![a-z])|[a-z]+|\d+)/g
    : /([A-Z][a-z]+|[A-Z]+(?![a-z])|[a-z]+|\d+)/g;

  return str.match(re)?.map((w) => w[0].toLocaleUpperCase() + w.slice(1).toLocaleLowerCase()) .join('')
    ?? '';
}

export function toPascalCaseI18n(str: string, keepAcronyms = false) {
  const re = keepAcronyms
    ? /([\p{Lu}][\p{Ll}]+|[\p{Lu}](?![\p{Ll}])|[\p{Ll}]+|[\p{L}]+|\p{N}+)/gu
    : /([\p{Lu}][\p{Ll}]+|[\p{Lu}]+(?![\p{Ll}])|[\p{Ll}]+|[\p{L}]+|\p{N}+)/gu;

  return str
    .normalize('NFC')
    // Insert a separator when switching between CJK and Latin
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])(?=[A-Za-z])/gu, '$1 ')
    .replace(/([A-Za-z])(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu, '$1 ')
    .match(re)?.map((w) => w[0].toLocaleUpperCase() + w.slice(1).toLocaleLowerCase())
    .join('') ?? '';
}

export function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (m * n === 0) return 0;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
    }
  }
  const dist = dp[m][n];
  return 1 - dist / Math.max(m, n);
}

export function jaroWinklerSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const m = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  let matches = 0, transpositions = 0;
  const s1Matches = [], s2Matches = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = Math.max(0, i - m); j < Math.min(b.length, i + m + 1); j++) {
      if (!s2Matches[j] && a[i] === b[j]) {
        s1Matches[i] = s2Matches[j] = true; matches++; break;
      }
    }
  }
  if (!matches) return 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (a[i] !== b[k++]) transpositions++;
    }
  }
  transpositions /= 2;
  const jw = ((matches / a.length) + (matches / b.length) + ((matches - transpositions) / matches)) / 3;
  // Winkler bonus for common prefix
  let l = 0;
  const prefix = 0.1;
  while (l < 4 && a[l] && a[l] === b[l]) l++;
  return jw + l * prefix * (1 - jw);
}

export function jaccardSimilarity(a: string, b: string): number {
  const A = new Set(a.toLowerCase().split(/\s+/));
  const B = new Set(b.toLowerCase().split(/\s+/));
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

// A, B, C, ... Z, AA, AB, ...
export function alphaLabel(idx1: number): string {
  let n = idx1, s = '';
  while (n > 0) { n--; s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26); }
  return s;
}

export function isLabelRedundant(label?: string, reference?: string): boolean {
  if (!label || !reference) return false;

  const nRef = norm(reference);
  const nLabel = norm(label);

  return (nLabel.length >= 3 && nRef.includes(nLabel));

  // ---- helper ----
  function norm(s: string): string {
    let out = s;
    try { out = decodeURIComponent(out); } catch { /* ignore malformed escapes */ }
    return out
      .normalize('NFC')
      .toLowerCase()
      .replace(/[.,:;?!'"()[\]\-–—\s_/\\…]+/g, '');
  }
}

export function filterGenericLabel(label?: string): string {
  if (!label) return '';
  const toks = label.normalize('NFC').toLowerCase().split(/[^0-9\p{L}]+/u).filter(Boolean);
  const generic = new Set([
    'here', 'click', 'me', 'tap',
    'more', 'read', 'learn', 'see', 'view', 'findout',
    'details', 'info', 'information',
    'continue', 'reading', 'keep', 'next',
    'article', 'post', 'page', 'source',
    'link', 'this', 'the', 'my', 'a', 'an',
  ]);
  const kept = toks.filter((w) => !generic.has(w));
  const content = kept.join('');
  return content;
}

export function isLabelGeneric(label?: string): boolean {
  if (!label) return true;
  const content = filterGenericLabel(label);
  if (content.length === 0) return true;
  return false;
  // return isLabelRedundant(content, reference);
}

export function formatDateWithRelative(iso?: string | null, opts?: { utc?: boolean; }): string {
  if (!iso) return 'unknown-date';

  const d = new Date(iso);
  const t = d.getTime();
  if (Number.isNaN(t)) return 'invalid-date';

  const utc = opts?.utc ?? false;

  const pad = (n: number) => String(n).padStart(2, '0');
  const y = utc ? d.getUTCFullYear() : d.getFullYear();
  const m = (utc ? d.getUTCMonth() : d.getMonth()) + 1;
  const day = utc ? d.getUTCDate() : d.getDate();
  const ymd = `${y}-${pad(m)}-${pad(day)}`;

  const diffMs = Date.now() - t;  // positive => past
  const absMs = Math.abs(diffMs);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const minute = 60_000;
  const hour = 60 * minute;
  const dayMs = 24 * hour;
  const month = 30 * dayMs;
  const year = 365 * dayMs;

  const sign = diffMs >= 0 ? -1 : 1;  // rtf: negative => past ("2 days ago")

  let rel: string;
  if (absMs < minute) rel = 'just now';
  else if (absMs < hour) rel = rtf.format(sign * Math.round(absMs / minute), 'minute');
  else if (absMs < dayMs) rel = rtf.format(sign * Math.round(absMs / hour), 'hour');
  else if (absMs < month) rel = rtf.format(sign * Math.round(absMs / dayMs), 'day');
  else if (absMs < year) rel = rtf.format(sign * Math.round(absMs / month), 'month');
  else rel = rtf.format(sign * Math.round(absMs / year), 'year');

  return `${ymd} (${rel})`;
}

function resolveUrl(raw?: string, base?: string): URL | undefined {
  if (!raw) return;
  try {
    return base ? new URL(raw, base) : new URL(raw);
  } catch { return; }
}

export function chooseCanonicalUrl(primary?: string, secondary?: string, base?: string): string | undefined {
  const u1 = resolveUrl(primary, base);
  const u2 = resolveUrl(secondary, base);
  if (!u1 || !u2) return (u1 ?? u2)?.toString();

  if (u1.origin !== u2.origin) return primary;

  // compare path segments
  const p1 = u1.pathname.split('/').filter(Boolean);
  const p2 = u2.pathname.split('/').filter(Boolean);
  for (let i = 0; i < Math.min(p1.length, p2.length); i++) {
    if (p1[i] !== p2[i]) {
      return primary;
    }
  }
  if (p1.length > p2.length) return primary;
  if (p1.length < p2.length) return secondary;

  // compare search params
  const s1 = [...u1.searchParams].sort().map(([k, v]) => `${k}=${v}`).join('&');
  const s2 = [...u2.searchParams].sort().map(([k, v]) => `${k}=${v}`).join('&');
  if (s1 !== s2) return primary;

  // compare hashes
  if (u2.hash && !u1.hash) return secondary;

  return primary;
}

export function sanitizeMdLinks(url: string): string {
  if (!url) return url;
  if (url.startsWith('#')) return url;

  let out = '';
  for (let i = 0; i < url.length; i++) {
    const ch = url[i];

    if (ch === ' ') { out += '%20'; continue; }
    if (ch === '(') { out += '%28'; continue; }
    if (ch === ')') { out += '%29'; continue; }

    out += ch;
  }
  return out;
}
