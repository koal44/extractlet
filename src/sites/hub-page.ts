import { createPage } from '../sites/hub';
import { loadResultsPage } from '../snapshot-loader';
import { repr } from '../utils/logging';

void loadResultsPage(createPage).catch((err) => {
  console.error('[xlet:hub-page] Error in hub page script:', repr(err));
});
