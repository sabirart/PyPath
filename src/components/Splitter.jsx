// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useRef } from "react";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Draggable (and keyboard-adjustable) divider between two panes.
// Pointer updates are throttled to one animation frame so resizing stays smooth.
export default function Splitter({ orientation = "col", value, onChange, min = 28, max = 72, label }) {
  const ref = useRef(null);
  const col = orientation === "col";
  const frame = useRef(0);
  const latest = useRef(value);

  const onDown = (e) => {
    e.preventDefault();
    if (!ref.current?.parentElement) return;
    const rect = ref.current.parentElement.getBoundingClientRect();
    latest.current = value;

    const move = (ev) => {
      const p = col ? (ev.clientX - rect.left) / rect.width : (ev.clientY - rect.top) / rect.height;
      const next = clamp(p * 100, min, max);
      latest.current = next;
      if (!frame.current) {
        frame.current = requestAnimationFrame(() => {
          frame.current = 0;
          onChange(latest.current);
        });
      }
    };

    const up = () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
        frame.current = 0;
      }
      onChange(latest.current);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.classList.remove("resizing", `resizing-${orientation}`);
    };

    document.body.classList.add("resizing", `resizing-${orientation}`);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { once: true });
  };

  const onKey = (e) => {
    const [dec, inc] = col ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
    if (e.key === dec) { e.preventDefault(); onChange(clamp(value - 3, min, max)); }
    if (e.key === inc) { e.preventDefault(); onChange(clamp(value + 3, min, max)); }
  };

  return (
    <div ref={ref} className={`splitter splitter-${orientation}`} role="separator" tabIndex={0}
      aria-orientation={col ? "vertical" : "horizontal"} aria-label={label} aria-valuenow={Math.round(value)} aria-valuemin={min} aria-valuemax={max}
      onPointerDown={onDown} onKeyDown={onKey} />
  );
}
