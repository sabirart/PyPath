# PyPath - Learn Python. Step by Step.

A lightweight single-page **30-day Python challenge**: 25 daily classes (Days 1-25, Basic to Advanced Python), 5 practical projects (Days 26-30) and a free compiler. Python runs **inside your browser** using Pyodide (WebAssembly). There is no backend, account, database, analytics or tracking.

## Prerequisites
- Node.js 18 or newer (npm included)
- An internet connection the first time Python is used (Pyodide is downloaded from the jsDelivr CDN and cached by the browser)

## Install and run
```bash
npm install
npm run dev        # development server, usually http://localhost:5173
npm test           # checks the course data contract (25 classes + 5 projects, all required fields)
npm run build      # production build into dist/
npm run preview    # serve dist/ locally to check the production build
```

## Deploy (static hosting)
Upload the `dist/` folder, or connect the repository to a free host.
- **Netlify / Vercel:** build command `npm run build`, output directory `dist`.
- **GitHub Pages:** publish the contents of `dist/`. The site uses `base: "./"` and hash routes (`#/lessons/l01`), so it works from a sub-folder with no server rewrite rules.

## Project layout
`src/data/lessons.json` holds all course content. Navigation, the sidebar, progress and the project list are generated from it. Item ids (`l01` - `l30`) equal the day number and are used as storage keys. Days 1-25 are classes (`kind: "lesson"`); Days 26-30 are projects (`kind: "project"`, Day 30 is the Final Project).

## Lesson status
Each day is **Completed**, **Pending** or **Not started**. Opening a day never changes its status. Pressing **Start Day** makes it the single Pending day (any other pending day goes back to Not started). **Mark Complete** is only available for the pending day. Future days can always be previewed, and earlier days never need to be finished first.

## Privacy and storage
Everything stays in your browser. Keys used in `localStorage`:

| Key | Purpose |
| --- | --- |
| `pypath_user` | first name |
| `pypath_progress_<id>` | `completed` |
| `pypath_active` | the one Pending day |
| `pypath_days` | dates a day was completed (for the streak) |
| `pypath_schema` | storage version (migrates saved code from the old numbering) |
| `pypath_code_<lessonId>` | your code for that lesson (`pypath_code_free` for the Free Compiler) |
| `pypath_last_lesson` | where Continue takes you |
| `pypath_theme` | `dark` (default) or `light` |
| `pypath_fontsize` | text size step |

If storage is blocked, PyPath keeps working from memory for that visit. "Reset progress" removes only progress, saved code and the last-lesson pointer.

Your code is executed locally by Pyodide and is never uploaded. The only network request PyPath makes is downloading the Pyodide files. Python code in the lessons cannot call web APIs; the API lesson uses sample JSON.

## Known limits
- Python runs on the main thread, so an endless loop in your own code will freeze the tab until it is closed or refreshed.
- `input()` is interactive: the prompt appears in the Output panel with an inline field, and the answer is echoed like a terminal. Internally the program is replayed from the top with each new answer (with a fixed random seed per run), so code with side effects other than printing may repeat them.
- Files created by lesson code live in temporary browser memory and vanish on refresh.
- Inter and JetBrains Mono are bundled with the app through npm (`@fontsource-variable/*`), so no font is requested from a third party.

## Layout
- **Lesson screens (1180px and wider):** the lesson scrolls on the left while the editor and output stay fixed on the right. Drag the dividers (or focus one and use the arrow keys) to resize the panes. The editor button in the header hides or shows the editor.
- **Narrower screens:** a Lesson / Code switch shows one full-height pane at a time, so there is no scrolling down to find the editor.
- **Progress:** a small pill at the bottom right shows completed/total. Select it to open a card with the percentage, counts, a clickable map of all 30 days, Continue and Reset.
- Scrollbars are thin and themed. The course outline starts open on screens 1360px and wider.

## Accessibility
Semantic landmarks, no focus rings (a soft background tint marks keyboard focus), keyboard access to every control, focus trapping in the name dialog and in drawers, `Esc` to close, `Esc` to leave the editor, status shown with icon plus text, text size controls and full dark mode.

## Side panel
Choosing anything in the course outline opens it and hides the panel. Use the panel button in the header to bring it back.

## Lazy loading
The first screen loads only the core app. Dashboard, Lesson, Projects, Compiler and the code editor are separate chunks, fetched on first visit with a skeleton placeholder, then prefetched while the browser is idle. Python itself (Pyodide) downloads only when needed. A small branded loader in `index.html` shows before the app starts.

## Deployment

PyPath is a static Vite application and is ready for GitHub or Render.

### Local production check

```bash
npm ci
npm run test
npm run build
npm run preview
```

The production files are generated in `dist/`.

### Render

A `render.yaml` Blueprint is included. Render can build the site with `npm ci && npm run build` and publish `dist/` as a static site.

### GitHub

Commit the project files (excluding `node_modules/` and `dist/`) to a repository. Because navigation uses hash routes, the site works on static hosting without server-side route rewrites.
