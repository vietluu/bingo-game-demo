import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
    server: {
    port: 3000,
    proxy: {
      '/socket.io': {
        target: process.env.VITE_SOCKET_URL,
        ws: true,
        changeOrigin: true,
      },
    },
  },
});