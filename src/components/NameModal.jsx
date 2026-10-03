// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useRef, useState } from "react";
import { X } from "lucide-react";
import useFocusTrap from "../hooks/useFocusTrap";

export default function NameModal({ onSubmit, onClose }) {
  const ref = useRef(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  useFocusTrap(ref, true, onClose);

  const submit = (e) => {
    e.preventDefault();
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) return setError("Please enter your first name.");
    if (clean.length > 30) return setError("Please use 30 characters or fewer.");
    onSubmit(clean);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="name-title" ref={ref}>
        <button className="icon-btn modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <h2 id="name-title">What should we call you?</h2>
        <p className="muted">Your first name is saved only in this browser. It is used for your greeting.</p>
        <form onSubmit={submit} noValidate>
          <label htmlFor="first-name" className="field-label">First name</label>
          <input id="first-name" className="input" value={name} maxLength={60} autoComplete="given-name"
            onChange={(e) => { setName(e.target.value); setError(""); }} aria-invalid={!!error} aria-describedby={error ? "name-error" : undefined} />
          {error && <p id="name-error" className="field-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Continue</button>
        </form>
      </div>
    </div>
  );
}
