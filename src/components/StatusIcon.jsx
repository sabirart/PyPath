// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { CheckCircle2, Circle, Clock } from "lucide-react";

// "pending" is the next unlocked lesson waiting for Start. "active" is the single lesson the person has started and not yet finished; it is shown as In Progress.
export const STATUS_LABEL = { completed: "Completed", active: "In Progress", pending: "Pending", "not-started": "Not started" };

// Status is shown by icon shape and text, never by colour alone.
export default function StatusIcon({ status = "not-started", size = 16 }) {
  const Icon = status === "completed" ? CheckCircle2 : status === "active" || status === "pending" ? Clock : Circle;
  return <Icon size={size} className={`status status-${status}`} role="img" aria-label={STATUS_LABEL[status]} />;
}
