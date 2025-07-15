import fs from 'node:fs';
import path from 'node:path';
import { minify } from 'terser';
import jsStringEscape from 'js-string-escape';
import Database from 'better-sqlite3';
import { glob } from 'glob';
import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';

type BundleInfo = { input: string; file: string; name: string; };

type SiteMeta = {
  title: string;
  description: string;
  site: string;
  bundle: BundleInfo;
  minName: string;
  unminName: string;
  gistUrl?: string;
  bookmarkTitle: string;
  domRefComment?: string;
};

type BookmarkRow = {
  id: number;
  title: string;
  fk: number;
  url: string;
  url_hash: bigint;
};

const siteMetas = [
  {
    title: 'Knowledge-site Sharing Bookmarklet',
    description: 'Extract wiki/stackexchange pages into plain Markdown or Wikitext, preserving math, code, and other doument structure. Useful for archiving or sharing with GPT.',
    site: 'extractlet',
    bundle: {
      input: 'src/extractlet.ts',
      file: 'dist/extractlet.bundle.js',
      name: 'extractlet',
    },
    minName: 'extractlet-bookmarklet.min.js',
    unminName: 'extractlet-bookmarklet.js',
    gistUrl: 'https://gist.github.com/koal44/77102fb777f9e3eb820db2a342ef965d',
    bookmarkTitle: 'extractlet',
  },
  {
    title: 'Wiki Sharing Bookmarklet',
    description: 'Extract wiki pages into plain Markdown or Wikitext, preserving math, code, and other doument structure. Useful for archiving or sharing with GPT.',
    site: 'wiki',
    bundle: {
      input: 'src/wiki.index.ts',
      file: 'dist/wiki.bundle.js',
      name: 'wiki',
    },
    minName: 'wiki-bookmarklet.min.js',
    unminName: 'wiki-bookmarklet.js',
    bookmarkTitle: 'wiki-extractlet',
  },
  {
    title: 'StackExchange Sharing Bookmarklet',
    description: 'Extract Stack Exchange posts into plain Markdown, preserving math, code, and other document structure. Useful for archiving or sharing with GPT.',
    site: 'Stack Exchange',
    bundle: {
      input: 'src/se.index.ts',
      file: 'dist/se.bundle.js',
      name: 'se',
    },
    minName: 'se-bookmarklet.min.js',
    unminName: 'se-bookmarklet.js',
    bookmarkTitle: 'se-extractlet',
  }
];

(async () => {
  createExampleJs();
  for (const meta of siteMetas) {
    await bundleSource(meta);
    let srcCode = fs.readFileSync(meta.bundle.file, 'utf8');
    srcCode = extractDomRef(srcCode, meta);
    srcCode = cleanTheCodeForSharing(srcCode);
    const bookmarkletUrl = await buildMinifiedCode(meta, srcCode);
    buildUnminifiedCode(meta, bookmarkletUrl, srcCode);
    updateBookmarkletInFirefox(meta, bookmarkletUrl);
  }
  console.log('Build process completed successfully.');
})();

async function bundleSource(meta: SiteMeta): Promise<void> {
  const { input, file, name } = meta.bundle;
  const bundle = await rollup({
    input,
    output: { file, format: 'iife', sourcemap: true, name },
    plugins: [typescript()],
  });
  await bundle.write({ file, format: 'iife', sourcemap: true, name });
  console.log(`Bundled ${file}`);
}

function extractDomRef(srcCode:string, siteMeta:SiteMeta): string {
  const domRefRegex = /\/\*\*[\s\S]*?DOM Reference[\s\S]*?\*\//gm;
  const matches = srcCode.match(domRefRegex);

  if (matches && matches.length > 0) {
    siteMeta.domRefComment = matches.join('\n\n');
    const newSrcCode = srcCode.replace(domRefRegex, '');
    console.log(`Extracted DOM reference comment for ${siteMeta.site}.`);
    return newSrcCode;
  } else {
    console.warn(`No DOM reference comment found for ${siteMeta.site}.`);
    return srcCode;
  }
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_.]+(.)?/g, (_, ch) => ch ? ch.toUpperCase() : '')
    .replace(/^[A-Z]/, ch => ch.toLowerCase());
}

