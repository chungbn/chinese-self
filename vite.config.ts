/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Deploy lên GitHub Pages tại https://chungbn.github.io/chinese-self/
export default defineConfig({
  base: "/chinese-self/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Học tiếng Trung",
        short_name: "Tiếng Trung",
        description: "Tự học tiếng Trung từ đầu theo lộ trình HSK",
        lang: "vi",
        theme_color: "#b91c1c",
        background_color: "#fafaf9",
        display: "standalone",
        icons: [{ src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
      },
    }),
  ],
  test: {
    environment: "node",
  },
});
