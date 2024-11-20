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
  // const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropAreaRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    /** TODO: Убрать дребезг при перетаскивании */
    const handleDragLeave = (event: DragEvent) => {
      const root = document.getElementById('internal-root-extension-container');
      if (root === event.target) {
        setIsDraggingOver(false);
        setIsAreaExpanded(false);
      }
    };

    const handleDragEnter = (e: { preventDefault: () => void }) => {
      e.preventDefault();
      setIsAreaExpanded(true);
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);

    const removeEventListeners = () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
    };

    if (!chrome.runtime) return removeEventListeners;

    const handleRuntimeMessage = (message: { type: string }) => {
      if (message.type === 'dragenter') {
        setIsAreaExpanded(true);
      }

      if (message.type === 'dragend') {
        setIsAreaExpanded(false);
        setIsDraggingOver(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleRuntimeMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
      removeEventListeners();
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (dropAreaRef.current?.contains(e.currentTarget)) {
      setIsDraggingOver(false);
      setIsAreaExpanded(false);
    } else {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setIsAreaExpanded(false);
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

  const fullscreenMode = !compressedFiles.length || isDraggingOver || isAreaExpanded;

  return (
    <div draggable className={styles.container} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <Title />
          <CountrySelect />
        </div>

        <div
          ref={dropAreaRef}
          className={cn(styles.dropArea, {
            [styles.dropArea_dragging]: isDraggingOver,
            [styles.dropArea_fullscreen]: fullscreenMode,
          })}
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
