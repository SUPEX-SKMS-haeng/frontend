import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
      // "@shared": path.resolve(__dirname, "./src/shared"),  // 만약 shared 폴더를 서비스 src 내에 넣는 경우 이 주석을 해제하고 위의 코드를 주석 처리
    },
    // 👇 추가: 외부 폴더(shared)에서 react, axios 등을 쓸 때 admin/node_modules를 쓰도록 강제
    dedupe: ['react', 'react-dom', 'axios', 'clsx', 'tailwind-merge'],
  },
  // console.log 제거: production 환경에서 주석 제거하여 사용
  // esbuild: {
  //   pure: ['console.log'],
  // },
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api/v1': {
        target: 'http://0.0.0.0:8000', // Traefik API Gateway
        changeOrigin: true,
      },
    },
  },
});
