import { usePage } from 'hooks';
import styles from './Feedback.module.css';
import { Button, Typography } from 'ui';

export const Feedback = () => {
  const { navigate } = usePage();

  const handleOpenDownload = () => {
    chrome.downloads?.search({}, (downloads) => {
      if (downloads.length > 0) {
        const lastDownload = downloads[0];
        chrome.downloads.show(lastDownload.id);
      }
    });
  };

  const handleBack = () => navigate('compressor');

  return (
    <div className={styles.container}>
      <main className={styles.wrapper}>
        <div className={styles.content}>
          <Typography as="h2" size="xl" weight="bold">
            Files are downloading
          </Typography>
          <div>
            <Typography className={styles.feedbackText} as="span" size="l" weight="semibold">
              Your&nbsp;
            </Typography>
            <Typography color="primary" as="span" size="l" weight="semibold">
              feedback
            </Typography>
            <Typography className={styles.feedbackText} as="span" size="l" weight="semibold">
              &nbsp;is valuable for us:
            </Typography>
          </div>
          <div className={styles.emojis}>
            <button className={styles.emojiButton}>😔</button>
            <button className={styles.emojiButton}>😐</button>
            <button className={styles.emojiButton}>🎉</button>
          </div>
        </div>
        <Button onClick={handleOpenDownload} variant="accent">
          Open download folder
        </Button>
      </main>
      <footer>
        <Button variant="underline" onClick={handleBack}>
          Go back
        </Button>
      </footer>
    </div>
  );
};
