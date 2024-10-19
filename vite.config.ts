import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'index.html'),
      },
      // output: {
      //   entryFileNames: 'assets/[name].js',
      //   chunkFileNames: 'assets/[name].js',
      //   assetFileNames: 'assets/[name].[ext]',
      // },
    }
  }
});
