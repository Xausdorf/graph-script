# Graph Script Editor

Interactive web app for building graphs (vertices + edges) and running JavaScript scripts on them.

## Quick start

```bash
python -m http.server 8080
# open http://localhost:8080
```

No build step. All dependencies loaded via CDN (Cytoscape.js, CodeMirror 5).

## Project structure

```
index.html          — entry point, CDN deps
css/style.css       — dark theme layout
js/
  app.js            — init: wires graph, editor, UI together
  graph.js          — Cytoscape: vertices, edges, renumbering, serialization
  editor.js         — CodeMirror 5: setup, get/set code
  ui.js             — button handlers, interaction modes (move/add-edge/delete)
  i18n.js           — localization (ru/en), language toggle, translations
  runner.js         — launches Web Worker, 5s timeout
  worker.js         — sandbox: executes user code via new Function()
  physics.js        — spring physics for edge wobble on drag
  resizer.js        — draggable panel dividers (vertical + horizontal)
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
- User scripts run in a Web Worker (isolated, 5s timeout)
- Linting: ESLint with recommended config, run `npx eslint js/`
- Formatting: Prettier, run `npx prettier --write .`

## Commands

```bash
npx eslint js/              # lint
npx prettier --check .      # check formatting
npx prettier --write .      # fix formatting
```
