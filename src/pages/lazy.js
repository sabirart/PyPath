import { lazy } from "react";

// Each page is its own chunk and is downloaded only when first visited.
const loaders = {
  dashboard: () => import("./Dashboard"),
  lesson: () => import("./Lesson"),
  compiler: () => import("./Compiler"),
  projects: () => import("./Projects"),
  about: () => import("./About"),
};
export const Dashboard = lazy(loaders.dashboard);
export const LessonPage = lazy(loaders.lesson);
export const Compiler = lazy(loaders.compiler);
export const Projects = lazy(loaders.projects);
export const About = lazy(loaders.about);

// After the first screen is ready, quietly fetch the other chunks while the browser is idle,
// so moving between pages feels instant.
export function prefetchPages() {
  const run = () => Object.values(loaders).forEach((load) => load().catch(() => {}));
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 1500);
}
