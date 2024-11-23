import { usePage } from 'hooks';
import styles from './Feedback.module.css';
import { Button } from 'ui';

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
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h2>Files are downloading</h2>
        <p>
          Your <span className={styles.feedbackLink}>feedback</span> is valuable for us:
        </p>
        <div className={styles.emojis}>
          <button className={styles.emojiButton}>😔</button>
          <button className={styles.emojiButton}>😐</button>
          <button className={styles.emojiButton}>🎉</button>
        </div>
        <Button className={styles.openFolderButton} onClick={handleOpenDownload} variant="accent">
          Open download folder
        </Button>
      </main>
      <footer className={styles.footer}>
        <button onClick={() => navigate('compressor')} className={styles.goBackLink}>
          Go back
        </button>
      </footer>
    </div>
  );
};
