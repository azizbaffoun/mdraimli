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
}) 