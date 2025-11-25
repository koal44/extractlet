import { createPage } from '../sites/hub';
import { loadResultsPage } from '../results-loader';
import { repr } from '../utils';

void loadResultsPage('hub', createPage).catch((err) => {
  console.error('[xlet:hub-page] Error in hub page script:', repr(err));
});
