type GhRouteBase = { url: string; hash: string; search: string; };
type GhRepoBase = GhRouteBase & { owner: string; repo: string; };

export type GhRoute =
  | { page: 'unknown'; url: string; }
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
  | (GhRepoBase & { page: 'pr-changes'; prId: string; })
  | (GhRepoBase & { page: 'discussions'; })
  | (GhRepoBase & { page: 'disc'; discussionId: string; })
  | (GhRepoBase & { page: 'tree'; ref: string; pathParts: string[]; })
  | (GhRepoBase & { page: 'commit'; commitSha: string; })
  | (GhRepoBase & { page: 'commits'; ref?: string; pathParts?: string[]; })
  | (GhRepoBase & { page: 'blob'; ref: string; pathParts: string[]; })
  | (GhRepoBase & { page: 'blame'; ref: string; pathParts: string[]; })
  | (GhRepoBase & { page: 'actions'; })
  | (GhRepoBase & { page: 'actions-run'; runId: string; })
  | (GhRepoBase & { page: 'actions-job'; runId: string; jobId: string; })
  | (GhRepoBase & { page: 'actions-workflow'; runId: string; })
  | (GhRepoBase & { page: 'actions-usage'; runId: string; })
  | (GhRepoBase & { page: 'actions-file'; yaml: string; })
  ;

// export type GhPage = GhRoute['page'];

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

  const [root, repo, kind, ...tail] = parts;
  if (!root) return;
  if (root === 'search') return { page: 'search', url: urlWithSearch, hash, search };

  const owner = root;
  if (!repo) return { page: 'owner', owner, url, hash, search };

  const base = { owner, repo, url, hash, search };
  if (!kind) return { ...base, page: 'repo' };

  switch (kind) {
    case 'issues': {
      const [issueId, ...rest] = tail;
      if (!issueId) return { ...base, page: 'issues' };
      if (!rest.length) return { ...base, page: 'issue', issueId };
      return;
    }

    case 'pulls': {
      if (!tail.length) return { ...base, page: 'pulls' };
      return;
    }

    case 'pull': {
      const [prId, subpage, ...rest] = tail;
      if (!prId) return;
      if (!subpage) return { ...base, page: 'pr', prId };
      if (subpage === 'commits' && !rest.length) return { ...base, page: 'pr-commits', prId };
      if (subpage === 'checks' && !rest.length) return { ...base, page: 'pr-checks', prId };
      if (subpage === 'files' && !rest.length) return { ...base, page: 'pr-files', prId };
      if (subpage === 'changes' && !rest.length) return { ...base, page: 'pr-changes', prId };
      return;
    }

    case 'discussions': {
      const [discussionId, ...rest] = tail;
      if (!discussionId) return { ...base, page: 'discussions' };
      if (!rest.length) return { ...base, page: 'disc', discussionId };
      return;
    }

    case 'tree': {
      const [ref, ...pathParts] = tail;
      if (!ref) return;
      return { ...base, page: 'tree', ref, pathParts };
    }

    case 'blob': {
      const [ref, ...pathParts] = tail;
      if (!ref || !pathParts.length) return;
      return { ...base, page: 'blob', ref, pathParts };
    }

    case 'blame': {
      const [ref, ...pathParts] = tail;
      if (!ref || !pathParts.length) return;
      return { ...base, page: 'blame', ref, pathParts };
    }

    case 'commits': {
      const [ref, ...pathParts] = tail;
      return { ...base, page: 'commits', ref, pathParts };
    }

    case 'commit': {
      const [commitSha, ...rest] = tail;
      if (commitSha && !rest.length) return { ...base, page: 'commit', commitSha };
      return;
    }

    case 'actions': {
      const [actionKind, ...actionRest] = tail;

      if (!actionKind) return { ...base, page: 'actions' };

      if (actionKind === 'workflows') {
        const [yaml, ...workflowRest] = actionRest;
        if (!yaml || workflowRest.length) return;
        return { ...base, page: 'actions-file', yaml };
      }

      if (actionKind === 'runs') {
        const [runId, runKind, jobId, ...runRest] = actionRest;
        if (!runId) return;
        if (!runKind) return { ...base, page: 'actions-run', runId };
        if (runKind === 'workflow' && !jobId) return { ...base, page: 'actions-workflow', runId };
        if (runKind === 'usage' && !jobId) return { ...base, page: 'actions-usage', runId };
        if (runKind === 'job' && jobId && !runRest.length) return { ...base, page: 'actions-job', runId, jobId };
      }
      return;
    }

    default:
      return { page: 'unknown', url };
  }
}
