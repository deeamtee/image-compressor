import React, { useState } from 'react';
import styles from './Compressor.module.css';
import cn from 'clsx';
import { compressJpeg, compressPng, compressSvg } from './Compressor.helpers';
import { UploadedFile } from '../UploadedFile';

export const Compressor: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    const files = e.dataTransfer.files;

    if (files.length === 0) return;

    const compressedFilePromises = Array.from(files).map((file) => {
      try {
        if (file.type === 'image/svg+xml') {
          return compressSvg(file);
        }
        if (file.type === 'image/jpeg') {
          return compressJpeg(file, setProgress);
        }
        if (file.type === 'image/png') {
          return compressPng(file);
        }
        return null;
      } catch {
        return null; // обработка невалидного файла
      }
    });
    const compressedFiles = await Promise.all(compressedFilePromises).catch(() => []); // добавить обработчку для невалидного файла, перенести try catch сюда
    const filteredCompressedFiles = compressedFiles.filter((file) => file !== null) as File[];
    setCompressedFiles(filteredCompressedFiles);
  };

  const downloadCompressed = () => {
    // if (compressedFile) {
    //   const blob = new Blob([compressedFile], { type: compressedFile.type });
    //   const link = document.createElement('a');
    //   link.href = URL.createObjectURL(blob);
    //   link.download = fileRef.current.name || 'compressed.svg';
    //   link.click();
    // }
  };
  console.log(compressedFiles);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Images Compressor</h1>
      <div
        className={cn(styles.dropArea, { [styles.dragging]: dragging })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className={styles.dropAreaText}>
          Drag and drop an image here <br /> (SVG, JPEG, PNG)
        </p>
      </div>

      {progress > 0 && !errorMessage && (
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {compressedFiles.map((file, index) => (
        <UploadedFile
          key={index}
          name={file.name}
          image={URL.createObjectURL(file)}
          progress={100} // сделать анимацию прогресса для каждого файла
          status="success"
          type={file.type}
          size={file?.size || 0}
        />
      ))}

      {compressedFiles.length > 0 && progress === 100 && (
        <div>
          <button className={styles.download} onClick={downloadCompressed}>
            Download an Image
          </button>
        </div>
      )}

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    </div>
  );
};
