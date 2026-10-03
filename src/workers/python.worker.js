const PYODIDE_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/";
let pyodide = null;
let loading = null;
let active = false;
let control = null;
let bytes = null;

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

function ensureControl(sab) {
  if (!sab) return false;
  control = new Int32Array(sab, 0, 2);
  bytes = new Uint8Array(sab, 8);
  return true;
}

function readAnswer() {
  if (!control || !bytes) return null;
  Atomics.store(control, 0, 0);
  Atomics.wait(control, 0, 0);
  const length = Atomics.load(control, 1);
  if (length < 0) return null;
  return new TextDecoder().decode(bytes.slice(0, Math.min(length, bytes.length)));
}

async function loadPython() {
  if (pyodide) return pyodide;
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      if (typeof self.loadPyodide === "function") return resolve();
      try {
        importScripts(PYODIDE_INDEX + "pyodide.js");
        resolve();
      } catch (e) {
        reject(new Error("The Python engine could not be downloaded. Check your internet connection and try again."));
      }
    }).then(() => self.loadPyodide({ indexURL: PYODIDE_INDEX }))
      .then((py) => { pyodide = py; return py; })
      .catch((e) => { loading = null; throw e; });
  }
  return loading;
}

function stdoutCollector() {
  let out = "";
  const decoder = new TextDecoder();
  return {
    get value() { return out; },
    stdout: { write: (buf) => { out += decoder.decode(buf, { stream: true }); return buf.length; } },
    stderr: { write: (buf) => { out += decoder.decode(buf, { stream: true }); return buf.length; } },
  };
}

async function execute(code, sab, answers = []) {
  const py = await loadPython();
  ensureControl(sab);
  let collector = stdoutCollector();
  let answerIndex = 0;
  py.setStdout(collector.stdout);
  py.setStderr(collector.stderr);
  py.setStdin({
    stdin: () => {
      if (control) {
        // Publish everything Python has printed, including input() prompts,
        // before blocking for the user's answer. This keeps prompts visible.
        postMessage({ type: "input-request", output: collector.value });
        const answer = readAnswer();
        if (answer !== null) collector.stdout.write(new TextEncoder().encode(answer + "\n"));
        return answer;
      }
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
    py.runPython(`import random\nrandom.seed(${Math.floor(Math.random() * 1000000) + 1})`);
    py.runPython(code, { globals: scope });
  } catch (e) {
    error = friendly(e);
  } finally {
    try { py.runPython("import sys; sys.stdout.flush()"); } catch {}
    scope.destroy();
    control = null;
    bytes = null;
  }
  return { output: collector.value, error };
}

self.onmessage = async (event) => {
  const { type } = event.data || {};
  if (type === "run") {
    if (active) return;
    active = true;
    try {
      postMessage({ type: "loading" });
      const result = await execute(event.data.code, event.data.sab, event.data.answers || []);
      postMessage({ type: "result", ...result });
    } catch (e) {
      postMessage({ type: "fatal", message: e?.message || String(e) });
    } finally {
      active = false;
    }
  } else if (type === "input-fallback") {
    // Used only when SharedArrayBuffer is unavailable. The main hook restarts
    // execution inside this worker with the accumulated answers.
  }
};
