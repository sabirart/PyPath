import { useEffect, useState } from "react";
import { parseHash, pathFor } from "./routerCore";

export { parseHash, pathFor };

export function navigate(path) {
  window.location.hash = "#" + path;
}

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash());
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
