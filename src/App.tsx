import { useEffect } from 'react';
import { initializeComments } from './components/comment.js';
import { initializeSearch } from './components/search.js';
import { initializeBearsApi } from './api/bears.js';
import { renderApiError, renderBears } from './components/bears-list.js';

export function App(): null {
  useEffect((): void => {
    initializeSearch();
    initializeComments();
    initializeBearsApi()
      .then(renderBears)
      .catch((error) => {
        console.error('Error initializing bears API:', error);
        renderApiError();
      });
  }, []);
  return null;
}
