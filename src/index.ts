import { initializeComments } from './components/comment.js';
import { initializeSearch } from './components/search.js';
import { initializeBearsApi } from './api/bears.js';
import { renderApiError, renderBears } from './components/bears-list.js';

initializeSearch();
initializeComments();
try {
  const bears = await initializeBearsApi();
  renderBears(bears);
} catch (error) {
  console.error('Error initializing bears API:', error);
  renderApiError();
}
