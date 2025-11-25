// usage: ts-node scripts/printfix-mjx.ts [expect|clean]
// default: generate .out.* files

/* eslint-disable no-restricted-properties */
import fs from 'node:fs';
import path from 'node:path';
import { setupDom } from '../test/utils/test-utils.js';
import { readHtmlFile } from '../test/fix/fix.js';
import type { MathView } from '../src/core.js';
import { toMd, toHtml } from '../src/core.js';
import { isElement } from '../src/utils/dom.js';

setupDom();

const FIXTURES_DIR = path.join(__dirname, '..', 'test', 'fix', 'fixtures', 'mathjax');
const BASE_CSS_PATH = path.join(__dirname, '..', 'public', 'base.css');
const BASE_CSS_START = '/* === xlet math start === */';
const BASE_CSS_END = '/* === xlet math end === */';

const baseCss = fs.readFileSync(BASE_CSS_PATH, 'utf8');
const mathCss = extractMathCss(baseCss);

type Mode = 'gen-out' | 'gen-expect' | 'clean';
const arg = process.argv[2] ?? '';
const mode: Mode =
  arg === 'clean'   ? 'clean' :
  arg === 'expect'  ? 'gen-expect' :
  'gen-out';

if (mode === 'clean') {
  const dir = FIXTURES_DIR;
  const patterns = ['.out.', '.structure.'];

  const files = fs.readdirSync(dir)
    .filter((f) => patterns.some((p) => f.includes(p)));

  console.log(`[printfix-mjx] Cleaning ${files.length} file(s):`);
  for (const f of files) {
    const full = path.join(dir, f);
    fs.unlinkSync(full);
    console.log(`  deleted ${relativePath(full)}`);
  }

  process.exit(0);
}

// Entry point
void (function main() {
  const htmlFiles = fs
    .readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith('.html'))
    .filter((f) => ['.out.', '.expect.'].every((excl) => !f.includes(excl)));

  console.log(`[printfix-mjx] Found ${htmlFiles.length} fixture(s):`);
  for (const file of htmlFiles) console.log(`  - ${file}`);

  for (const file of htmlFiles) {
    try {
      processFixture(file);
    } catch (err) {
      console.error(`[printfix-mjx] Error processing ${file}:`, err);
    }
  }

  console.log('[printfix-mjx] Done.');
})();

function processFixture(file: string): void {
  const htmlPath = path.join(FIXTURES_DIR, file);
  const baseName = file.replace(/\.html$/i, '');
  const baseUrl = `https://example.com/mathjax/${file}`;

  console.log(`\n[printfix-mjx] Processing ${file} …`);

  const doc = readHtmlFile(htmlPath, { baseUrl });
  const body = doc.body as HTMLElement | null;
  if (!body) {
    return console.warn(`  [warn] No <body> in ${file}, skipping.`);
  }

  // --- markdown output ---
  const mdOutPath = path.join(
    FIXTURES_DIR,
    `${baseName}.${mode === 'gen-expect' ? 'expect' : 'out'}.md`,
  );
  const md = toMd(body);
  fs.writeFileSync(mdOutPath, md, 'utf8');
  console.log(`  wrote ${relativePath(mdOutPath)}`);

  // --- HTML outputs for each math view ---
  const views: MathView[] = ['tex', 'svg', 'mathml'] as const;
  for (const view of views) {
    const bodyNode = toHtml(body, { mathView: view });
    if (!isElement(bodyNode)) {
      console.warn(`  [warn] toHtml returned null for view=${view}`);
      continue;
    }

    const standalone = wrapBody(bodyNode, `${baseName} [${view}]`);
    const htmlOutPath = path.join(
      FIXTURES_DIR,
      `${baseName}-${view}.${mode === 'gen-expect' ? 'expect' : 'out'}.html`,
    );
    fs.writeFileSync(htmlOutPath, standalone, 'utf8');
    console.log(`  wrote ${relativePath(htmlOutPath)}`);
  }
}

function extractMathCss(css: string): string {
  const startIdx = css.indexOf(BASE_CSS_START);
  const endIdx = css.indexOf(BASE_CSS_END);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('Failed to extract math CSS: markers not found or invalid');
  }
  return css.slice(startIdx + BASE_CSS_START.length, endIdx).trim();
}

function wrapBody(body: Element, title: string): string {
  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    `  <meta charset="utf-8">`,
    `  <title>${title}</title>`,
    `  <style>`,
    mathCss,
    `  </style>`,
    '</head>',
    body.outerHTML,
    '</html>',
    '',
  ].join('\n');
}

function relativePath(p: string): string {
  return path.relative(process.cwd(), p) || p;
}
