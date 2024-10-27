/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface UPNG {
    encode: (data: ArrayBuffer[], width: number, height: number, colors: number) => ArrayBuffer;
    decode: (data: any) => any;
    encodeLL: (data: ArrayBuffer[], width: number, height: number, colors: number) => ArrayBuffer;
    compress: (data: ArrayBuffer[], width: number, height: number) => ArrayBuffer;
    dither: (data: Uint8Array, width: number, height: number, amount: number) => Uint8Array;
    
    quantize: {
      (data: Uint8Array, colors: number): Uint8Array;
      findNearest: (color: Uint8Array, palette: Uint8Array[]) => number;
      getKDtree: (colors: Uint8Array[], colorsNum: number) => Uint8Array[];
      getNearest: (color: Uint8Array, palette: Uint8Array[]) => number;
    };
  }

  interface Window {
    UPNG: UPNG;
  }
}

export {};
