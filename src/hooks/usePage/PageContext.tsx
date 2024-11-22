import { createContext, useContext } from 'react';

type Page = 'compressor' | 'feedback';

type PageContextType = {
  currentPage: Page;
  navigate: (page: Page) => void;
};

export const PageContext = createContext<PageContextType | undefined>(undefined);

export const usePage = (): PageContextType => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePage must be used within a PageProvider');
  }
  return context;
};
