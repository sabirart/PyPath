// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
export function parseHash(hash = window.location.hash) {
  const raw = String(hash || "").replace(/^#/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  return { path: raw, page: parts[0] || "", id: parts[1] || "" };
}

export const pathFor = (item) => `/${item.kind === "project" ? "projects" : "lessons"}/${item.id}`;
