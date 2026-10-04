// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { lazy } from "react";

// Each page is its own chunk and is downloaded only when first visited.
const loaders = {
  dashboard: () => import("./Dashboard"),
  lesson: () => import("./Lesson"),
  compiler: () => import("./Compiler"),
  projects: () => import("./Projects"),
  about: () => import("./About"),
  course: () => import("./Course"),
  offline: () => import("./Offline"),
};
export const Dashboard = lazy(loaders.dashboard);
export const LessonPage = lazy(loaders.lesson);
export const Compiler = lazy(loaders.compiler);
export const Projects = lazy(loaders.projects);
export const About = lazy(loaders.about);
export const Course = lazy(loaders.course);
export const Offline = lazy(loaders.offline);

