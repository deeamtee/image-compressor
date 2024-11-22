import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import svgr from '@svgr/rollup';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    nodePolyfills(),
    {
      name: 'update-manifest',
      apply: 'build',
      writeBundle(options, bundle) {
        const manifestPath = resolve(__dirname, 'dist/manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

        const contentScriptFile = Object.keys(bundle).find(
          (file) => file.startsWith('assets/content') && file.endsWith('.js')
        );

        if (contentScriptFile) {
          manifest.content_scripts[0].js = [`/${contentScriptFile}`];
        }

        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      },
    },
  ],

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // content: resolve(__dirname, 'src/content.js'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      ui: resolve(__dirname, './src/ui'),
      hooks: resolve(__dirname, './src/hooks'),
    },
  },
});
