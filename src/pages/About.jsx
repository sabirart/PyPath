// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useState } from "react";
import { BookOpen, CheckCircle2, ChevronDown, Code2, ExternalLink, FileText, Mail, ShieldCheck, UserRound } from "lucide-react";

const basics = [
  { icon: BookOpen, title: "Learning path", text: "Follow the 30-day path from Python basics through practical projects." },
  { icon: Code2, title: "Practice in the browser", text: "Use the built-in Free Compiler and lesson editor to write and run Python without a separate setup." },
  { icon: CheckCircle2, title: "Progress", text: "Completed lessons, your active lesson, study days, theme and text-size preferences are saved locally in your browser." },
  { icon: ShieldCheck, title: "Privacy basics", text: "PyPath is designed as a browser-first learning site. It does not require an account, password or email to start." },
];

export default function About() {
  const [more, setMore] = useState(false);
  return (
    <div className="about-page page page-wide">
      <header className="about-hero">
        <div>
          <p className="eyebrow">About PyPath</p>
          <h2 className="page-title">A simple place to learn Python, step by step.</h2>
          <p className="about-lede">PyPath is a focused 30-day Python learning website with daily lessons, practical projects and a browser-based compiler. It is built to keep learning simple, local and hands-on.</p>
        </div>
        <div className="about-badge"><Code2 size={24} /><span>Learn · Practice · Build</span></div>
      </header>

      <section className="about-section" aria-labelledby="how-h">
        <div className="section-heading"><h3 id="how-h">How to use the website</h3><span className="muted small">Start small and keep going</span></div>
        <div className="about-grid">
          <article className="about-card"><span className="about-icon"><BookOpen size={19} /></span><h4>1. Start a lesson</h4><p>Choose a day from the Dashboard or course outline. Read the lesson and follow its examples.</p></article>
          <article className="about-card"><span className="about-icon"><Code2 size={19} /></span><h4>2. Write Python</h4><p>Use the lesson editor or open Free Compiler when you want a separate space to experiment.</p></article>
          <article className="about-card"><span className="about-icon"><CheckCircle2 size={19} /></span><h4>3. Complete and build</h4><p>Mark lessons complete as you progress, then use the project days to apply what you learned.</p></article>
        </div>
      </section>

      <section className="about-section" aria-labelledby="basics-h">
        <div className="section-heading"><h3 id="basics-h">Website basics</h3><span className="muted small">The essentials</span></div>
        <div className="about-grid basics-grid">
          {basics.map(({ icon: Icon, title, text }) => <article className="about-card" key={title}><span className="about-icon"><Icon size={19} /></span><h4>{title}</h4><p>{text}</p></article>)}
        </div>
      </section>

      <section className="about-section creator-section" aria-labelledby="creator-h">
        <div className="creator-main">
          <span className="creator-icon"><UserRound size={23} /></span>
          <div><p className="eyebrow">Built by</p><h3 id="creator-h">Sabir Hussain</h3><p className="muted">Computer Science student · ILMA University · 2026 · Karachi, Pakistan</p></div>
        </div>
        <button className="btn btn-ghost" onClick={() => setMore((v) => !v)} aria-expanded={more}><ChevronDown size={17} className={more ? "chevron-open" : ""} /> More about this website</button>
        {more && <div className="about-more">
          <p>PyPath was created as a practical learning project focused on a clean study flow, accessible browser-based coding and a lightweight experience that can be hosted as a static website.</p>
          <div className="more-list">
            <div><ShieldCheck size={17} /><span><strong>Copyright</strong><small>&copy; 2026 Sabir Hussain. All rights reserved. The code and lesson content may not be copied, modified or redistributed without written permission.</small></span></div>
            <div><FileText size={17} /><span><strong>Technology</strong><small>React, Vite, CodeMirror and browser-based Python execution.</small></span></div>
            <div><ShieldCheck size={17} /><span><strong>Data & storage</strong><small>Learning progress and preferences are kept in browser storage on the device.</small></span></div>
            <div><Mail size={17} /><span><strong>Contact</strong><small><a href="mailto:sabirhussain@gmail.com">sabirhussain@gmail.com</a></small></span></div>
            <div><ExternalLink size={17} /><span><strong>Hosting</strong><small>The project is suitable for static hosting such as GitHub Pages or Render.</small></span></div>
          </div>
        </div>}
      </section>
    </div>
  );
}
