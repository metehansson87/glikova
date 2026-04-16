import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Redirect real hooks/components to mock versions
      "./hooks/useReadings": path.resolve(__dirname, "src/hooks/useReadings.mock.js"),
      "../hooks/useReadings": path.resolve(__dirname, "src/hooks/useReadings.mock.js"),
      "./hooks/useSubscription": path.resolve(__dirname, "src/hooks/useSubscription.mock.js"),
      "../hooks/useSubscription": path.resolve(__dirname, "src/hooks/useSubscription.mock.js"),
      "./components/PaywallBanner": path.resolve(__dirname, "src/components/PaywallBanner.mock.jsx"),
      "../components/PaywallBanner": path.resolve(__dirname, "src/components/PaywallBanner.mock.jsx"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
  server: {
    open: true,
  },
});
