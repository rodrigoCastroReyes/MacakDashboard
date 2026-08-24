// react-table@7 ships regenerator-compiled async helpers and expects a global
// `regeneratorRuntime`. CRA's Babel preset injected it; Vite/esbuild does not, so
// DataTable pages crash without this import.
import "regenerator-runtime/runtime";

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { AuthProvider } from "context/authProvider";
import { MaterialUIControllerProvider } from "context";

const container = document.getElementById("app");
const root = createRoot(container);

// Kept in sync with `base` in vite.config.js so dev and production agree.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

root.render(
  <BrowserRouter basename={basename}>
    <MaterialUIControllerProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
