import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path';
import svgr from '@svgr/rollup';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), svgr(), nodePolyfills()],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'index.html'),
      },
    }
  }
});
