import { useEffect, useState } from "react";

export function parseHash() {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  return { path: raw, page: parts[0] || "", id: parts[1] || "" };
}

export function navigate(path) {
  window.location.hash = "#" + path;
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const on = () => setRoute(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

// Classes live under /lessons, projects under /projects.
export const pathFor = (item) => `/${item.kind === "project" ? "projects" : "lessons"}/${item.id}`;
