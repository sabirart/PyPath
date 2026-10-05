// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useState } from "react";
import { ArrowRight, BookOpen, Cpu, HardDrive, ShieldOff, Moon, Sun, Trophy, CalendarDays } from "lucide-react";
import { useApp } from "../context/AppContext";
import NameModal from "../components/NameModal";
import CodeBlock from "../components/CodeBlock";
import BrandLogo from "../components/BrandLogo";

const SAMPLE = 'name = "Ada"\nfor step in range(1, 4):\n    print(f"{name}, step {step} of 3")';

export default function Welcome({ onStart }) {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useApp();
  const points = [
    { icon: ShieldOff, title: "No account", text: "No sign-up, email or password." },
    { icon: Cpu, title: "Runs in your browser", text: "Your code never leaves your device." },
    { icon: HardDrive, title: "Saved locally", text: "No tracking, ads or cookie banner." },
  ];
  const stats = [
    { icon: CalendarDays, value: "30", label: "lessons" },
    { icon: BookOpen, value: "25", label: "daily classes" },
    { icon: Trophy, value: "5", label: "projects" },
  ];
  return (
    <main className="welcome">
      <header className="welcome-bar">
        <BrandLogo />
        <button className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </header>
      <div className="welcome-grid">
        <div className="welcome-copy">
          <span className="welcome-tag">30-Lesson Python Course</span>
          <h1><span>Start Programming Today.</span><br /><strong>30 Lessons with Projects.</strong></h1>
          <p className="lead">30 daily lessons and 5 projects, from your first line of code to a finished app. Read on the left, write and run real Python on the right.</p>
          <div className="welcome-cta">
            <button className="btn btn-primary btn-lg" onClick={() => setOpen(true)}>Start Learning <ArrowRight size={18} /></button>
            <span className="muted small">Free, and ready in seconds.</span>
          </div>
          <ul className="points">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title}><span className="point-icon"><Icon size={18} aria-hidden="true" /></span><div><h2>{title}</h2><p>{text}</p></div></li>
            ))}
          </ul>
        </div>
        <div className="welcome-visual" aria-hidden="true">
          <div className="preview">
            <CodeBlock code={SAMPLE} label="hello.py" copy={false} />
            <div className="preview-out"><span className="muted small">Output</span><pre>{"Ada, step 1 of 3\nAda, step 2 of 3\nAda, step 3 of 3"}</pre></div>
          </div>
          <ul className="welcome-stats">
            {stats.map(({ icon: Icon, value, label }) => (
              <li key={label}><Icon size={18} /><strong>{value}</strong><span>{label}</span></li>
            ))}
          </ul>
        </div>
      </div>
      <footer className="welcome-foot">Basic Python &rarr; Beginner &rarr; Intermediate &rarr; Advanced &rarr; Projects</footer>
      {open && <NameModal onSubmit={onStart} onClose={() => setOpen(false)} />}
    </main>
  );
}
