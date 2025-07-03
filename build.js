import fs from 'node:fs';
import path from 'node:path';
import { minify } from 'terser';
import jsStringEscape from 'js-string-escape';
import Database from 'better-sqlite3';
import { glob } from 'glob';

const shouldUpdateBookmarklet = true;

const wikiMeta = {
  title: 'Wiki Sharing Bookmarklet',
  description: 'Extract wiki pages into plain Markdown or Wikitext, preserving math, code, and other doument structure. Useful for archiving or sharing with GPT.',
  site: 'wiki',
  srcFiles: [
    'src/utils.js',
    'src/wiki.js',
  ],
  minName: 'wiki-bookmarklet.min.js',
  unminName: 'wiki-bookmarklet.js',
  gistUrl: null,
  bookmarkTitle: 'wiki-scraper',
};

const seMeta = {
  title: 'StackExchange Sharing Bookmarklet',
  description: 'Extract Stack Exchange posts into plain Markdown, preserving math, code, and other document structure. Useful for archiving or sharing with GPT.',
  site: 'Stack Exchange',
  srcFiles: [
    'src/utils.js',
    'src/se.js',
  ],
  minName: 'se-bookmarklet.min.js',
  unminName: 'se-bookmarklet.js',
  gistUrl: 'https://gist.github.com/koal44/77102fb777f9e3eb820db2a342ef965d',
  bookmarkTitle: 'stackexchange-scraper',
};

(async () => {
  createExampleJs();
  generateVanillaSourceFiles();
  const sites = [wikiMeta, seMeta];
  for (const meta of sites) {
    const srcCode = meta.srcFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');
    const cleanedCode = cleanTheCodeForSharing(srcCode);
    const bookmarkletUrl = await buildMinifiedCode(meta, cleanedCode);
    buildUnminifiedCode(meta, bookmarkletUrl, cleanedCode);
    if (shouldUpdateBookmarklet) {
      updateBookmarkletInFirefox(meta, bookmarkletUrl);
    }
  }
  console.log('Build process completed successfully.');
})();

