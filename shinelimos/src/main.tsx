import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Load fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Syncopate:wght@700&family=Orbitron:wght@700;900&display=swap";
document.head.appendChild(fontLink);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
