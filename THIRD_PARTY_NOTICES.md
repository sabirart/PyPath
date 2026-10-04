# Third-Party Notices

PyPath is proprietary software. The third-party components below remain under their respective licenses. Nothing in the PyPath proprietary license changes those third-party rights.

## Python runtime

### Pyodide 0.27.4
- Project: Pyodide
- License: Mozilla Public License 2.0 (MPL-2.0)
- Pyodide is loaded at runtime from the official jsDelivr CDN; it is not bundled into this PyPath source package.
- Official project: https://github.com/pyodide/pyodide
- PyPath uses the standard Pyodide browser runtime and Python standard library supplied by the upstream release.

## Direct JavaScript dependencies

| Package | Version range in PyPath | License |
|---|---|---|
| @codemirror/commands | ^6.5.0 | MIT |
| @codemirror/lang-python | ^6.1.6 | MIT |
| @codemirror/language | ^6.10.1 | MIT |
| @codemirror/state | ^6.4.1 | MIT |
| @codemirror/view | ^6.26.3 | MIT |
| @fontsource-variable/inter | ^5.0.20 | SIL Open Font License 1.1 |
| @fontsource-variable/jetbrains-mono | ^5.0.21 | SIL Open Font License 1.1 |
| @lezer/highlight | ^1.2.0 | MIT |
| codemirror | ^6.0.1 | MIT |
| lucide-react | ^0.383.0 | ISC |
| react | ^18.3.1 | MIT |
| react-dom | ^18.3.1 | MIT |
| @vitejs/plugin-react | ^4.3.1 | MIT |
| vite | ^5.4.0 | MIT |

## Transitive dependencies

PyPath also includes transitive npm dependencies resolved by `package-lock.json`. Their individual licenses are not replaced by the PyPath license. The exact installed dependency graph and package versions are recorded in `package-lock.json`; each package's published license metadata remains authoritative.

## Fonts

Inter and JetBrains Mono are distributed through the Fontsource packages listed above. They are subject to the SIL Open Font License 1.1. The font files are not covered by the PyPath proprietary software restrictions.

## Pyodide runtime use

Pyodide remains a third-party component under MPL-2.0. PyPath does not claim ownership of Pyodide. The browser compiler loads it from the official CDN when the user runs Python. PyPath does not upload learner Python code to a PyPath backend.

For authoritative license texts and copyright notices, consult the corresponding upstream package distributions. PyPath does not remove or modify third-party license terms.
