import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" lets the built site work from any static host or sub-folder
// (GitHub Pages, Netlify, Vercel). Routing uses the URL hash, so no
// server rewrite rules are needed.
export default defineConfig({
  base: "./",
  plugins: [react()],
  server: { headers: { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" } },
  preview: { headers: { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" } },
  build: { chunkSizeWarningLimit: 700 },
});
