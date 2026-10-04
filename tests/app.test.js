// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
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
  assert.equal(pathFor(lessons.find((x) => x.id === "p01")), "/projects/p01");
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
  const python = ["python3", "python"].find((cmd) => { try { execFileSync(cmd, ["--version"], { stdio: "pipe" }); return true; } catch { return false; } });
  assert.ok(python, "Python 3 is required to run this test (install python3).");
  try {
    execFileSync(python, ["-c", `
import json, sys
items = json.loads(sys.stdin.read())
for item in items:
    compile(item["code"], item["id"] + "." + item["key"], "exec")
`], { input: payload, stdio: ["pipe", "pipe", "pipe"] });
  } catch (error) {
    assert.fail(`A lesson Python snippet is invalid: ${error.stderr?.toString() || error.message}`);
  }
});

test("curriculum contains five integrated project checkpoints and professional coverage", () => {
  const projects = lessons.filter((x) => x.kind === "project");
  assert.equal(projects.length, 5);
  assert.deepEqual(projects.map((x) => x.id), ["p01", "p02", "p03", "p04", "p05"]);
  assert.deepEqual(projects.map((x) => x.afterLesson), [6, 9, 15, 24, 30]);
  for (const title of ["Testing", "SQLite", "Asyncio", "Logging", "Packaging", "Architecture", "Performance"]) {
    assert.ok(lessons.some((x) => x.title.includes(title)), `Missing topic: ${title}`);
  }
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

test("Python runtime uses the official online Pyodide CDN", () => {
  const worker = readFileSync(new URL("../src/workers/python.worker.js", import.meta.url), "utf8");
  assert.match(worker, /PYODIDE_CDN/);
  assert.match(worker, /cdn\.jsdelivr\.net/);
  assert.match(worker, /0\.27\.4/);
  assert.doesNotMatch(worker, /LOCAL_PYODIDE/);
  assert.doesNotMatch(worker, /prepare-offline-runtime/);
  assert.doesNotMatch(worker, /unpkg\.com/);
  assert.doesNotMatch(worker, /importScripts\s*\(/);
  const hook = readFileSync(new URL("../src/hooks/usePython.js", import.meta.url), "utf8");
  assert.match(hook, /type: "module"/);
});

test("online-only product has a dedicated offline page and no offline runtime setup", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const offline = readFileSync(new URL("../src/pages/Offline.jsx", import.meta.url), "utf8");
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(app, /navigator\.onLine/);
  assert.match(app, /return <Offline \/>/);
  assert.match(offline, /You’re offline/);
  assert.doesNotMatch(JSON.stringify(pkg.scripts), /offline|pyodide/);
  assert.equal(existsSync(new URL("../scripts/prepare-offline-runtime.mjs", import.meta.url)), false);
  assert.equal(existsSync(new URL("../public/pyodide/", import.meta.url)), false);
});

test("the execution timer starts only after Python has loaded, and output is capped", () => {
  const worker = readFileSync(new URL("../src/workers/python.worker.js", import.meta.url), "utf8");
  const hook = readFileSync(new URL("../src/hooks/usePython.js", import.meta.url), "utf8");
  assert.match(worker, /postMessage\(\{ type: "started" \}\)/);
  assert.match(hook, /data\.type === "started"/);
  assert.match(hook, /LOAD_TIMEOUT_MS/);
  assert.match(worker, /MAX_OUTPUT = 200000/);
});

test("Python is initialized only on editor intent or Run", () => {
  const hook = readFileSync(new URL("../src/hooks/usePython.js", import.meta.url), "utf8");
  assert.doesNotMatch(hook, /setTimeout\(\(\) => \{\s*if \(workerRef\.current\) return;/);
  assert.match(hook, /const warmup = useCallback/);
  for (const f of ["../src/pages/Lesson.jsx", "../src/pages/Compiler.jsx"]) {
    assert.match(readFileSync(new URL(f, import.meta.url), "utf8"), /onFocusCapture=\{py\.warmup\}/);
  }
});

test("React 18 gets string values for the inert attribute (booleans are dropped)", () => {
  for (const f of ["../src/pages/Lesson.jsx", "../src/components/Sidebar.jsx"]) {
    const src = readFileSync(new URL(f, import.meta.url), "utf8");
    assert.doesNotMatch(src, /inert=\{!?\w+\}/, `${f} passes a boolean to inert`);
    assert.match(src, /inert=\{/);
  }
});

test("toasts are mounted, and obsolete files are gone", () => {
  const app = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(app, /<Toast \/>/);
  assert.equal(existsSync(new URL("../src/services/pyodide.js", import.meta.url)), false);
  assert.equal(existsSync(new URL("../test.py", import.meta.url)), false);
});

test('progress popup shows only the 30 learning days and layout prevents page-width overflow', () => {
  const popup = readFileSync(new URL("../src/components/ProgressPopup.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles/index.css", import.meta.url), "utf8");
  assert.match(popup, /const dayOnlyLessons = lessons\.filter\(\(l\) => l\.kind === "lesson"\)/);
  assert.match(popup, /dayOnlyLessons\.map\(\(l\) =>/);
  assert.match(css, /\.main \{[^}]*overflow-x: hidden/);
  assert.match(css, /\.sidebar-inner \{[^}]*overflow-x: hidden/);
});

test("mobile sidebar swipes work across navigation pages", async () => {
  const fs = await import("node:fs/promises");
  const app = await fs.readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const css = await fs.readFile(new URL("../src/styles/index.css", import.meta.url), "utf8");
  assert.match(app, /const onGlobalTouchStart = \(e\) =>/);
  assert.match(app, /if \(bp !== "mobile" \|\| !start/);
  assert.match(app, /if \(dx < 0 && panels\.sidebar\)/);
  assert.match(app, /if \(lessonView\) return;/);
  assert.match(app, /if \(dx > 0 && !panels\.sidebar\) togglePanel\("sidebar", true\);/);
  assert.match(app, /node\.scrollWidth > node\.clientWidth \+ 1/);
  assert.match(app, /style\.overflowX === "auto" \|\| style\.overflowX === "scroll"/);
  assert.match(app, /<div className="body" onTouchStart=\{onGlobalTouchStart\} onTouchEnd=\{onGlobalTouchEnd\}>/);
  const lesson = await fs.readFile(new URL("../src/pages/Lesson.jsx", import.meta.url), "utf8");
  assert.match(lesson, /Do not treat horizontal scrolling inside lesson content as navigation/);
  assert.match(lesson, /node\.scrollWidth > node\.clientWidth \+ 1/);
  assert.match(lesson, /style\.overflowX/);
  assert.match(css, /\.workspace, \.sidebar\[data-bp="mobile"\], \.main \{ touch-action: pan-y; \}/);
});



test("mobile quiz clears the header and desktop hover feedback is suppressed on touch", async () => {
  const fs = await import("node:fs/promises");
  const css = await fs.readFile(new URL("../src/styles/index.css", import.meta.url), "utf8");
  assert.match(css, /\.quiz-backdrop \{ padding:calc\(var\(--header-h\) \+ \.5rem\) \.75rem \.75rem; align-items:start;/);
  assert.match(css, /\.quiz-modal \{ width:100%; max-height:calc\(100dvh - var\(--header-h\) - 1\.25rem\); border-radius:14px;/);
  assert.match(css, /@media \(hover: none\) and \(pointer: coarse\)/);
  assert.match(css, /\.day-card:hover \{ border-color: var\(--border\); transform: none; \}/);
});

test("mobile dashboard keeps the progress ring compact and lesson swipes control panels", async () => {
  const fs = await import("node:fs/promises");
  const css = await fs.readFile(new URL("../src/styles/index.css", import.meta.url), "utf8");
  const lesson = await fs.readFile(new URL("../src/pages/Lesson.jsx", import.meta.url), "utf8");
  assert.match(css, /\.focus-ring \{ position: static;/);
  assert.match(css, /\.focus-main \{ min-width: 0; padding-right: 0;/);
  assert.match(css, /\.focus-ring \{ position: static;[^}]*width: 100%;/);
  assert.match(css, /\.focus-ring \.ring-wrap\.big \{ width: 132px; height: 132px;/);
  assert.match(css, /touch-action: pan-y/);
  assert.match(lesson, /if \(dx > 0 && !showCode\) togglePanel\("sidebar", true\);/);
  assert.match(lesson, /if \(dx < 0 && !showCode && panels\.sidebar\) togglePanel\("sidebar", false\);/);
});

test("passed quiz saves completion immediately; the success popup has a Next Class button, no timer, and a shine on the trophy", async () => {
  const quiz = readFileSync(new URL("../src/components/CompletionQuiz.jsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../src/pages/Lesson.jsx", import.meta.url), "utf8");
  const ctx = readFileSync(new URL("../src/context/AppContext.jsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/styles/index.css", import.meta.url), "utf8");
  assert.match(quiz, /if \(attempted && isCorrect\(next\)\) markComplete\(\);/);
  assert.match(quiz, /if \(isCorrect\(answers\)\) markComplete\(\);/);
  assert.match(quiz, /const finish = \(\) => \{\s*markComplete\(\);\s*onNextRef\.current\?\.\(\);/);
  assert.match(quiz, /onClick=\{finish\}>\s*Next Class/);
  assert.doesNotMatch(quiz, /setTimeout|setInterval|quiz-ring/);
  assert.match(css, /\.quiz-trophy::after[^}]*animation:quiz-shine/);
  assert.match(css, /@keyframes quiz-shine/);
  assert.match(page, /completeLesson\(lesson\.id, \{ force: true \}\)/);
  assert.match(page, /onNext=\{afterQuiz\}/);
  assert.match(ctx, /if \(!force && !alreadyCompleted && !isCurrent\) return;/);
});

test("after a passed quiz the finished class is Completed and the next class is Pending with a Start button", async () => {
  const ctx = readFileSync(new URL("../src/context/AppContext.jsx", import.meta.url), "utf8");
  const status = readFileSync(new URL("../src/components/StatusIcon.jsx", import.meta.url), "utf8");
  // completeLesson clears the in-progress lesson instead of auto-starting the next one.
  assert.match(ctx, /removeItem\(KEYS\.active\);\s*setActiveId\(null\);/);
  // The first unfinished lesson is "pending" when nothing is in progress, so NavButtons shows Start.
  assert.match(ctx, /map\[pending\] = "pending"/);
  assert.match(status, /pending: "Pending"/);
});
