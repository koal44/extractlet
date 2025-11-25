// /* eslint-disable @typescript-eslint/no-unnecessary-condition */

// /* eslint-disable @typescript-eslint/no-unsafe-member-access */
// /* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable no-restricted-properties */
import fs from 'node:fs/promises';
import path from 'node:path';
import { rollup, type ModuleFormat, type RollupLog } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import {
  hasProp,
  // hasOfType, isArray, isNonEmptyString, isNumber, isFunction,
} from './src/typing';

type WarningCode = RollupLog['code'];

type BundleEntry = {
  input: string;
  output: string;
  format: ModuleFormat;
  patchPolyfill?: boolean;
  muteWarnings?: WarningCode[];
};

// clear dist/ folders
await fs.rm('dist', { recursive: true, force: true });
await fs.rm('dist-ff', { recursive: true, force: true });

// --- bundle top-level extension scripts ---
// These are the JS files the browser actually executes—via manifest (background,
// options, site pages) or via programmatic injection (run-extractlet, run-normalize).
const tsFiles: BundleEntry[] = [
  { input: 'src/background.ts', output: 'dist/background.js', format: 'esm', patchPolyfill: true },
  { input: 'src/content/run-extractlet.ts', output: 'dist/run-extractlet.js', format: 'iife' },
  { input: 'src/content/run-normalize.ts', output: 'dist/run-normalize.js', format: 'iife' },
  { input: 'src/settings-page.ts', output: 'dist/settings-page.js', format: 'iife' },
  { input: 'src/sites/wiki-page.ts', output: 'dist/sites/wiki-page.js', format: 'iife' },
  { input: 'src/sites/se-page.ts', output: 'dist/sites/se-page.js', format: 'iife' },
  { input: 'src/sites/hub-page.ts', output: 'dist/sites/hub-page.js', format: 'iife' },
];

// --- bundle and patch polyfill imports where needed ---
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

type ActiveHandle = {
  constructor?: { name?: string; };
  hasRef?: () => boolean;
  fd?: number;
  [key: string]: any;
};

type ActiveRequest = {
  constructor?: { name?: string; };
  [key: string]: unknown;
};

type Process = {
  pid: number;
  argv: string[];
  cwd: () => string;
  report?: {
    getReport?: () => unknown;
  };
  _getActiveHandles?: () => ActiveHandle[];
  _getActiveRequests?: () => ActiveRequest[];
  // [key: string]: any;
};

async function dumpNodeState(label: string) {
  const process: Process = globalThis.process;
  const outPath = path.join(process.cwd(), 'scratch', 'node-dump.json');

  const report = process.report?.getReport?.();

  const activeHandles = process._getActiveHandles?.() ?? [];
  const activeRequests = process._getActiveRequests?.() ?? [];

  const dump = {
    label,
    timestamp: new Date().toISOString(),
    pid: process.pid,
    argv: process.argv,
    cwd: process.cwd(),
    report,
    activeHandles: activeHandles.map((h) => ({
      type: h.constructor?.name,
      refed: typeof h.hasRef === 'function' ? h.hasRef() : undefined,
      fd: h.fd,
      ...h,
    })),
    activeRequests: activeRequests.map((r) => ({
      type: r.constructor?.name,
      ...r,
    })),
  };

  await fs.mkdir(path.join(process.cwd(), 'scratch'), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(dump, null, 2), 'utf8');
  console.log(`Wrote node-dump.json → ${outPath}`);
}


console.log('Build completed!');

if (process.env.DUMP_HANDLES) {
  await dumpNodeState('post-build');
}

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

async function bundleSource({ input, output, format, muteWarnings }: BundleEntry): Promise<void> {
  const globals = { 'webextension-polyfill': 'browser' };
  const bundle = await rollup({
    input,
    external: ['webextension-polyfill'],
    plugins: [typescript()],

    // Some entry scripts export values but aren't libraries; mute IIFE export warnings.
    // either name them (but pollutes window) or mute the warning.
    onwarn(warning, defaultWarn) {
      if (muteWarnings?.includes(warning.code)) return;
      defaultWarn(warning);
    },
  });

  try {
    await bundle.write({ file: output, format, globals, sourcemap: false });
    console.log(`Bundled ${output}`);
  } finally {
    await bundle.close();
  }
}
