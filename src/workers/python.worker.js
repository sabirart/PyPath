// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
// Pyodide is fetched from a CDN. To self-host it, copy the files from the `pyodide` npm package to
// public/pyodide/ and add { indexURL: "./pyodide/", moduleURL: "./pyodide/pyodide.mjs" } as the first entry.
const PYODIDE_SOURCES = [
  { indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/", moduleURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs" },
  { indexURL: "https://unpkg.com/pyodide@314.0.7/full/", moduleURL: "https://unpkg.com/pyodide@314.0.7/full/pyodide.mjs" },
];
let pyodideIndex = null;
let pyodide = null;
let loading = null;
let active = false;
let ready = false;
const EXPLAIN = {
  SyntaxError: "Python could not read a line. Check brackets, quotes and colons.",
  IndentationError: "The spaces at the start of a line do not line up.",
  NameError: "A name was used before it was created. Check the spelling.",
  TypeError: "A value was used in a way its type does not allow.",
  ValueError: "A value had the right type but unsuitable content.",
  ZeroDivisionError: "You cannot divide by zero.",
  IndexError: "The list position you asked for does not exist.",
  KeyError: "That key is not in the dictionary.",
  EOFError: "The program asked for input but none was available.",
  FileNotFoundError: "That file does not exist.",
  ModuleNotFoundError: "That module is not available in the browser.",
  AttributeError: "That object does not have the attribute or method you used.",
};

function friendly(err) {
  const msg = String((err && err.message) || err);
  const at = msg.indexOf('File "<exec>"');
  const detail = (at >= 0 ? msg.slice(at) : msg).trim();
  const lines = detail.split("\n");
  const summary = lines[lines.length - 1] || detail;
  const name = summary.split(":")[0].trim();
  return { summary, detail, hint: EXPLAIN[name] || "Read the last line above to see what went wrong." };
}


async function loadPython() {
  if (pyodide) return pyodide;
  if (!loading) {
    loading = (async () => {
      const failures = [];
      for (const source of PYODIDE_SOURCES) {
        try {
          // Pyodide 314.x requires an ES-module worker.
          // Load the runtime through its ES module entry point.
          const module = await import(/* @vite-ignore */ source.moduleURL);
          if (typeof module.loadPyodide !== "function") {
            throw new Error("The Pyodide module did not export loadPyodide().");
          }
          pyodideIndex = source.indexURL;
          return await module.loadPyodide({ indexURL: source.indexURL });
        } catch (error) {
          failures.push(`${source.moduleURL}: ${error?.message || error}`);
        }
      }
      throw new Error(
        "Python engine could not be loaded. The browser could not load the Pyodide ES module.\n\n" + failures.join("\n")
      );
    })()
      .then((py) => { pyodide = py; return py; })
      .catch((e) => { loading = null; throw e; });
  }
  return loading;
}

// Output is capped so a runaway print loop cannot exhaust the tab's memory.
const MAX_OUTPUT = 200000;
const TRUNCATED_NOTE = "\n[Output truncated: too much text was printed.]\n";

function stdoutCollector() {
  let out = "";
  let truncated = false;
  const decoder = new TextDecoder();
  const append = (text) => {
    if (truncated) return;
    if (out.length + text.length > MAX_OUTPUT) {
      out += text.slice(0, Math.max(0, MAX_OUTPUT - out.length)) + TRUNCATED_NOTE;
      truncated = true;
    } else {
      out += text;
    }
  };
  const sink = { write: (buf) => { append(decoder.decode(buf, { stream: true })); return buf.length; } };
  return { get value() { return out; }, stdout: sink, stderr: sink };
}

async function execute(code, answers = [], seed = 1) {
  const py = await loadPython();
  if (!ready) {
    ready = true;
    postMessage({ type: "ready" });
  }
  // Tells the page that the runtime is loaded and the program is about to run, so the
  // execution timeout never counts the time spent downloading Python.
  postMessage({ type: "started" });
  let collector = stdoutCollector();
  let answerIndex = 0;
  let waiting = false;

  py.setStdout(collector.stdout);
  py.setStderr(collector.stderr);
  py.setStdin({
    stdin: () => {
      if (answerIndex < answers.length) {
        const answer = String(answers[answerIndex++]);
        collector.stdout.write(new TextEncoder().encode(answer + "\n"));
        return answer;
      }
      return undefined;
    },
  });

  const scope = py.globals.get("dict")();
  let error = null;
  try {
    py.runPython(`import random\nrandom.seed(${Number(seed) || 1})`);
    py.runPython(code, { globals: scope });
  } catch (e) {
    const friendlyError = friendly(e);
    if (friendlyError.summary.startsWith("EOFError") && answerIndex >= answers.length) {
      waiting = true;
    } else {
      error = friendlyError;
    }
  } finally {
    try { py.runPython("import sys; sys.stdout.flush()"); } catch {}
    scope.destroy();
  }

  return { output: collector.value, error, waiting };
}

self.onmessage = async (event) => {
  const { type } = event.data || {};
  if (type === "warmup") {
    if (ready || loading) return;
    try {
      postMessage({ type: "loading" });
      await loadPython();
      ready = true;
      postMessage({ type: "ready" });
    } catch (e) {
      // Warmup is deliberately silent; a real Run will surface the detailed error.
    }
    return;
  }
  if (type !== "run" || active) return;

  active = true;
  try {
    if (!ready && !pyodide) postMessage({ type: "loading" });
    const result = await execute(event.data.code, event.data.answers || [], event.data.seed || 1);
    if (result.waiting) {
      postMessage({ type: "input-request", output: result.output });
    } else {
      postMessage({ type: "result", output: result.output, error: result.error });
    }
  } catch (e) {
    postMessage({ type: "fatal", message: e?.message || String(e) });
  } finally {
    active = false;
  }
};
