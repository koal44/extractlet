import type { CreatePage, RenderPage } from '../snapshot-loader';
import { h } from '../utils/dom';
import { assertNever } from '../utils/typing';
import { createNoticePage, ISSUE_LINK_ATTRS, renderXletPage, type XletPage } from '../xlet-page';
import { scrapePermaUrl, scrapeTitle } from './hub/dom';
import { getGhRoute } from './hub/route';
import { createDiscPage } from './hub/pages/disc';
import { createIssuePage } from './hub/pages/issue';
import { createListDiscPage } from './hub/pages/list-disc';
import { createListIssuePage } from './hub/pages/list-issue';
import { createListPrPage } from './hub/pages/list-pr';
import { createPrPage } from './hub/pages/pr';
import { createRepoPage } from './hub/pages/repo';
import { createTreePage } from './hub/pages/tree';
import { createCommitPage } from './hub/pages/commit';
import { createBlobPage } from './hub/pages/blob';
import { createBlamePage } from './hub/pages/blame';
import { createHistoryPage } from './hub/pages/history';
import { createSearchPage } from './hub/pages/search';
import { createPrCommitsPage } from './hub/pages/pr-commits';
import { createPrChecksPage } from './hub/pages/pr-checks';
import { createActionsJobPage } from './hub/pages/actions-job';
import { createActionsRunPage } from './hub/pages/actions-run';
import { createActionsWorkflowPage } from './hub/pages/actions-workflow';
import { createActionsUsagePage } from './hub/pages/actions-usage';
import { createActionsPage } from './hub/pages/actions';
import { createPrFilesPage } from './hub/pages/pr-files';
import { createPrChangesPage } from './hub/pages/pr-changes';
import { createUserPage } from './hub/pages/owner-user';
import { createOrgPage } from './hub/pages/owner-org';

type OwnerKind = 'user' | 'org' | 'unknown';
function detectOwnerKind(node: ParentNode): OwnerKind {
  const analytics =
    node.querySelector('meta[name="analytics-location"]')?.getAttribute('content') ?? '';

  if (analytics === '/<user-name>') return 'user';
  if (analytics === '/<org-login>') return 'org';

  const scope =
    node.querySelector('qbsearch-input')?.getAttribute('data-scope') ?? '';

  if (scope.startsWith('owner:')) return 'user';
  if (scope.startsWith('org:')) return 'org';

  return 'unknown';
}

export const renderPage: RenderPage = async ({ sourceDoc, ctxs, state, targetDoc, root }) => {
  const page = await createHubPage({ sourceDoc, ctxs, state });
  if (!page) return;
  renderXletPage(page, targetDoc, root);
};

export const createHubPage: CreatePage = async ({ sourceDoc, ctxs, state }) => {
  const title = scrapeTitle(sourceDoc) ?? '???';

  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) {
    return createNoticePage({
      kind: 'error', siteLabel: 'GitHub', title,
      message: h('div', {},
        h('p', {}, `Extractlet couldn't find this page's permalink.`),
        h('p', {}, `That's probably a bug. If you feel like helping, you can `,
          h('a', ISSUE_LINK_ATTRS, 'let us know')),
      ),
    });
  }

  const route = getGhRoute(permalink);
  let page: XletPage | undefined;
  switch (route.page) {
    case 'pr': page = await createPrPage({ sourceDoc, ctxs, state }); break;
    case 'disc': page = await createDiscPage({ sourceDoc, ctxs, state }); break;
    case 'issue': page = await createIssuePage({ sourceDoc, ctxs, state }); break;
    case 'repo': page = await createRepoPage({ sourceDoc, ctxs, state }); break;
    case 'issues': page = await createListIssuePage({ sourceDoc, ctxs, state }); break;
    case 'pulls': page = await createListPrPage({ sourceDoc, ctxs, state }); break;
    case 'discussions': page = await createListDiscPage({ sourceDoc, ctxs, state }); break;
    case 'tree': page = await createTreePage({ sourceDoc, ctxs, state }); break;
    case 'commit': page = await createCommitPage({ sourceDoc, ctxs, state }); break;
    case 'blob': page = await createBlobPage({ sourceDoc, ctxs, state }); break;
    case 'blame': page = await createBlamePage({ sourceDoc, ctxs, state }); break;
    case 'commits': page = await createHistoryPage({ sourceDoc, ctxs, state }); break;
    case 'search': page = await createSearchPage({ sourceDoc, ctxs, state }); break;
    case 'pr-commits': page = await createPrCommitsPage({ sourceDoc, ctxs, state }); break;
    case 'pr-checks': page = await createPrChecksPage({ sourceDoc, ctxs, state }); break;
    case 'pr-files': page = await createPrFilesPage({ sourceDoc, ctxs, state }); break;
    case 'pr-changes': page = await createPrChangesPage({ sourceDoc, ctxs, state }); break;
    case 'owner': {
      const ownerKind = detectOwnerKind(sourceDoc);
      if (ownerKind === 'user') page = await createUserPage({ sourceDoc, ctxs, state });
      else if (ownerKind === 'org') page = await createOrgPage({ sourceDoc, ctxs, state });
      break;
    }
    case 'actions': page = await createActionsPage({ sourceDoc, ctxs, state }); break;
    case 'actions-run': page = await createActionsRunPage({ sourceDoc, ctxs, state }); break;
    case 'actions-job': page = await createActionsJobPage({ sourceDoc, ctxs, state }); break;
    case 'actions-workflow': page = await createActionsWorkflowPage({ sourceDoc, ctxs, state }); break;
    case 'actions-usage': page = await createActionsUsagePage({ sourceDoc, ctxs, state }); break;
    case 'actions-file': page = await createActionsPage({ sourceDoc, ctxs, state }); break;
    case 'unknown': {
      page = createNoticePage({
        kind: 'info', siteLabel: 'GitHub', permalink, title,
        message: h('div', {},
          h('p', {}, `Extractlet doesn't know about this GitHub page type yet.`),
          h('p', {}, `If you'd like to see it supported, you can `,
            h('a', ISSUE_LINK_ATTRS, 'ask for it here')),
        ),
      });
      break;
    }
    default: assertNever(route);
  }

  if (!page) {
    return createNoticePage({
      kind: 'error', siteLabel: 'GitHub', title, permalink,
      message: h('div', {},
        h('p', {}, `Extractlet recognized this as a GitHub "${route.page}" page, but couldn't extract it.`),
        h('p', {}, `This is probably a bug. If you feel like helping, you can `,
          h('a', ISSUE_LINK_ATTRS, 'let us know')),
      ),
    });
  }

  page.siteLabel ??= 'GitHub';
  page.title ??= title;
  page.root.permalink ??= permalink;
  page.views = ['html', 'md'];

  return page;
};
