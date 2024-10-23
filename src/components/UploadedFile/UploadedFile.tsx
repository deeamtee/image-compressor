import { FC } from 'react';
import styles from './UploadedFile.module.css';
import cn from 'clsx';
import { Icon } from '../Icon';
import { getExtensionFromMimeType } from './UploadedFile.helpers';
import { downloadFile } from '../../utils/helpers';

type Props = {
  compressedFile: File;
  originalFile: File;
};

export const UploadedFile: FC<Props> = ({ compressedFile, originalFile }) => {
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
      
      downloadFile(blob, fileName); // Используем общую функцию для скачивания
    }
  };
  

  return (
    <div style={{ width: '100%', margin: '0 auto 12px' }}>
      <div className={styles.file}>
        <img className={styles.image} src={image} alt={name} />
        <div className={styles.wrapper}>
          <div className={styles.info}>
            <div className={cn(styles.flex, styles.title)}>
              <p>{name}</p>
              <p>–{compressionRate}%</p>
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
