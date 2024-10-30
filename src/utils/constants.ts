export const ERRORS = {
  UnexpectedError: {
    message: 'Unexpected error during PNG compression',
    type: 'UnexpectedError',
  },
  InvalidExtension: {
    message: 'Image is not a valid PNG file',
    type: 'InvalidExtension',
  },
  FileReaderError: { message: 'Error reading file', type: 'FileReaderError' },
  SvgoError: { message: 'Error optimizing SVG', type: 'SvgoError' },
};