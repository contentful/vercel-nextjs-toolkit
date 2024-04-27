/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    copyPublicDir: false,
    outDir: './dist',
    lib: {
      entry: {
        index: resolve(__dirname, 'lib/main.ts'),
        'app-router': resolve(__dirname, 'lib/app-router/index.ts'),
        'pages-router': resolve(__dirname, 'lib/pages-router/index.ts'),
      },
      formats: ['es'],
      fileName: 'main',
    },
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies)],
    },
  },
  plugins: [
    dts({
      entryRoot: 'lib',
    }),
  ],
});
