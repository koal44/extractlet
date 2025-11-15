/* eslint-disable no-restricted-properties */
import fs from 'node:fs/promises';
import type { ModuleFormat } from 'rollup';
import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import {
  hasOfType, hasProp, isArray, isNonEmptyString, isNumber, isFunction,
} from './src/typing';

type TSFile = {
  input: string;
  output: string;
  format: ModuleFormat;
  patchPolyfill?: boolean;
};

if (process.env.DUMP_HANDLES) {
  setTimeout(() => {
    // report: {activeHandles: [...], activeRequests: [...], otherProps...}
    // activeHandles: {fd?: number, hasRef?: () => boolean, constructor: {name: string}, ...}
    const rep = process.report.getReport();
    const handles = hasOfType(rep, 'activeHandles', isArray) ? rep.activeHandles : [];
    const requests = hasOfType(rep, 'activeRequests', isArray) ? rep.activeRequests : [];

    const summarize = (xs: unknown[]) =>
      xs.map((x) => {
        // const t = hasProp(x, 'constructor') && hasOfType(x.constructor, 'name', isNonEmptyString)
        const t = hasOfType(x, ['constructor', 'name'], isNonEmptyString)
          ? x.constructor.name
          : typeof x;
        // file descriptors / timers often expose helpful props:
        const fd = hasOfType(x, 'fd', isNumber) ? x.fd : undefined;
        const refed = hasOfType(x, 'hasRef', isFunction) ? Boolean(x.hasRef()) : undefined;
        return { type: t, fd, refed };
      });

    console.log('\n=== Active (diagnostic report) ===');
    console.log('handles:', handles.length, summarize(handles));
    console.log('requests:', requests.length, summarize(requests));
    console.log('==================================\n');
  }, 10_000).unref();
}


const tsFiles: TSFile[] = [
  { input: 'src/background.ts', output: 'dist/background.js', format: 'esm', patchPolyfill: true },
  { input: 'src/extractlet.ts', output: 'dist/extractlet.js', format: 'iife' },
  { input: 'src/options.ts', output: 'dist/options.js', format: 'iife' },
  { input: 'src/sites/wiki-page.ts', output: 'dist/sites/wiki-page.js', format: 'iife' },
  { input: 'src/sites/se-page.ts', output: 'dist/sites/se-page.js', format: 'iife' },
  { input: 'src/sites/hub-page.ts', output: 'dist/sites/hub-page.js', format: 'iife' },
];

// -- bundle and patch polyfill imports
for (const tsFile of tsFiles) {
  await bundleSource(tsFile);
  if (tsFile.patchPolyfill) {
    await patchPolyFillImport(tsFile.output);
  }
}

// --- copy public assets ---
await fs.cp('public', 'dist', { recursive: true, force: true });
await fs.cp(
  'node_modules/webextension-polyfill/dist/browser-polyfill.js',
  'dist/browser-polyfill.js',
  { force: true }
);

// --- copy dist to dist-ff ---
await fs.cp('dist', 'dist-ff', { recursive: true, force: true });

// --- patch manifest.json for chrome/firefox incompatibilities ---
const ffManifest = JSON.parse(await fs.readFile('dist-ff/manifest.json', 'utf8')) as unknown;
if (hasProp(ffManifest, ['background', 'service_worker'])) {
  delete (ffManifest.background as { service_worker?: unknown; }).service_worker;
  await fs.writeFile('dist-ff/manifest.json', JSON.stringify(ffManifest, null, 2));
  console.log('Patched manifest.json for Firefox in dist-ff');
}

const manifest = JSON.parse(await fs.readFile('dist/manifest.json', 'utf8')) as unknown;
if (hasProp(manifest, ['background', 'scripts'])) {
  delete (manifest.background as { scripts?: unknown; }).scripts;
  await fs.writeFile('dist/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('Patched manifest.json for Chrome/other in dist');
}

console.log('Build completed!');

// ------------------------
// --- HELPER FUNCTIONS ---
// ------------------------

async function patchPolyFillImport(file: string): Promise<void> {
  const content = await fs.readFile(file, 'utf8');
  const patched = content.replace(
    /^import\s+browser\s+from\s+['"]webextension-polyfill['"];?/gm,
    'import \'./browser-polyfill.js\';'
  );
  if (patched === content) throw new Error(`Polyfill import patch failed: pattern not found in ${file}`);
  await fs.writeFile(file, patched);
  console.log(`Patched polyfill in ${file}`);
}

async function bundleSource({ input, output, format }: TSFile): Promise<void> {
  const globals = { 'webextension-polyfill': 'browser' };
  const bundle = await rollup({
    input,
    external: ['webextension-polyfill'],
    plugins: [typescript()],
  });

  try {
    await bundle.write({ file: output, format, globals, sourcemap: false });
    console.log(`Bundled ${output}`);
  } finally {
    await bundle.close();
  }
}
