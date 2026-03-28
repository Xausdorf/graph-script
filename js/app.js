import { initGraph } from './graph.js';
import { initEditor } from './editor.js';
import { initUI } from './ui.js';
import { initPhysics } from './physics.js';
import { initResizers } from './resizer.js';

document.addEventListener('DOMContentLoaded', () => {
  const cy = initGraph('cy');
  const editorView = initEditor('editor');
  initUI(cy, editorView);
  initPhysics(cy);
  initResizers(cy, editorView);
});
