import { register } from './registry.js';
import { t } from '../i18n.js';

const DEFAULT_CODE = `\
// Функция solve принимает граф и возвращает результат.
// Параметры:
//   n        — количество вершин
//   m        — количество рёбер
//   edges    — массив пар [u, v] (нумерация с 1)
//   directed — true если граф ориентированный
//
// Верните результат: число, строку, массив — что угодно.

function solve(n, m, edges, directed) {
  // Пример: степени вершин
  const deg = new Array(n + 1).fill(0);
  for (const [u, v] of edges) {
    deg[u]++;
    deg[v]++;
  }
  return deg.slice(1)
    .map((d, i) => \`Вершина \${i + 1}: степень \${d}\`)
    .join('\\n');
}
`;

register({
  id: 'javascript',
  name: 'JavaScript',
  codemirrorMode: 'javascript',
  defaultCode: DEFAULT_CODE,
  fileLabel: 'script.js',
  run(code, graphData) {
    return new Promise((resolve) => {
      const worker = new Worker('js/worker.js');

      const timer = setTimeout(() => {
        worker.terminate();
        resolve({ success: false, error: t('error.timeout') });
      }, 5000);

      worker.onmessage = (e) => {
        clearTimeout(timer);
        worker.terminate();
        resolve(e.data);
      };

      worker.onerror = (e) => {
        clearTimeout(timer);
        worker.terminate();
        resolve({ success: false, error: e.message });
      };

      worker.postMessage({ code, graphData });
    });
  },
});
