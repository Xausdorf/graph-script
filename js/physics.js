/**
 * Spring physics for edges — makes them wobble like threads
 * when nodes are dragged, then settle back to straight.
 */
export function initPhysics(cy) {
  const STIFFNESS = 0.06;
  const DAMPING = 0.93;
  const IMPULSE = 0.35;
  const MAX_IMPULSE = 6;
  const MAX_DISP = 40;
  const THRESHOLD = 0.05;

  const springs = new Map(); // edgeId → { d: displacement, v: velocity }
  let grabbed = null;
  let prevPos = null;
  let running = false;

  function spring(id) {
    if (!springs.has(id)) springs.set(id, { d: 0, v: 0 });
    return springs.get(id);
  }

  function clamp(val, lo, hi) {
    return val < lo ? lo : val > hi ? hi : val;
  }

  /* ── animation loop ── */
  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(step);
  }

  function step() {
    /* 1. impulse from drag velocity */
    if (grabbed) {
      const p = grabbed.position();
      if (prevPos) {
        const vx = p.x - prevPos.x;
        const vy = p.y - prevPos.y;

        if (vx * vx + vy * vy > 0.25) {
          grabbed.connectedEdges().forEach((e) => {
            const s = e.source().position();
            const t = e.target().position();
            const dx = t.x - s.x;
            const dy = t.y - s.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 1) return;

            /* perpendicular component of velocity relative to edge */
            const cross = (vx * dy - vy * dx) / len;
            spring(e.id()).v += clamp(cross * IMPULSE, -MAX_IMPULSE, MAX_IMPULSE);
          });
        }
      }
      prevPos = { x: p.x, y: p.y };
    }

    /* 2. integrate spring physics */
    let active = false;
    springs.forEach((st, id) => {
      const force = -st.d * STIFFNESS;
      st.v = (st.v + force) * DAMPING;
      st.d = clamp(st.d + st.v, -MAX_DISP, MAX_DISP);

      const edge = cy.getElementById(id);
      if (!edge.length) {
        springs.delete(id);
        return;
      }

      if (Math.abs(st.d) > THRESHOLD || Math.abs(st.v) > THRESHOLD) {
        active = true;
        edge.style('control-point-distances', st.d);
      } else {
        st.d = 0;
        st.v = 0;
        edge.style('control-point-distances', 0);
        springs.delete(id);
      }
    });

    if (active || grabbed) {
      requestAnimationFrame(step);
    } else {
      running = false;
    }
  }

  /* ── events ── */
  cy.on('grab', 'node', (evt) => {
    grabbed = evt.target;
    prevPos = { ...evt.target.position() };
    start();
  });

  cy.on('free', 'node', () => {
    grabbed = null;
    prevPos = null;
  });

  cy.on('remove', 'edge', (evt) => {
    springs.delete(evt.target.id());
  });

  /* subtle pluck when a new edge appears */
  cy.on('add', 'edge', (evt) => {
    const st = spring(evt.target.id());
    st.v = (Math.random() - 0.5) * 2;
    start();
  });
}
