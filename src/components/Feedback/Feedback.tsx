import styles from './Feedback.module.css';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from 'ui';

export const Feedback = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();

  const handleOpenDownload = () => {
    chrome.downloads?.search({}, (downloads) => {
      if (downloads.length > 0) {
        const lastDownload = downloads[0];
        chrome.downloads.show(lastDownload.id);
      }
    });
  };

  const handleDislike = () => window.open('https://forms.gle/wgkRQjoP7Fbdx4KG6', '_blank', 'noopener,noreferrer');

  const handleLike = () => alert('Thanks! 🎉');

  return (
    <div className={styles.container}>
      <main className={styles.wrapper}>
        <div className={styles.content}>
          <Typography as="h2" size="xl" weight="bold">
            {t('filesDownloading')}
          </Typography>
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
              🎉
            </button>
          </div>
        </div>
        <div className={styles.buttons}>
          <Button onClick={handleOpenDownload} variant="accent">
            {t('openDownloadFolder')}
          </Button>
          <Button variant="underline" onClick={onBack}>
            {t('goBack')}
          </Button>
        </div>
      </main>
    </div>
  );
};
