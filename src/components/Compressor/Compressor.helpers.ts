import imageCompression from 'browser-image-compression';
import { optimize } from 'svgo';
import { dataURLtoUint8 } from '../../utils/helpers';
import Worker from './worker?worker';
import { ERRORS } from '../../utils/constants';
import { OutputFiles } from './CompressedFile.types';

function compressPng(file: File) {
  const reader = new FileReader();

  return new Promise<File | null>((resolve, reject) => {
    reader.onload = async (event) => {
      const inputImageData = dataURLtoUint8(event.target?.result as string);
      const options = {
        quality: '69-73', // полученно экспериментальным путем
        speed: '5',
      };

      const worker = new Worker();
      worker.postMessage({ pngData: inputImageData, options });

      worker.onmessage = (event) => {
        const { data, error, type, message } = event.data;
        if (data) {
          resolve(new File([data], file.name, { type: 'image/png' }));
        } else if (error) {
          reject({ error, type, message });
        }
        worker.terminate();
      };
    };

    reader.onerror = () =>
      reject({
        error: 'Error reading PNG file',
        type: ERRORS.FileReaderError.type,
        message: ERRORS.FileReaderError.message,
      });

    reader.readAsDataURL(file);
  });
}

const compressJpeg = async (file: File, onProgress: (p: number) => void) => {
  const options = {
    useWebWorker: true,
    initialQuality: 0.75,
    alwaysKeepResolution: true,
    fileType: file.type,
    onProgress,
  };

  return imageCompression(file, options);
};

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
          type: ERRORS.SvgoError.type,
          message: ERRORS.SvgoError.message,
        });
      }
    };

    reader.onerror = () =>
      reject({
        error: 'Error reading SVG file',
        type: ERRORS.FileReaderError.type,
        message: ERRORS.FileReaderError.message,
      });

    reader.readAsText(file);
  });
};


export const compressFile = async (file: File): Promise<OutputFiles> => {
  try {
    let compressedFile: File | null = null;
    if (file.type === 'image/svg+xml') {
      compressedFile = await compressSvg(file);
    } else if (file.type === 'image/jpeg') {
      compressedFile = await compressJpeg(file, () => {});
    } else if (file.type === 'image/png') {
      compressedFile = await compressPng(file);
    }
    return { originalFile: file, compressedFile };
  } catch {
    return { originalFile: file, compressedFile: null };
  }
};