
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import AuthProvider from "./auth/AuthProvider";
import { initializeMsal } from "./auth/msalInstance";

async function startApp() {
  try {
    await initializeMsal();

    ReactDOM.createRoot(
      document.getElementById("root")
    ).render(
      <React.StrictMode>
        <AuthProvider>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error(
      "Application initialization failed:",
      error
    );
  }
}

startApp();
