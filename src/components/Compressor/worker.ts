import { CompressorError } from 'types';
import { tinyimage } from '../../utils/tinyimage';

self.onmessage = (event) => {
  const { pngData, options } = event.data;

  try {
    const result = tinyimage(pngData, options, (error: string) => {
      const notAPNG = error && error.includes('Not a PNG file');

      if (notAPNG) {
        self.postMessage({ error: { message: 'Not a PNG file' } } as CompressorError);
        return;
      }
    });

    if (result instanceof Error) {
      self.postMessage({
        error: result,
        isRecoverable: true,
      } as CompressorError);
      return;
    }

    self.postMessage({ data: result.data });
  } catch (error) {
    self.postMessage({ error } as CompressorError);
  }
};
