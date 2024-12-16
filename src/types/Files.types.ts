export type OutputFiles = {
  originalFile: File;
  compressedFile: File | null;
};

export type CompressorError = {
  error: Error;
  isRecoverable?: boolean;
};

export type WorkerMessage = {
  data?: Uint8Array;
} & CompressorError;
