// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { Target } from "lucide-react";

export default function TaskCard({ task }) {
  return (
    <aside className="task-card" aria-label="Practice task">
      <span className="task-icon"><Target size={18} aria-hidden="true" /></span>
      <div>
        <p className="task-kicker">Your turn</p>
        <h3>Practice task</h3>
        <p className="task-text">{task}</p>
        <p className="muted small">Edit the starter code in the editor, then press Run.</p>
      </div>
    </aside>
  );
}
