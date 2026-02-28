/* eslint-disable no-restricted-properties */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import util from 'node:util';

try {
  runRelease();
} catch (error: unknown) {
  const err = error as { errno?: number; };
  if (err.errno) {
    console.log('errorMsg: ', util.getSystemErrorMessage(err.errno));
  }
  console.error('Error during release:', error);
  process.exit(1);
}

type BrowserTarget = 'firefox' | 'chrome';
type WebExtCmd = 'lint' | 'build';

function runRelease() {
  console.log('Packaging extension artifacts...');

  webExt('lint', 'firefox');
  webExt('build', 'firefox');
  renameLatestArtifact('firefox');

  webExt('build', 'chrome');
  renameLatestArtifact('chrome');

  console.log('Release build complete!');
}

function webExt(cmd: WebExtCmd, browser: BrowserTarget) {
  const sourceDir = `dist/${browser}`;
  const args =
    cmd === 'lint'
      ? ['lint', '--source-dir', sourceDir]
      : ['build', '--source-dir', sourceDir, '--artifacts-dir', 'dist', '--overwrite-dest'];

  execFileSync('web-ext', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

function renameLatestArtifact(browser: BrowserTarget) {
  const zipFile = fs
    .readdirSync('dist')
    .find((f) => f.startsWith('extractlet') && f.endsWith('.zip'));

  if (!zipFile) {
    throw new Error(`No zip file found in dist/ after building ${browser} extension`);
  }

  fs.renameSync(`dist/${zipFile}`, `dist/${browser}-${zipFile}`);
}
