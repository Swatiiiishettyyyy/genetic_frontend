import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const bloodtestApiProxyPaths = [
  "/auth",
  "/sessions",
  "/members",
  "/addresses",
  "/cart",
  "/thyrocare",
  "/orders",
  "/banners",
  "/sms",
  "/email",
  "/config",
  "/logs",
  "/leads",
  "/utm-tracking",
  "/health",
  "/profile",
  "/enquiry",
  "/newsletter",
  "/upload",
  "/api/utm-tracking",
];

function razorpayIconProxy(middlewares) {
  middlewares.use(async (req, res, next) => {
    if (!/^\/\d+\.png(\?.*)?$/.test(req.url ?? "")) return next();
    try {
      const upstream = await fetch(`https://cdn.razorpay.com/bank${req.url}`);
      if (!upstream.ok) {
        res.statusCode = upstream.status;
        res.end();
        return;
      }
      const buf = await upstream.arrayBuffer();
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      });
      res.end(new Uint8Array(buf));
    } catch {
      res.writeHead(502);
      res.end();
    }
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devPort = Number.parseInt(env.VITE_DEV_PORT || "3002", 10);
  const bloodtestApiProxyTarget = env.VITE_BLOODTEST_API_PROXY_TARGET || "http://localhost:8000";

  return {
    plugins: [
      react(),
      {
        name: "razorpay-icon-proxy",
        configureServer(server) {
          razorpayIconProxy(server.middlewares);
        },
        configurePreviewServer(server) {
          razorpayIconProxy(server.middlewares);
        },
      },
    ],
    server: {
      port: Number.isFinite(devPort) ? devPort : 3002,
      strictPort: true,
      proxy: Object.fromEntries(
        bloodtestApiProxyPaths.map((route) => [
          route,
          {
            target: bloodtestApiProxyTarget,
            changeOrigin: true,
            secure: false,
          },
        ]),
      ),
    },
    build: {
      chunkSizeWarningLimit: 1800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (
              id.includes("node_modules/recharts") ||
              id.includes("node_modules/d3-") ||
              id.includes("node_modules/victory-vendor")
            ) return "vendor-charts";
            if (
              id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/react-router")
            ) return "vendor-react";
          },
        },
      },
    },
  };
});
