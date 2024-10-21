/// <reference types="vite/client" />

declare module 'svgo-browser/lib/optimize' {
    export default function optimize(...rest: unknown): Promise<{ data: string }>;
} 

declare module '*.svg' {
    import * as React from 'react';
    export const ReactComponent: React.FunctionComponent<
      React.SVGProps<SVGSVGElement> & { title?: string }
    >;
    const src: string;
    export default src;
  }
  