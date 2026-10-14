import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative asset paths for easy static server / GitHub Pages deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    watch: {
      // 大体积媒体文件在写入/扫描时会被杀软或写入进程短暂锁住，
      // chokidar 碰到 EBUSY 会直接崩掉 dev 服务器。媒体属于静态资源不需要 HMR。
      ignored: ['**/assets/videos/**', '**/assets/images/**', '**/dist/**'],
    },
  },
});
