import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure the path correctly points to 'src' within the 'workflow' subdirectory
      '@': path.resolve(__dirname, './src'), 
    },
  },
  build: {
    // Output directory (default is 'dist')
    // outDir: 'dist',
    rollupOptions: {
      output: {
        // Ensure JS output is a single file named 'main.js'
        entryFileNames: `assets/main.js`,
        // Ensure CSS output is a single file named 'style.css'
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/style.css';
          }
          // Keep other assets (like images) in their default structure
          return `assets/[name].[ext]`;
        },
      },
    },
    // Ensure CSS is not split into multiple files
    cssCodeSplit: false,
  },
}) 