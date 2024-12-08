import { useState, useRef, useEffect } from 'react';

export const useDragAndDrop = (processFile: (files: FileList) => Promise<void>) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isAreaExpanded, setIsAreaExpanded] = useState(false);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => e.preventDefault();

    const handleGlobalDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        setIsAreaExpanded(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        setIsAreaExpanded(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsAreaExpanded(false);
    };

    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragenter', handleGlobalDragEnter);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragenter', handleGlobalDragEnter);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropAreaRef.current?.contains(e.target as Node)) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (dropAreaRef.current && !dropAreaRef.current.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    setIsDraggingOver(false);
    setIsAreaExpanded(false);
    await processFile(files);
  };

  return {
    isDraggingOver,
    isAreaExpanded,
    dropAreaRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
