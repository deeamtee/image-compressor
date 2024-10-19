import React, { useState } from 'react';
import styles from './App.module.css';
import cn from 'clsx';
import { optimize } from 'svgo';
import imageCompression from 'browser-image-compression';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const UPNG = window.UPNG;

export const App: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileRef = React.useRef({ name: '' });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setProgress(0);
    setErrorMessage(null);
    const file = e.dataTransfer.files[0];

    if (!file) return;

    fileRef.current = { name: file.name };

    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        setProgress(10);
        const svgString = event.target?.result as string;
        const compressedSvg = optimize(svgString, { multipass: true, floatPrecision: 2 }).data;
        setTimeout(() => setProgress(70), 100);
        const blob = new Blob([compressedSvg], { type: 'image/svg+xml' });
        setCompressedFile(blob);
        setTimeout(() => setProgress(100), 300);
      };
      reader.readAsText(file);
    }else if (['image/jpeg'].includes(file.type)) {
      // TODO: Приблизиться к tinypng. Сейчас PNG 530 Кб => 418 Кб, tinypng 155 Кб
      const options = {
        // maxSizeMB: 1,  // Устанавливаем целевой размер файла в мегабайтах
        useWebWorker: true,  // Используем Web Worker для улучшения производительности
        initialQuality: 0.75,  // Уровень качества: 0.7 (приближенно к TinyPNG)
        alwaysKeepResolution: true,  // Сохраняем разрешение изображения
        fileType: file.type,  // Преобразуем в тот же формат, что и оригинал
        onProgress: (p: number) => setProgress(p),  // Прогресс сжатия
      };
      try {
        const compressedImage = await imageCompression(file, options);
        setCompressedFile(compressedImage);
      } catch {
        setErrorMessage('Image compression error');
      }
    } else if (file && file.type === 'image/png') {
      compressPng(file);
    }else {
      setErrorMessage('Only JPEG, PNG and SVG images are supported');
    }
  };

  const compressPng = async (file: File) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const pngData = new Uint8Array(arrayBuffer);

      // Декодируем PNG в массив данных
      const img = UPNG.decode(pngData);
      
      // Сжимаем изображение с желаемым количеством цветов (например, 256 цветов)
      const compressedData = UPNG.encode([img.data.buffer], img.width, img.height, 256);

      // Создаем blob из сжатого изображения
      const blob = new Blob([compressedData], { type: 'image/png' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileRef.current.name || 'compressed.png';
      link.click();
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadCompressedSvg = () => {
    if (compressedFile) {
      const blob = new Blob([compressedFile], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileRef.current.name || 'compressed.svg';
      link.click();
    }
  };

  return (
    <div className={styles.container}>
      <h1>Images Compressor</h1>
      <div
        className={cn(styles.dropArea, { [styles.dragging]: dragging })}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>Drag and drop an image here (SVG, JPEG, PNG)</p>
      </div>

      {progress > 0 && !errorMessage && !compressedFile && (
        <div className={styles.progress}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {compressedFile && (
        <div>
          <p className={styles.success}>Compression complete!</p>
          <button onClick={downloadCompressedSvg}>Download an Image</button>
        </div>
      )}

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    </div>
  );
};
