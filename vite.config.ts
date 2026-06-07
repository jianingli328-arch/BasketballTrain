import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/BasketballTrain/',
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
});