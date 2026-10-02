import { ArrowRight, Calculator, Clock, Dices, Flag, HelpCircle, ListTodo, Receipt, Trophy } from "lucide-react";
import { useApp } from "../context/AppContext";
import { pathFor } from "../router";
import StatusIcon, { STATUS_LABEL } from "../components/StatusIcon";

const ICONS = { l26: Calculator, l27: Dices, l28: HelpCircle, l29: Receipt, l30: ListTodo };

function ProjectCard({ item, index, featured = false }) {
  const { progress } = useApp();
  const st = progress[item.id] || "not-started";
  const Icon = ICONS[item.id] || Trophy;
  const cta = st === "completed" ? "Review project" : st === "active" ? "Continue project" : "Open project";
  return (
    <a href={`#${pathFor(item)}`} className={`proj-card proj-${st} ${featured ? "is-featured" : ""}`} style={{ "--i": index }}
      aria-label={`Day ${item.day}, ${item.title}: ${STATUS_LABEL[st]}`}>
      <div className="proj-top">
        <span className="proj-icon"><Icon size={featured ? 26 : 22} aria-hidden="true" /></span>
        <span className="proj-day">{featured ? <>Final project &middot; Day {item.day}</> : `Day ${item.day}`}</span>
        <span className={`badge badge-${st}`}><StatusIcon status={st} size={13} /> {STATUS_LABEL[st]}</span>
      </div>
      <h3 className="proj-title">{item.title.replace(/^(Project \d+|Final Project): /, "")}</h3>
      <p className="proj-outcome">{item.outcome}</p>
      <div className="proj-meta">
        <span className={`level level-${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
        <span className="proj-time"><Clock size={13} aria-hidden="true" /> ~{item.minutes} min</span>
      </div>
      <div className="proj-skills">
        <span className="small muted">Skills you will use</span>
        <ul className="tags">{item.tags.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
      </div>
      <span className="proj-cta">{cta} <ArrowRight size={15} aria-hidden="true" /></span>
    </a>
  );
}

export default function Projects() {
  const { projectIds, getLesson, progress, stats } = useApp();
  const items = projectIds.map(getLesson).filter(Boolean);
  const regular = items.filter((l) => l.id !== "l30");
  const final = items.find((l) => l.id === "l30");
  const done = items.filter((l) => progress[l.id] === "completed").length;
  return (
    <div className="projects">
      <header className="projects-head">
        <div>
          <p className="eyebrow">Days 26 &ndash; 30</p>
          <h2 className="projects-title">Practical projects</h2>
          <p className="muted projects-sub">Turn what you learned into real programs. Each project opens with instructions and a working editor.</p>
        </div>
        <div className="projects-progress" role="group" aria-label="Project progress">
          <div className="row between"><strong>{done} of {items.length} built</strong><span className="muted small">{Math.round((done / Math.max(items.length, 1)) * 100)}%</span></div>
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Projects completed">
            <div className="bar-fill" style={{ width: `${(done / Math.max(items.length, 1)) * 100}%` }} />
          </div>
          <p className="muted small">{stats.lessonsDone >= 25 ? "All classes done. You are ready." : `${stats.lessonsDone} of 25 classes finished. You can start a project any time.`}</p>
        </div>
      </header>
      <div className="proj-grid">
        {regular.map((l, i) => <ProjectCard key={l.id} item={l} index={i} />)}
        {final && <ProjectCard item={final} index={regular.length} />}
      </div>
    </div>
  );
}
