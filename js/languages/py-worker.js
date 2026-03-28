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

    // Convert edges to Python list of tuples
    const edgesPy = JSON.stringify(edges);

    const fullCode = `
import json as _json

n = ${n}
m = ${m}
edges = [tuple(e) for e in _json.loads('${edgesPy}')]
directed = ${directed ? 'True' : 'False'}

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

    self.postMessage({ success: true, result: output });
  } catch (err) {
    self.postMessage({ success: false, error: err.toString() });
  }
};
