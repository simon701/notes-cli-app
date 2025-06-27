import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/login": "http://backend:5000",
      "/notes": "http://backend:5000",
      "/logout": "http://backend:5000",
    },
    host: true,
  },
});
