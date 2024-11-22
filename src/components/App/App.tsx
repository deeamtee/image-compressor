import { Compressor } from '../Compressor';
import { Feedback } from '../Feedback';
import { usePage } from 'hooks';

export const App = () => {
  const { currentPage } = usePage();

  if (currentPage === 'feedback') {
    return <Feedback />;
  }

  return <Compressor />;
};
