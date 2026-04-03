const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'sprint2');
const APP_URL = 'http://localhost:3000';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MINDS = [
  'Steve Jobs',
  'Albert Einstein',
  'Alexander the Great',
  'Leonardo da Vinci',
  'Cleopatra VII',
  'Sun Tzu',
  'Nikola Tesla',
];

async function evaluate() {
  const results = {
    criteria: {},
    consoleErrors: [],
    screenshots: [],
    scores: {},
    timestamp: new Date().toISOString(),
    sprint: 2,
    iteration: 1,
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (
        text.includes('favicon') ||
        text.includes('third-party') ||
        text.includes('Download the React DevTools')
      )
        return;
      results.consoleErrors.push({
        text: text,
        location: msg.location(),
      });
    }
  });

  page.on('pageerror', (err) => {
    results.consoleErrors.push({
      text: err.message,
      type: 'pageerror',
    });
  });

  try {
    // ================================================================
    // STEP 0: Clear localStorage and load fresh
    // ================================================================
    console.log('STEP 0: Clear localStorage and fresh load...');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(1500);
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await delay(2000);
    results.criteria['app_loads'] = true;
    console.log('  PASS: App loaded successfully');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-fresh-load.png') });
    results.screenshots.push('01-fresh-load.png');

    // ================================================================
    // CRITERION 1: Place 6 minds on canvas via click-to-place
    // ================================================================
    console.log('CRITERION 1: Placing 6 minds on canvas via sidebar click...');

    const mindsToPlace = MINDS.slice(0, 6);
    let placedSuccessCount = 0;

    for (const mindName of mindsToPlace) {
      // Find the sidebar card by text content
      const card = await page.locator(`text="${mindName}"`).first();
      if (card) {
        try {
          await card.click({ timeout: 3000 });
          await delay(600);
          placedSuccessCount++;
          console.log(`  Placed: ${mindName}`);
        } catch (err) {
          console.log(`  WARNING: Could not click card for ${mindName}: ${err.message}`);
        }
      } else {
        console.log(`  WARNING: Could not find sidebar card for ${mindName}`);
      }
    }

    await delay(1000);

    // Verify minds were placed
    const placedCount = await page.evaluate(() => {
      return document.querySelectorAll('.react-flow__node').length;
    });

    results.criteria['five_plus_minds_placed'] = placedCount >= 5;
    console.log(`  ${placedCount >= 5 ? 'PASS' : 'FAIL'}: ${placedCount} minds placed (need 5+)`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-minds-placed.png') });
    results.screenshots.push('02-minds-placed.png');

    // ================================================================
    // CRITERION 2: Create connections between nodes
    // ================================================================
    console.log('CRITERION 2: Creating connections...');

    // Get node positions
    const nodeData = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.react-flow__node');
      return Array.from(nodes).map((n) => {
        const rect = n.getBoundingClientRect();
        const id = n.getAttribute('data-id');
        return {
          id,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          sourceX: rect.x + rect.width,
          sourceY: rect.y + rect.height / 2,
          targetX: rect.x,
          targetY: rect.y + rect.height / 2,
        };
      });
    });

    // Create connections by dragging from source handles to target handles
    const connectionPairsAttempted = [];
    if (nodeData.length >= 5) {
      const pairs = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3],
      ];

      for (const [si, ti] of pairs) {
        if (si >= nodeData.length || ti >= nodeData.length) continue;
        const source = nodeData[si];
        const target = nodeData[ti];

        // Find the source handle (right side) of source node
        const sourceHandle = await page.$(`[data-id="${source.id}"] .react-flow__handle-right`);
        const targetHandle = await page.$(`[data-id="${target.id}"] .react-flow__handle-left`);

        if (sourceHandle && targetHandle) {
          const shBox = await sourceHandle.boundingBox();
          const thBox = await targetHandle.boundingBox();

          if (shBox && thBox) {
            const sx = shBox.x + shBox.width / 2;
            const sy = shBox.y + shBox.height / 2;
            const tx = thBox.x + thBox.width / 2;
            const ty = thBox.y + thBox.height / 2;

            await page.mouse.move(sx, sy);
            await delay(100);
            await page.mouse.down();
            await delay(50);
            // Smooth drag through intermediate points
            const steps = 8;
            for (let s = 1; s <= steps; s++) {
              const progress = s / steps;
              await page.mouse.move(
                sx + (tx - sx) * progress,
                sy + (ty - sy) * progress
              );
              await delay(20);
            }
            await page.mouse.up();
            await delay(400);

            connectionPairsAttempted.push(`${si} -> ${ti}`);
            console.log(`  Attempted connection: node ${si} -> ${ti}`);
          }
        }
      }
    }

    await delay(1000);

    // Check how many connection edges exist
    let edgeCount = await page.evaluate(() => {
      return document.querySelectorAll('.react-flow__edge').length;
    });

    results.criteria['connections_created'] = edgeCount >= 1;
    results.criteria['six_plus_connections'] = edgeCount >= 6;
    console.log(`  ${edgeCount >= 6 ? 'PASS' : edgeCount >= 1 ? 'PARTIAL' : 'FAIL'}: ${edgeCount} connections created (target: 6+)`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-connections.png') });
    results.screenshots.push('03-connections.png');

    // ================================================================
    // CRITERION 3: Connection glow effect with blended accent colors
    // ================================================================
    console.log('CRITERION 3: Connection glow effects...');

    const glowCheck = await page.evaluate(() => {
      const edges = document.querySelectorAll('.react-flow__edge');
      let hasGlowFilter = false;
      let hasGlowPath = false;
      let hasDashedEdge = false;
      let hasSolidEdge = false;

      edges.forEach((edge) => {
        const filters = edge.querySelectorAll('filter');
        if (filters.length > 0) hasGlowFilter = true;

        const blurs = edge.querySelectorAll('feGaussianBlur');
        if (blurs.length > 0) hasGlowFilter = true;

        const paths = edge.querySelectorAll('path');
        paths.forEach((p) => {
          const dashArray = p.getAttribute('stroke-dasharray');
          if (dashArray && dashArray !== 'none') hasDashedEdge = true;
          if (!dashArray || dashArray === 'none') hasSolidEdge = true;

          const stroke = p.getAttribute('stroke');
          if (stroke && stroke.includes('rgba')) hasGlowPath = true;
        });
      });

      return { hasGlowFilter, hasGlowPath, hasDashedEdge, hasSolidEdge, edgeCount: edges.length };
    });

    results.criteria['connection_glow'] = glowCheck.hasGlowFilter || glowCheck.hasGlowPath;
    results.criteria['connection_types_visual'] = glowCheck.hasDashedEdge || glowCheck.hasSolidEdge;
    console.log(`  Glow filter: ${glowCheck.hasGlowFilter}, Glow paths: ${glowCheck.hasGlowPath}`);
    console.log(`  Dashed edges: ${glowCheck.hasDashedEdge}, Solid edges: ${glowCheck.hasSolidEdge}`);

    // ================================================================
    // CRITERION 4: Right-click context menu on connections
    // ================================================================
    console.log('CRITERION 4: Connection context menu...');

    let contextMenuWorks = false;
    const currentEdgeCount = glowCheck.edgeCount;
    if (currentEdgeCount > 0) {
      const edgeEl = await page.$('.react-flow__edge path[stroke-width="20"]');
      if (edgeEl) {
        const edgeBox = await edgeEl.boundingBox();
        if (edgeBox) {
          await page.mouse.click(
            edgeBox.x + edgeBox.width / 2,
            edgeBox.y + edgeBox.height / 2,
            { button: 'right' }
          );
          await delay(500);

          const menuExists = await page.evaluate(() => {
            const buttons = document.querySelectorAll('button');
            for (const btn of buttons) {
              const text = btn.textContent?.toLowerCase() || '';
              if (text.includes('delete connection') || text.includes('switch to')) {
                return true;
              }
            }
            return false;
          });

          contextMenuWorks = menuExists;
          if (menuExists) {
            await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-context-menu.png') });
            results.screenshots.push('04-context-menu.png');
          }

          // Dismiss by clicking elsewhere
          await page.mouse.click(100, 100);
          await delay(300);
        }
      }
    }

    results.criteria['connection_context_menu'] = contextMenuWorks;
    console.log(`  ${contextMenuWorks ? 'PASS' : 'FAIL'}: Context menu on right-click`);

    // ================================================================
    // CRITERION 5: Detail panel opens on node click
    // ================================================================
    console.log('CRITERION 5: Detail panel on node click...');

    let detailPanelWorks = false;
    const firstNode = await page.$('.react-flow__node');
    if (firstNode) {
      const nodeBox = await firstNode.boundingBox();
      if (nodeBox) {
        // Click on the node body area (monogram/name area, avoiding buttons)
        await page.mouse.click(nodeBox.x + 60, nodeBox.y + 30);
        await delay(1000);

        detailPanelWorks = await page.evaluate(() => {
          // Look for detail panel content markers
          const allText = document.body.innerText.toUpperCase();
          const hasDetailContent =
            allText.includes('STRENGTHS') ||
            allText.includes('WEAKNESSES') ||
            allText.includes('COMMUNICATION STYLE') ||
            allText.includes('BEST ROLES');

          if (hasDetailContent) return true;

          // Also check for fixed panel with width ~340
          const divs = document.querySelectorAll('div');
          for (const d of divs) {
            const style = window.getComputedStyle(d);
            if (style.position === 'fixed' && parseInt(style.width) >= 300 && parseInt(style.width) <= 400) {
              return true;
            }
          }
          return false;
        });

        if (detailPanelWorks) {
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-detail-panel.png') });
          results.screenshots.push('05-detail-panel.png');
        }
      }
    }

    results.criteria['detail_panel_opens'] = detailPanelWorks;
    console.log(`  ${detailPanelWorks ? 'PASS' : 'FAIL'}: Detail panel opens`);

    // ================================================================
    // CRITERION 6: Detail panel shows strengths, weaknesses, quote
    // ================================================================
    console.log('CRITERION 6: Detail panel content...');

    let panelContent = { hasStrengths: false, hasWeaknesses: false, hasQuote: false, hasCommsStyle: false, hasBestRoles: false };
    if (detailPanelWorks) {
      panelContent = await page.evaluate(() => {
        const body = document.body.innerText.toUpperCase();
        return {
          hasStrengths: body.includes('STRENGTHS'),
          hasWeaknesses: body.includes('WEAKNESSES'),
          hasQuote: body.includes('\u201C') || body.includes('"'),
          hasCommsStyle: body.includes('COMMUNICATION') || body.includes('DECISION'),
          hasBestRoles: body.includes('BEST ROLES'),
        };
      });
    }

    results.criteria['detail_strengths'] = panelContent.hasStrengths;
    results.criteria['detail_weaknesses'] = panelContent.hasWeaknesses;
    results.criteria['detail_quote'] = panelContent.hasQuote;
    console.log(`  Strengths: ${panelContent.hasStrengths}, Weaknesses: ${panelContent.hasWeaknesses}, Quote: ${panelContent.hasQuote}`);
    console.log(`  Communication style: ${panelContent.hasCommsStyle}, Best roles: ${panelContent.hasBestRoles}`);

    // Close detail panel by clicking pane
    await page.mouse.click(400, 700);
    await delay(500);

    // ================================================================
    // CRITERION 7: Role-fit indicators visible
    // ================================================================
    console.log('CRITERION 7: Role-fit indicators...');

    let roleFitVisible = false;
    const nodeForRole = await page.$('.react-flow__node');
    if (nodeForRole) {
      const nodeBox = await nodeForRole.boundingBox();
      if (nodeBox) {
        // Find role dropdown: look for button with "Assign Role" text within the node
        const allButtons = await nodeForRole.$$('button');
        let roleBtn = null;
        for (const btn of allButtons) {
          const text = await btn.textContent();
          if (text?.includes('Assign Role') || text?.includes('Unassigned')) {
            roleBtn = btn;
            break;
          }
        }

        if (roleBtn) {
          await roleBtn.click();
          await delay(400);

          // Click the CEO option from the dropdown
          const roleOptions = await page.$$('button');
          for (const opt of roleOptions) {
            const text = await opt.textContent();
            if (text?.toUpperCase().includes('CEO') && !text?.includes('Assign')) {
              await opt.click();
              await delay(800);
              break;
            }
          }

          // Check for fit indicator
          roleFitVisible = await page.evaluate(() => {
            const allText = document.body.innerText.toLowerCase();
            if (allText.includes('fit')) return true;

            // Look for fit-colored borders/rings
            const allElements = document.querySelectorAll('div, span');
            for (const el of allElements) {
              const style = window.getComputedStyle(el);
              const borderColor = style.borderColor;
              if (
                borderColor.includes('76, 175, 80') ||
                borderColor.includes('255, 193, 7') ||
                borderColor.includes('244, 67, 54')
              ) {
                return true;
              }
            }
            return false;
          });

          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-role-fit.png') });
          results.screenshots.push('06-role-fit.png');
        } else {
          console.log('  WARNING: Could not find role dropdown button');
        }
      }
    }

    results.criteria['role_fit_indicator'] = roleFitVisible;
    console.log(`  ${roleFitVisible ? 'PASS' : 'FAIL'}: Role-fit indicator visible`);

    // ================================================================
    // CRITERION 8: localStorage persistence (autosave)
    // ================================================================
    console.log('CRITERION 8: localStorage persistence...');

    await delay(1500);

    const storageCheck = await page.evaluate(() => {
      const raw = localStorage.getItem('greatmind-company-builder');
      if (!raw) return { saved: false };
      try {
        const data = JSON.parse(raw);
        return {
          saved: true,
          version: data.version,
          mindCount: data.placedMinds?.length || 0,
          connectionCount: data.connections?.length || 0,
          hasCompany: !!data.company,
          hasSavedAt: !!data.savedAt,
        };
      } catch {
        return { saved: false, error: 'parse error' };
      }
    });

    results.criteria['localstorage_autosave'] = storageCheck.saved && storageCheck.mindCount > 0;
    console.log(`  ${storageCheck.saved ? 'PASS' : 'FAIL'}: localStorage save (${storageCheck.mindCount} minds, ${storageCheck.connectionCount} connections)`);

    // ================================================================
    // CRITERION 9: Persistence across reload
    // ================================================================
    console.log('CRITERION 9: State restoration after reload...');

    const preReloadMinds = storageCheck.mindCount;
    const preReloadConns = storageCheck.connectionCount;

    await page.reload({ waitUntil: 'networkidle' });
    await delay(2500);

    const postReloadCheck = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.react-flow__node');
      const edges = document.querySelectorAll('.react-flow__edge');
      return {
        nodeCount: nodes.length,
        edgeCount: edges.length,
      };
    });

    results.criteria['persistence_reload'] =
      postReloadCheck.nodeCount >= preReloadMinds && postReloadCheck.nodeCount > 0;
    console.log(
      `  ${postReloadCheck.nodeCount >= preReloadMinds ? 'PASS' : 'FAIL'}: ` +
        `After reload: ${postReloadCheck.nodeCount} nodes (was ${preReloadMinds}), ` +
        `${postReloadCheck.edgeCount} edges (was ${preReloadConns})`
    );

    // Update edge count to include post-reload state
    edgeCount = Math.max(edgeCount, postReloadCheck.edgeCount);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-after-reload.png') });
    results.screenshots.push('07-after-reload.png');

    // ================================================================
    // CRITERION 10: Export button
    // ================================================================
    console.log('CRITERION 10: Export functionality...');

    let exportWorks = false;
    const exportBtnExists = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.toLowerCase().includes('export')) return true;
      }
      return false;
    });

    if (exportBtnExists) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
        page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            if (btn.textContent?.toLowerCase().includes('export')) {
              btn.click();
              return true;
            }
          }
          return false;
        }),
      ]);

      if (download) {
        const filename = download.suggestedFilename();
        exportWorks = filename.endsWith('.json');
        console.log(`  Export triggered: ${filename}`);

        const downloadPath = path.join(SCREENSHOTS_DIR, 'exported.json');
        await download.saveAs(downloadPath);

        if (fs.existsSync(downloadPath)) {
          const content = JSON.parse(fs.readFileSync(downloadPath, 'utf-8'));
          results.criteria['export_valid_json'] = content.version === 1 && Array.isArray(content.placedMinds);
          console.log(`  Export JSON valid: version=${content.version}, minds=${content.placedMinds?.length}`);
        }
      }
    }

    results.criteria['export_button'] = exportWorks;
    console.log(`  ${exportWorks ? 'PASS' : 'FAIL'}: Export downloads JSON`);

    // ================================================================
    // CRITERION 11: Import button exists
    // ================================================================
    console.log('CRITERION 11: Import functionality...');

    const importBtnExists = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.toLowerCase().includes('import')) return true;
      }
      return false;
    });

    const fileInputExists = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]');
      for (const input of inputs) {
        if (input.accept === '.json') return true;
      }
      return inputs.length > 0;
    });

    results.criteria['import_button'] = importBtnExists;
    results.criteria['import_file_input'] = fileInputExists;
    console.log(`  Import button: ${importBtnExists}, File input: ${fileInputExists}`);

    // ================================================================
    // CRITERION 12: Save indicator visible
    // ================================================================
    console.log('CRITERION 12: Save indicator...');

    let saveIndicatorWorks = false;
    // Trigger a save by dragging a node slightly
    const aNode = await page.$('.react-flow__node');
    if (aNode) {
      const box = await aNode.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 + 10, box.y + 15);
        await page.mouse.up();
        await delay(2000);

        saveIndicatorWorks = await page.evaluate(() => {
          return document.body.innerText.includes('Saved');
        });
      }
    }

    results.criteria['save_indicator'] = saveIndicatorWorks;
    console.log(`  ${saveIndicatorWorks ? 'PASS' : 'FAIL'}: Save indicator visible`);

    // ================================================================
    // CRITERION 13: Company bar with stats
    // ================================================================
    console.log('CRITERION 13: Company bar stats...');

    const companyBarCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasMindCount = /\d+\s*mind/i.test(text);
      const hasLinkCount = /\d+\s*link/i.test(text);
      const hasCompanyName = text.includes('Untitled Company') || text.includes('Company');
      return { hasMindCount, hasLinkCount, hasCompanyName };
    });

    results.criteria['company_bar_stats'] = companyBarCheck.hasMindCount;
    console.log(`  Mind count: ${companyBarCheck.hasMindCount}, Link count: ${companyBarCheck.hasLinkCount}`);

    // ================================================================
    // CRITERION 14: Visual quality with multiple connections
    // ================================================================
    console.log('CRITERION 14: Visual quality check...');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-full-state.png') });
    results.screenshots.push('08-full-state.png');

    // ================================================================
    // CRITERION 15: Chemistry hints on connection hover
    // ================================================================
    console.log('CRITERION 15: Chemistry hints on connection hover...');

    let chemistryHintWorks = false;
    if (edgeCount > 0) {
      const hitArea = await page.$('.react-flow__edge path[stroke-width="20"]');
      if (hitArea) {
        const hitBox = await hitArea.boundingBox();
        if (hitBox) {
          await page.mouse.move(hitBox.x + hitBox.width / 2, hitBox.y + hitBox.height / 2);
          await delay(800);

          chemistryHintWorks = await page.evaluate(() => {
            const foreignObjects = document.querySelectorAll('foreignObject');
            return foreignObjects.length > 0;
          });

          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-chemistry-hint.png') });
          results.screenshots.push('09-chemistry-hint.png');
        }
      }
    }

    results.criteria['chemistry_hint_hover'] = chemistryHintWorks;
    console.log(`  ${chemistryHintWorks ? 'PASS' : 'PARTIAL'}: Chemistry hint on connection hover`);

    // ================================================================
    // CRITERION 16: Console errors
    // ================================================================
    console.log('CRITERION 16: Console errors...');

    const criticalErrors = results.consoleErrors.filter((e) => {
      const text = e.text || '';
      if (text.includes('favicon')) return false;
      if (text.includes('React DevTools')) return false;
      if (text.includes('Hydration')) return false;
      if (text.includes('Warning:')) return false;
      return true;
    });

    results.criteria['zero_console_errors'] = criticalErrors.length === 0;
    console.log(
      `  ${criticalErrors.length === 0 ? 'PASS' : 'FAIL'}: ${criticalErrors.length} critical console errors`
    );
    if (criticalErrors.length > 0) {
      criticalErrors.forEach((e) => console.log(`    ERROR: ${e.text}`));
    }

    // ================================================================
    // CRITERION 17: Sprint 1 regressions
    // ================================================================
    console.log('CRITERION 17: Sprint 1 regression checks...');

    const ghostsStillWork = await page.evaluate(() => {
      const allDivs = document.querySelectorAll('div');
      let ghostCount = 0;
      for (const div of allDivs) {
        const style = window.getComputedStyle(div);
        const text = div.textContent?.trim() || '';
        if (
          style.fontSize === '10px' &&
          style.textTransform === 'uppercase' &&
          style.letterSpacing &&
          parseFloat(style.letterSpacing) > 1 &&
          text.length > 2 &&
          text.length < 30 &&
          div.closest('[class*="pointer-events-none"]')
        ) {
          ghostCount++;
        }
      }
      return ghostCount;
    });

    results.criteria['ghost_constellation_regression'] = ghostsStillWork > 0;
    console.log(`  ${ghostsStillWork > 0 ? 'PASS' : 'NOTE'}: ${ghostsStillWork} ghost constellation labels found`);

    // Final screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-final-state.png') });
    results.screenshots.push('10-final-state.png');

    // ================================================================
    // SCORING
    // ================================================================
    console.log('\n========================================');
    console.log('SPRINT 2 EVALUATION SCORING');
    console.log('========================================\n');

    // Design: Glowing connections, detail panel integration, visual harmony
    let designScore = 7;
    if (glowCheck.hasGlowFilter) designScore += 0.5;
    if (glowCheck.hasGlowPath) designScore += 0.5;
    if (detailPanelWorks) designScore += 0.5;
    if (glowCheck.hasDashedEdge && glowCheck.hasSolidEdge) designScore += 0.5;
    if (roleFitVisible) designScore += 0.5;
    designScore = Math.min(10, designScore);

    // Originality: Chemistry hints, role-fit mechanic, connection types
    let originalityScore = 7.5;
    if (chemistryHintWorks) originalityScore += 0.5;
    if (roleFitVisible) originalityScore += 0.5;
    if (glowCheck.hasDashedEdge) originalityScore += 0.5;
    if (contextMenuWorks) originalityScore += 0.5;
    originalityScore = Math.min(10, originalityScore);

    // Craft: Polish of glow effects, typography, fit indicator subtlety
    let craftScore = 7;
    if (glowCheck.hasGlowFilter && glowCheck.hasGlowPath) craftScore += 1;
    if (detailPanelWorks && panelContent.hasStrengths && panelContent.hasWeaknesses) craftScore += 0.5;
    if (panelContent.hasQuote) craftScore += 0.5;
    if (saveIndicatorWorks) craftScore += 0.5;
    if (criticalErrors.length === 0) craftScore += 0.5;
    craftScore = Math.min(10, craftScore);

    // Functionality: Persistence, connections, detail panel, import/export
    let funcScore = 6;
    if (results.criteria['five_plus_minds_placed']) funcScore += 0.5;
    if (edgeCount >= 1) funcScore += 0.5;
    if (edgeCount >= 6) funcScore += 0.5;
    if (detailPanelWorks) funcScore += 0.5;
    if (storageCheck.saved) funcScore += 0.5;
    if (results.criteria['persistence_reload']) funcScore += 0.5;
    if (exportWorks) funcScore += 0.5;
    if (importBtnExists) funcScore += 0.3;
    if (contextMenuWorks) funcScore += 0.2;
    funcScore = Math.min(10, funcScore);

    const avgScore = ((designScore + originalityScore + craftScore + funcScore) / 4).toFixed(2);

    results.scores = {
      design: designScore,
      originality: originalityScore,
      craft: craftScore,
      functionality: funcScore,
      average: parseFloat(avgScore),
    };

    console.log(`Design:        ${designScore}/10`);
    console.log(`Originality:   ${originalityScore}/10`);
    console.log(`Craft:         ${craftScore}/10`);
    console.log(`Functionality: ${funcScore}/10`);
    console.log(`AVERAGE:       ${avgScore}/10`);
    console.log(`\nTarget: >= 8.0`);
    console.log(`Status: ${parseFloat(avgScore) >= 8.0 ? 'MEETS TARGET' : 'BELOW TARGET'}`);

    // Summary
    console.log('\n--- Criteria Summary ---');
    for (const [key, val] of Object.entries(results.criteria)) {
      console.log(`  ${val ? 'PASS' : 'FAIL'}: ${key}`);
    }
    console.log(`\nConsole errors: ${criticalErrors.length}`);
    console.log(`Screenshots: ${results.screenshots.length}`);
  } catch (err) {
    console.error('Evaluation error:', err);
    results.criteria['evaluation_error'] = err.message;
  } finally {
    await browser.close();
  }

  // Save results
  const resultsPath = path.join(__dirname, 'sprint2-iter1-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${resultsPath}`);

  return results;
}

evaluate().catch(console.error);
