// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { pathFor } from "../router";
import StatusIcon, { STATUS_LABEL } from "./StatusIcon";

// One course item (class or project) as a card: day number, name, short description, status.
export default function DayCard({ item, showTags = false }) {
  const { progress } = useApp();
  const st = progress[item.id] || "not-started";
  return (
    <a href={`#${pathFor(item)}`} className={`day-card day-${st}`} aria-label={`Day ${item.day}, ${item.title}: ${STATUS_LABEL[st]}`}>
      <div className="day-top">
        <span className="day-num">Day {item.day}</span>
        <span className={`badge badge-${st}`}><StatusIcon status={st} size={13} /> {STATUS_LABEL[st]}</span>
      </div>
      <h4 className="day-title">{item.title}</h4>
      <p className="day-text">{item.summary}</p>
      {showTags && item.tags && <ul className="tags">{item.tags.map((t) => <li key={t} className="chip">{t}</li>)}</ul>}
      <span className="day-open">{st === "completed" ? "Review" : st === "active" ? "Continue" : "Open"} <ArrowRight size={14} aria-hidden="true" /></span>
    </a>
  );
}
