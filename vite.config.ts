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
    ssr: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies)],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'lib',
      },
    },
  },
});
