import JSZip from 'jszip';
import { OutputFiles } from 'types';

export const downloadFile = (blob: Blob, fileName: string) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const archiveAndDownload = async (compressedFiles: OutputFiles[]) => {
  const zip = new JSZip();
  compressedFiles.forEach(({ compressedFile }) => {
    if (!compressedFile) return;
    zip.file(compressedFile.name, compressedFile);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFileName = 'compressed_images.zip';
  downloadFile(zipBlob, zipFileName);
};

export function dataURLtoUint8(dataurl: string) {
  const arr = dataurl.split(','),
    bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return u8arr;
}
