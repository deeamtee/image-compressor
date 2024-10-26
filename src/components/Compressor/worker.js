import { pngquant } from '../../utils/pngquant';

// TODO: Перенести обработку png в worker
self.onmessage = (event) => {
  const { pngData, options } = event.data;

  try {
    const compressedData = pngquant(pngData.data, options, console.log);

    self.postMessage({ compressedData });
  } catch (error) {
    self.postMessage({ error: 'Error compressing PNG file' });
  }
};
