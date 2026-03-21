export type GhDomain =
  | 'search'
  | 'issue' | 'pr' | 'disc' | 'repo'
  | 'issues' | 'pulls' | 'discussions'
  | 'owner' | 'tree' | 'commit'
  | 'blob' | 'blame'
  | 'commits';

type GhPath = {
  owner?: string;
  repo?: string;
  kind?: string;
  id?: string;
  hash: string;
  tail: string[];
  search: string;
};

export function parseGhPath(str: string): GhPath | undefined {
  try {
    const u = new URL(str, 'https://github.com');
    if (u.hostname !== 'github.com') return;

    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 1) return;

    const [owner, repo, kind, id, ...tail] = parts;
    return { owner, repo, kind, id, tail, hash: u.hash, search: u.search };
  } catch {
    return;
  }
}

export function matchGhUrl(str: string, withHash = false): string | null {
  const p = parseGhPath(str);
  if (!p?.owner) return null;

  let base = `https://github.com/${p.owner}`;

  if (p.owner === 'search') {
    return withHash && p.hash ? `${base}${p.search}${p.hash}` : `${base}${p.search}`;
  }

  if (p.repo) base += `/${p.repo}`;
  if (p.kind) base += `/${p.kind}`;
  if (p.id) base += `/${p.id}`;
  if (p.tail.length) base += `/${p.tail.join('/')}`;

  return withHash && p.hash ? `${base}${p.hash}` : base;
}

export function detectGhDomain(str: string): GhDomain | undefined {
  const p = parseGhPath(str);
  if (!p?.owner) return;
  if (p.owner === 'search') return 'search';
  if (!p.repo) return 'owner';
  if (!p.kind) return 'repo';

  switch (p.kind) {
    case 'discussions': return p.id ? 'disc' : 'discussions';
    case 'issues': return p.id ? 'issue' : 'issues';
    case 'pulls': return 'pulls';
    case 'pull': return p.id ? 'pr' : undefined;
    case 'tree': return 'tree';
    case 'commit': return p.id ? 'commit' : undefined;
    case 'commits': return 'commits';
    case 'blob': return p.id && p.tail.length ? 'blob' : undefined;
    case 'blame': return p.id && p.tail.length ? 'blame' : undefined;
  }
}
