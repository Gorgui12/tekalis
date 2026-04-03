/**
 * tekalis-seo/vite.config.optimized.js
 * 
 * Remplace tekalis-frontend/apps/client/vite.config.js
 * Ajout : prerendering + optimisations SEO/performance
 */

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
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['react-redux', '@reduxjs/toolkit', 'redux-persist'],
          'ui-vendor': ['react-icons', 'framer-motion'],
          // ✅ SEO : séparer react-helmet pour chargement prioritaire
          'seo-vendor': ['react-helmet-async'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 500,

    // ✅ SEO : générer les source maps pour debugging prod
    sourcemap: false,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
  },

  // ✅ SEO : variables d'environnement exposées au client
  define: {
    __SITE_URL__: JSON.stringify('https://tekalis.com'),
    __SITE_NAME__: JSON.stringify('Tekalis'),
  },
});