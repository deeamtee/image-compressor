const mimeToExtensionMap: { [key: string]: string } = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
};

export const getExtensionFromMimeType = (mimeType: string): string => {
  return mimeToExtensionMap[mimeType] || '';
};
