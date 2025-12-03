import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@/components': path.resolve(__dirname, 'client/src/components'),
      '@/lib': path.resolve(__dirname, 'client/src/lib'),
      '@/hooks': path.resolve(__dirname, 'client/src/hooks'),
      '@/pages': path.resolve(__dirname, 'client/src/pages')
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  },
  root: 'client',
  build: {
    outDir: '../dist/public',
    emptyOutDir: true
  }
});
