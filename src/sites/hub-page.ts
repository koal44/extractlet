import { renderPage } from '../sites/hub';
import { loadResultsPage } from '../snapshot-loader';
import { repr } from '../utils/logging';

void loadResultsPage(renderPage).catch((err) => {
  console.error('[xlet:hub-page] Error in hub page script:', repr(err));
});
