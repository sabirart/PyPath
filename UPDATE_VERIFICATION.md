# PyPath Update Verification

Source updated according to `PyPath_Complete_Update.pdf`.

## Automated verification

- `npm test`: PASS
- Test cases: 10
- Failed: 0
- Cancelled: 0
- Python lesson/project snippets syntax-checked: 90
- Lesson/project data contract: PASS
- Hash routing and invalid-route parsing: PASS
- localStorage memory fallback: PASS
- Project 1 sample input order: PASS
- Final project export wording: PASS
- Worker execution architecture checks: PASS
- Worker timeout: 10 seconds
- Worker cancellation/termination: PASS
- Worker-side input handling: PASS

## Source-level audit verification

- Pyodide no longer initializes automatically after compiler/lesson page load.
- Python execution moved into a dedicated Web Worker.
- Worker timeout and Stop/Cancel path implemented.
- SharedArrayBuffer input path implemented for cross-origin-isolated hosting.
- Worker-side compatibility input path retained for hosts without cross-origin isolation.
- Lesson/editor localStorage writes debounced.
- Page-chunk idle prefetch removed.
- Hidden lesson/code panes use inert focus management.
- Visible keyboard focus indicators restored.
- Console changed from full-output aria-live to a dedicated status announcement.
- Clipboard failure fallback added.
- Download failures surface a concise user message.
- Project 1 sample input corrected to `12`, `3`, `+`.
- Final project wording/code changed from misleading persistent-style saving to JSON export/display.
- API lesson example made location-neutral.
- README claims updated to match implementation.
- Obsolete main-thread Pyodide service removed.

## Production build

`npm run build` was attempted but could not execute because Vite is not installed in the provided build environment. `npm ci` was also attempted twice; the environment timed out while downloading dependencies. No build result is being fabricated.

Run in a normal Node/npm environment:

```bash
npm ci
npm test
npm run build
```

The source package is otherwise ready for that final production-build verification.


## 2026-10-03 Compiler UX Update
- Removed the duplicate top-toolbar compiler state badge; status is now shown once inside the Output area.
- Increased execution timeout from 10 seconds to 30 seconds.
- Timeout feedback now tells the user to check the code and run it again.
- Python input prompts are sent to the UI before the worker waits, so prompts such as `Write your name:` and `Name:` remain visible before the answer is entered.
- Kept all other product behavior unchanged.
- Automated tests: 12/12 passed.
