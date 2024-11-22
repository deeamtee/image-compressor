import { usePage } from 'hooks';
import styles from './Feedback.module.css';

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
      <header className={styles.header}>
        <h1>
          Images <span className={styles.highlight}>Compressor</span>
        </h1>
        <div className={styles.languageSelector}>
          <img src="flag-icon.png" alt="Language Selector" />
        </div>
      </header>
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
        <button onClick={handleOpenDownload} className={styles.downloadButton}>
          Open download folder
        </button>
      </main>
      <footer className={styles.footer}>
        <button onClick={() => navigate('compressor')} className={styles.goBackLink}>
          Go back
        </button>
      </footer>
    </div>
  );
};
