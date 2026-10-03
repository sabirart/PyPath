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
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const area = document.createElement("textarea");
        area.value = code;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand("copy");
        area.remove();
        if (!copied) throw new Error("Clipboard copy was not available");
      }
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyState("idle"), 1800);
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
