import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle dynamic import chunk loading failures gracefully by reloading the page
window.addEventListener("vite:preloadError", (event) => {
  const lastReload = sessionStorage.getItem("last-preload-reload");
  const now = Date.now();
  // Prevent infinite reload loops by requiring at least 10 seconds between reload attempts
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem("last-preload-reload", now.toString());
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
