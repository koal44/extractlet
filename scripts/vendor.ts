/* eslint-disable no-restricted-properties */
import {
  existsSync, mkdirSync, readFileSync, createWriteStream, readdirSync, copyFileSync, statSync, rmSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import https from 'node:https';
import http from 'node:http';

type GitSpec = {
  type: 'git';
  repo: string;
  rev: string; // tag or SHA
  dir: string;
  patch?: string;
  active: boolean;
};

type ZipSpec = {
  type: 'zip';
  url: string;
  dir: string;
  active: boolean;
  overlayDir?: string;
};

type VendorSpec = GitSpec | ZipSpec ;

const lock = JSON.parse(
  readFileSync('vendor-lock.json', 'utf8'),
) as Record<string, VendorSpec>;

void run().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function run(): Promise<void> {
  for (const [name, spec] of Object.entries(lock)) {
    if (!spec.active) {
      console.log(`--- [vendor] Skipping ${name} (active=false) ---`);
      continue;
    }

    switch (spec.type) {
      case 'git':
        fetchGitSpec(name, spec);
        break;
      case 'zip':
        await fetchZipSpec(name, spec);
        break;
      default:
        console.log(`--- [vendor] Skipping ${name} (unknown type "${String(spec satisfies never)}") ---`);
    }
  }
}

function sh(bin: string, args: string[], cwd?: string) {
  execFileSync(bin, args, { stdio: 'inherit', cwd });
}

function fetchGitSpec(name: string, spec: GitSpec): void {
  console.log(`--- [vendor] Using ${name} ---`);

  const { repo, rev, dir } = spec;
  const patch = spec.patch ? resolve(spec.patch) : undefined;

  if (!existsSync(dir)) {
    mkdirSync(dirname(dir), { recursive: true });
    sh('git', ['clone', '--quiet', repo, dir]);
    sh('git', ['-C', dir, 'config', 'core.filemode', 'false']);
    console.log(`[vendor] Cloned ${name} to ${dir}`);
  }

  try {
    console.log('[vendor] verify revision exists locally');
    sh('git', ['-C', dir, 'rev-parse', '--verify', rev]);
  } catch {
    console.log(`[vendor] fetching ${name} from origin...`);
    sh('git', ['-C', dir, 'fetch', '--quiet', '--tags', '--prune', 'origin']);
  }

  console.log(`[vendor] checkout ${name} @ ${rev}`);
  sh('git', ['-C', dir, '-c', 'advice.detachedHead=false', 'checkout', '--force', rev]);
  sh('git', ['-C', dir, 'clean', '-ffd']);

  if (patch) {
    console.log(`[vendor] applying patch for ${name}`);
    sh('git', ['-C', dir, 'apply', '--whitespace=fix', '--quiet', patch]);
  }

  console.log(`[vendor] ${name} ready @ ${dir}`);
}

async function fetchZipSpec(name: string, spec: ZipSpec): Promise<void> {
  console.log(`--- [vendor] Using ${name} (zip) ---`);

  const outDir = spec.dir;
  const url = spec.url;
  const downloadsDir = 'vendor/_downloads';
  const archiveName = `${name}.zip`;
  const archivePath = resolve(downloadsDir, archiveName);

  mkdirSync(dirname(archivePath), { recursive: true });

  if (!existsSync(archivePath)) {
    console.log(`[vendor] ${name}: downloading ${url} → ${archivePath}`);
    await downloadTo(url, archivePath);
  } else {
    console.log(`[vendor] ${name}: archive already present (${archivePath}), skipping download.`);
  }

  // Clean outDir so we always get a fresh tree before overlay
  if (existsSync(outDir)) {
    console.log(`[vendor] ${name}: removing existing ${outDir}`);
    rmSync(outDir, { recursive: true, force: true });
  }
  mkdirSync(outDir, { recursive: true });

  console.log(`[vendor] ${name}: extracting ${archivePath} → ${outDir}`);
  sh('tar', ['-xf', archivePath, '--strip-components=1', '-C', outDir]);

  // Optional overlay/patch step
  if (spec.overlayDir) {
    const overlay = resolve(spec.overlayDir);
    console.log(`[vendor] ${name}: applying overlay from ${overlay}`);
    copyDirRecursive(overlay, outDir);
  }

  console.log(`[vendor] ${name} ready @ ${outDir}`);
}

async function httpGet(u: URL): Promise<http.IncomingMessage> {
  const lib = u.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.get(u, (res) => {
      const code = res.statusCode ?? 0;
      if (code >= 300 && code < 400 && res.headers.location) {
        const next = new URL(res.headers.location, u);
        res.resume();
        resolve(httpGet(next));
        return;
      }
      if (code !== 200) {
        reject(new Error(`HTTP ${code} for GET ${u.toString()}`));
        return;
      }
      resolve(res);
    });
    req.on('error', reject);
  });
}

async function downloadTo(url: string, outPath: string): Promise<void> {
  mkdirSync(dirname(outPath), { recursive: true });
  const res = await httpGet(new URL(url));
  await new Promise<void>((resolve, reject) => {
    const file = createWriteStream(outPath, { flags: 'w' });
    res.pipe(file);
    res.on('error', reject);
    file.on('finish', () => file.close(() => resolve()));
  });
}

function copyDirRecursive(src: string, dest: string): void {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(src)) {
    const srcPath = resolve(src, entry);
    const destPath = resolve(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (stat.isFile()) {
      copyFileSync(srcPath, destPath);
    }
    // Symlinks/etc: ignore for now;
  }
}
