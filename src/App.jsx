// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { Suspense, useEffect, useRef, useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { navigate, useRoute } from "./router";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ProgressPopup from "./components/ProgressPopup";
import Toast from "./components/Toast";
import Welcome from "./pages/Welcome";
import Missing from "./components/Missing";
import PageSkeleton from "./components/Skeletons";
import { Dashboard, LessonPage, Compiler, Projects, About, Course, Offline } from "./pages/lazy";

function Shell() {
  const { user, setUser, getLesson } = useApp();
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  const route = useRoute();
  const main = useRef(null);
  const firstRoute = useRef(true);

  const page = route.page || "dashboard";
  let title = "Dashboard";
  let activeId = null;
  let content;
  let lessonView = false;

  if (page === "dashboard") content = <Dashboard />;
  else if (page === "lessons" && !route.id) { title = "Course overview"; content = <Course />; }
  else if (page === "lessons") {
    const l = getLesson(route.id);
    title = l ? `Day ${l.day}. ${l.title}` : "Lesson not found";
    activeId = l ? l.id : null;
    lessonView = !!l;
    content = <LessonPage id={route.id} base={l?.kind === "project" ? "projects" : "lessons"} />;
  } else if (page === "projects") {
    const l = route.id ? getLesson(route.id) : null;
    title = route.id ? (l ? `${l.kind === "project" ? "Project" : `Day ${l.day}`}. ${l.title}` : "Project not found") : "Projects";
    activeId = l ? l.id : null;
    lessonView = !!l;
    content = route.id ? <LessonPage id={route.id} base="projects" /> : <Projects />;
  } else if (page === "compiler") { title = "Free Compiler"; content = <Compiler />; }
  else if (page === "about") { title = "About"; content = <About />; }
  else { title = "Page not found"; content = <Missing what="page" />; }

  // Route changes: reset scroll, update the document title, and move focus to the main area
  // (except on the very first load) so screen-reader users hear that the page changed.
  useEffect(() => {
    main.current?.scrollTo(0, 0);
    if (!user) return;
    document.title = `${title} · PyPath`;
    if (firstRoute.current) { firstRoute.current = false; return; }
    main.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path, user]);

  if (!online) {
    return <Offline />;
  }

  if (!user) {
    return <Welcome onStart={(name) => { setUser(name); navigate("/dashboard"); }} />;
  }

  const fill = lessonView || page === "compiler";
  const variant = lessonView || (page === "lessons" && route.id) || (page === "projects" && route.id) ? "lesson" : page === "compiler" ? "editor" : page === "dashboard" ? "dashboard" : "cards";
  return (
    <div className="app">
      <button className="skip" onClick={() => main.current?.focus()}>Skip to content</button>
      <Header title={title} showCompilerToggle={lessonView} />
      <div className="body">
        <Sidebar page={page} activeId={activeId} />
        <main className={`main ${fill ? "fill" : ""}`} ref={main} id="main" tabIndex={-1}>
          <Suspense fallback={<PageSkeleton variant={variant} />}><div className={`route ${fill ? "route-fill" : ""}`} key={route.path}>{content}</div></Suspense>
        </main>
      </div>
      <ProgressPopup />
      <Toast />
    </div>
  );
}

export default function App() {
  return (<AppProvider><Shell /></AppProvider>);
}
