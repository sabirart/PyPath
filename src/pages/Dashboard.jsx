// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { ArrowRight, BookOpen, CheckCircle2, Flame, Folder, Layers, Target, Terminal, Trophy } from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import StatusIcon, { STATUS_LABEL } from "../components/StatusIcon";
import { navigate, pathFor } from "../router";

const LEVEL_NOTE = {
  "Basic Python": "First steps and core building blocks",
  "Beginner Python": "Decisions, loops, functions and lists",
  "Intermediate Python": "Data, files, errors and modules",
  "Advanced Python": "Objects and powerful Python features",
  "Practical Projects": "Build five real programs",
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? "Hello" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function Dashboard() {
  const { user, stats, lessons, progress, nextItem, activeId } = useApp();
  const stages = [];
  lessons.filter((l) => l.kind === "lesson").forEach((l) => {
    let g = stages[stages.length - 1];
    if (!g || g.name !== l.part) { g = { name: l.part, total: 0, done: 0, from: l.day, to: l.day }; stages.push(g); }
    g.total++; g.to = l.day;
    if (progress[l.id] === "completed") g.done++;
  });
  const activeStageIndex = nextItem ? Math.max(0, stages.findIndex((g) => nextItem.part === g.name)) : Math.max(0, stages.length - 1);
  const [showAllPath, setShowAllPath] = useState(false);
  const windowSize = 5;
  const windowStart = Math.max(0, Math.min(activeStageIndex - 2, stages.length - windowSize));
  const visibleStages = showAllPath ? stages : stages.slice(windowStart, windowStart + windowSize);
  const finished = !nextItem;
  const started = stats.completed > 0 || !!activeId;
  const upcoming = nextItem ? lessons.filter((l) => l.day > nextItem.day && progress[l.id] !== "completed").slice(0, 3) : [];
  const cta = finished ? "Review Lesson 1" : activeId ? "Continue Lesson " + nextItem.day : started ? `Start Lesson ${nextItem.day}` : "Start Lesson 1";
  const go = () => navigate(finished ? "/lessons/l01" : pathFor(nextItem));
  const firstLesson = lessons.find((l) => l.kind === "lesson" && progress[l.id] !== "completed") || lessons[0];

  const tiles = [
    { icon: CheckCircle2, label: "Lessons completed", value: stats.completed, of: stats.total },
    { icon: BookOpen, label: "Classes", value: stats.lessonsDone, of: stats.classCount },
    { icon: Folder, label: "Projects", value: stats.projectsDone, of: stats.projectCount },
    { icon: Flame, label: "Study streak", value: stats.streak, of: null },
  ];
  const links = [
    { to: pathFor(firstLesson), icon: BookOpen, title: "Lessons", text: `${stats.classCount} classes covering Python fundamentals through advanced topics.` },
    { to: "/projects", icon: Trophy, title: "Projects", text: `5 independent project checkpoints you build yourself.` },
    { to: "/compiler", icon: Terminal, title: "Free Compiler", text: "Try any Python idea with no lesson attached." },
  ];

  return (
    <div className="dash">
      <header className="dash-head">
        <div>
          <p className="eyebrow">30-Lesson Python Course</p>
          <h2 className="dash-title">{greeting()}, {user}</h2>
          <p className="muted dash-sub">{stats.studiedToday ? "Today's day is done. Rest up. You can continue whenever you are ready." : started ? "One focused day at a time. Pick up where you left off." : "Build Python skills from fundamentals through professional engineering, then prove them with five projects."}</p>
        </div>
        <div className={`streak-pill ${stats.streak ? "is-lit" : ""}`} title="Consecutive days you completed a lesson">
          <Flame size={18} aria-hidden="true" />
          <span><strong>{stats.streak}</strong> day streak</span>
        </div>
      </header>

      <section className="focus-card" aria-label="Today's focus">
        <div className="focus-main">
          <span className="focus-tag"><Target size={14} aria-hidden="true" /> {finished ? "Challenge complete" : activeId ? "In progress" : started ? "Up next" : "Start here"}</span>
          {finished ? (
            <>
              <h3 className="focus-title">You finished all 30 lessons</h3>
              <p className="focus-text">Every class and project is complete. Revisit any day to sharpen your skills.</p>
            </>
          ) : (
            <>
              <p className="focus-day">Lesson {nextItem.day} &middot; {nextItem.kind === "project" ? "Project" : "Lesson"} &middot; {nextItem.part}</p>
              <h3 className="focus-title">{nextItem.title}</h3>
              <p className="focus-text">{nextItem.summary}</p>
            </>
          )}
          <div className="focus-actions">
            <button className="btn btn-primary btn-lg" onClick={go}>{cta} <ArrowRight size={18} /></button>
            <a className="btn btn-ghost btn-lg" href="#/compiler">Open compiler</a>
          </div>
        </div>
        <div className="focus-progress" aria-label={`${stats.percent}% of the challenge complete`}>
          <div className="progress-visual">
            <div className="ring-wrap progress-ring progress-ring-static" aria-hidden="true">
              <svg width="156" height="156" viewBox="0 0 156 156" className="ring dashboard-progress-ring">
                <circle cx="78" cy="78" r="66" fill="none" stroke="var(--ring-track)" strokeWidth="12" />
                <circle
                  cx="78" cy="78"
                  r="66"
                  fill="none"
                  stroke="var(--ring)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray={`${stats.percent} ${100 - stats.percent}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 78 78)"
                />
              </svg>
              <span className="ring-center"><strong>{stats.percent}%</strong><small>complete</small></span>
            </div>
            <p className="progress-total"><span>{stats.completed} / {stats.total} Lessons</span></p>
          </div>
        </div>
      </section>

      <ul className="stat-row" aria-label="Your numbers">
        {tiles.map(({ icon: Icon, label, value, of }) => (
          <li key={label} className="stat-tile">
            <span className="stat-icon"><Icon size={18} aria-hidden="true" /></span>
            <div>
              <p className="stat-value">{value}{of !== null && <span className="muted"> / {of}</span>}</p>
              <p className="stat-label">{label}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className={`dash-cols ${showAllPath ? "is-expanded" : ""}`}>
        <section className="panel" aria-labelledby="path-h">
          <div className="panel-head"><Layers size={18} aria-hidden="true" /><h3 id="path-h">Learning path</h3><button className="link-btn path-toggle" type="button" onClick={() => setShowAllPath((v) => !v)}>{showAllPath ? "Show less" : "Show all"}</button></div>
          <ul className="path">
            {visibleStages.map((g, i) => (
              <li key={g.name} className="path-item">
                <span className={`path-num ${g.done === g.total ? "is-done" : ""}`}>{g.done === g.total ? <CheckCircle2 size={16} aria-hidden="true" /> : stages.indexOf(g) + 1}</span>
                <div className="path-body">
                  <div className="row between"><strong>{g.name}</strong><span className="muted small">{g.done}/{g.total}</span></div>
                  <p className="muted small">Lessons {g.from}&ndash;{g.to} &middot; {LEVEL_NOTE[g.name]}</p>
                  <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={g.total} aria-valuenow={g.done} aria-label={g.name}>
                    <div className="bar-fill" style={{ width: `${(g.done / g.total) * 100}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="dash-side">
          <section className="panel" aria-labelledby="map-h">
            <div className="panel-head"><h3 id="map-h">30-lesson map</h3>
              <span className="map-legend small muted">
                {["completed", "active", "not-started"].map((s) => <span key={s}><StatusIcon status={s} size={12} /> {STATUS_LABEL[s]}</span>)}
              </span>
            </div>
            <ol className="day-map" aria-label="All 30 lessons">
              {lessons.filter((l) => l.kind === "lesson").map((l) => {
                const st = progress[l.id] || "not-started";
                return (
                  <li key={l.id}>
                    <a href={`#${pathFor(l)}`} className={`map-day map-${st}`}
                      aria-label={`Lesson ${l.day}, ${l.title}: ${STATUS_LABEL[st]}`} title={`Lesson ${l.day}. ${l.title} (${STATUS_LABEL[st]})`}>{l.day}</a>
                  </li>
                );
              })}
            </ol>
          </section>

          {upcoming.length > 0 && (
            <section className="panel" aria-labelledby="soon-h">
              <div className="panel-head"><h3 id="soon-h">Coming up</h3></div>
              <ul className="soon">
                {upcoming.map((l) => (
                  <li key={l.id}><a href={`#${pathFor(l)}`}><span className="soon-day">Lesson {l.day}</span><span className="soon-title">{l.title}</span><ArrowRight size={14} aria-hidden="true" /></a></li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <section aria-label="Quick links" className="quick">
        {links.map(({ to, icon: Icon, title, text }) => (
          <a key={title} href={`#${to}`} className="quick-card">
            <span className="quick-icon"><Icon size={20} aria-hidden="true" /></span>
            <div><h3>{title}</h3><p className="muted">{text}</p></div>
            <ArrowRight size={16} className="quick-arrow" aria-hidden="true" />
          </a>
        ))}
      </section>
    </div>
  );
}
