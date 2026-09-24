import { initializeComments } from './components/comment.js';
import { initializeSearch } from './components/search.js';
import { initializeBearsApi } from './api/bears.js';
import { renderBears } from './components/bears-list.js';

initializeSearch();
initializeComments();
try {
  await initializeBearsApi().then(renderBears);
} catch (error) {
  console.error('Error initializing bears API:', error);
  alert('Something went really wrong.');
}
