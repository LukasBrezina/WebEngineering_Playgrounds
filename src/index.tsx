import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { BrowserRouter } from 'react-router-dom';

const rootElement = document.getElementById('root');

if (rootElement == null) {
  throw new Error('Root element not found in the DOM');
}
const root = createRoot(rootElement);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// Test aborting via AbortController
// setTimeout(() => root.unmount(), 500);
