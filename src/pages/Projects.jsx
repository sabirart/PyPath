// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { ArrowRight, Calculator, Clock, Dices, HelpCircle, Receipt, Trophy } from "lucide-react";
import { useApp } from "../context/AppContext";
import { pathFor } from "../router";
import StatusIcon, { STATUS_LABEL } from "../components/StatusIcon";

const ICONS = { p01: Calculator, p02: Dices, p03: Receipt, p04: HelpCircle, p05: Trophy };

function ProjectCard({ item, index, featured = false, classRange }) {
  const { progress } = useApp();
  const st = progress[item.id] || "not-started";
  const Icon = ICONS[item.id] || Trophy;
  const cta = st === "completed" ? "Review project" : st === "active" ? "Continue project" : "Open project";
  return (
    <a href={`#${pathFor(item)}`} className={`proj-card proj-${st} ${featured ? "is-featured" : ""}`} style={{ "--i": index }}
      aria-label={`${item.title}: ${STATUS_LABEL[st]}`}>
      <div className="proj-top">
        <span className="proj-icon"><Icon size={featured ? 26 : 22} aria-hidden="true" /></span>
        <span className="proj-day">{featured ? "Final project" : `Project ${item.projectNumber}`}</span>
        <span className={`badge badge-${st}`}><StatusIcon status={st} size={13} /> {STATUS_LABEL[st]}</span>
      </div>
      <h3 className="proj-title">{item.title.replace(/^(Project \d+|Final Project): /, "")}</h3>
      <p className="proj-outcome">{item.bio || item.outcome || item.summary}</p>
      <div className="proj-meta">
        <span className={`level level-${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
        <span className="class-range">Classes {classRange?.from}–{classRange?.to}</span>
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
  const final = items[items.length - 1]; // the last project is the Final Project
  const regular = items.slice(0, -1);
  const classRangeFor = (item, index) => ({ from: item.classFrom || (index === 0 ? 1 : (items[index - 1]?.afterLesson || 0) + 1), to: item.afterLesson });
  const done = items.filter((l) => progress[l.id] === "completed").length;
  return (
    <div className="projects">
      <header className="projects-head">
        <div>
          <p className="eyebrow">5 Project Checkpoints</p>
          <h2 className="projects-title">Practical projects</h2>
          <p className="muted projects-sub">Projects are not extra days. Complete each checkpoint when its related skills are ready, then return to the next lesson.</p>
        </div>
        <div className="projects-progress" role="group" aria-label="Project progress">
          <div className="row between"><strong>{done} of {items.length} built</strong><span className="muted small">{Math.round((done / Math.max(items.length, 1)) * 100)}%</span></div>
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Projects completed">
            <div className="bar-fill" style={{ width: `${(done / Math.max(items.length, 1)) * 100}%` }} />
          </div>
          <p className="muted small">`${stats.lessonsDone} of ${stats.classCount} lessons finished. Projects are independent checkpoints.`</p>
        </div>
      </header>
      <div className="proj-grid">
        {regular.map((l, i) => <ProjectCard key={l.id} item={l} index={i} classRange={classRangeFor(l, i)} />)}
        {final && <ProjectCard item={final} index={regular.length} classRange={classRangeFor(final, regular.length)} />}
      </div>
    </div>
  );
}
