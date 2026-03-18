export type GhDomain =
  | 'issue' | 'pr' | 'disc' | 'repo'
  | 'issues' | 'pulls' | 'discussions'
  | 'owner' | 'tree' | 'commit';

type GhPath = {
  owner?: string;
  repo?: string;
  kind?: string;
  id?: string;
  hash: string;
  tail: string[];
};

export function parseGhPath(str: string): GhPath | undefined {
  try {
    const u = new URL(str, 'https://github.com');
    if (u.hostname !== 'github.com') return;

    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 1) return;

    const [owner, repo, kind, id, ...tail] = parts;
    return { owner, repo, kind, id, tail, hash: u.hash };
  } catch {
    return;
  }
}

export function matchGhUrl(str: string, withHash = false): string | null {
  const p = parseGhPath(str);
  if (!p?.owner) return null;

  let base = `https://github.com/${p.owner}`;

  if (p.repo) base += `/${p.repo}`;
  if (p.kind) base += `/${p.kind}`;
  if (p.id) base += `/${p.id}`;
  if (p.tail.length) base += `/${p.tail.join('/')}`;

  return withHash && p.hash ? `${base}${p.hash}` : base;
}

export function detectGhDomain(str: string): GhDomain | undefined {
  const p = parseGhPath(str);
  if (!p?.owner) return;

  if (!p.repo) return 'owner';
  if (!p.kind) return 'repo';

  if (p.kind === 'issues') {
    return p.id ? 'issue' : 'issues';
  }

  if (p.kind === 'pulls') return 'pulls';
  if (p.kind === 'pull' && p.id) return 'pr';

  if (p.kind === 'discussions') {
    return p.id ? 'disc' : 'discussions';
  }

  if (p.kind === 'tree') return 'tree';
  if (p.kind === 'commit' && p.id) return 'commit';
}
