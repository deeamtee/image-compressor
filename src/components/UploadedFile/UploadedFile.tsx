import { FC } from 'react';
import styles from './UploadedFile.module.css';
import cn from 'clsx';
import { Icon } from '../Icon';

type Props = {
  progress: number;
  image: string;
  name: string;
  size: number;
  type: string;
  status: 'success' | 'error';
};

export const UploadedFile: FC<Props> = ({ image, progress, name }) => {
  return (
    <div style={{ width: '100%', margin: '0 auto 12px' }}>
      <div className={styles.file}>
        <img className={styles.image} src={image} alt={name} />
        <div className={styles.wrapper}>
          <div className={styles.info}>
            <div className={cn(styles.flex, styles.title)}>
              <p>{name}</p>
              <p>–44%</p>
            </div>
            <div className={cn(styles.flex, styles.sizes)}>
              <p>202 KB</p>
              <p>7 KB</p>
            </div>
          </div>
          <button className={styles.download}>

          <Icon variant="download" />
          </button>
        </div>
      </div>
      <div style={{ width: `${progress}%` }}></div>
    </div>
  );
};
