import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },

      "/anomaly": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },

      "/predict": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },

      "/forecast": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,

        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
          });
        },
      },
    },
  },

  preview: {
    host: "0.0.0.0",
    port: 10000,
    allowedHosts: ["marketmind-frontend-sl1d.onrender.com"],
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});