// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { CheckCircle2, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { navigate, pathFor } from "../router";

// The centre button follows the lesson's state: Start -> Mark Complete -> Completed.
export default function NavButtons({ prev, next, status, canStart, onStart, onComplete, isProject = false }) {
  const done = status === "completed";
  const active = status === "active";
  return (
    <nav className="nav-buttons" aria-label={isProject ? "Project navigation" : "Lesson navigation"}>
      <button className="btn btn-ghost btn-sm" disabled={!prev} onClick={() => navigate(pathFor(prev))}>
        <ChevronLeft size={16} /> Previous
      </button>
      {done ? (
        <button className="btn btn-sm btn-success" disabled aria-pressed="true" title={isProject ? "This project is complete" : "This lesson is complete"}>
          <CheckCircle2 size={16} /> Completed
        </button>
      ) : active ? (
        <button className="btn btn-sm btn-primary" onClick={onComplete}>
          <CheckCircle2 size={16} /> Mark Complete
        </button>
      ) : canStart ? (
        <button className="btn btn-sm btn-primary" onClick={isProject ? onComplete : onStart}>
          {isProject ? <><CheckCircle2 size={16} /> Mark Complete</> : <><Play size={15} /> Start Lesson</>}
        </button>
      ) : null}
      <button className="btn btn-ghost btn-sm" disabled={!next} onClick={() => navigate(pathFor(next))}>
        {isProject ? "Next Project" : "Next Lesson"} <ChevronRight size={16} />
      </button>
    </nav>
  );
}
