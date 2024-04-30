/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      include: ['lib'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'],
      fileName: () => 'main.js',
    },
    minify: false,
    ssr: true,
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies)],
    },
  },
});
