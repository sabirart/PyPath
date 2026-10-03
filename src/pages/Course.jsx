import { useApp } from "../context/AppContext";
import StatusIcon, { STATUS_LABEL } from "../components/StatusIcon";
import DayCard from "../components/DayCard";

const BLURB = {
  "Basic Python": "Your first steps: what code is, and the building blocks every program uses.",
  "Beginner Python": "Make decisions, repeat work and organise logic with functions and lists.",
  "Intermediate Python": "Work with richer data, files, errors and modules like a working developer.",
  "Advanced Python": "Object-oriented design and the powerful features that make Python elegant.",
  "Practical Projects": "Put everything to work. Four projects and a final project finish the challenge.",
};

export default function Course() {
  const { lessons, stats } = useApp();
  const parts = [];
  lessons.forEach((l) => {
    let g = parts[parts.length - 1];
    if (!g || g.name !== l.part) { g = { name: l.part, items: [] }; parts.push(g); }
    g.items.push(l);
  });
  return (
    <div className="page page-wide">
      <header className="course-head">
        <p className="eyebrow">30-Day Python Challenge</p>
        <h2 className="page-title">Course overview</h2>
        <p className="muted course-lead">25 classes cover Python fundamentals through advanced topics. Days 26 to 30 are practical projects. Continue at your own pace.</p>
        <div className="course-stats">
          <div className="bar course-bar" role="progressbar" aria-valuemin={0} aria-valuemax={stats.total} aria-valuenow={stats.completed} aria-label="Course progress">
            <div className="bar-fill" style={{ width: `${stats.percent}%` }} />
          </div>
          <p className="small muted">{stats.completed} of {stats.total} days complete</p>
        </div>
        <ul className="legend" aria-label="Status key">
          {["completed", "active", "not-started"].map((s) => (
            <li key={s}><StatusIcon status={s} size={14} /> <strong>{STATUS_LABEL[s]}</strong>
              <span className="muted">{s === "completed" ? "finished" : s === "active" ? "the day you are studying now" : "not studied yet"}</span></li>
          ))}
        </ul>
      </header>
      {parts.map((g, i) => {
        const first = g.items[0].day;
        const last = g.items[g.items.length - 1].day;
        const id = `part-${i}`;
        return (
          <section key={g.name} className="part-section" aria-labelledby={id}>
            <div className="part-head">
              <span className="part-index">{i + 1}</span>
              <div>
                <h3 id={id}>{g.name} <span className="muted part-days">Days {first}&ndash;{last}</span></h3>
                <p className="muted small">{BLURB[g.name]}</p>
              </div>
            </div>
            <div className="day-grid">
              {g.items.map((l) => <DayCard key={l.id} item={l} showTags={l.kind === "project"} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
