import { createPage } from './wiki';
import { repr } from '../utils';
import { loadResultsPage } from '../results-loader';

void loadResultsPage('wiki', createPage).catch((err) => {
  console.error('[xlet:wiki-page] Error in wiki page script:', repr(err));
});
