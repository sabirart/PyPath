// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import App from "./App";
import "./styles/index.css";
import { migrateStorage } from "./services/storage";

migrateStorage();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
