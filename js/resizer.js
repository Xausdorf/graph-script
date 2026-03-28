/**
 * Draggable panel resizers.
 *  – vertical:   graph ↔ right panel
 *  – horizontal: editor ↔ output
 */
export function initResizers(cy, editorView) {
  setupVertical(cy, editorView);
  setupHorizontal(editorView);
}

/* ── Vertical (left ↔ right) ── */
function setupVertical(cy, editorView) {
  const handle = document.getElementById('divider-v');
  const container = document.querySelector('.main-content');
  const graphPanel = document.querySelector('.graph-panel');

  let dragging = false;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    handle.classList.add('dragging');
    document.body.classList.add('resizing');
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(20, Math.min(80, pct));
    graphPanel.style.flex = `0 0 ${clamped}%`;
    cy.resize();
    editorView.refresh();
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.classList.remove('resizing');
  });
}

/* ── Horizontal (editor ↔ output) ── */
function setupHorizontal(editorView) {
  const handle = document.getElementById('divider-h');
  const rightPanel = document.querySelector('.right-panel');
  const editorSection = document.querySelector('.editor-section');
  const outputSection = document.querySelector('.output-section');

  let dragging = false;

  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    handle.classList.add('dragging');
    document.body.classList.add('resizing-h');
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = rightPanel.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const total = rect.height;

    /* clamp so neither section disappears */
    const editorH = Math.max(80, Math.min(total - 60, y));
    const outputH = total - editorH - handle.offsetHeight;

    editorSection.style.flex = 'none';
    editorSection.style.height = editorH + 'px';
    outputSection.style.flex = 'none';
    outputSection.style.height = outputH + 'px';

    editorView.refresh();
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('dragging');
    document.body.classList.remove('resizing-h');
  });
}
