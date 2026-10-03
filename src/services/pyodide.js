// Pyodide is loaded as an ES module. Current Pyodide releases require a module
// worker/module import; classic <script> injection and importScripts() are unsupported.
const PYODIDE_SOURCES = [
  { indexURL: "/pyodide/", moduleURL: "/pyodide/pyodide.mjs" },
  { indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/", moduleURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs" },
  { indexURL: "https://unpkg.com/pyodide@314.0.7/full/", moduleURL: "https://unpkg.com/pyodide@314.0.7/full/pyodide.mjs" },
];

let instance = null;
let pending = null;

async function loadModule() {
  const failures = [];
  for (const source of PYODIDE_SOURCES) {
    try {
      const module = await import(/* @vite-ignore */ source.moduleURL);
      if (typeof module.loadPyodide !== "function") {
        throw new Error("The Pyodide module did not export loadPyodide().");
      }
      return module.loadPyodide({ indexURL: source.indexURL });
    } catch (error) {
      failures.push(`${source.moduleURL}: ${error?.message || error}`);
    }
  }
  throw new Error("Python engine could not be loaded. The browser could not load the Pyodide ES module.\n\n" + failures.join("\n"));
}

export function loadPython() {
  if (instance) return Promise.resolve(instance);
  if (!pending) {
    pending = loadModule()
      .then((py) => { instance = py; return py; })
      .catch((err) => { pending = null; throw err; });
  }
  return pending;
}

const EXPLAIN = {
  SyntaxError: "Python could not read a line. Check brackets, quotes and colons.",
  IndentationError: "The spaces at the start of a line do not line up.",
  NameError: "A name was used before it was created. Check the spelling.",
  TypeError: "A value was used in a way its type does not allow.",
  ValueError: "A value had the right type but unsuitable content.",
  ZeroDivisionError: "You cannot divide by zero.",
  IndexError: "The list position you asked for does not exist.",
  KeyError: "That key is not in the dictionary.",
  EOFError: "The program asked for input but none was left. Add more lines to the Input box.",
  FileNotFoundError: "That file does not exist.",
  ModuleNotFoundError: "That module is not available in the browser.",
  AttributeError: "That object does not have the attribute or method you used.",
};

function friendly(err) {
  const msg = String((err && err.message) || err);
  const at = msg.indexOf('File "<exec>"');
  const detail = (at >= 0 ? msg.slice(at) : msg).trim();
  const lines = detail.split("\n");
  const summary = lines[lines.length - 1];
  const name = summary.split(":")[0].trim();
  return { summary, detail, hint: EXPLAIN[name] || "Read the last line above to see what went wrong." };
}

// Runs the program from the top with the answers typed so far.
// Output behaves like a real terminal: prompts appear as written and each answer is echoed after its prompt.
// When the program asks for an answer we do not have yet, the run stops there and reports `waiting: true`;
// the console then shows an inline input, and the program is replayed with the new answer added.
// A fixed random seed per session makes the replay identical to the previous run.
export async function execute(code, answers = [], seed = 1) {
  const py = await loadPython();
  let out = "";
  let used = 0;
  let waitingAt = null;
  const outDecoder = new TextDecoder();
  const errDecoder = new TextDecoder();

  py.setStdout({ write: (buf) => { out += outDecoder.decode(buf, { stream: true }); return buf.length; } });
  py.setStderr({ write: (buf) => { out += errDecoder.decode(buf, { stream: true }); return buf.length; } });
  py.setStdin({
    stdin: () => {
      if (used < answers.length) {
        const answer = answers[used++];
        out += answer + "\n"; // terminal-style echo of what was typed
        return answer;
      }
      if (waitingAt === null) waitingAt = out.length; // remember where the prompt ended
      return undefined;
    },
  });

  const scope = py.globals.get("dict")(); // fresh namespace for every run
  let error = null;
  try {
    py.runPython(`import random\nrandom.seed(${Number(seed) || 1})`);
    py.runPython(code, { globals: scope });
  } catch (e) {
    error = friendly(e);
  } finally {
    try { py.runPython("import sys; sys.stdout.flush()"); } catch { /* ignore */ }
    scope.destroy();
  }
  if (waitingAt !== null) return { output: out.slice(0, waitingAt), error: null, waiting: true };
  return { output: out, error, waiting: false };
}
