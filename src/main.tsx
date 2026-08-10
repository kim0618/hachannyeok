import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';

const rootElement = document.querySelector<HTMLDivElement>('#app');

if (!rootElement) {
  throw new Error('Root element #app not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
