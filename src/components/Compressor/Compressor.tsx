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
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

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
  const [isAreaExpanded, setIsAreaExpanded] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<OutputFiles[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropAreaRef = React.useRef<HTMLDivElement>(null);
  const isFileDragging = React.useRef(false);

  useEffect(() => {
    const handleGlobalDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        isFileDragging.current = true;
        setIsAreaExpanded(true);
      }
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        isFileDragging.current = false;
        setIsAreaExpanded(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      isFileDragging.current = false;
      setIsAreaExpanded(false);
    };

    document.addEventListener('dragenter', handleGlobalDragEnter);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
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
    setIsDraggingOver(false);
    setIsAreaExpanded(false);
    setIsLoading(true);
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

  const fullscreenMode = !compressedFiles.length || isDraggingOver || isAreaExpanded;

  return (
    <div draggable className={styles.container} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <Title />
          <CountrySelect />
        </div>

        <div
          onDrop={handleDrop}
          ref={dropAreaRef}
          className={cn(styles.dropArea, {
            [styles.dropArea_dragging]: isDraggingOver,
            [styles.dropArea_fullscreen]: fullscreenMode,
          })}
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
          <SimpleBar autoHide={false} forceVisible="y" className={styles[`simplebar-custom-style`]}>
            {!fullscreenMode &&
              compressedFiles.map(({ originalFile, compressedFile }, index) => (
                <UploadedFile key={index} originalFile={originalFile} compressedFile={compressedFile} />
              ))}
          </SimpleBar>
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
