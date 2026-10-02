import { useEffect, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { python } from "@codemirror/lang-python";
import { basicSetup } from "codemirror";
import { Play, Download, RotateCcw, Loader2, FileCode2 } from "lucide-react";

// Token colours come from CSS variables, so the editor follows the warm theme in both modes.
const pyStyle = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: "var(--tok-kw)" },
  { tag: [t.string, t.special(t.string)], color: "var(--tok-str)" },
  { tag: [t.comment, t.lineComment], color: "var(--tok-com)", fontStyle: "italic" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "var(--tok-num)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.definition(t.variableName)], color: "var(--tok-fn)" },
  { tag: [t.className, t.standard(t.variableName), t.self], color: "var(--tok-bi)" },
]);

const base = EditorView.theme({
  "&": { height: "100%", backgroundColor: "var(--editor-bg)", color: "var(--text)", fontSize: "13.5px" },
  ".cm-scroller": { overflow: "auto", fontFamily: "var(--mono)", lineHeight: "1.7" },
  ".cm-content": { padding: "10px 0" },
  ".cm-gutters": { backgroundColor: "var(--editor-bg)", color: "var(--muted)", border: "none" },
  ".cm-activeLine": { backgroundColor: "var(--active-line)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--active-line)", color: "var(--text)" },
  ".cm-cursor": { borderLeftColor: "var(--text)" },
  "&.cm-focused": { outline: "none" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "var(--selection) !important" },
});

export default function CodeEditor({ value, onChange, onRun, running, onDownload, onReset, theme, fileName = "main.py", label = "Python code editor" }) {
  const host = useRef(null);
  const view = useRef(null);
  const cb = useRef({});
  cb.current = { onChange, onRun };

  useEffect(() => {
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup, python(), base,
          syntaxHighlighting(pyStyle),
          keymap.of([
            { key: "Mod-Enter", run: () => { cb.current.onRun(); return true; } },
            // Escape leaves the editor so keyboard users are never trapped.
            { key: "Escape", run: (ev) => { ev.dom.closest(".editor-card")?.querySelector(".toolbar button")?.focus(); return true; } },
            indentWithTab,
          ]),
          EditorView.contentAttributes.of({ "aria-label": label }),
          EditorView.updateListener.of((u) => { if (u.docChanged) cb.current.onChange(u.state.doc.toString()); }),
        ],
      }),
    });
    view.current = v;
    return () => v.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replace the document when the value changes from outside (reset, load example).
  useEffect(() => {
    const v = view.current;
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  return (
    <section className="editor-card" aria-label="Code editor">
      <div className="toolbar">
        <span className="filetab"><FileCode2 size={15} aria-hidden="true" /> {fileName}</span>
        <span className="toolbar-spacer" />
        <button className="btn btn-primary btn-sm" onClick={onRun} disabled={running} title="Run (Ctrl/Cmd + Enter)">
          {running ? <Loader2 size={15} className="spin" /> : <Play size={15} />} {running ? "Running" : "Run Code"}
        </button>
        <button className="icon-btn sm" onClick={onDownload} aria-label="Download as .py file" title="Download .py"><Download size={16} /></button>
        {onReset && <button className="icon-btn sm" onClick={onReset} aria-label="Reset to starter code" title="Reset to starter code"><RotateCcw size={16} /></button>}
      </div>
      <div className="cm-host" ref={host} />
    </section>
  );
}
