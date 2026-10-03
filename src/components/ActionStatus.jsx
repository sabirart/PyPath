import { Check, CircleAlert } from "lucide-react";

export default function ActionStatus({ message, type = "success" }) {
  if (!message) return null;
  const Icon = type === "error" ? CircleAlert : Check;
  return (
    <span className={`action-status action-status-${type}`} role="status" aria-live="polite">
      <Icon size={14} aria-hidden="true" /> {message}
    </span>
  );
}
