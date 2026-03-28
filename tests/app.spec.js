import { test, expect } from '@playwright/test';

/**
 * Helper: get the Cytoscape instance from the container element.
 * Cytoscape.js stores a back-reference on the container via _cyreg.
 */
function getCyNodeCount(page) {
  return page.evaluate(() => {
    const reg = document.getElementById('cy')._cyreg;
    return reg ? reg.cy.nodes().length : -1;
  });
}

function getCyEdgeCount(page) {
  return page.evaluate(() => {
    const reg = document.getElementById('cy')._cyreg;
    return reg ? reg.cy.edges().length : -1;
  });
}

function getCyNodeIds(page) {
  return page.evaluate(() => {
    const reg = document.getElementById('cy')._cyreg;
    if (!reg) return [];
    return reg.cy
      .nodes()
      .map((n) => n.id())
      .sort();
  });
}

/**
 * Helper: get the rendered screen position of a Cytoscape node by index.
 */
function getNodeScreenPosition(page, nodeIndex) {
  return page.evaluate((idx) => {
    const cy = document.getElementById('cy')._cyreg.cy;
    const node = cy.nodes()[idx];
    const p = node.renderedPosition();
    const rect = cy.container().getBoundingClientRect();
    return { x: rect.left + p.x, y: rect.top + p.y };
  }, nodeIndex);
}

test.describe('Graph Script Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to initialize (CodeMirror + Cytoscape must be ready)
    await page.waitForSelector('.CodeMirror');
    await page.waitForSelector('#cy');
  });

  test('page loads and shows toolbar', async ({ page }) => {
    // Brand name is visible
    await expect(page.locator('.brand-name')).toHaveText('GraphScript');

    // Run button is visible
    await expect(page.locator('#btn-run')).toBeVisible();

    // CodeMirror editor is present
    await expect(page.locator('.CodeMirror')).toBeVisible();

    // Cytoscape container is present
    await expect(page.locator('#cy')).toBeVisible();
  });

  test('add vertices', async ({ page }) => {
    // Click the add vertex button 3 times
    const btnAddVertex = page.locator('#btn-add-vertex');
    await btnAddVertex.click();
    await btnAddVertex.click();
    await btnAddVertex.click();

    // Wait for animations to complete (~400ms per vertex)
    await page.waitForTimeout(500);

    // Assert 3 nodes exist
    const nodeCount = await getCyNodeCount(page);
    expect(nodeCount).toBe(3);
  });

  test('add edge between two vertices', async ({ page }) => {
    // Add 2 vertices
    const btnAddVertex = page.locator('#btn-add-vertex');
    await btnAddVertex.click();
    await btnAddVertex.click();
    await page.waitForTimeout(500);

    // Enter edge mode
    await page.locator('#btn-add-edge').click();

    // Verify mode changed - the status text should update
    const modeLabel = page.locator('#mode-label');
    const modeLabelText = await modeLabel.textContent();
    // In Russian: "Добавление ребра", in English: "Adding edge"
    expect(
      modeLabelText === 'Добавление ребра' || modeLabelText === 'Adding edge',
    ).toBe(true);

    // Click on the first node
    const pos1 = await getNodeScreenPosition(page, 0);
    await page.mouse.click(pos1.x, pos1.y);

    // Click on the second node
    const pos2 = await getNodeScreenPosition(page, 1);
    await page.mouse.click(pos2.x, pos2.y);

    // Wait for edge animation
    await page.waitForTimeout(400);

    // Verify edge count is 1
    const edgeCount = await getCyEdgeCount(page);
    expect(edgeCount).toBe(1);
  });

  test('run default JavaScript script', async ({ page }) => {
    // Add 2 vertices
    const btnAddVertex = page.locator('#btn-add-vertex');
    await btnAddVertex.click();
    await btnAddVertex.click();
    await page.waitForTimeout(500);

    // Enter edge mode and connect the two nodes
    await page.locator('#btn-add-edge').click();
    const pos1 = await getNodeScreenPosition(page, 0);
    await page.mouse.click(pos1.x, pos1.y);
    const pos2 = await getNodeScreenPosition(page, 1);
    await page.mouse.click(pos2.x, pos2.y);
    await page.waitForTimeout(400);

    // Click the Run button
    await page.locator('#btn-run').click();

    // Wait for output to finish loading (no longer has output--loading class)
    const outputEl = page.locator('#output');
    await expect(outputEl).not.toHaveClass(/output--loading/, { timeout: 10000 });

    // Assert success
    await expect(outputEl).toHaveClass(/output--success/);

    // Assert output contains degree info (Russian "степень" or English "degree")
    const outputText = await outputEl.textContent();
    expect(outputText).toMatch(/степень|degree/i);
  });

  test('toggle language switches UI text', async ({ page }) => {
    // Get the current Run button text
    const runBtnText = page.locator('#btn-run span[data-i18n="btn.run"]');
    const textBefore = await runBtnText.textContent();

    // Click the language toggle
    await page.locator('#btn-lang').click();

    // Assert the Run button text changed
    const textAfter = await runBtnText.textContent();
    expect(textAfter).not.toBe(textBefore);

    // Verify it toggled between known values
    const validTexts = ['Запуск', 'Run'];
    expect(validTexts).toContain(textBefore);
    expect(validTexts).toContain(textAfter);
  });

  test('delete vertex renumbers remaining', async ({ page }) => {
    // Add 3 vertices
    const btnAddVertex = page.locator('#btn-add-vertex');
    await btnAddVertex.click();
    await btnAddVertex.click();
    await btnAddVertex.click();
    await page.waitForTimeout(500);

    // Verify 3 nodes
    expect(await getCyNodeCount(page)).toBe(3);

    // Enter delete mode
    await page.locator('#btn-delete').click();

    // Click on the first vertex (node "1")
    const pos = await getNodeScreenPosition(page, 0);
    await page.mouse.click(pos.x, pos.y);

    // Wait for removal animation + renumbering to complete
    await expect
      .poll(() => getCyNodeCount(page), { timeout: 5000 })
      .toBe(2);

    // Assert remaining nodes are renumbered to 1 and 2
    const ids = await getCyNodeIds(page);
    expect(ids).toEqual(['1', '2']);
  });
});
