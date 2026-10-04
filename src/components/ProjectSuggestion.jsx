// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { ArrowRight, CheckCircle2, X } from "lucide-react";

export default function ProjectSuggestion({ project, onClose }) {
  if (!project) return null;
  return (
    <div className="project-suggest-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="project-suggest" role="dialog" aria-modal="true" aria-labelledby="project-suggest-title">
        <button className="project-suggest-close" onClick={onClose} aria-label="Close project suggestion"><X size={18} /></button>
        <div className="project-suggest-icon"><CheckCircle2 size={22} /></div>
        <p className="eyebrow">Checkpoint unlocked</p>
        <h2 id="project-suggest-title">You are ready for {project.title.replace(/^Project \d+: /, "")}</h2>
        <p className="muted">You completed Classes {project.classFrom}–{project.afterLesson}. Now use those skills in this {project.difficulty.toLowerCase()} project.</p>
        <p className="project-suggest-bio">{project.bio || project.summary}</p>
        <div className="project-suggest-actions">
          <button className="btn btn-ghost" onClick={onClose}>Continue learning</button>
          <a className="btn btn-primary" href={`#/projects/${project.id}`} onClick={onClose}>Open project <ArrowRight size={15} /></a>
        </div>
      </section>
    </div>
  );
}
