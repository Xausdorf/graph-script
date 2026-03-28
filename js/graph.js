let nextVertexId = 1;

function initGraph(containerId) {
  const cy = cytoscape({
    container: document.getElementById(containerId),
    style: [
      /* ── Nodes ── */
      {
        selector: 'node',
        style: {
          'background-color': '#0f1729',
          'background-opacity': 0.9,
          'border-width': 1.5,
          'border-color': '#38bdf8',
          'border-opacity': 0.7,
          label: 'data(id)',
          'text-valign': 'center',
          'text-halign': 'center',
          color: '#cbd5e1',
          'text-outline-width': 0,
          width: 40,
          height: 40,
          'font-size': '13px',
          'font-family': "'Outfit', system-ui, sans-serif",
          'font-weight': 600,
          'overlay-opacity': 0,
          opacity: 1,
          'transition-property':
            'background-color, background-opacity, border-color, border-width, border-opacity, width, height, opacity, color',
          'transition-duration': '0.25s',
          'transition-timing-function': 'ease-in-out-sine',
        },
      },
      {
        selector: 'node:active',
        style: { 'overlay-opacity': 0 },
      },

      /* ── Edges (thread style — unbundled-bezier for physics) ── */
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': '#4a6fa5',
          'line-opacity': 0.85,
          'curve-style': 'unbundled-bezier',
          'control-point-distances': 0,
          'control-point-weights': 0.5,
          'target-arrow-shape': 'triangle',
          'target-arrow-color': '#4a6fa5',
          'arrow-scale': 0.8,
          'overlay-opacity': 0,
          opacity: 1,
          'transition-property':
            'line-color, line-opacity, target-arrow-color, width, opacity, arrow-scale',
          'transition-duration': '0.3s',
          'transition-timing-function': 'ease-in-out-sine',
        },
      },

      /* ── Node hover — grow + glow ── */
      {
        selector: 'node.hover-glow',
        style: {
          'border-color': '#60a5fa',
          'border-opacity': 1,
          'border-width': 2,
          'background-color': '#162240',
          width: 46,
          height: 46,
          color: '#e2e8f0',
        },
      },

      /* ── Connected edges glow when node hovered ── */
      {
        selector: 'edge.edge-hover',
        style: {
          'line-color': '#6db3e8',
          'line-opacity': 1,
          'target-arrow-color': '#6db3e8',
          width: 2.5,
          'arrow-scale': 0.9,
        },
      },

      /* ── Edge hover (direct) ── */
      {
        selector: 'edge.edge-direct-hover',
        style: {
          'line-color': '#7cc4ff',
          'line-opacity': 1,
          'target-arrow-color': '#7cc4ff',
          width: 3,
          'arrow-scale': 0.95,
        },
      },

      /* ── Selection ── */
      {
        selector: 'node:selected',
        style: {
          'background-color': 'rgba(56, 189, 248, 0.12)',
          'border-color': '#38bdf8',
          'border-width': 2.5,
          'border-opacity': 1,
        },
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': '#38bdf8',
          'line-opacity': 1,
          'target-arrow-color': '#38bdf8',
          width: 2.5,
        },
      },

      /* ── Edge source (add-edge mode) ── */
      {
        selector: '.edge-source',
        style: {
          'border-width': 2.5,
          'border-color': '#34d399',
          'border-opacity': 1,
          'background-color': 'rgba(52, 211, 153, 0.08)',
          width: 48,
          height: 48,
        },
      },

      /* ── Ghost state for fade-in / fade-out ── */
      {
        selector: '.ghost',
        style: {
          opacity: 0,
        },
      },
    ],
    layout: { name: 'preset' },
    userZoomingEnabled: true,
    userPanningEnabled: true,
    boxSelectionEnabled: false,
    selectionType: 'single',
    pixelRatio: 'auto',
  });

  const cyEl = document.getElementById(containerId);

  /* ── Node hover: grow + highlight connected edges ── */
  cy.on('mouseover', 'node', (evt) => {
    const node = evt.target;
    node.addClass('hover-glow');
    node.connectedEdges().addClass('edge-hover');
    cyEl.style.cursor = 'grab';
  });

  cy.on('mouseout', 'node', (evt) => {
    const node = evt.target;
    node.removeClass('hover-glow');
    node.connectedEdges().removeClass('edge-hover');
    cyEl.style.cursor = '';
  });

  /* ── Edge hover: glow ── */
  cy.on('mouseover', 'edge', (evt) => {
    evt.target.addClass('edge-direct-hover');
    cyEl.style.cursor = 'pointer';
  });

  cy.on('mouseout', 'edge', (evt) => {
    evt.target.removeClass('edge-direct-hover');
    cyEl.style.cursor = '';
  });

  /* ── Grabbing cursor while dragging ── */
  cy.on('grab', 'node', () => {
    cyEl.style.cursor = 'grabbing';
  });

  cy.on('free', 'node', () => {
    cyEl.style.cursor = '';
  });

  return cy;
}

