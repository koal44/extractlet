export type GhPage =
  | 'search' | 'owner' | 'repo'
  | 'issues' | 'issue'
  | 'pulls' | 'pr' | 'pr-commits' | 'pr-checks' | 'pr-files'
  | 'discussions' | 'disc'
  | 'tree' | 'blob' | 'blame'
  | 'commit' | 'commits'
  | 'actions' | 'actions-run' | 'actions-job';

type GhRouteBase = { url: string; hash: string; search: string; };
type GhRepoBase = GhRouteBase & { owner: string; repo: string; };

export type GhRoute =
  | (GhRouteBase & { page: 'search'; })
  | (GhRouteBase & { page: 'owner'; owner: string; })
  | (GhRepoBase & { page: 'repo'; })
  | (GhRepoBase & { page: 'issues'; })
  | (GhRepoBase & { page: 'issue'; issueId: string; })
  | (GhRepoBase & { page: 'pulls'; })
  | (GhRepoBase & { page: 'pr'; prId: string; })
  | (GhRepoBase & { page: 'pr-commits'; prId: string; })
  | (GhRepoBase & { page: 'pr-checks'; prId: string; })
  | (GhRepoBase & { page: 'pr-files'; prId: string; })
  | (GhRepoBase & { page: 'discussions'; })
  | (GhRepoBase & { page: 'disc'; discussionId: string; })
  | (GhRepoBase & { page: 'tree'; ref: string; pathParts: string[]; })
  | (GhRepoBase & { page: 'commit'; commitSha: string; })
  | (GhRepoBase & { page: 'commits'; ref?: string; pathParts?: string[]; })
  | (GhRepoBase & { page: 'blob'; ref: string; pathParts: string[]; })
  | (GhRepoBase & { page: 'blame'; ref: string; pathParts: string[]; })
  | (GhRepoBase & { page: 'actions'; })
  | (GhRepoBase & { page: 'actions-run'; runId: string; })
  | (GhRepoBase & { page: 'actions-job'; runId: string; jobId: string; });

export function getGhRoute(str: string): GhRoute | undefined {
  let u: URL;
  try { u = new URL(str, 'https://github.com'); }
  catch { return; }

  if (u.hostname !== 'github.com') return;

  const parts = u.pathname.split('/').filter(Boolean);
  const hash = u.hash;
  const search = u.search;
  const url = `https://github.com${u.pathname}`;
  const urlWithSearch = `${url}${search}`;

  if (!parts.length) return;
  if (parts[0] === 'search') return { page: 'search', url: urlWithSearch, hash, search };
  if (!parts[1]) return { page: 'owner', owner: parts[0], url, hash, search };

  const [owner, repo, kind, ...tail] = parts; // as (string | undefined)[];
  const base = { owner, repo, url, hash, search };
  const files = { ref: tail[0], pathParts: tail.slice(1) };

  if (!kind) return { ...base, page: 'repo' };

  switch (kind) {
    case 'issues':
      if (tail.length === 0) return { ...base, page: 'issues' };
      if (tail.length === 1) return { ...base, page: 'issue', issueId: tail[0] };
      return;

    case 'pulls':
      if (tail.length === 0) return { ...base, page: 'pulls' };
      return;

    case 'pull':
      if (tail.length === 1) return { ...base, page: 'pr', prId: tail[0] };
      if (tail.length === 2 && tail[1] === 'commits') return { ...base, page: 'pr-commits', prId: tail[0] };
      if (tail.length === 2 && tail[1] === 'checks') return { ...base, page: 'pr-checks', prId: tail[0] };
      if (tail.length === 2 && tail[1] === 'files') return { ...base, page: 'pr-files', prId: tail[0] };
      return;

    case 'discussions':
      if (tail.length === 0) return { ...base, page: 'discussions' };
      if (tail.length === 1) return { ...base, page: 'disc', discussionId: tail[0] };
      return;

    case 'tree':
      if (tail.length >= 1) return { ...base, ...files, page: 'tree' };
      return;

    case 'blob':
      if (tail.length >= 2) return { ...base, ...files, page: 'blob' };
      return;

    case 'blame':
      if (tail.length >= 2) return { ...base, ...files, page: 'blame' };
      return;

    case 'commit':
      if (tail.length === 1) return { ...base, page: 'commit', commitSha: tail[0] };
      return;

    case 'commits':
      return { ...base, ...files, page: 'commits' };

    case 'actions':
      if (tail.length === 0) return { ...base, page: 'actions' };
      if (tail.length === 2 && tail[0] === 'runs') return { ...base, page: 'actions-run', runId: tail[1] };
      if (tail.length === 4 && tail[0] === 'runs' && tail[2] === 'job') {
        return { ...base, page: 'actions-job', runId: tail[1], jobId: tail[3] };
      }
      return;

    default:
      return;
  }
}
