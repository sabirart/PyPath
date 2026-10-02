import { useCallback, useEffect, useRef, useState } from "react";
import { execute, loadPython } from "../services/pyodide";

// status: idle -> loading -> ready | error
// While a program is waiting for input(), `waiting` is true and submit(answer) continues it.
export default function usePython() {
  const [status, setStatus] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const session = useRef({ code: "", answers: [], seed: 1, busy: false });

  const init = useCallback(() => {
    setStatus("loading");
    setLoadError("");
    loadPython()
      .then(() => setStatus("ready"))
      .catch((e) => {
        setStatus("error");
        setLoadError(e.message);
      });
  }, []);

  // Start downloading shortly after the page is usable.
  useEffect(() => {
    const t = setTimeout(init, 400);
    return () => clearTimeout(t);
  }, [init]);

  const go = useCallback(async () => {
    const s = session.current;
    s.busy = true;
    setRunning(true);
    setWaiting(false);
    setAnswerCount(s.answers.length);
    await new Promise((r) => setTimeout(r, 30)); // let the loading state paint
    try {
      const result = await execute(s.code, s.answers, s.seed);
      setOutput(result.output);
      setError(result.error);
      setWaiting(result.waiting);
      setStatus("ready");
    } catch (e) {
      setStatus("error");
      setLoadError(e.message);
    } finally {
      s.busy = false;
      setRunning(false);
    }
  }, []);

  const run = useCallback((code) => {
    if (session.current.busy) return;
    session.current = { code, answers: [], seed: Math.floor(Math.random() * 1e6) + 1, busy: false };
    setError(null);
    setOutput("");
    setHasRun(true);
    return go();
  }, [go]);

  const submit = useCallback((answer) => {
    if (session.current.busy) return;
    session.current.answers = [...session.current.answers, String(answer)];
    return go();
  }, [go]);

  const clear = useCallback(() => {
    session.current = { ...session.current, answers: [] };
    setOutput("");
    setError(null);
    setWaiting(false);
    setHasRun(false);
  }, []);

  return { status, loadError, running, output, error, waiting, hasRun, answerCount, run, submit, clear, retry: init };
}
