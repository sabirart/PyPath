import { useEffect, useRef, useState } from "react";
import { Eraser, Loader2, RefreshCw, TerminalSquare } from "lucide-react";

// Inline answer field that continues the last output line, like a terminal prompt.
function PromptLine({ prompt, onSubmit, hint }) {
  const [value, setValue] = useState("");
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); input.current?.scrollIntoView({ block: "nearest" }); }, [prompt]);
  const send = (e) => {
    e.preventDefault();
    onSubmit(value);
    setValue("");
  };
  return (
    <form className="prompt-line" onSubmit={send}>
      <label className="out prompt-text" htmlFor="py-input">{prompt || "> "}</label>
      <input id="py-input" ref={input} className="prompt-input" value={value} onChange={(e) => setValue(e.target.value)}
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} aria-label="Type your answer and press Enter" />
      {hint && <span className="prompt-hint">e.g. {hint}</span>}
    </form>
  );
}

export default function Console({ py, samples = [] }) {
  const { status, loadError, running, output, error, waiting, hasRun, answerCount, clear, retry, submit } = py;
  const hint = samples[answerCount] ?? "";
  const cut = output.lastIndexOf("\n") + 1;
  // While waiting, the unfinished last line is the prompt and the answer field sits right after it.
  const head = waiting ? output.slice(0, cut) : output;
  const prompt = waiting ? output.slice(cut) : "";
  const body = useRef(null);
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }); }, [output, waiting]);

  return (
    <section className="console-card" aria-label="Output console">
      <div className="toolbar">
        <span className="filetab"><TerminalSquare size={15} aria-hidden="true" /> Output</span>
        <span className={`state state-${waiting && !running ? "waiting" : status}`} aria-live="polite">
          {status === "loading" && (<><Loader2 size={12} className="spin" /> Loading Python</>)}
          {status === "ready" && (running ? "Running" : waiting ? "Waiting for input" : "Ready")}
          {status === "error" && "Unavailable"}
          {status === "idle" && "Starting"}
        </span>
        <span className="toolbar-spacer" />
        <button className="btn btn-ghost btn-sm" onClick={clear} disabled={!hasRun}><Eraser size={15} /> Clear</button>
      </div>
      <div className="console-body" role="log" aria-live="polite" ref={body} onClick={() => document.getElementById("py-input")?.focus()}>
        {status === "error" && (
          <div className="msg msg-error">
            <p><strong>The Python engine did not load.</strong> {loadError}</p>
            <p className="small">The lesson is still available. You can try again.</p>
            <button className="btn btn-primary btn-sm" onClick={retry}><RefreshCw size={15} /> Retry</button>
          </div>
        )}
        {status === "loading" && !hasRun && <p className="muted">Python is loading for the first time. This can take a few seconds.</p>}
        {!hasRun && status === "ready" && <p className="muted">Press Run Code to see the output here. If your program uses input(), you can type your answers right here.</p>}
        {hasRun && head && <pre className="out">{head}</pre>}
        {running && <p className="muted running-note"><Loader2 size={14} className="spin" /> Running...</p>}
        {!running && waiting && <PromptLine prompt={prompt} onSubmit={submit} hint={hint} />}
        {!running && hasRun && !error && !waiting && !output && status !== "error" && <p className="muted">The program finished and printed nothing.</p>}
        {!running && error && (
          <div className="msg msg-error">
            <p><strong>Your program stopped because of an error.</strong></p>
            <p>{error.hint}</p>
            <pre className="out err">{error.detail}</pre>
          </div>
        )}
      </div>
    </section>
  );
}
