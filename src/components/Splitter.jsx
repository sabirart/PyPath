import { useRef } from "react";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Draggable (and keyboard-adjustable) divider between two panes.
// orientation "col" splits left/right, "row" splits top/bottom.
export default function Splitter({ orientation = "col", value, onChange, min = 28, max = 72, label }) {
  const ref = useRef(null);
  const col = orientation === "col";

  const onDown = (e) => {
    e.preventDefault();
    const rect = ref.current.parentElement.getBoundingClientRect();
    const move = (ev) => {
      const p = col ? (ev.clientX - rect.left) / rect.width : (ev.clientY - rect.top) / rect.height;
      onChange(clamp(p * 100, min, max));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.classList.remove("resizing");
    };
    document.body.classList.add("resizing");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
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
