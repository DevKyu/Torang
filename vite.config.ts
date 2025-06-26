import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015', // 브라우저 호환성을 위한 최소 타겟 (기본값은 modules)
    minify: 'esbuild', // 기본값이지만 명시적으로 설정
  },
});
