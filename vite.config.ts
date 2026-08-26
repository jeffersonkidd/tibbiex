import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Ensure a single React instance across the app and pre-bundled deps
    // (e.g. sonner), otherwise its hooks see a null dispatcher.
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "sonner"],
  },
  server: {
    port: parseInt(process.env.PORT || "5173"),
  },
  preview: {
    port: parseInt(process.env.PORT || "4173"),
  },
})
