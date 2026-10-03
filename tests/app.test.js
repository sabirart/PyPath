import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const root = new URL("../", import.meta.url);
const lessons = JSON.parse(readFileSync(new URL("../src/data/lessons.json", import.meta.url), "utf8"));

test("hash router handles dashboard, lessons, projects and invalid ids", async () => {
  global.window = { location: { hash: "#/lessons/l04" } };
  const { parseHash, pathFor } = await import("../src/routerCore.js");
  assert.deepEqual(parseHash(), { path: "/lessons/l04", page: "lessons", id: "l04" });
  global.window.location.hash = "#/projects/l30";
  assert.deepEqual(parseHash(), { path: "/projects/l30", page: "projects", id: "l30" });
  global.window.location.hash = "#/unknown/nope";
  assert.deepEqual(parseHash(), { path: "/unknown/nope", page: "unknown", id: "nope" });
  assert.equal(pathFor(lessons[0]), "/lessons/l01");
  assert.equal(pathFor(lessons[25]), "/projects/l26");
});

test("storage survives unavailable localStorage through memory fallback and handles corrupted progress", async () => {
  const store = new Map();
  global.window = {
    localStorage: {
      getItem: (k) => { throw new Error("blocked"); },
      setItem: (k, v) => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
      key: () => null,
      get length() { return 0; },
    },
  };
  const storage = await import(`../src/services/storage.js?test=${Date.now()}`);
  assert.equal(storage.setItem("test_key", "value"), false);
  assert.equal(storage.getItem("test_key"), "value");
  assert.doesNotThrow(() => storage.resetProgressData());
  void store;
});

test("lesson Python examples are syntactically valid Python", () => {
  const snippets = [];
  for (const lesson of lessons) {
    for (const key of ["codeExample", "fullExample", "starterCode"]) {
      if (typeof lesson[key] === "string") snippets.push({ id: lesson.id, key, code: lesson[key] });
    }
  }
  const payload = JSON.stringify(snippets);
  try {
    execFileSync("python", ["-c", `
import json, sys
items = json.loads(sys.stdin.read())
for item in items:
    compile(item["code"], item["id"] + "." + item["key"], "exec")
`], { input: payload, stdio: ["pipe", "pipe", "pipe"] });
  } catch (error) {
    assert.fail(`A lesson Python snippet is invalid: ${error.stderr?.toString() || error.message}`);
  }
});

test("critical audit content fixes are present", () => {
  const p1 = lessons.find((x) => x.id === "l26");
  assert.equal(p1.sampleInput, "12\n3\n+");
  const final = lessons.find((x) => x.id === "l30");
  assert.match(final.fullExample, /command == "export"/);
  assert.doesNotMatch(final.definition, /persistent-style/i);
  const api = lessons.find((x) => x.id === "l24");
  assert.doesNotMatch(api.fullExample, /Karachi/i);
});

