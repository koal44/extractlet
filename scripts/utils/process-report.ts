/* eslint-disable no-restricted-properties */
import fs from 'node:fs/promises';
import path from 'node:path';

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

export async function dumpNodeState(label: string) {
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
