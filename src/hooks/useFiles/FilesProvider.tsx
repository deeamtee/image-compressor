import { useState } from 'react';
import { FilesContext } from './FilesContext';
import { OutputFiles } from 'types';

export const FilesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compressedFiles, setCompressedFiles] = useState<OutputFiles[]>([]);

  return <FilesContext.Provider value={{ compressedFiles, setCompressedFiles }}>{children}</FilesContext.Provider>;
};
