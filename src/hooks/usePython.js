import { useCallback, useEffect, useRef, useState } from "react";

const INPUT_BUFFER_SIZE = 64 * 1024;
const TIMEOUT_MS = 30000;

function createWorker() {
  return new Worker(new URL("../workers/python.worker.js", import.meta.url));
}

function makeInputBuffer() {
  if (typeof SharedArrayBuffer === "undefined" || !window.crossOriginIsolated) return null;
  return new SharedArrayBuffer(8 + INPUT_BUFFER_SIZE);
}

function writeAnswer(sab, answer) {
  const control = new Int32Array(sab, 0, 2);
  const bytes = new Uint8Array(sab, 8);
  const encoded = new TextEncoder().encode(String(answer));
  const length = Math.min(encoded.length, bytes.length);
  bytes.fill(0);
  bytes.set(encoded.subarray(0, length));
  Atomics.store(control, 1, length);
  Atomics.store(control, 0, 1);
  Atomics.notify(control, 0);
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
  const session = useRef({ code: "", answers: [], sab: null, waiting: false });

  const cleanup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    workerRef.current?.terminate();
    workerRef.current = null;
    session.current.waiting = false;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback((code, answers = []) => {
    cleanup();
    const worker = createWorker();
    const sab = makeInputBuffer();
    workerRef.current = worker;
    session.current = { code, answers: [...answers], sab, waiting: false };
    setRunning(true);
    setWaiting(false);
    setStatus("loading");
    setLoadError("");
    setError(null);
    setOutput("");
    setHasRun(true);

    worker.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === "loading") {
        setStatus("loading");
        return;
      }
      if (data.type === "input-request") {
        session.current.waiting = true;
        setWaiting(true);
        setRunning(false);
        setAnswerCount(session.current.answers.length);
        if (typeof data.output === "string") setOutput(data.output);
        setStatus("ready");
        return;
      }
      if (data.type === "result") {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
        setOutput(data.output || "");
        setError(data.error || null);
        setWaiting(false);
        setRunning(false);
        setStatus("ready");
        cleanup();
        return;
      }
      if (data.type === "fatal") {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
        setRunning(false);
        setWaiting(false);
        setStatus("error");
        setLoadError(data.message || "The Python engine failed.");
        cleanup();
      }
    };

    worker.onerror = (event) => {
      setRunning(false);
      setWaiting(false);
      setStatus("error");
      setLoadError(event.message || "The Python worker stopped unexpectedly.");
      cleanup();
    };

    timerRef.current = setTimeout(() => {
      cleanup();
      setRunning(false);
      setWaiting(false);
      setStatus("ready");
      setError({
        hint: "Your program took too long and was stopped. Check for an infinite loop or very large computation, then run your code again.",
        detail: "Execution timeout after 30 seconds. Please run your code again.",
      });
    }, TIMEOUT_MS);

    worker.postMessage({ type: "run", code, sab });
  }, [cleanup]);

  const run = useCallback((code) => {
    start(code);
  }, [start]);

  const submit = useCallback((answer) => {
    const s = session.current;
    if (!s.waiting) return;
    if (s.sab) {
      s.answers.push(String(answer));
      s.waiting = false;
      setWaiting(false);
      setRunning(true);
      writeAnswer(s.sab, answer);
      return;
    }
    // Non-isolated browsers cannot synchronously unblock Python input(). Run the
    // same program in the worker with accumulated input as a compatibility fallback.
    s.answers.push(String(answer));
    start(s.code, s.answers);
  }, [start]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;
    cleanup();
    setRunning(false);
    setWaiting(false);
    setStatus("ready");
    setError({ hint: "Execution was stopped.", detail: "The run was cancelled by the user." });
  }, [cleanup]);

  const clear = useCallback(() => {
    cleanup();
    session.current = { code: "", answers: [], sab: null, waiting: false };
    setOutput("");
    setError(null);
    setWaiting(false);
    setHasRun(false);
    setStatus("idle");
  }, [cleanup]);

  const retry = useCallback(() => {
    const code = session.current.code;
    if (code) start(code);
  }, [start]);

  return { status, loadError, running, output, error, waiting, hasRun, answerCount, run, submit, stop, clear, retry };
}
