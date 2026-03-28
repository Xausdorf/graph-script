const DEFAULT_CODE = `// Функция solve принимает граф и возвращает результат.
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

function initEditor(containerId) {
  const editor = CodeMirror(document.getElementById(containerId), {
    value: DEFAULT_CODE,
    mode: 'javascript',
    theme: 'monokai',
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    indentWithTabs: false,
  });
  return editor;
}

function getCode(editor) {
  return editor.getValue();
}

function setCode(editor, code) {
  editor.setValue(code);
}

export { initEditor, getCode, setCode };
