import { CheckCircle2, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { navigate, pathFor } from "../router";

// The centre button follows the lesson's state: Start -> Mark Complete -> Completed.
export default function NavButtons({ prev, next, status, onStart, onComplete }) {
  const done = status === "completed";
  const active = status === "active";
  return (
    <nav className="nav-buttons" aria-label="Day navigation">
      <button className="btn btn-ghost btn-sm" disabled={!prev} onClick={() => navigate(pathFor(prev))}>
        <ChevronLeft size={16} /> Previous
      </button>
      {done ? (
        <button className="btn btn-sm btn-success" onClick={onStart} aria-pressed="true" title="Click to reopen this day">
          <CheckCircle2 size={16} /> Completed
        </button>
      ) : active ? (
        <button className="btn btn-sm btn-primary" onClick={onComplete}>
          <CheckCircle2 size={16} /> Mark Complete
        </button>
      ) : (
        <button className="btn btn-sm btn-primary" onClick={onStart}>
          <Play size={15} /> Start Day
        </button>
      )}
      <button className="btn btn-ghost btn-sm" disabled={!next} onClick={() => navigate(pathFor(next))}>
        Next Day <ChevronRight size={16} />
      </button>
    </nav>
  );
}
