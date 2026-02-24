import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../../packages/shared/src"),
    },
  },

  build: {
    // Optimisations SEO/Performance
    rollupOptions: {
      output: {
        // Code splitting pour réduire bundle size
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['react-redux', '@reduxjs/toolkit', 'redux-persist'],
          'ui-vendor': ['react-icons', 'framer-motion'],
        },
      },
    },
    // Compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en prod
        drop_debugger: true,
      },
    },
    // Taille chunks
    chunkSizeWarningLimit: 500,
  },

  // Preload des assets critiques
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});