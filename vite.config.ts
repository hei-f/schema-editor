import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import manifest from './src/manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as any })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      input: {
        // CRXJS会自动处理manifest中的入口
      },
      output: {
        // Monaco Editor配置为主线程模式，将其打包为单独chunk以优化加载
        manualChunks: (id) => {
          if (id.includes('monaco-editor')) {
            return 'monaco'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['monaco-editor']
  }
})

