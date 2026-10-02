import { useMemo } from "react";
import { Copy } from "lucide-react";
import { useApp } from "../context/AppContext";
import { tokenize } from "../services/highlight";

export default function CodeBlock({ code, label = "Python", copy = true }) {
  const { toast } = useApp();
  const parts = useMemo(() => tokenize(code), [code]);
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(code); toast("Code copied.", "success"); }
    catch { toast("Copy is not available in this browser.", "error"); }
  };
  return (
    <figure className="codeblock">
      <figcaption>
        <span>{label}</span>
        {copy && <button className="copy-btn" onClick={doCopy} aria-label={`Copy ${label} code`}><Copy size={14} /> Copy</button>}
      </figcaption>
      <pre tabIndex={0} aria-label={`${label} code`}><code>{parts.map((p, i) => (p.t ? <span key={i} className={`tok-${p.t}`}>{p.s}</span> : p.s))}</code></pre>
    </figure>
  );
}
