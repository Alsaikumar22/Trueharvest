
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Ensure assets are loaded relatively so the app works on any domain or subdirectory
  base: '/', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true
  },
  define: {
    'process.env': process.env,
    'global': 'globalThis',
  }
});
