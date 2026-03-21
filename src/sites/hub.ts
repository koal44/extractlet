import { toHtml as _toHtml, toMd as _toMd } from '../core';
import type { CreatePage, RenderPage } from '../snapshot-loader';
import { warn } from '../utils/logging';
import { renderXletPage, type XletPage } from '../xlet-page';
import { createDiscPage } from './hub/pages/disc';
import { detectGhDomain } from './hub/route';
import { scrapePermaUrl, scrapeTitle } from './hub/dom';
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

export const renderPage: RenderPage = async ({ sourceDoc, ctxs, state, targetDoc, root }) => {
  const page = await createHubPage({ sourceDoc, ctxs, state });
  if (!page) return;
  renderXletPage(page, targetDoc, root);
};

export const createHubPage: CreatePage = async ({ sourceDoc, ctxs, state }) => {
  const permalink = scrapePermaUrl(sourceDoc);
  if (!permalink) return warn(undefined, '[xlet:hub-create] Failed to scrape permalink');

  const domain = detectGhDomain(permalink);
  if (!domain) return warn(undefined, '[xlet:hub-create] Failed to detect GitHub domain');

  const title = scrapeTitle(sourceDoc) ?? '???';

  let page: XletPage | undefined;
  switch (domain) {
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
  }

  if (!page) {
    return warn(undefined, `[xlet:hub-create] Failed to create page for domain "${domain}"`);
  }

  page.siteLabel ??= 'GitHub';
  page.title ??= title;
  page.root.permalink ??= permalink;
  page.views = ['html', 'md'];

  return page;
};
