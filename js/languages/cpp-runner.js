import { register } from './registry.js';
import { t } from '../i18n.js';

const DEFAULT_CODE = `\
#include <iostream>
#include <vector>
using namespace std;

// solve получает граф, выводит результат через cout.
//   n        — количество вершин
//   m        — количество рёбер
//   edges    — vector пар {u, v} (нумерация с 1)
//   directed — true если граф ориентированный

void solve(int n, int m, vector<pair<int,int>>& edges, bool directed) {
    // Пример: степени вершин
    vector<int> deg(n + 1, 0);
    for (auto& [u, v] : edges) {
        deg[u]++;
        deg[v]++;
    }
    for (int i = 1; i <= n; i++) {
        cout << "Vertex " << i << ": degree " << deg[i] << endl;
    }
}
`;

register({
  id: 'cpp',
  name: 'C++',
  codemirrorMode: 'text/x-c++src',
  defaultCode: DEFAULT_CODE,
  fileLabel: 'script.cpp',
  async run(code, graphData) {
    const { n, m, edges, directed } = graphData;

    const edgesInit = edges.map(([u, v]) => `{${u}, ${v}}`).join(', ');

    const fullCode =
      code +
      `
int main() {
    int n = ${n}, m = ${m};
    vector<pair<int,int>> edges = {${edgesInit}};
    bool directed = ${directed};
    solve(n, m, edges, directed);
    return 0;
}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const resp = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compiler: 'gcc-head',
          code: fullCode,
          'compiler-option-raw': '-std=c++17\n-O2',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await resp.json();

      if (data.compiler_error) {
        return { success: false, error: data.compiler_error };
      }
      if (data.program_error) {
        return { success: false, error: data.program_error };
      }
      return {
        success: true,
        result: data.program_output || '(empty output)',
      };
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        return { success: false, error: t('error.timeout') };
      }
      return { success: false, error: err.message };
    }
  },
});
