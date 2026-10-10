// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useEffect, useRef, useState } from "react";
import { Eraser, Loader2, RefreshCw, TerminalSquare, Lightbulb, X } from "lucide-react";

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

function explainPythonError(error, code = "") {
  const detail = String(error?.detail || error?.summary || "");
  const summary = String(error?.summary || detail.split("\n").pop() || "Python error");
  const type = summary.split(":")[0].trim().replace(/^.*\b([A-Za-z]+Error)$/, "$1");
  const lineMatch = detail.match(/line (\d+)/);
  const lineNumber = lineMatch ? Number(lineMatch[1]) : null;
  const sourceLine = lineNumber && code ? code.split("\n")[lineNumber - 1] : "";
  const explanations = {
    SyntaxError: { title: "Python could not understand this code", why: "The line has invalid Python syntax. Common causes are missing colons, unmatched brackets, or quotes that were not closed.", fix: "Check the highlighted line and the line just before it. Make sure every opening bracket and quote has a matching closing one, and statements such as if, for, while, and def end with a colon.", example: `if score >= 50:
    print("Passed")` },
    IndentationError: { title: "The code indentation is inconsistent", why: "Python uses indentation to determine which statements belong inside a block. Lines in the same block must line up.", fix: "Use four spaces for each indentation level. Indent the body after a line ending with a colon, and align statements that belong to the same block.", example: `if score >= 50:
    print("Passed")` },
    NameError: { title: "Python cannot find a variable or name", why: "A name was used before it was defined, or its spelling/capitalization does not match. Python treats score, Score, and SCORE as different names.", fix: "Check the name in the error message, define it before using it, and use exactly the same spelling and capitalization.", example: `score = 85
print(score)` },
    TypeError: { title: "These value types cannot be used together this way", why: "An operation or function received a value of an incompatible type. A common beginner example is adding text directly to a number.", fix: "Convert the value to the type you intend, or use an f-string when combining text and values.", example: `age = int("18")
print(f"Age: {age}")` },
    ValueError: { title: "The value is not valid for this operation", why: "Python understood the value's type, but its contents are not acceptable—for example, converting the text 'hello' to an integer.", fix: "Check the input before converting it, or handle invalid input with try/except.", example: `text = "18"
number = int(text)
print(number)` },
    ZeroDivisionError: { title: "A number is being divided by zero", why: "Python cannot calculate a division when the divisor is 0.", fix: "Check the divisor before dividing and decide what your program should do when it is zero.", example: `a, b = 10, 2
if b != 0:
    print(a / b)
else:
    print("Cannot divide by zero")` },
    IndexError: { title: "The list position is outside the available items", why: "List indexes start at 0, so the last valid index is len(items) - 1. An empty list has no valid indexes.", fix: "Check the list length or loop over the items directly instead of assuming an index exists.", example: `items = ["apple", "pear"]
print(items[0])
for item in items:
    print(item)` },
    KeyError: { title: "That dictionary key does not exist", why: "Your code requested a dictionary key that is not present in the dictionary.", fix: "Check the key spelling or use get() when the key may be missing.", example: `user = {"name": "Ava"}
print(user.get("email", "Not provided"))` },
    AttributeError: { title: "This object does not have that attribute or method", why: "The code tried to access a property or method that the value's type does not provide. A typo or unexpected value type can cause this.", fix: "Check the object's type and the exact method/property name. Use methods supported by that type.", example: `name = "ava"
print(name.upper())` },
    ModuleNotFoundError: { title: "Python could not find the requested module", why: "The module may be misspelled, may not be installed, or may not be supported by PyPath's browser-based Python environment.", fix: "Check the import spelling. If it is a third-party package, confirm that the browser environment supports it; not every desktop Python package is available here.", example: `import math
print(math.sqrt(16))` },
    FileNotFoundError: { title: "Python could not find the file", why: "The file path does not point to a file available to the program. Browser-based Python also does not automatically see files on your computer.", fix: "Check the path and filename. In PyPath, use supported browser files or create the file in the program before reading it.", example: `with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Hello")` },
    EOFError: { title: "The program asked for input but no answer was available", why: "Your code called input(), but the compiler has no remaining answer to provide.", fix: "Enter the requested answer in the Output panel when prompted. If the program asks several questions, provide an answer for each one.", example: `name = input("Your name: ")
print(f"Hello, {name}!")` },
  };
  const chosen = explanations[type] || { title: `Fix the ${type || "Python"} error`, why: error?.hint || "Python stopped because it encountered a problem while running your code.", fix: "Read the final line of the error first, then check the reported line and the values used there. Fix the cause rather than hiding the error, and run the program again.", example: `value = 10
print(value)` };
  const solutions = [{ title: "Try this correction", detail: chosen.fix, code: chosen.example }];

  // Match undefined names against variables already defined in the user's code.
  if (type === "NameError") {
    const missingMatch = summary.match(/name ['‘’"]([^'‘’"]+)['‘’"] is not defined/i)
      || detail.match(/name ['‘’"]([^'‘’"]+)['‘’"] is not defined/i);
    const missingName = missingMatch?.[1];
    if (missingName) {
      const identifiers = [...code.matchAll(/^\s*([A-Za-z_]\w*)\s*(?::[^=]+)?=(?!=)/gm)].map((match) => match[1]);
      const distance = (a, b) => {
        const row = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
          let diagonal = row[0];
          row[0] = i;
          for (let j = 1; j <= b.length; j++) {
            const previous = row[j];
            row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
            diagonal = previous;
          }
        }
        return row[b.length];
      };
      const closest = identifiers
        .filter((name) => name !== missingName && name.toLowerCase() !== missingName.toLowerCase())
        .map((name) => ({ name, distance: distance(missingName.toLowerCase(), name.toLowerCase()) }))
        .sort((a, b) => a.distance - b.distance)[0];
      const isLikelyTypo = closest && closest.distance <= Math.max(1, Math.floor(missingName.length / 4));
      solutions.length = 0;

      if (isLikelyTypo) {
        const correctedLine = sourceLine.replace(new RegExp(`\\b${missingName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`), closest.name);
        const correctedLines = code.split("\n");
        if (lineNumber && correctedLines[lineNumber - 1] !== undefined) correctedLines[lineNumber - 1] = correctedLine;
        solutions.push({
          title: `Use the existing variable “${closest.name}”`,
          detail: `You defined “${closest.name}” earlier, but this line uses “${missingName}”. The names differ by ${closest.distance === 1 ? "one character" : `${closest.distance} characters`}. Change the name on line ${lineNumber || "shown"} to match the variable you already created.`,
          code: correctedLines.join("\n"),
        });
      } else {
        const printMatch = sourceLine.match(/print\s*\(\s*([A-Za-z_]\w*)\s*\)/);
        const likelyText = printMatch?.[1] === missingName;
        if (likelyText) solutions.push({ title: "If you meant literal text", detail: "Put quotes around the word to print it as text.", code: sourceLine.replace(new RegExp(`\\b${missingName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`), `"${missingName}"`) });
        solutions.push({ title: `If “${missingName}” is meant to be a variable`, detail: `Define ${missingName} before this line, using the value your program needs.`, code: `${missingName} = "your value"\n${sourceLine || `print(${missingName})`}` });
      }
    }
  } else if (type === "TypeError" && /concatenate|str.*int|int.*str|unsupported operand/i.test(summary + " " + detail)) {
    solutions.length = 0;
    solutions.push({ title: "Convert the number to text", detail: "Use str() when you want to join a number to text.", code: `age = 18
print("Age: " + str(age))` });
    solutions.push({ title: "Or use an f-string", detail: "F-strings let Python format numbers and text together without manual concatenation.", code: `age = 18
print(f"Age: {age}")` });
  } else if (type === "ValueError" && /invalid literal.*int|could not convert string to float/i.test(summary + " " + detail)) {
    solutions.length = 0;
    solutions.push({ title: "Check the value before converting", detail: "int() only accepts text that represents a whole number. If the value comes from input(), validate it or handle invalid input.", code: `text = input("Enter a whole number: ")
try:
    number = int(text)
    print(number)
except ValueError:
    print("Please enter digits, like 18.")` });
  }
  return { ...chosen, solutions, lineNumber, sourceLine: sourceLine.trim(), summary };
}

