importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

let pyodide = null;

async function ensurePyodide() {
  if (!pyodide) {
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });
  }
  return pyodide;
}

self.onmessage = async function (e) {
  const { code, graphData } = e.data;
  const { n, m, edges, directed } = graphData;

  try {
    const py = await ensurePyodide();

    // Pass data through Pyodide globals instead of string interpolation
    py.globals.set('_n', n);
    py.globals.set('_m', m);
    py.globals.set('_edges_json', JSON.stringify(edges));
    py.globals.set('_directed', directed);

    const fullCode = `
import json as _json

n = int(_n)
m = int(_m)
edges = [tuple(e) for e in _json.loads(_edges_json)]
directed = bool(_directed)

${code}

_result = solve(n, m, edges, directed)
`;

    py.runPython(fullCode);
    const result = py.globals.get('_result');

    let output;
    if (result === undefined || result === null || result.toString === undefined) {
      output = String(result);
    } else {
      output = result.toString();
    }
    // Clean up Python reference if it's a proxy
    if (result && typeof result.destroy === 'function') {
      result.destroy();
    }

    // Clean up injected globals
    py.globals.delete('_n');
    py.globals.delete('_m');
    py.globals.delete('_edges_json');
    py.globals.delete('_directed');

    self.postMessage({ success: true, result: output });
  } catch (err) {
    self.postMessage({ success: false, error: err.toString() });
  }
};
