import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative asset paths for easy static server / GitHub Pages deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
