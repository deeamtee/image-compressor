import React, { useState } from 'react';
import { PageContext } from './PageContext';

type Page = 'compressor' | 'feedback';

export const PageProvider: React.FC<{ initialPage?: Page; children: React.ReactNode }> = ({
  initialPage = 'compressor',
  children,
}) => {
  const [currentPage, setCurrentPage] = useState<Page>(initialPage);

  const navigate = (page: Page) => setCurrentPage(page);

  return <PageContext.Provider value={{ currentPage, navigate }}>{children}</PageContext.Provider>;
};
