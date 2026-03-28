# Примеры скриптов

Скопируйте любой пример в редактор и нажмите «Запуск».

## Степени вершин

```javascript
function solve(n, m, edges) {
  const deg = new Array(n + 1).fill(0);
  for (const [u, v] of edges) {
    deg[u]++;
    deg[v]++;
  }
  return deg.slice(1)
    .map((d, i) => `Вершина ${i + 1}: степень ${d}`)
    .join('\n');
}
```

## BFS — кратчайший путь от вершины 1

```javascript
function solve(n, m, edges, directed) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    if (!directed) adj[v].push(u);
  }

  const dist = new Array(n + 1).fill(-1);
  dist[1] = 0;
  const queue = [1];

  for (let i = 0; i < queue.length; i++) {
    const u = queue[i];
    for (const v of adj[u]) {
      if (dist[v] === -1) {
        dist[v] = dist[u] + 1;
        queue.push(v);
      }
    }
  }

  return dist.slice(1)
    .map((d, i) => `1 → ${i + 1}: ${d === -1 ? '∞' : d}`)
    .join('\n');
}
```

## Компоненты связности

```javascript
function solve(n, m, edges) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const comp = new Array(n + 1).fill(0);
  let count = 0;

  for (let start = 1; start <= n; start++) {
    if (comp[start]) continue;
    count++;
    const stack = [start];
    while (stack.length) {
      const u = stack.pop();
      if (comp[u]) continue;
      comp[u] = count;
      for (const v of adj[u]) {
        if (!comp[v]) stack.push(v);
      }
    }
  }

  const groups = {};
  for (let i = 1; i <= n; i++) {
    (groups[comp[i]] ??= []).push(i);
  }

  return Object.entries(groups)
    .map(([id, verts]) => `Компонента ${id}: {${verts.join(', ')}}`)
    .join('\n');
}
```

## Обнаружение цикла (DFS)

```javascript
function solve(n, m, edges, directed) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    if (!directed) adj[v].push(u);
  }

  const color = new Array(n + 1).fill(0); // 0=white 1=gray 2=black
  const parent = new Array(n + 1).fill(-1);
  let cycleEnd = -1, cycleStart = -1;

  function dfs(u) {
    color[u] = 1;
    for (const v of adj[u]) {
      if (!directed && v === parent[u]) continue;
      if (color[v] === 1) {
        cycleEnd = u;
        cycleStart = v;
        return true;
      }
      if (color[v] === 0) {
        parent[v] = u;
        if (dfs(v)) return true;
      }
    }
    color[u] = 2;
    return false;
  }

  for (let i = 1; i <= n; i++) {
    if (color[i] === 0 && dfs(i)) break;
  }

  if (cycleStart === -1) return 'Циклов нет';

  const cycle = [cycleStart];
  for (let v = cycleEnd; v !== cycleStart; v = parent[v]) {
    cycle.push(v);
  }
  cycle.push(cycleStart);
  cycle.reverse();

  return `Цикл: ${cycle.join(' → ')}`;
}
```

## Топологическая сортировка

```javascript
function solve(n, m, edges, directed) {
  if (!directed) return 'Только для ориентированных графов';

  const adj = Array.from({ length: n + 1 }, () => []);
  const indeg = new Array(n + 1).fill(0);

  for (const [u, v] of edges) {
    adj[u].push(v);
    indeg[v]++;
  }

  const queue = [];
  for (let i = 1; i <= n; i++) {
    if (indeg[i] === 0) queue.push(i);
  }

  const order = [];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    for (const v of adj[u]) {
      if (--indeg[v] === 0) queue.push(v);
    }
  }

  if (order.length < n) return 'Невозможно: граф содержит цикл';
  return `Порядок: ${order.join(' → ')}`;
}
```

## Проверка на двудольность

```javascript
function solve(n, m, edges) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const side = new Array(n + 1).fill(-1);
  const parts = [[], []];

  for (let start = 1; start <= n; start++) {
    if (side[start] !== -1) continue;
    side[start] = 0;
    const queue = [start];

    for (let i = 0; i < queue.length; i++) {
      const u = queue[i];
      parts[side[u]].push(u);
      for (const v of adj[u]) {
        if (side[v] === -1) {
          side[v] = 1 - side[u];
          queue.push(v);
        } else if (side[v] === side[u]) {
          return `Не двудольный: конфликт на ребре ${u}—${v}`;
        }
      }
    }
  }

  return `Двудольный\nДоля A: {${parts[0].join(', ')}}\nДоля B: {${parts[1].join(', ')}}`;
}
```

## Мосты

```javascript
function solve(n, m, edges) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  const visited = new Array(n + 1).fill(false);
  const tin = new Array(n + 1).fill(0);
  const low = new Array(n + 1).fill(0);
  let timer = 0;
  const bridges = [];

  function dfs(u, parent) {
    visited[u] = true;
    tin[u] = low[u] = timer++;
    for (const v of adj[u]) {
      if (v === parent) continue;
      if (visited[v]) {
        low[u] = Math.min(low[u], tin[v]);
      } else {
        dfs(v, u);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] > tin[u]) bridges.push([u, v]);
      }
    }
  }

  for (let i = 1; i <= n; i++) {
    if (!visited[i]) dfs(i, -1);
  }

  if (!bridges.length) return 'Мостов нет';
  return `Мосты (${bridges.length}):\n` +
    bridges.map(([u, v]) => `  ${u}—${v}`).join('\n');
}
```

## Матрица смежности

```javascript
function solve(n, m, edges, directed) {
  const mx = Array.from({ length: n }, () => new Array(n).fill(0));
  for (const [u, v] of edges) {
    mx[u - 1][v - 1] = 1;
    if (!directed) mx[v - 1][u - 1] = 1;
  }

  const hdr = '    ' + Array.from({ length: n }, (_, i) =>
    String(i + 1).padStart(2)).join(' ');
  const rows = mx.map((row, i) =>
    String(i + 1).padStart(2) + ': ' + row.map(v => String(v).padStart(2)).join(' '));

  return hdr + '\n' + rows.join('\n');
}
```
