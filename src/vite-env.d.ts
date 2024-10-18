/// <reference types="vite/client" />

declare module 'svgo-browser/lib/optimize' {
    export default function optimize(...rest: unknown): Promise<{ data: string }>;
} 