// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { useEffect, useState } from "react";

const query = (w) => window.matchMedia(w);
const read = () => (query("(max-width: 767px)").matches ? "mobile" : query("(max-width: 1023px)").matches ? "tablet" : "desktop");

export default function useBreakpoint() {
  const [bp, setBp] = useState(read);
  useEffect(() => {
    const on = () => setBp(read());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return bp;
}
