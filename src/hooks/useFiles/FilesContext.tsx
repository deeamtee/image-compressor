import React, { createContext, useContext } from 'react';
import { OutputFiles } from './Files.types';

interface FilesContextProps {
  compressedFiles: OutputFiles[];
  setCompressedFiles: React.Dispatch<React.SetStateAction<OutputFiles[]>>;
}

export const FilesContext = createContext<FilesContextProps | undefined>(undefined);

export const useFiles = () => {
  const context = useContext(FilesContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