export default function Console({ py, samples = [], code = "" }) {
  const { status, loadError, running, output, error, waiting, hasRun, answerCount, clear, retry, submit } = py;
  const [showStatus, setShowStatus] = useState(true);
  const [showExplainer, setShowExplainer] = useState(false);
  const statusTimer = useRef(null);
  const statusKey = `${status}-${running}-${waiting}`;
  useEffect(() => {
    setShowStatus(true);
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setShowStatus(false), 3000);
    return () => {
      if (statusTimer.current) clearTimeout(statusTimer.current);
      statusTimer.current = null;
    };
  }, [statusKey]);
  const hint = samples[answerCount] ?? "";
  const explanation = error ? explainPythonError(error, code) : null;
  useEffect(() => { setShowExplainer(false); }, [error]);
  const cut = output.lastIndexOf("\n") + 1;
  // While waiting, the unfinished last line is the prompt and the answer field sits right after it.
  const head = waiting ? output.slice(0, cut) : output;
  const prompt = waiting ? output.slice(cut) : "";
  const body = useRef(null);
  const explainerPanel = useRef(null);
  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }); }, [output, waiting]);
  useEffect(() => {
    if (showExplainer) explainerPanel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [showExplainer]);

  return (
    <section className="console-card" aria-label="Output console">
      <span className="sr-only" role="status" aria-live="polite">{status === "loading" ? "Loading Python" : status === "error" ? "Python engine unavailable" : running ? "Python is running" : waiting ? "Waiting for input" : hasRun ? (error ? "Python execution ended with an error" : "Python execution finished") : "Python compiler ready"}</span>
      <div className="toolbar">
        <span className="filetab"><TerminalSquare size={15} aria-hidden="true" /> Output</span>
        {showStatus && (
          <div className={`console-status status-${waiting && !running ? "waiting" : status}`} role="status" aria-live="polite">
            {status === "loading" && (<><Loader2 size={12} className="spin" /> Loading Python</>)}
            {status === "ready" && (running ? "Running" : waiting ? "Waiting for input" : "Python loaded")}
            {status === "error" && "Python unavailable"}
            {status === "idle" && "Starting"}
          </div>
        )}
        <span className="toolbar-spacer" />
        {hasRun && !running && error && status !== "error" && (
          <button className={`btn btn-ghost btn-sm error-explainer-trigger${showExplainer ? " is-active" : ""}`} onClick={() => setShowExplainer((open) => !open)} aria-expanded={showExplainer} aria-controls="error-explainer-panel" title="Explain this error">
            <Lightbulb size={15} aria-hidden="true" /> Explain error
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={clear} disabled={!hasRun}><Eraser size={15} /> Clear</button>
      </div>
      <div className="console-body" ref={body} onClick={() => document.getElementById("py-input")?.focus()}>
        {showExplainer && explanation && (
          <section className="error-explainer-panel" id="error-explainer-panel" ref={explainerPanel} aria-label="Error explanation">
            <div className="error-explainer-heading"><div><Lightbulb size={17} aria-hidden="true" /><strong>{explanation.title}</strong></div><button className="icon-btn" onClick={() => setShowExplainer(false)} aria-label="Close error explanation"><X size={16} /></button></div>
            <p>{explanation.why}</p>
            {explanation.lineNumber && <p className="error-explainer-line"><strong>Check line {explanation.lineNumber}</strong>{explanation.sourceLine ? <>: <code>{explanation.sourceLine}</code></> : "."}</p>}
            <div className="error-explainer-solutions">
              {explanation.solutions.map((solution, index) => (
                <div className="error-explainer-solution" key={`${solution.title}-${index}`}>
                  <p><strong>{solution.title}</strong></p>
                  <p>{solution.detail}</p>
                  <div className="error-explainer-example"><span>Example solution</span><pre>{solution.code}</pre></div>
                </div>
              ))}
            </div>
            <p className="error-explainer-note">Choose the option that matches what you intended your code to do. Examples use sample values; keep your own intended values.</p>
          </section>
        )}
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
