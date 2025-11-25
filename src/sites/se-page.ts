import { createPage } from './se';
import { repr } from '../utils';
import { loadResultsPage } from '../results-loader';

void loadResultsPage('se', createPage).catch((err) => {
  console.error('[xlet:se-page] Error in se page script:', repr(err));
});
