# Graph Script Editor

Interactive web app for building graphs (vertices + edges) and running scripts on them (JavaScript, C++, Python).

## Quick start

```bash
python -m http.server 8080
# open http://localhost:8080
```

No build step. All dependencies loaded via CDN (Cytoscape.js, CodeMirror 5).

## Project structure

```
index.html          — entry point, CDN deps, a11y attrs, CDN fallback check
css/style.css       — dark theme layout
js/
  app.js            — init: wires graph, editor, UI, physics together
  graph.js          — Cytoscape: vertices, edges, renumbering, serialization
  editor.js         — CodeMirror 5: setup, get/set code
  ui.js             — button handlers, interaction modes (move/add-edge/delete)
  i18n.js           — localization (ru/en), language toggle, translations
  runner.js         — dispatches run to selected language runner (with fallback)
  worker.js         — JS sandbox: executes user code via new Function()
  physics.js        — spring physics for edge wobble on drag, exposes resetSprings
  resizer.js        — draggable panel dividers (mouse + touch)
  languages/
    registry.js     — language registry (register/list/get, throws on unknown id)
    js-runner.js    — JavaScript runner (Web Worker, 5s timeout)
    cpp-runner.js   — C++ runner (Wandbox API, 15s timeout)
    py-runner.js    — Python runner (Pyodide, 30s timeout)
    py-worker.js    — Python Web Worker (passes data via Pyodide globals)
tests/
  app.spec.js       — Playwright e2e tests (6 scenarios)
playwright.config.js — Playwright config (auto-starts http server)
```

## Script contract

User code must define `function solve(n, m, edges, directed)` where:

- `n` — vertex count
- `m` — edge count
- `edges` — array of `[u, v]` pairs (1-indexed)
- `directed` — boolean, true if graph is directed

Return value is displayed as-is (string, number, array, object).

## Key conventions

- No build tools — pure ES modules + CDN
- Graph vertices are always numbered 1..n (renumbered on deletion)
- Directed/undirected toggle (directed by default)
- User scripts run in a Web Worker (isolated, with per-language timeouts)
- C++ runner sends code to wandbox.org (external API)
- Worker paths use `import.meta.url` for correct resolution under subpaths
- localStorage calls are wrapped in try/catch (private browsing safety)
- Linting: ESLint with recommended config
- Formatting: Prettier

## Commands

```bash
npx eslint js/              # lint
npx prettier --check .      # check formatting
npx prettier --write .      # fix formatting
npm test                    # run Playwright e2e tests
npm run test:ui             # run tests with Playwright UI
```
