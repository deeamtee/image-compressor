import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import cn from 'clsx';
import { compressFile } from './Compressor.helpers';
import { UploadedFile } from '../UploadedFile';
import { downloadFile } from '../../utils/helpers';
import { OutputFiles } from './CompressedFile.types';
import { Trans, useTranslation } from 'react-i18next';
import { Typography, Icon, Button } from 'ui';
import { CountrySelect } from '../CountrySelect/CountrySelect';
import styles from './Compressor.module.css';

const Title = () => (
  <Typography as="h1">
    <Trans
      i18nKey="title"
      components={{
        primary: <Typography as="span" color="primary" size="xl" weight="bold" />,
        dark: <Typography as="span" color="dark" size="xl" weight="bold" />,
      }}
    />
  </Typography>
);

export const Compressor: React.FC = () => {
  const { t } = useTranslation();
  const [dragging, setDragging] = useState(false);
  const [dragContent, setDragContent] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<OutputFiles[]>([]);
  // const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!chrome.runtime) return;

    const handleRuntimeMessage = (message: { type: string; data: string }) => {
      if (message.type === 'dragenter') {
        setDragContent(true);
      }

      if (message.type === 'dragend') {
        setDragContent(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    };
  }, []);

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
  const fullscreenMode = !compressedFiles.length || dragging || dragContent;

  return (
    <div className={styles.container}>
      <div className={styles.narrow}>
        <div className={styles.header}>
          <Title />
          <CountrySelect />
        </div>
        <div
          className={cn(styles.dropArea, {
            [styles.dropArea_dragging]: dragging,
            [styles.dropArea_fullscreen]: fullscreenMode,
          })}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className={styles.loader} />
          ) : (
            <div className={styles.dragndrop}>
              <Icon variant="picture" />
              <Typography className={styles.dragndropText} size="m" weight="semibold" color="primary">
                {t('dragndrop')} <br /> (SVG, JPEG, PNG, WEBP)
              </Typography>
            </div>
          )}
        </div>
        <div className={styles.uploadedFiles}>
          {!dragContent &&
            compressedFiles.map(({ originalFile, compressedFile }, index) => (
              <UploadedFile key={index} originalFile={originalFile} compressedFile={compressedFile} />
            ))}
        </div>
      </div>
      {!fullscreenMode && (
        <Button className={styles.downloadButton} variant="accent" onClick={handleDownloadAll}>
          {t('download')} ZIP
        </Button>
      )}
    </div>
  );
};
