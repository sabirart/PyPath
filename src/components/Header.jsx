// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import { PanelLeft, Sun, Moon, ZoomIn, ZoomOut, SquareTerminal } from "lucide-react";
import { useApp } from "../context/AppContext";
import BrandLogo from "./BrandLogo";

function Toggle({ icon: Icon, label, on, onClick }) {
  return (
    <button className={`icon-btn ${on ? "is-on" : ""}`} onClick={onClick} aria-label={label} aria-pressed={on} title={label}>
      <Icon size={19} />
    </button>
  );
}

export default function Header({ title, showCompilerToggle }) {
  const { panels, togglePanel, theme, toggleTheme, changeFont, fontIdx, fontMax, bp } = useApp();
  return (
    <header className="header">
      <Toggle icon={PanelLeft} label="Course outline" on={panels.sidebar} onClick={() => togglePanel("sidebar")} />

      <a href="#/dashboard" className="logo desktop-logo" aria-label="PyPath home"><BrandLogo /></a>

      <div className="mobile-brand" aria-label={`PyPath, ${title}`}>
        <a href="#/dashboard" className="mobile-brand-mark" aria-label="PyPath home"><BrandLogo compact /></a>
        <div className="mobile-brand-copy">
          <span className="mobile-site-name">PyPath</span>
          <span className="mobile-page-name">{title}</span>
        </div>
      </div>

      <span className="header-sep" aria-hidden="true" />
      <h1 className="header-title">{title}</h1>
      <div className="header-actions">
        {bp !== "mobile" && (
          <>
            <button className="icon-btn" onClick={() => changeFont(-1)} disabled={fontIdx === 0} aria-label="Decrease text size" title="Decrease text size"><ZoomOut size={19} /></button>
            <button className="icon-btn" onClick={() => changeFont(1)} disabled={fontIdx === fontMax} aria-label="Increase text size" title="Increase text size"><ZoomIn size={19} /></button>
          </>
        )}
        {showCompilerToggle && <Toggle icon={SquareTerminal} label="Code editor" on={panels.compiler} onClick={() => togglePanel("compiler")} />}
        <button className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title="Theme">
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
}
