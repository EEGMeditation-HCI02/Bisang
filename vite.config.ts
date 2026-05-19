import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Gemini API 프록시 (개발 환경에서만 사용)
      "/api/gemini": {
        target: "https://generativelanguage.googleapis.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, "/v1beta/models"),
      },
      // Freesound API 프록시 (CORS 문제 해결)
      "/api/freesound": {
        target: "https://freesound.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/freesound/, "/apiv2"),
      },
    },
  },
});