function createExampleJs() {
  const htmlSuffix = '.htm';
  const rawSuffix = '.raw';
  const outputSuffix = '_string.js';
  const outputRawSuffix = '_raw_string.js';
  const pattern = 'test/browser/**/examples/*.htm';
  const exampleManifest = glob.sync(pattern);

  // Group files by site (e.g. 'wiki', 'se')
  const filesBySite: Record<string, string[]> = {};
  for (const file of exampleManifest) {
    const norm = file.replace(/\\/g, '/');
    const match = norm.match(/test\/browser\/([^/]+)\/examples\/([^/]+)\.htm$/);
    if (!match) throw new Error(`Malformed path: ${file}`);
    const [, site] = match;
    if (!filesBySite[site]) filesBySite[site] = [];
    filesBySite[site].push(file);
  }

  // Process each group
  for (const site in filesBySite) {
    const jsExampleManifest: { htmlVar:string; htmlFileName:string; rawVar?:string; rawFileName?:string }[] = [];

    for (const input of filesBySite[site]) {
      const baseName = path.basename(input, htmlSuffix);  // e.g. 'se-math-limits'
      
      const htmlFileName = `${baseName}${outputSuffix}`;  // e.g. 'se-math-limits_string.js'
      const genDir = `test/browser/${site}/gen`;          // fixed location
      const outputPath = `${genDir}/${htmlFileName}`;     // full output path
      const htmlVar = toCamelCase(baseName) + 'String';   // e.g. seMathLimitsString
      const htmlInfo = { htmlVar, htmlFileName };

      if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });

      const html = fs.readFileSync(input, 'utf8');
      const escaped = jsStringEscape(html);
      const jsContent = `window["${htmlVar}"] = "${escaped}";\n`;

      fs.writeFileSync(outputPath, jsContent);
      console.log(`Built ${outputPath}`);

      // If there's a corresponding .raw file, process it too
      let rawInfo;
      const rawPath = input.replace(htmlSuffix, rawSuffix);
      if (fs.existsSync(rawPath)) {
        const rawFileName = `${baseName}${outputRawSuffix}`;  // e.g. 'wiki-enwiki-tensor_raw_string.js'
        const rawOutputPath = `${genDir}/${rawFileName}`;
        const rawVar = toCamelCase(baseName) + 'RawString';   // e.g. wikiEnwikiTensorRawString
        rawInfo = { rawVar, rawFileName };

        const raw = fs.readFileSync(rawPath, 'utf8');
        const escapedRaw = jsStringEscape(raw);
        const rawJsContent = `window["${rawVar}"] = "${escapedRaw}";\n`;

        fs.writeFileSync(rawOutputPath, rawJsContent);
        console.log(`Built ${rawOutputPath}`);
      }

      jsExampleManifest.push({ ...htmlInfo, ...rawInfo });
    }

    jsExampleManifest.sort((a, b) => a.htmlVar.localeCompare(b.htmlVar));

    const indexContent = `const exampleManifest = ${JSON.stringify(jsExampleManifest, null, 2)};\n`;
    const indexPath = `test/browser/${site}/gen/_example_manifest.js`;
    fs.writeFileSync(indexPath, indexContent);
    console.log(`Built ${indexPath}`);
  }
}

