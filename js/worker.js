self.onmessage = function (e) {
  const { code, graphData } = e.data;
  const { n, m, edges, directed } = graphData;
  try {
    const wrappedCode = code + '\nreturn solve(n, m, edges, directed);';
    const fn = new Function('n', 'm', 'edges', 'directed', wrappedCode);
    const result = fn(n, m, edges, directed);

    let output;
    if (result === undefined || result === null) {
      output = String(result);
    } else if (Array.isArray(result)) {
      output = result.join('\n');
    } else if (typeof result === 'object') {
      output = JSON.stringify(result, null, 2);
    } else {
      output = String(result);
    }
    self.postMessage({ success: true, result: output });
  } catch (err) {
    self.postMessage({ success: false, error: err.toString() });
  }
};
