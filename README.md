# PyPath - Learn Python. Step by Step.

A lightweight single-page **30-lesson Python developer course**: 30 lessons from Python fundamentals through professional engineering, plus 5 separate project checkpoints. Projects are completed alongside the relevant lessons and do not consume extra days. Python runs **inside your browser** using Pyodide (WebAssembly). There is no backend, account, database, analytics or tracking.

## Prerequisites
- Node.js 18 or newer (npm included)
- PyPath is an online website. The learning interface can load without the compiler, but Python execution requires an internet connection because Pyodide is loaded from the official CDN.

## Install and run
```bash
npm install
npm run dev        # development server, usually http://localhost:5173
npm test           # course data contract, progress rules, worker/hook behaviour checks (needs python3 on PATH)
npm run build       # builds the online static website
npm run preview    # serve dist/ locally to check the production build
```

## Deploy (static hosting)
Upload the `dist/` folder, or connect the repository to a free host. No special response headers or server rewrites are needed.
- **Netlify / Vercel:** build command `npm run build`, output directory `dist`.
- **GitHub Pages:** publish the contents of `dist/`. The site uses `base: "./"` and hash routes (`#/lessons/l01`; `#/lessons` shows the course overview), so it works from a sub-folder with no server rewrite rules.

## Project layout
`src/data/lessons.json` holds all course content. Navigation, the sidebar, progress and the project list are generated from it. Lesson ids (`l01` - `l30`) equal the day number. Project checkpoints use `p01` - `p05` and have no day number. Each project records the lesson after which it is recommended, so projects reinforce the concepts instead of becoming a separate final-stage course.

## Lesson status
Each lesson is **Completed**, **In Progress**, **Pending** (the next class, unlocked and waiting for Start) or **Not started**. Opening a lesson never changes its status. Pressing **Start Lesson** makes it the single In Progress lesson. **Mark Complete** is only available for the active lesson. Future lessons can be previewed, and earlier lessons do not need to be finished first.

## License and protection
PyPath is **proprietary software**. Copyright (c) 2026 Sabir Hussain. All rights reserved. See `LICENSE`: visitors may use the website to learn, but nobody may copy, modify, host or redistribute the code or lesson content without written permission. Third-party components keep their own licences (`THIRD_PARTY_NOTICES.md`).

What the project does to protect the work:
- `LICENSE` (strict, all rights reserved), `"license": "UNLICENSED"` and `"private": true` in `package.json`, and a copyright header in every source file and in the built JavaScript.
- No source maps are published (`sourcemap: false`), and production code is minified.
- Security headers (`public/_headers` for Netlify/Cloudflare, `render.yaml` for Render): no framing of the site (clickjacking), no MIME sniffing, HTTPS-only, restricted browser features.

Important limits: a website's JavaScript is delivered to every visitor's browser, so it can always be viewed and copied technically. Minifying is not encryption. The licence is what makes copying illegal; the technical steps only make it harder. Keep the **GitHub repository private** so the readable source is never public. Visitors cannot change your live site; only people with access to your hosting and repository can.

## Privacy and storage
Everything stays in your browser. Keys used in `localStorage`:

| Key | Purpose |
| --- | --- |
| `pypath_user` | first name |
| `pypath_progress_<id>` | `completed` |
| `pypath_active` | the one In Progress lesson |
| `pypath_pending` | the Pending day (next class after the last one completed) |
| `pypath_days` | dates a day was completed (for the streak) |
| `pypath_schema` | storage version (migrates saved code from the old numbering) |
| `pypath_code_<lessonId>` | your code for that lesson (`pypath_code_free` for the Free Compiler) |
| `pypath_last_lesson` | where Continue takes you |
| `pypath_theme` | `dark` (default) or `light` |
| `pypath_fontsize` | text size step |

If storage is blocked, PyPath keeps working from memory for that visit. "Reset progress" removes only progress, saved code and the last-lesson pointer.

Your code is executed in the browser by Pyodide from the official jsDelivr CDN and is not uploaded to a PyPath backend. PyPath does not provide a backend, analytics, or tracking service. The Python compiler requires an internet connection to load Pyodide and its standard library.

## Known limits
- Python runs inside a dedicated Web Worker, so user code cannot block React rendering. Programs are stopped after 30 seconds of running (loading the online runtime is separate from program execution) and can be cancelled with Stop.
- Output is capped at 200,000 characters per run.
- `input()` works by **replaying**: each time the program asks for an answer it does not have yet, the run stops, the console shows an inline field, and the program is run again from the top with all answers so far. A fixed random seed per session keeps replays identical. Side effects (printing, file writes) therefore repeat on each replay, and time-dependent code such as `datetime.now()` can differ between replays.
- Pyodide is loaded from the official jsDelivr CDN only when the compiler is used. Opening lessons does not initialize Python. The compiler requires an internet connection; no local Pyodide runtime or runtime download step is included in the project.
- Files created by lesson code live in temporary browser memory and vanish on refresh.
- Inter and JetBrains Mono are bundled with the app through npm (`@fontsource-variable/*`), so no font is requested from a third party.

## Layout
- **Lesson screens (1180px and wider):** the lesson scrolls on the left while the editor and output stay fixed on the right. Drag the dividers (or focus one and use the arrow keys) to resize the panes. The editor button in the header hides or shows the editor.
- **Narrower screens:** a Lesson / Code switch shows one full-height pane at a time, so there is no scrolling down to find the editor.
- **Progress:** a small pill at the bottom right shows completed/total. Select it to open a card with the percentage, counts, a clickable map of all 30 lessons, Continue and Reset.
- Scrollbars are thin and themed. The course outline starts open on screens 1360px and wider.

## Accessibility
Semantic landmarks, visible keyboard focus indicators, keyboard access to every control, focus trapping in the name dialog and drawers, `Esc` to close, `Esc` to leave the editor, status shown with icon plus text, text size controls and full dark mode.

## Side panel
Choosing anything in the course outline opens it and hides the panel. Use the panel button in the header to bring it back.

## Lazy loading
The first screen loads only the core app. Dashboard, Lesson, Projects, Compiler and the code editor are separate chunks and are fetched when first needed with a skeleton placeholder. Python itself (Pyodide) is loaded from the official online CDN only when the user runs code. The compiler requires an internet connection. A small branded loader in `index.html` shows before the app starts.

## Deployment

PyPath is a static Vite application and is ready for GitHub or Render.

### Local production check

```bash
npm ci
npm run test
npm run build
npm run build
npm run preview
```

The production files are generated in `dist/`.

### Render

A `render.yaml` Blueprint is included. Render can build the site with `npm ci && npm run build` and publish `dist/` as a static site.

### GitHub

Commit the project files (excluding `node_modules/` and `dist/`) to a repository. Because navigation uses hash routes, the site works on static hosting without server-side route rewrites.
