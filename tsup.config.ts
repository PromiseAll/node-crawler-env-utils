import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts', 'src/dom.ts', 'src/process.ts', 'src/dom.ts'],
  bundle: true,
  format: ['esm', 'cjs'],
  dts: true,
  shims: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  silent: true,
});
