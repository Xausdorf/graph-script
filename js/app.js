import { initGraph } from './graph.js';
import { initEditor } from './editor.js';
import { initUI } from './ui.js';
import { initPhysics } from './physics.js';
import { initResizers } from './resizer.js';
import { initI18n } from './i18n.js';
import { getLanguage } from './languages/registry.js';
import { getLanguageId } from './runner.js';

// Register language runners (side-effect imports)
import './languages/js-runner.js';
import './languages/cpp-runner.js';
import './languages/py-runner.js';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  const lang = getLanguage(getLanguageId());
  const cy = initGraph('cy');
  const editorView = initEditor('editor', lang.defaultCode, lang.codemirrorMode);
  const physics = initPhysics(cy);
  initUI(cy, editorView, physics);
  initResizers(cy, editorView);
});
