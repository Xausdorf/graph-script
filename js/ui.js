import {
  addVertex,
  addEdge,
  animateRemoveNode,
  animateRemoveEdge,
  getGraphData,
  renumberVertices,
  setDirected,
  getDirected,
} from './graph.js';
import { getCode } from './editor.js';
import { runScript } from './runner.js';
import { t, getLang, setLang } from './i18n.js';

function initUI(cy, editorView) {
  const btnAddVertex = document.getElementById('btn-add-vertex');
  const btnAddEdge = document.getElementById('btn-add-edge');
  const btnDelete = document.getElementById('btn-delete');
  const btnRun = document.getElementById('btn-run');
  const outputEl = document.getElementById('output');
  const modeLabel = document.getElementById('mode-label');
  const statusDot = document.querySelector('.status-dot');
  const btnGrid = document.getElementById('btn-grid');
  const graphGrid = document.getElementById('graph-grid');

  let currentMode = 'default';
  let edgeSource = null;

  const btnDirected = document.getElementById('btn-directed');
  const btnLang = document.getElementById('btn-lang');
  const langLabel = document.getElementById('lang-label');

  /* Grid toggle — on by default */
  btnGrid.classList.add('active');
  btnGrid.addEventListener('click', () => {
    graphGrid.classList.toggle('hidden');
    btnGrid.classList.toggle('active');
  });

  /* Directed toggle — on by default */
  btnDirected.classList.add('active');
  btnDirected.addEventListener('click', () => {
    const nowDirected = !getDirected();
    setDirected(cy, nowDirected);
    btnDirected.classList.toggle('active', nowDirected);
  });

  /* Language toggle */
  langLabel.textContent = getLang() === 'ru' ? 'EN' : 'RU';
  btnLang.addEventListener('click', () => {
    const newLang = getLang() === 'ru' ? 'en' : 'ru';
    setLang(newLang);
    langLabel.textContent = newLang === 'ru' ? 'EN' : 'RU';
    /* Re-apply mode label since it's set dynamically */
    setMode(currentMode, true);
    /* Update output placeholder if no result is showing */
    if (!outputEl.className) {
      outputEl.textContent = t('output.placeholder');
    }
  });

  function setMode(mode, force) {
    if (!force && currentMode === mode) {
      mode = 'default';
    }
    currentMode = mode;

    btnAddEdge.classList.toggle('active', mode === 'add-edge');
    btnDelete.classList.toggle('active', mode === 'delete');

    /* Update status indicator color */
    if (statusDot) {
      statusDot.className = 'status-dot';
      if (mode === 'add-edge') statusDot.classList.add('status-dot--edge');
      if (mode === 'delete') statusDot.classList.add('status-dot--delete');
    }

    if (modeLabel) {
      const labels = {
        default: t('mode.default'),
        'add-edge': t('mode.addEdge'),
        delete: t('mode.delete'),
      };
      modeLabel.textContent = labels[mode] || t('mode.default');
    }

    if (mode !== 'add-edge' && edgeSource) {
      edgeSource.removeClass('edge-source');
      edgeSource = null;
    }
  }

  btnAddVertex.addEventListener('click', () => {
    addVertex(cy);
  });

  btnAddEdge.addEventListener('click', () => {
    setMode('add-edge');
  });

  btnDelete.addEventListener('click', () => {
    setMode('delete');
  });

  btnRun.addEventListener('click', async () => {
    const code = getCode(editorView);
    const graphData = getGraphData(cy);

    outputEl.textContent = t('status.running');
    outputEl.className = 'output--loading';
    btnRun.classList.add('executing');

    const result = await runScript(code, graphData);

    btnRun.classList.remove('executing');

    if (result.success) {
      outputEl.textContent = result.result;
      outputEl.className = 'output--success';
      btnRun.classList.add('flash-success');
    } else {
      outputEl.textContent = t('error.prefix') + result.error;
      outputEl.className = 'output--error';
      btnRun.classList.add('flash-error');
    }

    setTimeout(() => {
      btnRun.classList.remove('flash-success', 'flash-error');
    }, 600);
  });

  cy.on('tap', 'node', (evt) => {
    const node = evt.target;

    if (currentMode === 'add-edge') {
      if (!edgeSource) {
        edgeSource = node;
        edgeSource.addClass('edge-source');
      } else {
        if (node.id() !== edgeSource.id()) {
          const srcId = edgeSource.id();
          const tgtId = node.id();
          const duplicate = cy
            .edges()
            .some(
              (e) =>
                (e.source().id() === srcId && e.target().id() === tgtId) ||
                (e.source().id() === tgtId && e.target().id() === srcId),
            );
          if (!duplicate) {
            addEdge(cy, srcId, tgtId);
          }
        }
        edgeSource.removeClass('edge-source');
        edgeSource = null;
      }
    } else if (currentMode === 'delete') {
      animateRemoveNode(cy, node, () => {
        renumberVertices(cy);
      });
    }
  });

  cy.on('tap', 'edge', (evt) => {
    if (currentMode === 'delete') {
      animateRemoveEdge(evt.target);
    }
  });

  cy.on('tap', (evt) => {
    if (evt.target === cy && currentMode === 'add-edge' && edgeSource) {
      edgeSource.removeClass('edge-source');
      edgeSource = null;
    }
  });
}

export { initUI };
