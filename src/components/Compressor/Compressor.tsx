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
import { usePage } from 'hooks';
import { Feedback } from '../Feedback';

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
  const { currentPage, navigate } = usePage();
  const [isAreaExpanded, setIsAreaExpanded] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [compressedFiles, setCompressedFiles] = useState<OutputFiles[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropAreaRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isFileDragging = React.useRef(false);

  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => e.preventDefault();

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

  const processFile = async (files: FileList) => {
    setIsDraggingOver(false);
    setIsAreaExpanded(false);

    if (files.length === 0) return;

    setIsLoading(true);

    const compressedFilePromises = Array.from(files).map(compressFile);
    const compressedFiles = await Promise.all(compressedFilePromises);
    const filteredCompressedFiles = compressedFiles.filter((file) => !!file) as OutputFiles[];
    setCompressedFiles((prev) => filteredCompressedFiles.concat(prev));
    setIsLoading(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    await processFile(files);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files!;
    await processFile(files);

    e.target.value = '';
  };

  const handleDropAreaClick = () => {
    fileInputRef.current?.click();
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
    navigate('feedback');
  };

  const fullscreenMode = !compressedFiles.length || isDraggingOver || isAreaExpanded;

  return (
    <div draggable className={styles.container} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <Title />
          <CountrySelect />
        </header>
        {currentPage === 'feedback' ? (
          <Feedback />
        ) : (
          <>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            <div
              onClick={handleDropAreaClick}
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
              <SimpleBar autoHide className={styles[`simplebar-custom-style`]}>
                {!fullscreenMode &&
                  compressedFiles.map(({ originalFile, compressedFile }, index) => (
                    <UploadedFile key={index} originalFile={originalFile} compressedFile={compressedFile} />
                  ))}
              </SimpleBar>
            </div>
          </>
        )}
      </div>
      {!fullscreenMode && currentPage === 'compressor' && (
        <Button className={styles.downloadButton} variant="accent" onClick={handleDownloadAll}>
          {t('download')} ZIP
        </Button>
      )}
    </div>
  );
};
