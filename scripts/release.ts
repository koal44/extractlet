/* eslint-disable no-restricted-properties */
import { execFileSync } from 'node:child_process';
import util from 'node:util';

try {
  runRelease();
} catch (error: unknown) {
  const err = error as { errno?: number; message: string; };
  if (err.errno) {
    console.log('errorMsg: ', util.getSystemErrorMessage(err.errno));
  }
  console.error('Error during release:', error);
  process.exit(1);
}

function runRelease() {
  console.log('Linting and building Firefox extension...');
  execFileSync(
    'web-ext',
    ['lint', '--source-dir', 'dist/firefox'],
    { stdio: 'inherit', shell: process.platform === 'win32' }
  );
  execFileSync(
    'web-ext',
    ['build', '--source-dir', 'dist/firefox', '--artifacts-dir', 'dist', '--overwrite-dest'],
    { stdio: 'inherit', shell: process.platform === 'win32' }
  );
}
