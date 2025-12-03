import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Добавьте плагины, если используете React/Vue, напр. react()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000', // Прокси для backend в dev
    },
  },
});