function toCamelCase(str) {
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
  const filesBySite = {};
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
    const jsExampleManifest = [];

    for (const input of filesBySite[site]) {
      const baseName = path.basename(input, htmlSuffix);        // e.g. 'se-math-limits'
      
      const htmlFileName = `${baseName}${outputSuffix}`;        // e.g. 'se-math-limits_string.js'
      const genDir = `test/browser/${site}/gen`;                // fixed location
      const outputPath = `${genDir}/${htmlFileName}`;           // full output path
      const htmlVar = toCamelCase(baseName) + 'String';     // e.g. seMathLimitsString
      const htmlInfo = { htmlVar, htmlFileName };

      if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });

      const html = fs.readFileSync(input, 'utf8');
      const escaped = jsStringEscape(html);
      const jsContent = `var ${htmlVar} = "${escaped}";\n`;  // use var or window[constName]

      fs.writeFileSync(outputPath, jsContent);
      console.log(`Built ${outputPath}`);

      // If there's a corresponding .raw file, process it too
      let rawInfo;
      const rawPath = input.replace(htmlSuffix, rawSuffix);
      if (fs.existsSync(rawPath)) {
        const rawFileName = `${baseName}${outputRawSuffix}`;  // e.g. 'wiki-enwiki-tensor_raw_string.js'
        const rawOutputPath = `${genDir}/${rawFileName}`;
        const rawVar = toCamelCase(baseName) + 'RawString'; // e.g. wikiEnwikiTensorRawString
        rawInfo = { rawVar, rawFileName };

        const raw = fs.readFileSync(rawPath, 'utf8');
        const escapedRaw = jsStringEscape(raw);
        const rawJsContent = `var ${rawVar} = "${escapedRaw}";\n`; // use var or window[constName]

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

function cleanTheCodeForSharing(srcCode) {
  // Remove debug functions and console.log() statements
  return srcCode
    .replace(/\/\* @debug-start \*\/[\s\S]*?\/\* @debug-end \*\//g, '')
    .replace(/\/\* @export-start \*\/[\s\S]*?\/\* @export-end \*\//g, '')
    .split('\n')
    .filter(line => !/^\s*(\/\/\s*)?(console\.)?log\(/.test(line))
    .join('\n');
}

async function buildMinifiedCode(meta, srcCode) {
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
  const bookmarkletMin = `javascript:(function(){${minified.code};runBookmarklet();})();`;

  if (!fs.existsSync('dist')) fs.mkdirSync('dist');
  const outPath = path.join('dist', meta.minName);
  fs.writeFileSync(outPath, bookmarkletMin);
  console.log('Minified bookmarklet built successfully.');

  return bookmarkletMin;
}

// build bookmarklet.min.js and bookmarklet.js
function buildUnminifiedCode(meta, minifiedCode, srcCode) {
  const bookmarklet = `
/*
${meta.gistUrl ? meta.gistUrl + '\n\n' : ''}
Title: ${meta.title}
Description: ${meta.description}

Author: koal44
License: MIT
Usage: Save the Minified Code as a bookmark, then visit any ${meta.site} page and click it.

--- Minified Code ---
(Paste the following line as your bookmark URL)
${minifiedCode}
*/

javascript:(function() {
${srcCode}
runBookmarklet();

})();`;

  const outPath = path.join('dist', meta.unminName);
  fs.writeFileSync(outPath, bookmarklet);
  console.log('Bookmarklet built successfully.');
}

// Function to compute the URL hash as per Firefox's algorithm
function computeUrlHash(url) {
  const GOLDEN_RATIO = 0x9e3779b9n;
  const MAX_UINT32 = 0xffffffffn;
  const MAX_LENGTH = 1500;

  function rotateLeft5(x) {
    return ((x << 5n) | (x >> 27n)) & MAX_UINT32;
  }

  function hashSimple(str) {
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

// This part requires sqlite3 package to access Firefox's SQLite
function updateBookmarkletInFirefox(meta, bookmarkUrl) {
  // Locate Firefox profile path
  const appData = process.env.APPDATA;
  const profilesPath = path.join(appData, 'Mozilla', 'Firefox', 'Profiles');
  const profileDir = fs.readdirSync(profilesPath).find(name =>
    name.includes('default-release')
  );
  if (!profileDir) throw new Error('Could not find default-release Firefox profile');
  const dbPath = path.join(profilesPath, profileDir, 'places.sqlite');
  if (!fs.existsSync(dbPath)) throw new Error('places.sqlite not found');
  console.log(`Found database: ${dbPath}`);

  fs.copyFileSync(dbPath, `${dbPath}.bak`); // Backup the database before anything

  // Open the SQLite database and update the bookmark bookmark.
  const db = new Database(dbPath);
  //db.pragma('journal_mode = WAL');
  const bookmark = db.prepare(`
    SELECT b.id, b.title, b.fk, p.url, p.url_hash
    FROM moz_bookmarks b
    JOIN moz_places p ON b.fk = p.id
    WHERE b.title = ?
  `).safeIntegers().get(meta.bookmarkTitle);

  if (!bookmark) throw new Error(`Bookmark '${meta.bookmarkTitle}' not found in Firefox bookmarks.`);
  const hash = computeUrlHash(bookmark.url || '');
  // sanity check that computedUrlHash matches Firefox's algorithm
  if (hash !== bookmark.url_hash) {
    throw new Error(`Computed hash (${hash}) does not match stored hash (${bookmark.url_hash}) for bookmark '${meta.bookmarkTitle}'.`);
  }
  // Update the bookmark with the new URL
  const updateStmt = db.prepare(`
    UPDATE moz_places
    SET url = ?, url_hash = ?
    WHERE id = ?
  `);

  db.transaction(() => {
    const info = updateStmt.run(bookmarkUrl, computeUrlHash(bookmarkUrl), bookmark.fk);
    if (info.changes === 1) {
      console.log(`Updated bookmark: '${meta.bookmarkTitle}'`);
    } else if (info.changes === 0) {
      console.warn(`Bookmark '${meta.bookmarkTitle}' was already up to date.`);
    } else {
      throw new Error(`Unexpected number of changes: ${info.changes}`);
    }
    console.warn('Note: Firefox may require a restart to reflect any changes');
  })();

  db.close();
}

// test.html can't source modules, only vanilla JS
function generateVanillaSourceFiles() {
  const debugPattern = /\/\* @export-start \*\/[\s\S]*?\/\* @export-end \*\//g;
  const genDir = path.join('test', 'browser', 'gen');
  if (!fs.existsSync(genDir)) fs.mkdirSync(genDir, { recursive: true });

  const srcFiles = fs.readdirSync('src').filter(f => f.endsWith('.js'));

  for (const file of srcFiles) {
    const filePath = path.join('src', file);
    const content = fs.readFileSync(filePath, 'utf8').replace(debugPattern, '');
    const outputPath = path.join(genDir, `_${file}`);
    fs.writeFileSync(outputPath, content);
    console.log(`Generated ${outputPath}`);
  }
}