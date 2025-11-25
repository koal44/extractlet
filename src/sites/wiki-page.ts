import { createPage } from './wiki';
import { repr } from '../utils/logging';
import { loadResultsPage } from '../snapshot-loader';

void loadResultsPage(createPage).catch((err) => {
  console.error('[xlet:wiki-page] Error in wiki page script:', repr(err));
});
