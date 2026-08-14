import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // route react-native imports to react-native-web for web build
      { find: 'react-native', replacement: 'react-native-web' },
      // ensure any import of the native AdMob package resolves to a no-op shim
      { find: 'react-native-google-mobile-ads', replacement: path.resolve(__dirname, 'src/shims/admob-web-stub.js') },
      // alias mobile utils (if accidentally imported) to shims directory
      { find: /^mobile\/(.*)/, replacement: path.resolve(__dirname, 'src/shims/$1') },
    ],
  },
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'https://www.xicinime.my.id',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      },
    },
  },
  preview: {
    historyApiFallback: true,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split heavy/shared deps into their own chunks so the home route
        // doesn't have to ship videojs and friends. Vite 8 (Rolldown) requires
        // the function form rather than the object form.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@videojs/react')) return 'videojs';
          if (id.includes('react-router')) return 'react-vendor';
          if (
            id.includes('/react-dom/') ||
            id.endsWith('/react/index.js') ||
            id.includes('/react/cjs/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor';
          }
          return undefined;
        },
      },
    },
  },
})
