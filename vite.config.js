// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const NOTICE = "/*! PyPath (c) 2026 Sabir Hussain. All rights reserved. Proprietary software: copying, modification and redistribution are prohibited. See LICENSE. */";

// base "./" lets the built site work from any static host or sub-folder
// (GitHub Pages, Netlify, Vercel, Render). Routing uses the URL hash, so no
// server rewrite rules are needed.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    sourcemap: false, // never publish source maps: they would expose the original source
    rollupOptions: { output: { banner: NOTICE } },
  },
  worker: { rollupOptions: { output: { banner: NOTICE } } },
});
