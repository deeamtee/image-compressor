import React, { useState } from "react";
import { optimize } from "svgo";
import styles from "./App.module.css";
import cn from "clsx";

export const App: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [compressedSvg, setCompressedSvg] = useState<string | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setCompressionProgress(0);
    setErrorMessage(null);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "image/svg+xml") {
      const reader = new FileReader();
      reader.onload = (event) => {
        const svgData = event.target?.result as string;
        setSvgContent(svgData);
        compressSvg(svgData);
      };
      reader.readAsText(file);
    } else {
      setErrorMessage("Please drop a valid SVG file.");
    }
  };

  const compressSvg = (svgData: string) => {
    setCompressionProgress(10);

    const result = optimize(svgData, {
      multipass: true, // Улучшенное сжатие без потери качества
      floatPrecision: 2, 
    });
    setTimeout(() => {
    setCompressionProgress(70);
    }, 100);
    
    setTimeout(() => { // TODO: Переписать анимацию на CSS
      setCompressedSvg(result.data);
      setCompressionProgress(100);
    }, 300); // Искусственная задержка для демонстрации прогресса
  };

  const downloadCompressedSvg = () => {
    if (compressedSvg) {
      const blob = new Blob([compressedSvg], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "compressed_image.svg";
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
        {svgContent ? (
          <p>SVG uploaded. Compressing...</p>
        ) : (
          <p>Drag & drop your SVG file here</p>
        )}
      </div>

      {compressionProgress > 0 && (
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${compressionProgress}%` }}
          ></div>
        </div>
      )}

      {compressedSvg && (
        <div>
          <p>Compression complete!</p>
          <button onClick={downloadCompressedSvg}>
            Download Compressed SVG
          </button>
        </div>
      )}

      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};
