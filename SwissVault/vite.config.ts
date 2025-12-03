import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared')
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js']
  },
  root: 'client',
  build: {
    outDir: '../dist/public',
    emptyOutDir: true
  }
});
