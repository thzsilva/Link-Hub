import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Configure API base URL BEFORE rendering the app
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://link-hub-production.up.railway.app"
    : "http://localhost:3001");

console.log("🔌 API Base URL:", apiBaseUrl);
console.log("📍 Hostname:", typeof window !== "undefined" ? window.location.hostname : "N/A");
console.log("🌍 VITE_API_BASE_URL env:", import.meta.env.VITE_API_BASE_URL);

setBaseUrl(apiBaseUrl);

createRoot(document.getElementById("root")!).render(<App />);
