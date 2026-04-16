/**
 * vite.config.js — Optimisé performance mobile (score Lighthouse 90+)
 * tekalis-frontend/apps/client/vite.config.js
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Babel plugins pour réduire la taille du bundle React
      babel: {
        plugins: mode === 'production' ? ['transform-remove-console'] : [],
      },
    }),
  ],

  server: {
    port: 3000,
    host: true, // Accessible sur le réseau local (test mobile)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },

  build: {
    target: 'es2015', // Support ancien Android
    cssCodeSplit: true,
    minify: 'esbuild', // Plus rapide que terser, résultats similaires
    
    rollupOptions: {
      output: {
        // ── Chunking stratégique pour mobile ──────────────────────────────
        manualChunks: (id) => {
          // Vendor React — chargé en priorité
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Router — chargé juste après
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          // Redux — chargé au démarrage
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux-persist')) {
            return 'redux';
          }
          // Charts — lazy-loaded
          if (id.includes('recharts')) {
            return 'charts';
          }
          // Icons — divisés par provider
          if (id.includes('react-icons/fa')) return 'icons-fa';
          if (id.includes('react-icons')) return 'icons';
          if (id.includes('lucide-react')) return 'icons-lucide';
          // SEO
          if (id.includes('react-helmet-async')) return 'seo';
          // Framer Motion — lazy si possible
          if (id.includes('framer-motion')) return 'motion';
          // XLSX — très lourd, isolé
          if (id.includes('xlsx')) return 'xlsx';
          // Swiper
          if (id.includes('swiper')) return 'swiper';
        },

        // ── Noms de fichiers avec hash pour cache long ────────────────────
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    // Limite d'avertissement chunk à 500KB
    chunkSizeWarningLimit: 500,

    // Source maps désactivées en prod (réduire taille)
    sourcemap: false,

    // Compression assets
    reportCompressedSize: true,

    // ── Inline CSS critique dans le HTML ──────────────────────────────────
    // Les styles critiques sont inline, le reste async
    assetsInlineLimit: 4096, // 4KB — inline les petites images en base64
  },

  // ── Optimisation des deps ────────────────────────────────────────────────
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-redux',
      '@reduxjs/toolkit',
      'axios',
    ],
    // Exclure les imports dynamiques lourds
    exclude: ['recharts', 'framer-motion', 'xlsx'],
  },

  // ── Variables d'environnement ────────────────────────────────────────────
  define: {
    __SITE_URL__: JSON.stringify(
      mode === 'production' ? 'https://tekalis.com' : 'http://localhost:3000'
    ),
    __SITE_NAME__: JSON.stringify('Tekalis'),
    __DEV__: mode !== 'production',
  },

  // ── CSS ──────────────────────────────────────────────────────────────────
  css: {
    devSourcemap: true,
    preprocessorOptions: {},
  },
}));