test("compiler source has valid line breaks and quiet editor/input focus styling", () => {
  const compiler = readFileSync(new URL("../src/pages/Compiler.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles/index.css", import.meta.url), "utf8");
  assert.doesNotMatch(compiler, /useApp\(\);\\n\s+const py/);
  assert.match(compiler, /const \{ toast \} = useApp\(\);\n  const py = usePython\(\);/);
  assert.match(css, /\.sr-only \{/);
  assert.doesNotMatch(css, /\.cm-editor\.cm-focused \{ outline:/);
  assert.match(css, /\.prompt-input:focus-visible \{ outline: 0; background:/);
  const editor = readFileSync(new URL("../src/components/CodeEditor.jsx", import.meta.url), "utf8");
  assert.match(editor, /onClick=\{running \? onStop : onRun\}/);
  assert.doesNotMatch(editor, /onClick=\{onRun\} disabled=\{running\}/);
  assert.match(css, /body\.resizing \.compiler-page > \.stack-item \{ transition: none; \}/);
});

test("worker execution architecture contains timeout, cancellation and reliable input replay", () => {
  const worker = readFileSync(new URL("../src/workers/python.worker.js", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../src/hooks/usePython.js", import.meta.url), "utf8");
  assert.match(hook, /new Worker\(new URL\("\.\.\/workers\/python\.worker\.js"/);
  assert.match(hook, /TIMEOUT_MS = 30000/);
  assert.match(hook, /workerRef\.current\?\.terminate/);
  assert.match(hook, /session\.current\.answers/);
  assert.match(worker, /setStdin/);
  assert.match(worker, /answerIndex < answers\.length/);
  assert.match(worker, /EOFError/);
  assert.match(worker, /input-request/);
  assert.match(worker, /postMessage\(\{ type: "input-request", output: result\.output \}\)/);
  assert.doesNotMatch(worker, /Atomics\.wait/);
});


test("compiler uses a single in-output status line and shows input prompts before waiting", () => {
  const consoleSource = readFileSync(new URL("../src/components/Console.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles/index.css", import.meta.url), "utf8");
  const worker = readFileSync(new URL("../src/workers/python.worker.js", import.meta.url), "utf8");
  assert.doesNotMatch(consoleSource, /<span className=\{`state state-/);
  assert.match(consoleSource, /console-status/);
  assert.match(css, /\.console-status \{/);
  assert.match(worker, /postMessage\(\{ type: "input-request", output: result\.output \}\)/);
});

test("reset flow reuses the name modal and restarts Day 1", () => {
  const progress = readFileSync(new URL("../src/components/ProgressPopup.jsx", import.meta.url), "utf8");
  const context = readFileSync(new URL("../src/context/AppContext.jsx", import.meta.url), "utf8");
  assert.match(progress, /<NameModal/);
  assert.match(progress, /resetAndRestart\(name\)/);
  assert.match(progress, /navigate\("\/lessons\/l01"\)/);
  assert.match(context, /setItem\(KEYS\.active, "l01"\)/);
  assert.match(context, /setActiveId\("l01"\)/);
});

test("ProgressPopup contains real JavaScript line breaks and editor has Python indentation rules", () => {
  const progress = readFileSync(new URL("../src/components/ProgressPopup.jsx", import.meta.url), "utf8");
  const editor = readFileSync(new URL("../src/components/CodeEditor.jsx", import.meta.url), "utf8");
  assert.match(progress, /const \[confirming, setConfirming\] = useState\(false\);\n  const \[renaming, setRenaming\] = useState\(false\);/);
  assert.doesNotMatch(progress, /useState\(false\);\\n\s+const \[renaming/);
  assert.match(editor, /indentUnit\.of\("    "\)/);
  assert.match(editor, /indentOnInput\(\)/);
  assert.match(editor, /key: "Enter"/);
  assert.match(editor, /dedentHeader/);
  assert.match(editor, /key: "Shift-Tab"/);
});

test("Python runtime is warmed once and reused between runs", () => {
  const hook = readFileSync(new URL("../src/hooks/usePython.js", import.meta.url), "utf8");
  const worker = readFileSync(new URL("../src/workers/python.worker.js", import.meta.url), "utf8");
  assert.match(hook, /postMessage\(\{ type: "warmup" \}\)/);
  assert.match(worker, /type === "warmup"/);
  assert.match(worker, /let ready = false/);
  assert.match(worker, /if \(!ready && !pyodide\) postMessage\(\{ type: "loading" \}\)/);
  assert.match(hook, /if \(!worker\) \{\n      worker = createWorker\(\);/);
  assert.match(hook, /setStatus\("ready"\);/);
});

test("Python runtime uses the current stable Pyodide CDN", () => {
  const worker = readFileSync(new URL("../src/workers/python.worker.js", import.meta.url), "utf8");
  const service = readFileSync(new URL("../src/services/pyodide.js", import.meta.url), "utf8");
  assert.match(worker, /pyodide\/v314\.0\.7\/full\/pyodide\.mjs/);
  assert.match(service, /pyodide\/v314\.0\.7\/full\/pyodide\.mjs/);
  assert.doesNotMatch(worker, /importScripts\s*\(/);
  const hook = readFileSync(new URL("../src/hooks/usePython.js", import.meta.url), "utf8");
  assert.match(hook, /type: "module"/);
  assert.doesNotMatch(worker, /v0\.25\.0/);
  assert.doesNotMatch(service, /v0\.25\.0/);
});
