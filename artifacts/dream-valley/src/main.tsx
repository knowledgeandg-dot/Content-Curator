import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Frontend and backend are now served from the same Render web service,
// so API calls use relative paths ("/api/...") and no base URL is needed.

createRoot(document.getElementById("root")!).render(<App />);
