import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { tokenize } from "../services/highlight";

export default function CodeBlock({ code, label = "Python", copy = true }) {
  const parts = useMemo(() => tokenize(code), [code]);
  const [copyState, setCopyState] = useState("idle");
  const copyTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  const doCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopyState("idle"), 1000);
    } catch {
      setCopyState("error");
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopyState("idle"), 1000);
    }
  };
  return (
    <figure className="codeblock">
      <figcaption>
        <span>{label}</span>
        {copy && <button className={`copy-btn ${copyState !== "idle" ? `is-${copyState}` : ""}`} onClick={doCopy} aria-label={`Copy ${label} code`}>{copyState === "copied" ? <><Check size={14} /> Copied</> : copyState === "error" ? <><Copy size={14} /> Copy failed</> : <><Copy size={14} /> Copy</>}</button>}
      </figcaption>
      <pre tabIndex={0} aria-label={`${label} code`}><code>{parts.map((p, i) => (p.t ? <span key={i} className={`tok-${p.t}`}>{p.s}</span> : p.s))}</code></pre>
    </figure>
  );
}
