const fs = require('fs');
const path = require('path');
const terser = require('terser');
const jsStringEscape = require('js-string-escape');
const Database = require('better-sqlite3');

const gistUrl = 'https://gist.github.com/koal44/77102fb777f9e3eb820db2a342ef965d';
const bookmarkTitle = 'stackexchange-scraper';
const testPath = 'test';
const distPath = 'dist';
const shouldUpdateBookmarklet = true;

(async () => {
  createExampleJs();
  const scraperJs = fs.readFileSync('src/stackexchange_scraper.js', 'utf8');
  const srcCode = cleanTheCodeForSharing(scraperJs);
  const bookmarkletUrl = await buildMinifiedCode(srcCode);
  buildUnminifiedCode(bookmarkletUrl, srcCode);
  if (shouldUpdateBookmarklet) {
    updateBookmarkletInFirefox(bookmarkletUrl);
  }
})();

function createExampleJs() {
  const htmlSuffix = '.htm';
  const outputSuffix = '_html_string.js';

  if (!fs.existsSync(testPath)) fs.mkdirSync(testPath);
  const files = fs.readdirSync(testPath);
  const jsExampleFiles = [];

  for (const file of files.filter(f => f.endsWith(htmlSuffix))) {
    const base = path.basename(file, htmlSuffix); // 'example1'
    const input = path.join(testPath, file);
    const output = path.join(testPath, `${base}${outputSuffix}`);
    const varName = `${base}Html`;

    const html = fs.readFileSync(input, 'utf8');
    const escaped = jsStringEscape(html);
    const jsContent = `var ${varName} = "${escaped}";\n`; // use var or window[constName]

    fs.writeFileSync(output, jsContent);
    jsExampleFiles.push(`${base}${outputSuffix}`);
    console.log(`Built ${output}`);
}

  const jsExamplesFilesString = `const exampleFiles = ${JSON.stringify(jsExampleFiles, null, 4)};`;
  const examplePath = path.join(testPath, 'example_files.js');
  fs.writeFileSync(examplePath, jsExamplesFilesString);
  console.log(`Built ${examplePath}`);
}

function cleanTheCodeForSharing(srcCode) {
  // Remove debug functions and console.log() statements
  return srcCode
    .replace(/\/\* @debug-start \*\/[\s\S]*?\/\* @debug-end \*\//g, '')
    .split('\n')
    .filter(line => !/^\s*(\/\/\s*)?(console\.)?log\(/.test(line))
    .join('\n');
}

async function buildMinifiedCode(srcCode) {
  const minified = await terser.minify(srcCode, {
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

  if (!fs.existsSync(distPath)) fs.mkdirSync(distPath);
  fs.writeFileSync(`${distPath}/bookmarklet.min.js`, bookmarkletMin);
  console.log('Minified bookmarklet built successfully.');

  return bookmarkletMin;
}

// build bookmarklet.min.js and bookmarklet.js
function buildUnminifiedCode(minifiedCode, srcCode) {
  const bookmarklet = `
/*
${gistUrl}

Stack Exchange Q&A Scraper Bookmarklet
View and copy readable StackExchange posts including original LaTeX code.

Author: koal44
License: MIT
Usage: Save the Minified Code as a bookmark, then visit any StackExchange page and click it.

--- Minified Code ---
(Paste the following line as your bookmark URL)
${minifiedCode}
*/

javascript:(function() {
${srcCode}
runBookmarklet();

})();`;

  fs.writeFileSync(`${distPath}/bookmarklet.js`, bookmarklet);
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
function updateBookmarkletInFirefox(bookmarkUrl) {
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
  `).safeIntegers().get(bookmarkTitle);

  if (!bookmark) throw new Error(`Bookmark '${bookmarkTitle}' not found in Firefox bookmarks.`);
  const hash = computeUrlHash(bookmark.url || '');
  // sanity check that computedUrlHash matches Firefox's algorithm
  if (hash !== bookmark.url_hash) {
    throw new Error(`Computed hash (${hash}) does not match stored hash (${bookmark.url_hash}) for bookmark '${bookmarkTitle}'.`);
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
      console.log(`Updated bookmark: '${bookmarkTitle}'`);
    } else if (info.changes === 0) {
      console.warn(`Bookmark '${bookmarkTitle}' was already up to date.`);
    } else {
      throw new Error(`Unexpected number of changes: ${info.changes}`);
    }
    console.warn('Note: Firefox may require a restart to reflect any changes');
  })();

  db.close();
}