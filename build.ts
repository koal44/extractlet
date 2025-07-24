/* eslint-disable no-restricted-properties */
import fs from 'node:fs/promises';
import { rollup, ModuleFormat } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { cp } from 'node:fs/promises';

type TSFile = {
  input: string;
  output: string;
  format: ModuleFormat;
  patchPolyfill?: boolean;
};

const tsFiles: TSFile[] = [
  { input: 'src/background.ts', output: 'dist/background.js', format: 'esm', patchPolyfill: true },
  { input: 'src/extractlet.ts', output: 'dist/extractlet.js', format: 'iife' },
  { input: 'src/wiki-page.ts', output: 'dist/wiki-page.js', format: 'iife' },
  { input: 'src/se-page.ts', output: 'dist/se-page.js', format: 'iife' },
];

// -- bundle and patch polyfill imports
for (const tsFile of tsFiles) {
  await bundleSource(tsFile);
  if (tsFile.patchPolyfill) {
    await patchPolyFillImport(tsFile.output);
  }
}

// --- copy public assets ---
await cp('public', 'dist', { recursive: true, force: true });
await cp(
  'node_modules/webextension-polyfill/dist/browser-polyfill.js',
  'dist/browser-polyfill.js',
  { force: true }
);

// --- copy dist to dist-ff ---
await cp('dist', 'dist-ff', { recursive: true, force: true });

// --- patch manifest.json for chrome/firefox incompatibilities ---
const ffManifest = JSON.parse(await fs.readFile('dist-ff/manifest.json', 'utf8'));
if (ffManifest.background && ffManifest.background.service_worker) {
  delete ffManifest.background.service_worker;
  await fs.writeFile('dist-ff/manifest.json', JSON.stringify(ffManifest, null, 2));
  console.log('Patched manifest.json for Firefox in dist-ff');
}
const manifest = JSON.parse(await fs.readFile('dist/manifest.json', 'utf8'));
if (manifest.background && manifest.background.scripts) {
  delete manifest.background.scripts;
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
  await bundle.write({ file: output, format, globals, sourcemap: false });
  console.log(`Bundled ${output}`);
}

