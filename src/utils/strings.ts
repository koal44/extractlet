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

export function formatDateWithRelative(iso?: string | null): string {
  if (!iso) return 'unknown-date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'invalid-date';

  const pad = (n: number) => String(n).padStart(2, '0');
  const ymd = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  // --- relative ---
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.round(diffMs / 86400000); // 1 day = 86400000 ms
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  let rel: string;
  if (Math.abs(diffDays) < 30) rel = rtf.format(-diffDays, 'day');
  else if (Math.abs(diffDays) < 365) rel = rtf.format(-Math.round(diffDays / 30), 'month');
  else rel = rtf.format(-Math.round(diffDays / 365), 'year');

  return `${ymd} (${rel})`;
}

