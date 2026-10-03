// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { BookOpen, Clock, Code2, FileInput, ListOrdered, Play, Sparkles } from "lucide-react";
import CodeBlock from "./CodeBlock";
import StatusIcon, { STATUS_LABEL } from "./StatusIcon";
import { useApp } from "../context/AppContext";

function Section({ title, icon: Icon, step, children, ok = true, id }) {
  return (
    <section className="lesson-section" aria-labelledby={id}>
      <div className="sec-head">
        <span className="sec-icon"><Icon size={16} aria-hidden="true" /></span>
        <h3 id={id}>{title}</h3>
        <span className="sec-step" aria-hidden="true">{step} / 4</span>
      </div>
      <div className="sec-body">
        {ok ? children : <p className="content-error" role="alert">This section is missing from the lesson data.</p>}
      </div>
    </section>
  );
}

// Lesson text is rendered as plain text by React, so lesson data can never inject HTML.
export default function LessonContent({ lesson, onLoadExample, onStart, canStart }) {
  const { progress, lessons } = useApp();
  const st = progress[lesson.id] || "not-started";
  const how = Array.isArray(lesson.howItWorks) ? lesson.howItWorks : [];
  const project = lesson.kind === "project";
  const noun = project ? "project" : "lesson";
  return (
    <article className="lesson">
      <header className="lesson-hero">
        <div className="lesson-meta">
          <span className="chip chip-accent">Day {lesson.day} of {lessons.length}</span>
          <span className="muted small">{project ? "Project" : "Class"} &middot; {lesson.part}</span>
          <span className={`status-text small status-text-${st}`}><StatusIcon status={st} size={14} /> {STATUS_LABEL[st]}</span>
        </div>
        <h2 className="lesson-title">{lesson.title}</h2>
        {lesson.summary && <p className="lesson-summary">{lesson.summary}</p>}
        <ul className="lesson-facts" aria-label="Details">
          {lesson.minutes && <li><Clock size={14} aria-hidden="true" /> ~{lesson.minutes} min</li>}
          {project && lesson.difficulty && <li><Sparkles size={14} aria-hidden="true" /> {lesson.difficulty}</li>}
          {project && lesson.tags?.map((t) => <li key={t} className="fact-tag">{t}</li>)}
        </ul>
        {project && lesson.outcome && <p className="project-brief"><strong>You will build:</strong> {lesson.outcome}</p>}
      </header>
      {st === "not-started" && canStart && (
        <div className="preview-note" role="note">
          <p>You are previewing this {noun}. It is not marked as started until you choose to study it.</p>
          <button className="btn btn-primary btn-sm" onClick={onStart}><Play size={14} /> Start Day {lesson.day}</button>
        </div>
      )}
      <Section title="Definition" icon={BookOpen} step={1} id="s-def" ok={!!lesson.definition}><p className="lede">{lesson.definition}</p></Section>
      <Section title="Code Example" icon={Code2} step={2} id="s-ex" ok={!!lesson.codeExample}><CodeBlock code={lesson.codeExample} /></Section>
      <Section title="How It Works" icon={ListOrdered} step={3} id="s-how" ok={how.length > 0}>
        <ol className="steps">{how.map((h, i) => <li key={i}>{h}</li>)}</ol>
      </Section>
      <Section title="Full Example" icon={Play} step={4} id="s-full" ok={!!lesson.fullExample}>
        <CodeBlock code={lesson.fullExample} label="Python - runnable example" />
        <button className="btn btn-ghost btn-sm" onClick={onLoadExample}><FileInput size={15} /> Load in editor</button>
      </Section>
    </article>
  );
}
