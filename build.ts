import fs from 'node:fs';
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

for (const tsFile of tsFiles) {
  await bundleSource(tsFile);
  if (tsFile.patchPolyfill) {
    patchPolyFillImport(tsFile.output);
  }
}

await cp('public', 'dist', { recursive: true, force: true });
await cp(
  'node_modules/webextension-polyfill/dist/browser-polyfill.js',
  'dist/browser-polyfill.js',
  { force: true }
);

function patchPolyFillImport(file: string): void {
  if (!fs.existsSync(file)) throw new Error(`File not found: ${file}`);
  const original = fs.readFileSync(file, 'utf8');
  const patched = original.replace(
    /^import\s+browser\s+from\s+['"]webextension-polyfill['"];?/gm,
    'import \'./browser-polyfill.js\';'
  );
  if (patched === original) throw new Error(`Polyfill import patch failed: pattern not found in ${file}`);
  fs.writeFileSync(file, patched);
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