/* ── Add vertex with spring-in animation ── */
function addVertex(cy) {
  const id = String(nextVertexId++);
  const x = 100 + Math.random() * 400;
  const y = 100 + Math.random() * 300;

  const node = cy.add({
    group: 'nodes',
    data: { id },
    position: { x, y },
  });

  /* Start tiny + invisible, then spring to full size */
  node.style({ width: 8, height: 8, opacity: 0 });
  node.animate({
    style: { width: 50, height: 50, opacity: 1 },
    duration: 200,
    easing: 'ease-out-cubic',
    complete: () => {
      node.animate({
        style: { width: 40, height: 40 },
        duration: 180,
        easing: 'ease-in-out-sine',
      });
    },
  });
}

/* ── Add edge with fade-in ── */
function addEdge(cy, srcId, tgtId) {
  const edge = cy.add({
    group: 'edges',
    data: {
      id: `e_${srcId}_${tgtId}`,
      source: srcId,
      target: tgtId,
    },
  });

  edge.style({ opacity: 0 });
  edge.animate({
    style: { opacity: 1 },
    duration: 300,
    easing: 'ease-out-cubic',
  });

  return edge;
}

/* ── Animated remove for a node ── */
function animateRemoveNode(cy, node, onDone) {
  const edges = node.connectedEdges();

  /* Fade out edges first, then shrink + fade node */
  edges.animate({
    style: { opacity: 0 },
    duration: 150,
    easing: 'ease-in-cubic',
  });

  node.animate({
    style: { width: 6, height: 6, opacity: 0 },
    duration: 220,
    easing: 'ease-in-cubic',
    complete: () => {
      edges.remove();
      node.remove();
      if (onDone) onDone();
    },
  });
}

/* ── Animated remove for an edge ── */
function animateRemoveEdge(edge, onDone) {
  edge.animate({
    style: { opacity: 0, width: 0.3 },
    duration: 200,
    easing: 'ease-in-cubic',
    complete: () => {
      edge.remove();
      if (onDone) onDone();
    },
  });
}

function getGraphData(cy) {
  const nodes = cy.nodes().sort((a, b) => parseInt(a.id()) - parseInt(b.id()));
  const edges = cy.edges();
  const n = nodes.length;
  const m = edges.length;
  const edgeList = edges.map((e) => [
    parseInt(e.source().id()),
    parseInt(e.target().id()),
  ]);
  return { n, m, edges: edgeList };
}

function renumberVertices(cy) {
  const nodes = cy
    .nodes()
    .sort((a, b) => parseInt(a.id()) - parseInt(b.id()));
  const edges = cy.edges();

  const oldToNew = {};
  const nodeData = [];
  nodes.forEach((node, i) => {
    const newId = String(i + 1);
    oldToNew[node.id()] = newId;
    nodeData.push({
      id: newId,
      position: { ...node.position() },
    });
  });

  const edgeData = edges.map((e) => ({
    source: oldToNew[e.source().id()],
    target: oldToNew[e.target().id()],
  }));

  cy.batch(() => {
    cy.elements().remove();
    nodeData.forEach((nd) => {
      cy.add({
        group: 'nodes',
        data: { id: nd.id },
        position: nd.position,
      });
    });
    edgeData.forEach((ed) => {
      cy.add({
        group: 'edges',
        data: {
          id: `e_${ed.source}_${ed.target}`,
          source: ed.source,
          target: ed.target,
        },
      });
    });
  });

  nextVertexId = nodeData.length + 1;
}

function resetGraph(cy) {
  cy.elements().remove();
  nextVertexId = 1;
}

export {
  initGraph,
  addVertex,
  addEdge,
  animateRemoveNode,
  animateRemoveEdge,
  getGraphData,
  renumberVertices,
  resetGraph,
};
