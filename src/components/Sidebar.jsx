import { useRef } from "react";
import { LayoutDashboard, Folder, Terminal, Info } from "lucide-react";
import { pathFor } from "../router";
import { useApp } from "../context/AppContext";
import useFocusTrap from "../hooks/useFocusTrap";
import StatusIcon from "./StatusIcon";

export default function Sidebar({ page, activeId }) {
  const { lessons, progress, bp, panels, togglePanel } = useApp();
  const ref = useRef(null);
  const open = panels.sidebar;
  const overlay = bp !== "desktop" && open;
  const close = () => togglePanel("sidebar", false);
  useFocusTrap(ref, overlay, close);

  const parts = [];
  lessons.forEach((l) => {
    let g = parts[parts.length - 1];
    if (!g || g.name !== l.part) { g = { name: l.part, items: [] }; parts.push(g); }
    g.items.push(l);
  });
  const nav = [
    { href: "#/dashboard", label: "Dashboard", icon: LayoutDashboard, on: page === "dashboard" },
    { href: "#/projects", label: "Projects", icon: Folder, on: page === "projects" && !activeId },
    { href: "#/compiler", label: "Free Compiler", icon: Terminal, on: page === "compiler" },
    { href: "#/about", label: "About", icon: Info, on: page === "about" },
  ];
  // Choosing anything in the panel opens it and hides the panel so the person can focus.
  const onNav = () => close();

  return (
    <>
      {overlay && <div className="backdrop" onClick={close} aria-hidden="true" />}
      <aside className="sidebar" data-bp={bp} data-open={open} ref={ref} aria-label="Course outline">
        <div className="sidebar-inner">
          <nav aria-label="Main">
            {nav.map(({ href, label, icon: Icon, on }) => (
              <a key={href} href={href} className="nav-link" aria-current={on ? "page" : undefined} onClick={onNav} title={label}>
                <Icon size={18} /><span className="label">{label}</span>
              </a>
            ))}
          </nav>
          <nav aria-label="Lessons">
            {parts.map((g, i) => (
              <div key={g.name} className="part">
                <h2 className="part-title label">{g.name} &middot; Days {g.items[0].day}&ndash;{g.items[g.items.length - 1].day}</h2>
                <ul>
                  {g.items.map((l) => (
                    <li key={l.id}>
                      <a href={`#${pathFor(l)}`} className="nav-link lesson-link" aria-current={activeId === l.id ? "page" : undefined} onClick={onNav} title={`Day ${l.day}. ${l.title}`}>
                        <span className="num">{l.number}</span>
                        <span className="label lesson-name">{l.title}</span>
                        <StatusIcon status={progress[l.id] || "not-started"} size={15} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
