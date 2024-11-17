import { FC } from 'react';
import cn from 'clsx';
import { getExtensionFromMimeType } from './UploadedFile.helpers';
import { downloadFile } from '../../utils/helpers';
import fallbackImage from './resources/fallback.jpg';
import { OutputFiles } from '../Compressor/CompressedFile.types';
import { Icon, Typography } from 'ui';
import styles from './UploadedFile.module.css';

type Props = OutputFiles;

const FallbackFile = ({ originalFile }: { originalFile: File }) => {
  const { name } = originalFile;
  return (
    <div className={styles.container}>
      <div className={styles.file}>
        <img className={styles.image} src={fallbackImage} alt={`Fallback image for ${originalFile.name}`} />
        <div className={styles.wrapper}>
          <div className={styles.info}>
            <div className={styles.flex}>
              <Typography className={cn(styles.name, styles.name_error)} size="m" weight="semibold">
                {name}
              </Typography>
            </div>
            <div className={cn(styles.flex, styles.sizes)}>
              <Typography className={styles.error} size="s" weight="normal">
                Invalid
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.progress} style={{ width: `${100}%` }}></div>
    </div>
  );
};

export const UploadedFile: FC<Props> = ({ compressedFile, originalFile }) => {
  if (!compressedFile) {
    return <FallbackFile originalFile={originalFile} />;
  }
  const { name, type } = compressedFile;
  const image = URL.createObjectURL(compressedFile);

  const originalSize = (originalFile.size / 1024).toFixed(2); // в КБ
  const compressedSize = (compressedFile.size / 1024).toFixed(2); // в КБ
  const compressionRate = ((1 - compressedFile.size / originalFile.size) * 100).toFixed(2);

  const handleDownload = () => {
    if (compressedFile) {
      const blob = new Blob([compressedFile], { type });
      const extension = getExtensionFromMimeType(type);
      const defaultFileName = `compressed.${extension}`;
      const fileName = compressedFile.name || defaultFileName;

      downloadFile(blob, fileName);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.file}>
        <img className={styles.image} src={image} alt={name} />
        <div className={styles.wrapper}>
          <div className={styles.info}>
            <div className={styles.flex}>
              <Typography className={styles.name} size="m" weight="semibold">
                {name}
              </Typography>
              <Typography size="m" weight="semibold" className={styles.rate}>
                –{compressionRate}%
              </Typography>
            </div>
            <div className={styles.flex}>
              <Typography size="s" weight="normal">
                {originalSize} KB
              </Typography>
              <Typography size="s" weight="normal">
                {compressedSize} KB
              </Typography>
            </div>
          </div>
          <button className={styles.download} onClick={handleDownload}>
            <Icon variant="download" color="var(--color-primary)" />
          </button>
        </div>
      </div>
      <div className={styles.progress} style={{ width: `${100}%` }}></div>
    </div>
  );
};
