import React, { useState } from 'react';
import JSZip from 'jszip';
import styles from './Compressor.module.css';
import cn from 'clsx';
import { compressJpeg, compressPng, compressSvg } from './Compressor.helpers';
import { UploadedFile } from '../UploadedFile';
import { downloadFile } from '../../utils/helpers';

interface CompressedFile {
  originalFile: File;
  compressedFile: File;
}

export const Compressor: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  // const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    setIsLoading(true);
    // setProgress(0);
    setErrorMessage(null);
    const files = e.dataTransfer.files;

    if (files.length === 0) return;

    const compressedFilePromises = Array.from(files).map(async (file) => {
      try {
        let compressedFile: File | null = null;
        if (file.type === 'image/svg+xml') {
          compressedFile = await compressSvg(file);
        } else if (file.type === 'image/jpeg') {
          compressedFile = await compressJpeg(file, () => {});
        } else if (file.type === 'image/png') {
          compressedFile = await compressPng(file);
        }
        return compressedFile ? { originalFile: file, compressedFile } : null;
      } catch {
        return null; // обработка невалидного файла
      }
    });

    const compressedFiles = await Promise.all(compressedFilePromises).catch(() => []); // добавить обработку для невалидного файла
    const filteredCompressedFiles = compressedFiles.filter(
      (file) => file !== null
    ) as CompressedFile[];
    setCompressedFiles((prev) => filteredCompressedFiles.concat(prev)); // добавить обработку для невалидного файла filteredCompressedFiles);
    setIsLoading(false);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    compressedFiles.forEach(({ compressedFile }) => {
      zip.file(compressedFile.name, compressedFile);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = 'compressed_images.zip';

    downloadFile(zipBlob, zipFileName);
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
        <p className={styles.dropAreaContent}>
          {isLoading ? <div className={styles.loader}/> : <>Drag and drop an image here <br /> (SVG, JPEG, PNG)</>}
  
        </p>
      </div>
      {/* 
      {progress > 0 && !errorMessage && (
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
        </div>
      )} */}
      <div className={styles.uploadedFiles}>
        {compressedFiles.map(({ originalFile, compressedFile }, index) => (
          <UploadedFile key={index} originalFile={originalFile} compressedFile={compressedFile} />
        ))}
      </div>

      {compressedFiles.length > 0 && (
        <div>
          <button className={styles.download} onClick={handleDownloadAll}>
            Download ZIP
          </button>
        </div>
      )}
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    </div>
  );
};
