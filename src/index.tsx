import { createRoot } from 'react-dom/client';
import { App } from './App.js';

const rootElement = document.getElementById('root');

if (rootElement == null) {
  throw new Error('Root element not found in the DOM');
}
createRoot(rootElement).render(<App />);
