import imageCompression from 'browser-image-compression';
import { optimize } from 'svgo';

const UPNG = window.UPNG;

export const compressPng = async (file: File) => {
  const reader = new FileReader();

  return new Promise<Blob | null>((resolve, reject) => {
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const pngData = new Uint8Array(arrayBuffer);

      const img = UPNG.decode(pngData); // Декодируем PNG
      const compressedData = UPNG.encode([img.data.buffer], img.width, img.height, 256); // Сжимаем изображение

      const blob = new Blob([compressedData], { type: 'image/png' });
      resolve(blob);
    };

    reader.onerror = () => reject('Error reading PNG file');
    reader.readAsArrayBuffer(file);
  });
};

export const compressJpeg = async (file: File, onProgress: (p: number) => void) => {
  const options = {
    useWebWorker: true,
    initialQuality: 0.75,
    alwaysKeepResolution: true,
    fileType: file.type,
    onProgress,
  };

  return await imageCompression(file, options);
};

export const compressSvg = async (file: File) => {
  const reader = new FileReader();

  return new Promise<Blob | null>((resolve, reject) => {
    reader.onload = (event) => {
      const svgString = event.target?.result as string;
      const compressedSvg = optimize(svgString, { multipass: true, floatPrecision: 2 }).data;

      const blob = new Blob([compressedSvg], { type: 'image/svg+xml' });
      resolve(blob);
    };

    reader.onerror = () => reject('Error reading SVG file');
    reader.readAsText(file);
  });
};
