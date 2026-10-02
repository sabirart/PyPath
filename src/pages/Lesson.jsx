import { Suspense, lazy, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Code2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { KEYS, getItem, setItem } from "../services/storage";
import { downloadPython } from "../services/download";
import Missing from "../components/Missing";
import { EditorSkeleton } from "../components/Skeletons";
import usePython from "../hooks/usePython";
import useMedia from "../hooks/useMedia";
import LessonContent from "../components/LessonContent";
import TaskCard from "../components/TaskCard";
import Console from "../components/Console";
import NavButtons from "../components/NavButtons";
import Splitter from "../components/Splitter";

const CodeEditor = lazy(() => import("../components/CodeEditor"));

// Wide screens: lesson and editor sit side by side and scroll independently.
// Narrower screens: a Lesson / Code switch shows one full-height pane at a time.
function LessonView({ lesson, base, prev, next }) {
  const { touchLesson, startLesson, completeLesson, progress, panels, togglePanel, theme, toast, lessons } = useApp();
  const split = useMedia("(min-width: 1180px)");
  const py = usePython();
  const [code, setCode] = useState(() => getItem(KEYS.code(lesson.id)) ?? lesson.starterCode ?? "");
  const [colSize, setColSize] = useState(46);
  const [rowSize, setRowSize] = useState(60);
  const status = progress[lesson.id] || "not-started";
  const noun = lesson.kind === "project" ? "project" : "lesson";
  const showCode = panels.compiler;
  const showLesson = split || !showCode;
  const sideBySide = split && showCode;
  const samples = lesson.sampleInput ? lesson.sampleInput.split("\n") : [];

  useEffect(() => { touchLesson(lesson.id); }, [lesson.id, touchLesson]);

  const change = (v) => { setCode(v); setItem(KEYS.code(lesson.id), v); };
  const loadExample = () => { change(lesson.fullExample); togglePanel("compiler", true); toast("Example loaded into the editor.", "success"); };
  const download = () => { try { downloadPython(code, `${lesson.id}.py`); } catch { toast("The download failed. Please try again.", "error"); } };
  const start = () => {
    startLesson(lesson.id);
    toast(`Day ${lesson.day} started. It is now your pending ${noun}.`, "success");
  };
  const complete = () => {
    completeLesson(lesson.id);
    const following = lessons[lesson.day];
    toast(following ? `Day ${lesson.day} complete! Come back for Day ${following.day}.` : "Day 30 complete! You finished the challenge.", "success");
  };
  const reset = () => { change(lesson.starterCode); toast("Starter code restored.", "success"); };

  return (
    <div className="workspace">
      {!split && (
        <div className="tabbar" role="tablist" aria-label="Lesson view">
          <button role="tab" className="tab" aria-selected={!showCode} onClick={() => togglePanel("compiler", false)}><BookOpen size={16} /> Lesson</button>
          <button role="tab" className="tab" aria-selected={showCode} onClick={() => togglePanel("compiler", true)}><Code2 size={16} /> Code</button>
        </div>
      )}
      <div className="ws-panes">
        <section className={`pane pane-lesson ${showLesson ? "is-visible" : "is-hidden"}`} aria-label="Lesson" aria-hidden={!showLesson} style={sideBySide ? { flex: `${colSize} 1 0` } : undefined}>
            <div className="pane-scroll">
              {base === "projects" && <a href="#/projects" className="back-link"><ArrowLeft size={16} /> All projects</a>}
              <LessonContent lesson={lesson} onLoadExample={loadExample} onStart={start} />
              {lesson.practiceTask ? <TaskCard task={lesson.practiceTask} /> : <p className="content-error" role="alert">The practice task is missing from the lesson data.</p>}
            </div>
            <footer className="lesson-footer">
              <NavButtons prev={prev} next={next} status={status} onStart={start} onComplete={complete} />
            </footer>
          </section>
        {sideBySide && <Splitter orientation="col" value={colSize} onChange={setColSize} min={30} max={70} label="Resize lesson and editor" />}
        <section className={`pane pane-code ${showCode ? "is-visible" : "is-hidden"}`} aria-label="Code workspace" aria-hidden={!showCode} style={sideBySide ? { flex: `${100 - colSize} 1 0` } : undefined}>
          <div className="stack-item" style={{ flex: `${rowSize} 1 0` }}>
            <Suspense fallback={<EditorSkeleton />}>
              <CodeEditor value={code} onChange={change} onRun={() => py.run(code)} running={py.running}
                onDownload={download} onReset={reset} theme={theme} fileName={`${lesson.id}.py`} />
            </Suspense>
          </div>
          <Splitter orientation="row" value={rowSize} onChange={setRowSize} min={25} max={75} label="Resize editor and output" />
          <div className="stack-item" style={{ flex: `${100 - rowSize} 1 0` }}>
            <Console py={py} samples={samples} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LessonPage({ id, base = "lessons" }) {
  const { lessons, getLesson } = useApp();
  const lesson = getLesson(id);
  if (!lesson) return <Missing what={base === "projects" ? "project" : "lesson"} />;
  // Previous / Next walk through the whole 30-day course in order.
  const i = lessons.findIndex((l) => l.id === id);
  return <LessonView key={id} lesson={lesson} base={base} prev={lessons[i - 1]} next={lessons[i + 1]} />;
}
