import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path';
import svgr from '@svgr/rollup';

export default defineConfig({
  plugins: [react(), svgr()],
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
