import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import { PageProvider, FilesProvider } from 'hooks';
import './index.css';
import './utils/i18n';

createRoot(document.getElementById('internal-root-extension-container')!).render(
  <StrictMode>
    <PageProvider>
      <FilesProvider>
        <App />
      </FilesProvider>
    </PageProvider>
  </StrictMode>
);
