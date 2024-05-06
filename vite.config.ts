import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import pkg from './package.json';

export default defineConfig({
  plugins: [
    dts({
      exclude: ['lib/**/*.spec.ts', 'test'],
    }),
  ],
  build: {
    ssr: true,
    lib: {
      entry: {
        'app-router': resolve(__dirname, 'lib/app-router/index.ts'),
        'pages-router': resolve(__dirname, 'lib/pages-router/index.ts'),
        'experimental-graphql': resolve(__dirname, 'lib/graphql/index.ts'),
      },
      formats: ['es', 'cjs'],
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