function cleanTheCodeForSharing(srcCode: string): string {
  // Remove debug functions and console.log() statements
  return srcCode
    // .replace(/\/\* @debug-start \*\/[\s\S]*?\/\* @debug-end \*\//g, '')
    // .replace(/\/\* @module-start \*\/[\s\S]*?\/\* @module-end \*\//g, '')
    .replace(/\r\n/g, '\n')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .filter(line => !/^\s*(\/\/\s*)?(console\.)?log\(/.test(line))
    .join('\n');
}

async function buildMinifiedCode(meta: SiteMeta, srcCode: string): Promise<string> {
  const minified = await minify(srcCode, {
    compress: { global_defs: { DEBUG: false }, dead_code: true },
    mangle: false,
    format: {
      beautify: false,
      max_line_len: 100000,
      comments: false,
    },
  }).catch(err => {
    console.error('Terser minification failed:', err);
    process.exit(1);
  });

  // Wrap the minified code in bookmarklet wrapper again
  const bookmarkletMin = `javascript:(function(){${minified.code};${meta.bundle.name}.runBookmarklet();})();`;

  if (!fs.existsSync('dist')) fs.mkdirSync('dist');
  const outPath = path.join('dist', meta.minName);
  fs.writeFileSync(outPath, bookmarkletMin);
  console.log(`Minified bookmarklet for ${meta.site} built successfully.`);

  return bookmarkletMin;
}

// build bookmarklet.min.js and bookmarklet.js
function buildUnminifiedCode(meta: SiteMeta, minifiedCode: string, srcCode: string): void {
  const bookmarklet = `
/*
${meta.gistUrl ? meta.gistUrl + '\n' : ''}
Title: ${meta.title}
Description: ${meta.description}

Author: koal44
License: MIT
Usage: Save the Minified Code as a bookmark, then visit any ${meta.site} page and click it.

--- Minified Code ---
(Paste the following line as your bookmark URL)
${minifiedCode}
*/
${meta.domRefComment ? '\n' + meta.domRefComment + '\n' : ''}
javascript:(function() {
${srcCode}
${meta.bundle.name}.runBookmarklet();

})();`.trim();

  const outPath = path.join('dist', meta.unminName);
  fs.writeFileSync(outPath, bookmarklet);
  console.log(`Bookmarklet for ${meta.site} built successfully.`);
}

// Function to compute the URL hash as per Firefox's algorithm
function computeUrlHash(url: string): bigint {
  const GOLDEN_RATIO = 0x9e3779b9n;
  const MAX_UINT32 = 0xffffffffn;
  const MAX_LENGTH = 1500;

  function rotateLeft5(x: bigint): bigint {
    return ((x << 5n) | (x >> 27n)) & MAX_UINT32;
  }

  function hashSimple(str: string): bigint {
    let hash = 0n;
    const trimmed = str.slice(0, MAX_LENGTH);
    const bytes = Buffer.from(trimmed, 'utf8');
    for (const byte of bytes) {
      hash = (GOLDEN_RATIO * (rotateLeft5(hash) ^ BigInt(byte))) & MAX_UINT32;
    }
    return hash;
  }

  const scheme = url.split(':', 1)[0];
  const prefixHash = hashSimple(scheme) & 0xffffn;
  const fullHash = hashSimple(url);

  return (prefixHash << 32n) + fullHash;
}

function updateBookmarkletInFirefox(meta: SiteMeta, bookmarkUrl: string) {
  if (typeof process === 'undefined' || process.env?.ENABLE_BOOKMARK_UPDATE !== 'true') {
    return;
  }

  const bail = (msg: string) => {
    console.warn(`${updateBookmarkletInFirefox.name}: ${msg}`);
    return;
  };

  const appData = process.env?.APPDATA;
  if (!appData) return bail('APPDATA not set — skipping.');

  const profilesPath = path.join(appData, 'Mozilla', 'Firefox', 'Profiles');

  let profileDir: string | undefined;
  try {
    profileDir = fs.readdirSync(profilesPath).find(name => name.includes('default-release') );
  } catch {
    return bail('Firefox profile directory not found.');
  }
  if (!profileDir) return bail('default-release profile not found.');

  const dbPath = path.join(profilesPath, profileDir, 'places.sqlite');
  if (!fs.existsSync(dbPath)) return bail('places.sqlite not found.');
  // console.log(`${updateBookmarkletInFirefox.name}: Found database at ${dbPath}`);

  let db: Database.Database | undefined;
  try {
    db = new Database(dbPath);
    const bookmark = db
      .prepare<{title: string}, BookmarkRow>(`
        SELECT b.id, b.title, b.fk, p.url, p.url_hash
        FROM moz_bookmarks b
        JOIN moz_places p ON b.fk = p.id
        WHERE b.title = :title
      `).safeIntegers().get({title: meta.bookmarkTitle});

    if (!bookmark) return bail(`Bookmark '${meta.bookmarkTitle}' not found.`);

    const currentHash = computeUrlHash(bookmark.url || '');
    if (currentHash !== bookmark.url_hash) {
      return bail('Hash mismatch — skipping update.');
    }

    const updateStmt = db.prepare(`
      UPDATE moz_places
      SET url = ?, url_hash = ?
      WHERE id = ?
    `);

    db.transaction(() => {
      const info = updateStmt.run(bookmarkUrl, computeUrlHash(bookmarkUrl), bookmark.fk);

      if (info.changes === 1) {
        console.log(`${updateBookmarkletInFirefox.name}: Updated '${meta.bookmarkTitle}'`);
      } else if (info.changes === 0) {
        console.log(`${updateBookmarkletInFirefox.name}: Already up to date.`);
      } else {
        return bail(`Unexpected update count: ${info.changes}`);
      }
      console.warn('Note: Firefox may require a restart to see the change.');
    })();
  } catch (err) {
    bail(`Error during DB update: ${(err as Error).message}`);
  } finally {
    db?.close?.();
  }
}
