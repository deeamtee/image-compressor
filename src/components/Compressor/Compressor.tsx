import React, { useRef, useState } from 'react';
import cn from 'clsx';
import { compressFile } from './Compressor.helpers';
import { UploadedFile } from '../UploadedFile';
import { archiveAndDownload } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { Typography, Icon, Button } from 'ui';
import styles from './Compressor.module.css';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useFiles, usePage, useDragAndDrop } from 'hooks';
import { OutputFiles } from 'types';

export const Compressor: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = usePage();
  const { compressedFiles, setCompressedFiles } = useFiles();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (files: FileList) => {
    if (files.length === 0) return;

    setIsLoading(true);

    const totalFiles = files.length;
    let processedFiles = 0;

    const updateProgress = () => {
      processedFiles += 1;
      setProgress(Math.floor((processedFiles / totalFiles) * 100));
    };

    const compressedFilePromises = Array.from(files).map((file) => compressFile(file, updateProgress));

    const compressedFiles: OutputFiles[] = await Promise.all(compressedFilePromises);

    setCompressedFiles((prev) => compressedFiles.concat(prev));
    setIsLoading(false);
    setProgress(0);
  };

  const { dropAreaRef, isDraggingOver, isAreaExpanded, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop(processFile);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files!;
    await processFile(files);
    e.target.value = '';
  };

  const handleDropAreaClick = () => {
    fileInputRef.current?.click();
  };
  const handleDownloadAll = async () => {
    await archiveAndDownload(compressedFiles);
    navigate('feedback');
  };

  const fullscreenMode = !compressedFiles.length || isDraggingOver || isAreaExpanded;

  return (
    <>
      <div draggable className={styles.wrapper} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
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
            <div className={styles.loaderContainer}>
              {progress} %
              <div className={styles.loader} />
            </div>
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
      </div>
      {!fullscreenMode && (
        <Button type="button" className={styles.downloadButton} variant="accent" onClick={handleDownloadAll}>
          {t('download')} ZIP
        </Button>
      )}
    </>
  );
};
