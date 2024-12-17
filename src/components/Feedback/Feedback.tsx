import { useTranslation } from 'react-i18next';
import { Button, Typography } from 'ui';
import { closeSidePanel, openDownloadFolder } from './Feedback.helpers';
import { useFiles, usePage } from 'hooks';
import { archiveAndDownload } from '../../utils/helpers';
import styles from './Feedback.module.css';

export const Feedback = () => {
  const { t } = useTranslation();
  const { compressedFiles, setCompressedFiles } = useFiles();
  const { navigate } = usePage();

  const handleDownloadAll = async () => {
    await archiveAndDownload(compressedFiles);
    navigate('feedback');
  };

  const handleBack = () => {
    setCompressedFiles([]);
    navigate('compressor');
  };

  const handleDislike = () => {
    window.open('https://forms.gle/wgkRQjoP7Fbdx4KG6', '_blank', 'noopener,noreferrer');
    closeSidePanel();
  };

  const handleLike = () => {
    window.open(
      'https://chromewebstore.google.com/detail/reduce-image-size/lgmiicnpnjkacaolkkoiiobddokgmcfo/reviews',
      '_blank',
      'noopener,noreferrer'
    );
    closeSidePanel();
  };

  return (
    <div className={styles.container}>
      <main className={styles.wrapper}>
        <div className={styles.content}>
          <Typography as="h2" size="xl" weight="bold">
            🎉&nbsp;{t('filesDownloading')}
          </Typography>
          <Typography weight="semibold" className={styles.downloadText}>
            {t('ifYourDownloadHasntStarted')}&nbsp;
            <a className={styles.downloadLink} onClick={handleDownloadAll}>
              {t('clickHere')}
            </a>
          </Typography>
          <div className={styles.feedback}>
            <div>
              <Typography className={styles.feedbackText} as="span" size="l" weight="semibold">
                {t('your')}&nbsp;
              </Typography>
              <Typography color="primary" as="span" size="l" weight="semibold">
                {t('feedback')}
              </Typography>
              <Typography className={styles.feedbackText} as="span" size="l" weight="semibold">
                &nbsp;{t('isValuableForUs')}:
              </Typography>
            </div>
            <div className={styles.emojis}>
              <button className={styles.emojiButton} onClick={handleDislike}>
                😔
              </button>
              <button className={styles.emojiButton} onClick={handleDislike}>
                😐
              </button>
              <button className={styles.emojiButton} onClick={handleLike}>
                🥳
              </button>
            </div>
          </div>
        </div>
        <div className={styles.buttons}>
          <Button onClick={openDownloadFolder} variant="accent">
            {t('openDownloadFolder')}
          </Button>
          <Button variant="underline" onClick={handleBack}>
            {t('goBack')}
          </Button>
        </div>
      </main>
    </div>
  );
};
