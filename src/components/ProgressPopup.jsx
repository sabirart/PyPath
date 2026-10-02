import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { navigate, pathFor } from "../router";
import { STATUS_LABEL } from "./StatusIcon";

export function Ring({ percent, size = 40, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="ring">
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="var(--ring)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - percent / 100)} transform={`rotate(-90 ${mid} ${mid})`} />
    </svg>
  );
}

// Compact bottom-right widget: a small pill that expands into a progress card.
export default function ProgressPopup() {
  const { stats, lessons, progress, nextItem, activeId, panels, togglePanel, resetProgress, bp } = useApp();
  const [confirming, setConfirming] = useState(false);
  const pill = useRef(null);
  const open = panels.progress;
  const target = nextItem;
  const close = () => { togglePanel("progress", false); setConfirming(false); };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") { close(); pill.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = (path) => { navigate(path); if (bp === "mobile") close(); };

  return (
    <div className="pp" data-open={open}>
      <button ref={pill} className="pp-pill" onClick={() => togglePanel("progress")} aria-expanded={open} aria-controls="pp-card"
        aria-label={`Progress: ${stats.completed} of ${stats.total} days complete`}>
        <span className="ring-wrap"><Ring percent={stats.percent} size={30} stroke={4} /></span>
        <span className="pp-count">{stats.completed}<span className="muted">/{stats.total}</span></span>
      </button>
      {open && (
        <section id="pp-card" className="pp-card" role="dialog" aria-label="Your progress">
          <div className="pp-head">
            <div className="ring-wrap big"><Ring percent={stats.percent} size={56} stroke={5} /><span className="ring-text">{stats.percent}%</span></div>
            <div>
              <h2>Your progress</h2>
              <p className="muted small">{stats.completed} of {stats.total} days complete</p>
            </div>
            <button className="icon-btn pp-close" onClick={close} aria-label="Close progress"><X size={18} /></button>
          </div>
          <ul className="pp-stats" aria-label="Day counts">
            <li><strong>{stats.completed}</strong> completed</li>
            <li><strong>{stats.active}</strong> pending</li>
            <li><strong>{stats.notStarted}</strong> not started</li>
          </ul>
          <ol className="dots" aria-label="All 30 days">
            {lessons.map((l) => {
              const st = progress[l.id] || "not-started";
              return (
                <li key={l.id}>
                  <a href={`#${pathFor(l)}`} className={`dot dot-${st}`} onClick={() => bp === "mobile" && close()}
                    aria-label={`Day ${l.day}, ${l.title}: ${STATUS_LABEL[st]}`} title={`Day ${l.day}. ${l.title}`}>
                    {st === "completed" ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : l.number}
                  </a>
                </li>
              );
            })}
          </ol>
          <button className="btn btn-primary btn-block" onClick={() => go(target ? pathFor(target) : "/lessons/l01")}>
            {!target ? "Review Day 1" : activeId ? `Continue: Day ${target.day}` : stats.completed ? `Start Day ${target.day}` : "Start Day 1"} <ArrowRight size={16} />
          </button>
          {!confirming ? (
            <button className="link-btn" onClick={() => setConfirming(true)}><RotateCcw size={14} /> Reset progress</button>
          ) : (
            <div className="confirm" role="alertdialog" aria-label="Confirm reset">
              <p>Delete all progress and saved code on this device?</p>
              <div className="row">
                <button className="btn btn-danger btn-sm" onClick={() => { resetProgress(); setConfirming(false); }}>Yes, reset</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
