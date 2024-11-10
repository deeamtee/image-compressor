import React, { useState } from 'react';
import JSZip from 'jszip';
import styles from './Compressor.module.css';
import cn from 'clsx';
import { compressFile } from './Compressor.helpers';
import { UploadedFile } from '../UploadedFile';
import { downloadFile } from '../../utils/helpers';
import { OutputFiles } from './CompressedFile.types';
import { useTranslation } from 'react-i18next';

export const Compressor: React.FC = () => {
  const { t } = useTranslation();

  const [dragging, setDragging] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<OutputFiles[]>([]);
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

    const compressedFilePromises = Array.from(files).map(compressFile);

    const compressedFiles = await Promise.all(compressedFilePromises); 
    const filteredCompressedFiles = compressedFiles.filter((file) => !!file) as OutputFiles[];
    setCompressedFiles((prev) => filteredCompressedFiles.concat(prev));
    setIsLoading(false);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    compressedFiles.forEach(({ compressedFile }) => {
      if (!compressedFile) return;
      zip.file(compressedFile.name, compressedFile);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFileName = 'compressed_images.zip';

    downloadFile(zipBlob, zipFileName);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('title')}</h1>
      <div
        className={cn(styles.dropArea, { [styles.dragging]: dragging })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.dropAreaContent}>
          {isLoading ? (
            <div className={styles.loader} />
          ) : (
            <p>
              {t('text')} <br /> (SVG, JPEG, PNG)
            </p>
          )}
        </div>
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
            {t('download')} ZIP
          </button>
        </div>
      )}
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    </div>
  );
};
