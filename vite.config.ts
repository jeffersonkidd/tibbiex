import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

/* /dashboard serves dashboard.html, in dev and preview as vercel.json does in
   production, and /studio still lands on it. The hash (/dashboard#avatar) never
   reaches the server, so the browser keeps it across both. */
function studioAtDashboard(): Plugin {
  const route = (
    req: { url?: string },
    res: {
      statusCode: number
      setHeader: (k: string, v: string) => void
      end: () => void
    },
    next: () => void,
  ) => {
    const [path, query = ""] = (req.url ?? "").split("?")
    if (path === "/studio") {
      res.statusCode = 308
      res.setHeader("Location", "/dashboard" + (query ? `?${query}` : ""))
      return res.end()
    }
    if (path === "/dashboard")
      req.url = "/dashboard.html" + (query ? `?${query}` : "")
    next()
  }
  return {
    name: "studio-at-dashboard",
    configureServer: (server) => void server.middlewares.use(route),
    configurePreviewServer: (server) => void server.middlewares.use(route),
  }
}

// Vite config — https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), studioAtDashboard()],
  resolve: {
    // Ensure a single React instance across the app and pre-bundled deps
    // (e.g. sonner), otherwise its hooks see a null dispatcher.
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    /* Two pages: the public site, and the owner's back office at /dashboard.
       Separate entries, so the site's bundle carries none of the studio. */
    rolldownOptions: {
      input: {
        main: path.resolve(import.meta.dirname, "index.html"),
        dashboard: path.resolve(import.meta.dirname, "dashboard.html"),
      },
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
