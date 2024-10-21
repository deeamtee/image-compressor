import React, { useState } from 'react';
import styles from './App.module.css';
import cn from 'clsx';
import { compressJpeg, compressPng, compressSvg } from './App.helpers';

export const App: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileRef = React.useRef({ name: '' });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setProgress(0);
    setErrorMessage(null);
    const file = e.dataTransfer.files[0];

    if (!file) return;

    fileRef.current = { name: file.name };
    try {
      let compressed: Blob | null = null;

      if (file.type === 'image/svg+xml') {
        compressed = await compressSvg(file);
      } else if (file.type === 'image/jpeg') {
        compressed = await compressJpeg(file, setProgress);
      } else if (file.type === 'image/png') {
        compressed = await compressPng(file);
      } else {
        setErrorMessage('Only JPEG, PNG, and SVG images are supported');
        return;
      }

      if (compressed) {
        setCompressedFile(compressed);
        setProgress(100);
      }
  } catch {
    setErrorMessage('Image compression error');
  }
  };
  
  const downloadCompressed = () => {
    if (compressedFile) {
      const blob = new Blob([compressedFile], { type: compressedFile.type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileRef.current.name || 'compressed.svg';
      link.click();
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Images Compressor</h1>
      <div
        className={cn(styles.dropArea, { [styles.dragging]: dragging })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag and drop an image here (SVG, JPEG, PNG)</p>
      </div>

      {progress > 0 && !errorMessage && (
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {compressedFile && progress === 100 && (
        <div>
          <p className={styles.success}>Compression complete!</p>
          <button onClick={downloadCompressed}>Download an Image</button>
        </div>
      )}

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    </div>
  );
};
