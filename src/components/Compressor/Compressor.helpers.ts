import imageCompression, { Options } from 'browser-image-compression';
import { optimize } from 'svgo';
import { dataURLtoUint8 } from '../../utils/helpers';
import Worker from './worker?worker';
import { CompressorError, OutputFiles, WorkerMessage } from 'types';

const compressImage = async (file: File, options?: Options) => {
  const defaultOptions = {
    useWebWorker: true,
    alwaysKeepResolution: true,
  };

  return imageCompression(file, { ...defaultOptions, ...options });
};

function compressPng(file: File) {
  const reader = new FileReader();

  return new Promise<File | null>((resolve, reject) => {
    reader.onload = async (event) => {
      const inputImageData = dataURLtoUint8(event.target?.result as string);
      const options = {
        quality: '70-85', // полученно экспериментальным путем
        speed: '5',
      };

      const worker = new Worker();
      worker.postMessage({ pngData: inputImageData, options });

      worker.onmessage = async (event) => {
        const { data, error, isRecoverable }: WorkerMessage = event.data;

        if (data) {
          resolve(new File([data], file.name, { type: 'image/png' }));
        } else if (error && isRecoverable) {
          try {
            const fallbackFile = await compressImage(file, {
              maxSizeMB: (file.size * 0.45) / (1024 * 1024),
            });
            resolve(fallbackFile);
          } catch (fallbackError) {
            reject(fallbackError);
          }
        } else {
          reject(error);
        }
        worker.terminate();
      };
    };

    reader.onerror = () =>
      reject({
        error: { message: 'Error reading PNG file' },
      } as CompressorError);

    reader.readAsDataURL(file);
  });
}

const compressSvg = async (file: File) => {
  const reader = new FileReader();

  return new Promise<File | null>((resolve, reject) => {
    reader.onload = (event) => {
      const svgString = event.target?.result as string;
      try {
        const { data } = optimize(svgString, { multipass: true, floatPrecision: 2 });
        resolve(new File([data], file.name, { type: 'image/svg+xml' }));
      } catch (error) {
        reject({
          error,
        } as CompressorError);
      }
    };

    reader.onerror = () =>
      reject({
        error: { message: 'Error reading SVG file' },
      });

    reader.readAsText(file);
  });
};

export const compressFile = async (file: File, onProgress?: () => void): Promise<OutputFiles> => {
  try {
    let compressedFile: File | null = null;
    if (file.type === 'image/svg+xml') {
      compressedFile = await compressSvg(file);
    } else if (file.type === 'image/jpeg') {
      compressedFile = await compressImage(file, { initialQuality: 0.75 });
    } else if (file.type === 'image/png') {
      compressedFile = await compressPng(file);
    } else if (file.type === 'image/webp' || file.type === 'image/gif') {
      compressedFile = await compressImage(file);
    }
    onProgress?.();
    return { originalFile: file, compressedFile };
  } catch {
    return { originalFile: file, compressedFile: null };
  }
};
