import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './index.css';
import './utils/i18n';
import { PageProvider } from './hooks/usePage';

createRoot(document.getElementById('internal-root-extension-container')!).render(
  <StrictMode>
    <PageProvider>
      <App />
    </PageProvider>
  </StrictMode>
);
