import { register } from './registry.js';
import { t } from '../i18n.js';

const DEFAULT_CODE = `\
# Функция solve принимает граф и возвращает результат.
# Параметры:
#   n        — количество вершин
#   m        — количество рёбер
#   edges    — список пар (u, v), нумерация с 1
#   directed — True если граф ориентированный
#
# Верните результат: число, строку, список — что угодно.

def solve(n, m, edges, directed):
    # Пример: степени вершин
    deg = [0] * (n + 1)
    for u, v in edges:
        deg[u] += 1
        deg[v] += 1
    return '\\n'.join(f'Вершина {i+1}: степень {deg[i+1]}' for i in range(n))
`;

let worker = null;

register({
  id: 'python',
  name: 'Python',
  codemirrorMode: 'python',
  defaultCode: DEFAULT_CODE,
  fileLabel: 'script.py',
  run(code, graphData) {
    return new Promise((resolve) => {
      if (!worker) {
        worker = new Worker('js/languages/py-worker.js');
      }

      const timer = setTimeout(() => {
        worker.terminate();
        worker = null;
        resolve({ success: false, error: t('error.timeout') });
      }, 30000);

      function onMessage(e) {
        clearTimeout(timer);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        resolve(e.data);
      }

      function onError(e) {
        clearTimeout(timer);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        worker.terminate();
        worker = null;
        resolve({ success: false, error: e.message });
      }

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);

      worker.postMessage({ code, graphData });
    });
  },
});
