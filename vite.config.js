import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const fromSrc = (p) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

// Absolute-from-src imports (e.g. `import theme from "assets/theme"`) used to be
// resolved by the CRA-era jsconfig.json `baseUrl: "src"`. Vite needs them declared.
const srcAliases = [
  "assets",
  "components",
  "context",
  "css",
  "examples",
  "fonts",
  "hooks",
  "layouts",
  "utils",
];

export default defineConfig({
  // The app is served under /dashboard (see the router basename in src/index.jsx,
  // which reads this same value via import.meta.env.BASE_URL). An absolute base is
  // required so assets still resolve on deep routes like /dashboard/token/123.
  base: "/dashboard/",
  plugins: [react()],
  resolve: {
    alias: {
      ...Object.fromEntries(srcAliases.map((dir) => [dir, fromSrc(dir)])),
      routes: fromSrc("routes"),
      config: fromSrc("config"),
      App: fromSrc("App"),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
