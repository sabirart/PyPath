// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useCallback, useEffect, useRef } from "react";
import { setItem } from "../services/storage";

// Saves `value` under `key` shortly after it stops changing (debounced). A pending save is
// written immediately when the component unmounts or the key changes, so the last edit is
// never lost. Nothing is written until the value actually changes, so merely opening a
// lesson does not store its starter code.
export default function useAutosave(key, value, delay = 300) {
  const s = useRef({ key, value, initial: value, dirty: false, timer: null });

  const flush = useCallback(() => {
    const cur = s.current;
    clearTimeout(cur.timer);
    cur.timer = null;
    if (cur.dirty) {
      setItem(cur.key, cur.value);
      cur.dirty = false;
    }
  }, []);

  useEffect(() => {
    const cur = s.current;
    if (cur.key !== key) {
      flush();
      cur.key = key;
      cur.initial = value;
    }
    if (value === cur.initial && !cur.dirty) return;
    cur.value = value;
    cur.dirty = true;
    clearTimeout(cur.timer);
    cur.timer = setTimeout(flush, delay);
  }, [key, value, delay, flush]);

  useEffect(() => flush, [flush]); // flush on unmount
}
