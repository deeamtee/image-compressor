import { FC } from 'react';
import styles from './UploadedFile.module.css';
import cn from 'clsx';
import { Icon } from '../Icon';
import { getExtensionFromMimeType } from './UploadedFile.helpers';
import { downloadFile } from '../../utils/helpers';
import fallbackImage from './resources/fallback.jpg';

type Props = {
  compressedFile: File;
  originalFile: File;
};

const FallbackFile = ({ originalFile }: { originalFile: File }) => {
  return (
    <div className={styles.container}>
      <div className={styles.file}>
        <img className={styles.image} src={fallbackImage} alt={`Fallback image for ${originalFile.name}`} />
        <div className={styles.wrapper}>
          <div className={styles.info}>
            <div className={cn(styles.flex, styles.title)}>
              <p className={cn(styles.name, styles.name_error)}>{originalFile.name}</p>
            </div>
            <div className={cn(styles.flex, styles.sizes)}>
              <p className={styles.error}>Invalid</p>
            </div>
          </div>
        </div>
      </div>
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
            <div className={cn(styles.flex, styles.title)}>
              <p className={styles.name}>{name}</p>
              <p className={styles.rate}>–{compressionRate}%</p>
            </div>
            <div className={cn(styles.flex, styles.sizes)}>
              <p>{originalSize} KB</p>
              <p>{compressedSize} KB</p>
            </div>
          </div>
          <button className={styles.download} onClick={handleDownload}>
            <Icon variant="download" />
          </button>
        </div>
      </div>
      {/* <div style={{ width: `${progress}%` }}></div> */}
    </div>
  );
};
