/* eslint-disable no-restricted-properties */
import fs from 'node:fs/promises';
import { rollup, type ModuleFormat, type RollupLog } from 'rollup';
import typescript from '@rollup/plugin-typescript';

type WarningCode = RollupLog['code'];

type BundleEntry = {
  input: string;
  output: string;
  format: ModuleFormat;
  patchPolyfill?: boolean;
  muteWarnings?: WarningCode[];
};

type ManifestStub = {
  background?: { service_worker?: string; scripts?: string[]; };
  incognito?: string;
  browser_specific_settings?: unknown;
};

const DIST_ROOT = 'dist';
const DIST_CHROME = `${DIST_ROOT}/chrome`;
const DIST_FIREFOX = `${DIST_ROOT}/firefox`;
await fs.rm(DIST_ROOT, { recursive: true, force: true });

// --- bundle top-level extension scripts ---
// These are the JS files the browser actually executes—via manifest (background,
// options, site pages) or via programmatic injection (run-extractlet, run-normalize).
const tsFiles: BundleEntry[] = [
  { input: 'src/background.ts', output: `${DIST_CHROME}/background.js`, format: 'esm', patchPolyfill: true },
  { input: 'src/content/run-extractlet.ts', output: `${DIST_CHROME}/run-extractlet.js`, format: 'iife' },
  { input: 'src/content/run-normalize.ts', output: `${DIST_CHROME}/run-normalize.js`, format: 'iife' },
  { input: 'src/settings-page.ts', output: `${DIST_CHROME}/settings-page.js`, format: 'iife' },
  { input: 'src/sites/wiki-page.ts', output: `${DIST_CHROME}/sites/wiki-page.js`, format: 'iife' },
  { input: 'src/sites/se-page.ts', output: `${DIST_CHROME}/sites/se-page.js`, format: 'iife' },
  { input: 'src/sites/hub-page.ts', output: `${DIST_CHROME}/sites/hub-page.js`, format: 'iife' },
];

// --- bundle and patch polyfill imports where needed ---
for (const tsFile of tsFiles) {
  await bundleSource(tsFile);
  if (tsFile.patchPolyfill) {
    await patchPolyFillImport(tsFile.output);
  }
}

// --- copy public assets into chrome build ---
await fs.cp('public', DIST_CHROME, { recursive: true, force: true });
await fs.cp(
  'node_modules/webextension-polyfill/dist/browser-polyfill.js',
  `${DIST_CHROME}/browser-polyfill.js`,
  { force: true }
);

// --- clone chrome build to firefox build ---
await fs.cp(DIST_CHROME, DIST_FIREFOX, { recursive: true, force: true });

// --- patch manifest.json for chrome/firefox incompatibilities ---
async function patchFirefoxManifest(): Promise<void> {
  const ffManifest = JSON.parse(await fs.readFile(`${DIST_FIREFOX}/manifest.json`, 'utf8')) as ManifestStub;
  delete ffManifest.background?.service_worker;
  delete ffManifest.incognito;
  await fs.writeFile(`${DIST_FIREFOX}/manifest.json`, JSON.stringify(ffManifest, null, 2));
  console.log(`Patched manifest.json for Firefox in ${DIST_FIREFOX}`);
}

async function patchChromeManifest(): Promise<void> {
  const manifest = JSON.parse(await fs.readFile(`${DIST_CHROME}/manifest.json`, 'utf8')) as ManifestStub;
  delete manifest.background?.scripts;
  delete manifest.browser_specific_settings;
  await fs.writeFile(`${DIST_CHROME}/manifest.json`, JSON.stringify(manifest, null, 2));
  console.log(`Patched manifest.json for Chrome in ${DIST_CHROME}`);
}

await Promise.all([patchFirefoxManifest(), patchChromeManifest()]);

console.log('Build completed!');
process.exit(0);


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
