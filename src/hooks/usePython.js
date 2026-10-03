import { useCallback, useEffect, useRef, useState } from "react";

const TIMEOUT_MS = 30000;

function createWorker() {
  return new Worker(new URL("../workers/python.worker.js", import.meta.url), { type: "module" });
}

export default function usePython() {
  const [status, setStatus] = useState("idle");
  const [loadError, setLoadError] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [waiting, setWaiting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const workerRef = useRef(null);
  const timerRef = useRef(null);
  const session = useRef({ code: "", answers: [], waiting: false });

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const terminate = useCallback(() => {
    cleanup();
    workerRef.current?.terminate();
    workerRef.current = null;
    session.current.waiting = false;
  }, [cleanup]);

  useEffect(() => {
    const warmupTimer = setTimeout(() => {
      if (workerRef.current) return;
      const worker = createWorker();
      workerRef.current = worker;
      worker.onmessage = (event) => {
        const data = event.data || {};
        if (data.type === "ready") setStatus("ready");
      };
      worker.onerror = () => {
        workerRef.current = null;
      };
      worker.postMessage({ type: "warmup" });
    }, 800);
    return () => {
      clearTimeout(warmupTimer);
      terminate();
    };
  }, [terminate]);

  const start = useCallback((code, answers = [], seed = Math.floor(Math.random() * 1000000) + 1) => {
    cleanup();
    let worker = workerRef.current;
    if (!worker) {
      worker = createWorker();
      workerRef.current = worker;
    }
    worker.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === "loading") {
        setStatus("loading");
        return;
      }
      if (data.type === "ready") {
        setStatus("ready");
        return;
      }
      if (data.type === "input-request") {
        cleanup();
        session.current.waiting = true;
        setWaiting(true);
        setRunning(false);
        setAnswerCount(session.current.answers.length);
        if (typeof data.output === "string") setOutput(data.output);
        setStatus("ready");
        return;
      }
      if (data.type === "result") {
        cleanup();
        setOutput(data.output || "");
        setError(data.error || null);
        setWaiting(false);
        setRunning(false);
        setStatus("ready");
        return;
      }
      if (data.type === "fatal") {
        cleanup();
        setRunning(false);
        setWaiting(false);
        setStatus("error");
        setLoadError(data.message || "The Python engine failed.");
        terminate();
      }
    };
    worker.onerror = (event) => {
      setRunning(false);
      setWaiting(false);
      setStatus("error");
      setLoadError(event.message || "The Python worker stopped unexpectedly.");
      terminate();
    };

    session.current = { code, answers: [...answers], waiting: false, seed };
    setRunning(true);
    setWaiting(false);
    setLoadError("");
    setError(null);
    setOutput("");
    setAnswerCount(session.current.answers.length);
    setHasRun(true);

    timerRef.current = setTimeout(() => {
      terminate();
      setRunning(false);
      setWaiting(false);
      setStatus("ready");
      setError({
        hint: "Your program took too long and was stopped. Check for an infinite loop or very large computation, then run your code again.",
        detail: "Execution timeout after 30 seconds. Please run your code again.",
      });
    }, TIMEOUT_MS);

    worker.postMessage({ type: "run", code, answers: session.current.answers, seed: session.current.seed });
  }, [cleanup, terminate]);

  const run = useCallback((code) => start(code, [], Math.floor(Math.random() * 1000000) + 1), [start]);

  const submit = useCallback((answer) => {
    const s = session.current;
    if (!s.waiting) return;
    s.answers.push(String(answer));
    s.waiting = false;
    start(s.code, s.answers, s.seed);
  }, [start]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;
    terminate();
    setRunning(false);
    setWaiting(false);
    setStatus("ready");
    setError({ hint: "Execution was stopped.", detail: "The run was cancelled by the user." });
  }, [terminate]);

  const clear = useCallback(() => {
    cleanup();
    session.current = { code: "", answers: [], waiting: false, seed: 1 };
    setOutput("");
    setError(null);
    setWaiting(false);
    setHasRun(false);
    setAnswerCount(0);
    setStatus("idle");
  }, [cleanup]);

  const retry = useCallback(() => {
    const code = session.current.code;
    if (code) start(code, session.current.answers, session.current.seed);
  }, [start]);

  return { status, loadError, running, output, error, waiting, hasRun, answerCount, run, submit, stop, clear, retry };
}
