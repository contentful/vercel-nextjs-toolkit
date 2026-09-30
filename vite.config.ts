/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

const peerDependencies = Object.keys(pkg.peerDependencies);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({
    exclude: ["lib/**/*.spec.ts", "test"],
  })],
  build: {
    ssr: true,
    minify: false,
    lib: {
      entry: {
        "app-router": resolve(__dirname, 'lib/app-router/index.ts'),
        "pages-router": resolve(__dirname, 'lib/pages-router/index.ts'),
      },
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // Also match subpaths like `next/navigation`. Left to Vite's SSR externalization they get
      // rewritten to `next/navigation.js`, which misses Turbopack's `next/*` aliases and crashes
      // the route handler.
      external: (id) =>
        peerDependencies.some((dep) => id === dep || id.startsWith(`${dep}/`)),
      output: {
        preserveModules: true,
        preserveModulesRoot: 'lib',
      },
    },
  },
});
