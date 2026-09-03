import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5174,  // ← port différent du client
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
      // FIX 2026-09-03 : pointait vers packages/shared/src, qui n'existe
      // pas (les fichiers sont directement à la racine de packages/shared/).
      // Alias inutilisé aujourd'hui dans apps/admin/src (vérifié par grep),
      // mais corrigé pour ne pas casser silencieusement le jour où
      // quelqu'un l'utilisera.
      "@shared": path.resolve(__dirname, "../../packages/shared"),
    },
  },
});