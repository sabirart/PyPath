import { CheckCircle2, Circle, Clock } from "lucide-react";

// "active" is the single lesson the person has started and not yet finished; it is shown as Pending.
export const STATUS_LABEL = { completed: "Completed", active: "Pending", "not-started": "Not started" };

// Status is shown by icon shape and text, never by colour alone.
export default function StatusIcon({ status = "not-started", size = 16 }) {
  const Icon = status === "completed" ? CheckCircle2 : status === "active" ? Clock : Circle;
  return <Icon size={size} className={`status status-${status}`} role="img" aria-label={STATUS_LABEL[status]} />;
}
