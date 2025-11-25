/* eslint-disable no-restricted-properties */
/* use: npm run printfix -- <hub|se|wiki> <fixture.html> [<STR>] [<ARR>] */
import util from 'util';
import { extractFromDoc as seExtraction } from '../src/sites/se.js';
import { extractFromDoc as wikiExtraction } from '../src/sites/wiki.js';
import { extractFromDoc as hubExtraction } from '../src/sites/hub.js';
import { setupDom } from '../test/utils/test-utils.js';
import { readHtmlFile } from '../test/fix/fix.js';
import path from 'path';
import { isArray, isBoolean, isNumber, isObjectRecord, isString } from '../src/utils/typing.js';

// allow console.log to print objects more deeply
util.inspect.defaultOptions = { depth: 4, colors: true };

setupDom();

type Domain = 'hub' | 'se' | 'wiki';
const FIXTURES_DIR = path.join(__dirname, '..', 'test', 'fix', 'fixtures');

// --- main ---
void (function main() {
  const { help, domain, fixture, strLim, arrLim } = parseArgs(process.argv);
  if (help || !domain || !fixture) {
    printHelp();
    process.exit(help ? 0 : 1);
  }

  console.log(`[printfix] domain=${domain} fixture=${fixture} strLim=${strLim} arrLim=${arrLim}`);

  try {
    switch (domain) {
      case 'hub': runHub(fixture, strLim, arrLim); break;
      case 'se': runSe(fixture, strLim, arrLim); break;
      case 'wiki': runWiki(fixture, strLim, arrLim); break;
      default:
        throw new Error(`Unknown domain "${String(domain)}" (expected: hub | se | wiki)`);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const help = args.includes('-h') || args.includes('--help');

  // strip help flags from positional stream
  const pos = args.filter((a) => a !== '-h' && a !== '--help');

  const [domain, fixture, s, a] = pos as [Domain?, string?, string?, string?];

  const strLim = s ? Math.max(1, Math.floor(Number(s))) : 70;
  const arrLim = a ? Math.max(1, Math.floor(Number(a))) : 5;

  return { help, domain, fixture, strLim, arrLim };
}

function printHelp() {
  console.log(`
Usage:
  npm run printfix -- <hub|se|wiki> <fixture.html> [<STR>] [<ARR>]

Examples:
  npm run printfix -- hub issue1.html
  npm run printfix -- hub issue2.html 10 100
  npm run printfix -- wiki wiki-sample.html 50 3
  npm run printfix -- se se-sample.html 7 1

Notes:
- STR = maximum string length (default 70).
- ARR = maximum array length (default 5).
- All arguments are positional; no flags are supported.
`.trim());
}


export function trimObj<T>(input: T, opts?: { strLim?: number; arrLim?: number; }): T {
  const { strLim = Infinity, arrLim = Infinity } = opts ?? {};
  if (strLim === Infinity && arrLim === Infinity) return input;
  if (strLim < 1 || arrLim < 1) throw new Error(`trimJson: strLim and arrLim must be >= 1`);

  const visit = (node: unknown): unknown => {
    if (node === null) return null;
    if (node === undefined) return undefined;
    if (isString(node)) return node.slice(0, strLim);
    if (isNumber(node) || isBoolean(node)) return node;

    if (isArray(node)) {
      const sliced = arrLim === Infinity ? node : node.slice(0, arrLim);
      return sliced.map(visit);
    }

    if (isObjectRecord(node)) {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node)) {
        const vv = visit(v);
        if (vv !== undefined) out[k] = vv; // drop undefined from objects
      }
      return out;
    }

    // Drop functions, symbols, BigInt, Dates/Regex if they appear.
    return undefined;
  };

  return visit(input) as T;
}

/* ------------------------------------------------------------------ */
/* GitHub Hub                                                         */
/* ------------------------------------------------------------------ */
function runHub(fix: string, strLim = 7, arrLim = 1) {
  if (fix === '') return; // tslint
  const domain: 'issues' | 'pull' | 'discussions'
    = fix.startsWith('issue') ? 'issues'
    : fix.startsWith('pull') ? 'pull'
    : fix.startsWith('disc') ? 'discussions'
    : (() => { throw new Error(`Unknown fix type for ${fix}`); })();

  const FOOBAR = `https://github.com/foo/bar/${domain}/1234`;
  const htmlPath = path.join(FIXTURES_DIR, 'github', fix);
  const dom = readHtmlFile(htmlPath, { baseUrl: FOOBAR });
  const res = hubExtraction(dom);

  if (!res) { console.log('No result extracted'); return; }

  const exp = structuredClone(res);
  exp.permalink = exp.permalink === FOOBAR ? '???' : exp.permalink;
  exp.title = exp.title || '???';

  const sidecar = {
    baseUrl: exp.permalink,
    expect: {
      ...trimObj(exp, { strLim, arrLim }),
      totalPosts: exp.posts.length,
    },
  };

  const prefix = `import type { HubSidecar  } from '../hub.test';\n\nexport default `;
  const suffix = ' satisfies HubSidecar;\n';
  const fullOutput = prefix + JSON.stringify(sidecar, null, 2) + suffix;
  console.log(`\n--- Copy below to test/fix/fixtures/github/${fix.replace('.html', '.expect.ts')} ---\n`);
  console.log(fullOutput);
  console.log(`\n--- End of fixture ${fix} ---\n`);
}

/* ------------------------------------------------------------------ */
/* Stack Exchange                                                     */
/* ------------------------------------------------------------------ */
function runSe(fix: string, strLim = 70, arrLim = 5) {
  if (fix === '') return;
  const htmlPath = path.join(FIXTURES_DIR, 'stackexchange', fix);

  const BASE = 'https://example.com/questions/123456/example';
  const dom = readHtmlFile(htmlPath, { baseUrl: BASE });
  const res = seExtraction(dom); // SEResult

  if (!res) { console.log('No result extracted (se)'); return; }

  res.permalink = res.permalink || '???';
  res.permalink = res.permalink.includes('example.com') ? '???' : res.permalink;
  const exp = {
    ...trimObj(res, { strLim, arrLim }),
  };

  const prefix = `import type { SESidecar } from '../../se.test';\n\nexport default `;
  const suffix = ' satisfies SESidecar;\n';
  const fullOutput = prefix + JSON.stringify({ baseUrl: exp.permalink, expect: exp }, null, 2) + suffix;

  console.log(`\n--- Copy below to test/fix/fixtures/stackexchange/${fix.replace('.html', '.expect.ts')} ---\n`);
  console.log(fullOutput);
  console.log(`\n--- End of fixture ${fix} ---\n`);
}

/* ------------------------------------------------------------------ */
/* Wikipedia                                                          */
/* ------------------------------------------------------------------ */
function runWiki(fix: string, strLim = 70, arrLim = 5) {
  if (fix === '') return;

  const htmlPath = path.join(FIXTURES_DIR, 'wiki', fix);

  // Stable fake base for generation; your extractor will compute true base/raw
  const BASE = 'https://en.wikipedia.org/wiki/Example';
  const dom = readHtmlFile(htmlPath, { baseUrl: BASE });
  const res = wikiExtraction(dom); // WikiResult

  if (!res) { console.log('No result extracted (wiki)'); return; }

  const exp = {
    baseUrl: res.baseUrl || '???',
    rawUrl:  res.rawUrl  || '???',
    data: trimObj(res.data, { strLim, arrLim }),
    // data: pruneWikiNode(res.data, limit),
  };

  const prefix = `import type { WikiSidecar } from '../../wiki.test';\n\nexport default `;
  const suffix = ' satisfies WikiSidecar;\n';
  const fullOutput = prefix + JSON.stringify({ baseUrl: exp.baseUrl, expect: exp }, null, 2) + suffix;

  console.log(`\n--- Copy below to test/fix/fixtures/wiki/${fix.replace('.html', '.expect.ts')} ---\n`);
  console.log(fullOutput);
  console.log(`\n--- End of fixture ${fix} ---\n`);
}
