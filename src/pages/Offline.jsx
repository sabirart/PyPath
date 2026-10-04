// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { WifiOff, RefreshCw } from "lucide-react";
import { navigate } from "../router";

export default function Offline() {
  const retry = () => window.location.reload();
  return (
    <section className="empty-page" aria-labelledby="offline-title">
      <div className="empty-icon"><WifiOff size={28} aria-hidden="true" /></div>
      <h1 id="offline-title">You’re offline</h1>
      <p>PyPath is an online learning website. Reconnect to the internet to load lessons, save progress, and run Python in the browser.</p>
      <div className="stack-actions">
        <button className="btn btn-primary" onClick={retry}><RefreshCw size={16} /> Try again</button>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>Go to dashboard</button>
      </div>
    </section>
  );
}
