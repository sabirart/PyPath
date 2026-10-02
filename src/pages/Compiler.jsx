import { Suspense, lazy, useState } from "react";
import { useApp } from "../context/AppContext";
import { KEYS, getItem, setItem } from "../services/storage";
import { downloadPython } from "../services/download";
import usePython from "../hooks/usePython";
import useMedia from "../hooks/useMedia";
import Console from "../components/Console";
import Splitter from "../components/Splitter";
import { EditorSkeleton } from "../components/Skeletons";

const CodeEditor = lazy(() => import("../components/CodeEditor"));
const DEFAULT = '# Free Compiler: write any Python here\nprint("Hello from PyPath")\n';

export default function Compiler() {
  const { theme, toast } = useApp();
  const py = usePython();
  const wide = useMedia("(min-width: 900px)");
  const [code, setCode] = useState(() => getItem(KEYS.code("free")) ?? DEFAULT);
  const [size, setSize] = useState(60);
  const change = (v) => { setCode(v); setItem(KEYS.code("free"), v); };
  const download = () => { try { downloadPython(code, "pypath.py"); } catch { toast("The download failed. Please try again.", "error"); } };
  return (
    <div className={`compiler-page ${wide ? "is-wide" : ""}`}>
      <div className="stack-item" style={{ flex: `${size} 1 0` }}>
        <Suspense fallback={<EditorSkeleton />}>
          <CodeEditor value={code} onChange={change} onRun={() => py.run(code)} running={py.running} onDownload={download}
            theme={theme} fileName="main.py" label="Free compiler code editor" />
        </Suspense>
      </div>
      <Splitter orientation={wide ? "col" : "row"} value={size} onChange={setSize} min={30} max={75} label="Resize editor and output" />
      <div className="stack-item" style={{ flex: `${100 - size} 1 0` }}>
        <Console py={py} />
      </div>
    </div>
  );
}
