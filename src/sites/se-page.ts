import { createPage } from './se';
import { repr } from '../utils/logging';
import { loadResultsPage } from '../snapshot-loader';

void loadResultsPage(createPage).catch((err) => {
  console.error('[xlet:se-page] Error in se page script:', repr(err));
});
