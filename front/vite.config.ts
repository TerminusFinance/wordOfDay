import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {nodePolyfills} from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  // base : '/test/front/',
  build: {
    minify: true,
    sourcemap: false,
    target: 'modules',
  },
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
});