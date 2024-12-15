import { ERRORS } from '../../utils/constants';
import { tinyimage } from '../../utils/tinyimage';

self.onmessage = (event) => {
  const { pngData, options } = event.data;

  try {
    const compressedData = tinyimage(pngData, options, (error: string) => {
      const notAPNG = error && error.includes('Not a PNG file');
      if (notAPNG) {
        self.postMessage({ error, type: ERRORS.InvalidExtension.type, message: ERRORS.InvalidExtension.message });
        return;
      }
    }).data;

    self.postMessage({ data: compressedData });
  } catch (error) {
    self.postMessage({ error, type: ERRORS.UnexpectedError.type, message: ERRORS.UnexpectedError.message });
  }
};
