import { Trans, useTranslation } from 'react-i18next';
import { Typography } from 'ui';
import { Compressor } from '../Compressor';
import { CountrySelect } from '../CountrySelect';
import styles from './App.module.css';
import { usePage } from 'hooks';
import { Feedback } from '../Feedback';

const Title = () => (
  <Typography as="h1">
    <Trans
      i18nKey="title"
      components={{
        primary: <Typography as="span" color="primary" size="xl" weight="bold" />,
        dark: <Typography as="span" color="dark" size="xl" weight="bold" />,
      }}
    />
  </Typography>
);

export const App = () => {
  const { currentPage } = usePage();
  useTranslation();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Title />
        <CountrySelect />
      </header>
      {currentPage === 'feedback' && <Feedback />}
      {currentPage === 'compressor' && <Compressor />}
    </div>
  );
};
