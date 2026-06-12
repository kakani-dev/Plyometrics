import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import axios from "axios";

// Configure global Axios headers to skip ngrok browser warnings and avoid CORS errors
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

import "i18n/config";

import "simplebar-react/dist/simplebar.min.css";

import "styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
