// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { BookOpen, Clock, Code2, FileInput, ListOrdered, Play, Sparkles, ShieldCheck, Target, Lightbulb, AlertTriangle } from "lucide-react";
import CodeBlock from "./CodeBlock";
import StatusIcon, { STATUS_LABEL } from "./StatusIcon";
import { useApp } from "../context/AppContext";

function Section({ title, icon: Icon, step, children, ok = true, id, className = "" }) {
  return (
    <section className={`lesson-section ${className}`.trim()} aria-labelledby={id}>
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
  const doDont = Array.isArray(lesson.doDont) ? lesson.doDont : [];
  const quickInfo = Array.isArray(lesson.quickInfo) ? lesson.quickInfo : [];
  const practiceLevels = Array.isArray(lesson.practiceLevels) ? lesson.practiceLevels : [];
  const skills = Array.isArray(lesson.skills) ? lesson.skills : [];
  const project = lesson.kind === "project";
  const noun = project ? "project" : "lesson";
  return (
    <article className="lesson">
      <header className="lesson-hero">
        <div className="lesson-meta">
          <span className="chip chip-accent">{project ? `Project ${lesson.projectNumber} of 5` : `Lesson ${lesson.day} of 30`}</span>
          <span className="muted small">{project ? "Project checkpoint" : "Lesson"} &middot; {lesson.part}</span>
          <span className={`status-text small status-text-${st}`}><StatusIcon status={st} size={14} /> {STATUS_LABEL[st]}</span>
        </div>
        <h2 className="lesson-title">{lesson.title}</h2>
        {lesson.summary && <p className="lesson-summary">{lesson.summary}</p>}
        <ul className="lesson-facts" aria-label="Details">
          {lesson.minutes && <li><Clock size={14} aria-hidden="true" /> ~{lesson.minutes} min</li>}
          {project && lesson.difficulty && <li><Sparkles size={14} aria-hidden="true" /> {lesson.difficulty}</li>}
          {project && lesson.classFrom && lesson.afterLesson && <li>Classes {lesson.classFrom}–{lesson.afterLesson}</li>}
          {project && lesson.tags?.map((t) => <li key={t} className="fact-tag">{t}</li>)}
        </ul>
        {project && lesson.outcome && <p className="project-brief"><strong>You will build:</strong> {lesson.outcome}</p>}
      </header>
      {lesson.id === "l01" && (st === "not-started" || st === "pending") && canStart && (
        <div className="preview-note" role="note">
          <p>You are previewing this {noun}. It is not marked as started until you choose to study it.</p>
          <button className="btn btn-primary btn-sm" onClick={onStart}><Play size={14} /> Start Lesson {lesson.day}</button>
        </div>
      )}
      {(lesson.intro || lesson.whyItMatters) && (
        <section className="lesson-detail-block lesson-intro lesson-start-here" aria-labelledby="s-intro">
          <div className="detail-head"><BookOpen size={16} aria-hidden="true" /><h3 id="s-intro">Start Here</h3></div>
          {lesson.intro && <p>{lesson.intro}</p>}
          {lesson.whyItMatters && (
            <div className="lesson-why-inline" aria-labelledby="s-why">
              <div className="detail-head"><Lightbulb size={15} aria-hidden="true" /><h4 id="s-why">Why this matters</h4></div>
              <p>{lesson.whyItMatters}</p>
            </div>
          )}
        </section>
      )}
      {lesson.runtimeNote && (
        <section className="lesson-detail-block runtime-note" aria-labelledby="s-runtime">
          <div className="detail-head"><AlertTriangle size={16} aria-hidden="true" /><h3 id="s-runtime">Runtime note</h3></div>
          <p>{lesson.runtimeNote}</p>
        </section>
      )}
      <Section title="Definition" icon={BookOpen} step={1} id="s-def" ok={!!lesson.definition} className="definition-section"><p className="lede">{lesson.definition}</p></Section>
      <Section title="Code Example" icon={Code2} step={2} id="s-ex" ok={!!lesson.codeExample} className="code-example-section"><CodeBlock code={lesson.codeExample} />{lesson.exampleOutput && <div className="lesson-example-output"><div className="lesson-example-output-title">Output</div><pre>{lesson.exampleOutput}</pre></div>}</Section>
      <Section title="How It Works" icon={ListOrdered} step={3} id="s-how" ok={how.length > 0}>
        <ol className="steps">{how.map((h, i) => {
          const [label, ...rest] = String(h).split(': ');
          return (
            <li key={i}>
              <div className="step-label"><span className="step-number">{i + 1}</span><strong>{label}</strong></div>
              <span className="step-description">{rest.join(': ')}</span>
            </li>
          );
        })}</ol>
      </Section>
      {doDont.length > 0 && (
        <section className="lesson-detail-block" aria-labelledby="s-dodont">
          <div className="detail-head"><ShieldCheck size={16} aria-hidden="true" /><h3 id="s-dodont">Do &amp; Don't</h3></div>
          <div className="dodont-wrap"><table className="dodont-table"><thead><tr><th>Don't</th><th>Do instead</th><th>Example</th></tr></thead><tbody>{doDont.map((row, i) => <tr key={i}><td>{row.dont}</td><td>{row.do}</td><td>{row.example || "See the lesson example above."}</td></tr>)}</tbody></table></div>
        </section>
      )}
      {quickInfo.length > 0 && (
        <section className="lesson-detail-block quick-info" aria-labelledby="s-quick-info">
          <div className="detail-head"><h3 id="s-quick-info">Quick Info</h3></div>
          <div className="quick-info-wrap"><table className="quick-info-table"><tbody>{quickInfo.map((row, i) => <tr key={i}><th scope="row">{row[0]}</th><td>{row[1]}</td></tr>)}</tbody></table></div>
        </section>
      )}
      {(practiceLevels.length > 0 || skills.length > 0) && (
        <section className="lesson-detail-block practice-skills" aria-labelledby="s-practice-levels">
          {practiceLevels.length > 0 && (
            <>
              <div className="detail-head"><Target size={16} aria-hidden="true" /><h3 id="s-practice-levels">Practice path</h3></div>
              <div className="practice-level-grid">{practiceLevels.map((item, i) => <div className="practice-level" key={item.level}>
                <span className="practice-level-number">{i + 1}</span><div><strong>{item.level}</strong><p>{item.task}</p></div>
              </div>)}</div>
            </>
          )}
          {skills.length > 0 && (
            <div className="skills-now-inline" aria-labelledby="s-skills">
              <div className="detail-head"><Target size={15} aria-hidden="true" /><h4 id="s-skills">By the end, you should be able to</h4></div>
              <ul className="skills-list">{skills.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          )}
        </section>
      )}
      <Section title="Complete Example" icon={Play} step={4} id="s-full" ok={!!lesson.fullExample}>
        <CodeBlock code={lesson.fullExample} label={project ? "Python - complete project" : "Python - runnable example"} />
        <button className="btn btn-ghost btn-sm" onClick={onLoadExample}><FileInput size={15} /> Load in editor</button>
      </Section>
      {!project && lesson.projectId && (
        <div className="project-brief" role="note">
          <strong>Project checkpoint unlocked:</strong> After this lesson, apply these skills in the related project.
          <div style={{ marginTop: 8 }}>
            <a className="btn btn-ghost btn-sm" href={`#/projects/${lesson.projectId}`}>Open project</a>
          </div>
        </div>
      )}
    </article>
  );
}
