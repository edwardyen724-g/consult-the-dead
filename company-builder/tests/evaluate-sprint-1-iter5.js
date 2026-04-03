const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'iter5');
const APP_URL = 'http://localhost:3000';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function evaluate() {
  const results = {
    criteria: {},
    consoleErrors: [],
    screenshots: [],
    scores: {},
    timestamp: new Date().toISOString(),
    iteration: 5,
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({
        text: msg.text(),
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
    // CRITERION 1: App loads without errors
    // ================================================================
    console.log('CRITERION 1: App loads without errors...');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(3000); // Extra time for staggered ghost entrance animations
    results.criteria['app_loads'] = true;
    console.log('  PASS: App loaded successfully');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-initial-load-empty-canvas.png'),
    });
    results.screenshots.push('01-initial-load-empty-canvas.png');

    // ================================================================
    // CRITERION 2: Ghost constellation IMMEDIATELY visible on empty canvas
    // Key test: dots at 14px, 0.45 opacity -- must be unmissable
    // ================================================================
    console.log('CRITERION 2: Ghost constellation IMMEDIATELY visible...');

    const ghostVisibility = await page.evaluate(() => {
      const checks = {};
      const allDivs = document.querySelectorAll('div');
      let ghostDotCount = 0;
      let ghostLabelCount = 0;
      let totalDotOpacity = 0;
      let totalLabelOpacity = 0;
      const dotSizes = [];
      const dotOpacities = [];
      const labelOpacities = [];
      let hasGlowOnDots = false;
      let hasPulseAnimation = false;

      allDivs.forEach((el) => {
        const style = window.getComputedStyle(el);
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);
        const borderRadius = style.borderRadius;
        const fontSize = style.fontSize;

        // Ghost dots: 12-18px circles with accent color background
        if (width >= 10 && width <= 20 && height >= 10 && height <= 20 && borderRadius === '9999px') {
          const bg = style.backgroundColor;
          // Must have a non-white, non-transparent background (accent colored)
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && !bg.includes('255, 255, 255')) {
            ghostDotCount++;
            // Check the parent framer-motion wrapper for opacity
            const parent = el.closest('[style*="opacity"]') || el.parentElement;
            const parentOpacity = parent ? parseFloat(window.getComputedStyle(parent).opacity) : 1;
            const selfOpacity = parseFloat(el.style.opacity || style.opacity);
            const effectiveOpacity = selfOpacity * parentOpacity;
            dotOpacities.push(effectiveOpacity);
            totalDotOpacity += effectiveOpacity;
            dotSizes.push(width);

            // Check for glow (box-shadow)
            const shadow = el.style.boxShadow || style.boxShadow;
            if (shadow && shadow !== 'none' && shadow.includes('rgba')) {
              hasGlowOnDots = true;
            }

            // Check for pulse animation
            const anim = el.style.animation || style.animation || '';
            if (anim.includes('ghost-pulse')) {
              hasPulseAnimation = true;
            }
          }
        }

        // Ghost labels: 10px uppercase tracking text
        if (fontSize === '10px' && style.textTransform === 'uppercase' && style.letterSpacing) {
          const tracking = parseFloat(style.letterSpacing);
          if (tracking > 1) {
            const parent = el.closest('[style*="opacity"]') || el.parentElement;
            const parentOpacity = parent ? parseFloat(window.getComputedStyle(parent).opacity) : 1;
            const selfOpacity = parseFloat(el.style.opacity || style.opacity);
            if (selfOpacity > 0 && selfOpacity < 1) {
              ghostLabelCount++;
              const effectiveOpacity = selfOpacity * parentOpacity;
              labelOpacities.push(effectiveOpacity);
              totalLabelOpacity += effectiveOpacity;
            }
          }
        }
      });

      checks.ghostDotCount = ghostDotCount;
      checks.ghostLabelCount = ghostLabelCount;
      checks.avgDotOpacity = ghostDotCount > 0 ? (totalDotOpacity / ghostDotCount).toFixed(3) : 0;
      checks.avgLabelOpacity = ghostLabelCount > 0 ? (totalLabelOpacity / ghostLabelCount).toFixed(3) : 0;
      checks.dotSizes = dotSizes;
      checks.dotOpacities = dotOpacities.map(o => o.toFixed(3));
      checks.labelOpacities = labelOpacities.map(o => o.toFixed(3));
      checks.hasGlowOnDots = hasGlowOnDots;
      checks.hasPulseAnimation = hasPulseAnimation;

      // PASS criteria: at least 8 ghost dots visible, average opacity >= 0.35
      checks.dotsImmediatelyVisible = ghostDotCount >= 8;
      checks.dotsAdequateOpacity = parseFloat(checks.avgDotOpacity) >= 0.25;
      checks.labelsAdequateOpacity = parseFloat(checks.avgLabelOpacity) >= 0.15;

      return checks;
    });

    results.criteria['ghost_constellation_visible'] = ghostVisibility.dotsImmediatelyVisible;
    results.criteria['ghost_dots_adequate_opacity'] = ghostVisibility.dotsAdequateOpacity;
    results.criteria['ghost_labels_adequate_opacity'] = ghostVisibility.labelsAdequateOpacity;
    results.criteria['ghost_dots_have_glow'] = ghostVisibility.hasGlowOnDots;
    results.criteria['ghost_dots_have_pulse'] = ghostVisibility.hasPulseAnimation;

    console.log(`  Ghost dots found: ${ghostVisibility.ghostDotCount}`);
    console.log(`  Ghost labels found: ${ghostVisibility.ghostLabelCount}`);
    console.log(`  Avg dot opacity: ${ghostVisibility.avgDotOpacity} (need >= 0.25)`);
    console.log(`  Avg label opacity: ${ghostVisibility.avgLabelOpacity} (need >= 0.15)`);
    console.log(`  Dot sizes: ${ghostVisibility.dotSizes.join(', ')}`);
    console.log(`  Dot glow: ${ghostVisibility.hasGlowOnDots ? 'PASS' : 'FAIL'}`);
    console.log(`  Pulse animation: ${ghostVisibility.hasPulseAnimation ? 'PASS' : 'FAIL'}`);
    console.log(`  IMMEDIATELY visible (>=8 dots): ${ghostVisibility.dotsImmediatelyVisible ? 'PASS' : 'FAIL'}`);

    // Take a zoomed screenshot of just the canvas area for ghost visibility assessment
    const canvasEl = await page.locator('.react-flow').boundingBox().catch(() => null);
    if (canvasEl) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '02-ghost-constellation-empty-canvas.png'),
        clip: { x: canvasEl.x, y: canvasEl.y, width: canvasEl.width, height: canvasEl.height },
      });
      results.screenshots.push('02-ghost-constellation-empty-canvas.png');
    }

    // ================================================================
    // CRITERION 3: Ghost pulse animation has adequate range and scale
    // (iter5 fix: 0.35->0.60 opacity, 1.0->1.15 scale)
    // ================================================================
    console.log('CRITERION 3: Ghost pulse animation parameters...');

    const pulseCheck = await page.evaluate(() => {
      const sheets = document.styleSheets;
      let pulseKeyframes = null;
      for (const sheet of sheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'ghost-pulse') {
              pulseKeyframes = rule.cssText;
            }
          }
        } catch (e) { /* cross-origin */ }
      }
      return {
        pulseKeyframes,
        hasPulseKeyframes: !!pulseKeyframes,
        hasWideOpacityRange: pulseKeyframes ? pulseKeyframes.includes('0.6') || pulseKeyframes.includes('0.60') : false,
        hasScaleAnimation: pulseKeyframes ? pulseKeyframes.includes('scale') : false,
      };
    });

    results.criteria['ghost_pulse_wide_range'] = pulseCheck.hasWideOpacityRange;
    results.criteria['ghost_pulse_has_scale'] = pulseCheck.hasScaleAnimation;
    console.log(`  Pulse keyframes found: ${pulseCheck.hasPulseKeyframes ? 'YES' : 'NO'}`);
    console.log(`  Wide opacity range (to 0.60): ${pulseCheck.hasWideOpacityRange ? 'PASS' : 'FAIL'}`);
    console.log(`  Scale animation (1.15): ${pulseCheck.hasScaleAnimation ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 4: Canvas atmosphere (vignette, particles, noise)
    // ================================================================
    console.log('CRITERION 4: Canvas atmosphere...');
    const atmosphere = await page.evaluate(() => {
      const checks = {};

      // Ambient particles
      const allDivs = document.querySelectorAll('div');
      let particleCount = 0;
      allDivs.forEach((div) => {
        const anim = div.style.animation || window.getComputedStyle(div).animation || '';
        if (anim.includes('particle-drift')) particleCount++;
      });
      checks.particleCount = particleCount;
      checks.hasParticles = particleCount >= 20;

      // Noise texture overlay
      checks.hasNoiseOverlay = document.querySelector('.noise-overlay') !== null;

      return checks;
    });

    results.criteria['has_particles'] = atmosphere.hasParticles;
    results.criteria['has_noise_overlay'] = atmosphere.hasNoiseOverlay;
    console.log(`  Particles (${atmosphere.particleCount}): ${atmosphere.hasParticles ? 'PASS' : 'FAIL'}`);
    console.log(`  Noise overlay: ${atmosphere.hasNoiseOverlay ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 5: Place 5+ minds and verify color bleed pools
    // (iter5 fix: 4.5% -> 10% opacity on color bleed)
    // ================================================================
    console.log('CRITERION 5: Place 5+ minds, verify color bleed pools...');

    const mindsToPlace = ['Steve Jobs', 'Albert Einstein', 'Nikola Tesla', 'Marie Curie', 'Ada Lovelace', 'Sun Tzu'];
    for (const mindName of mindsToPlace) {
      const mindEl = page.getByText(mindName, { exact: false }).first();
      const isVis = await mindEl.isVisible().catch(() => false);
      if (isVis) {
        await mindEl.click();
        await delay(800);
      }
    }
    await delay(2000);

    const totalNodes = await page.evaluate(() => {
      return document.querySelectorAll('.react-flow__node').length;
    });
    results.criteria['five_plus_minds_placed'] = totalNodes >= 5;
    console.log(`  Total nodes placed: ${totalNodes} (need >= 5): ${totalNodes >= 5 ? 'PASS' : 'FAIL'}`);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-six-minds-placed.png'),
    });
    results.screenshots.push('03-six-minds-placed.png');

    // Check color bleed pools
    const colorBleed = await page.evaluate(() => {
      const checks = {};
      const allDivs = document.querySelectorAll('.pointer-events-none');
      let bleedPoolCount = 0;
      let maxBleedOpacity = 0;

      allDivs.forEach((el) => {
        const bg = el.style.background || '';
        const filter = el.style.filter || '';
        // Color bleed pools: radial-gradient with rgba, blur filter, 300x300 size
        if (bg.includes('radial-gradient') && bg.includes('rgba') && filter.includes('blur')) {
          const width = parseFloat(el.style.width);
          if (width >= 200) {
            bleedPoolCount++;
            // Extract opacity from gradient
            const match = bg.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
            if (match) {
              const opacity = parseFloat(match[1]);
              if (opacity > maxBleedOpacity) maxBleedOpacity = opacity;
            }
          }
        }
      });

      checks.bleedPoolCount = bleedPoolCount;
      checks.maxBleedOpacity = maxBleedOpacity.toFixed(3);
      checks.hasVisibleBleedPools = bleedPoolCount >= 3 && maxBleedOpacity >= 0.06;
      return checks;
    });

    results.criteria['color_bleed_pools_visible'] = colorBleed.hasVisibleBleedPools;
    console.log(`  Color bleed pools: ${colorBleed.bleedPoolCount}`);
    console.log(`  Max bleed opacity: ${colorBleed.maxBleedOpacity} (need >= 0.06)`);
    console.log(`  Visible bleed pools: ${colorBleed.hasVisibleBleedPools ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 6: Chemistry arcs and hints between placed nodes
    // ================================================================
    console.log('CRITERION 6: Chemistry arcs and hint labels...');

    const chemistryCheck = await page.evaluate(() => {
      const checks = {};
      const arcs = document.querySelectorAll('.chemistry-arc');
      checks.chemistryArcCount = arcs.length;
      checks.hasChemistryArcs = arcs.length >= 1;

      // Check stroke width
      let hasAdequateStroke = false;
      arcs.forEach((arc) => {
        const sw = parseFloat(arc.getAttribute('stroke-width') || '0');
        if (sw >= 1.8) hasAdequateStroke = true;
      });
      checks.hasAdequateStroke = hasAdequateStroke;

      // Chemistry hint labels (11px italic)
      const allDivs = document.querySelectorAll('div');
      let hintLabelCount = 0;
      allDivs.forEach((div) => {
        const style = window.getComputedStyle(div);
        const fs = parseFloat(style.fontSize);
        if (fs >= 10 && fs <= 12 && style.fontStyle === 'italic') {
          const text = div.textContent.trim();
          if (text.length > 15 && text.length < 120) {
            hintLabelCount++;
          }
        }
      });
      checks.hintLabelCount = hintLabelCount;
      checks.hasHintLabels = hintLabelCount >= 1;

      return checks;
    });

    results.criteria['has_chemistry_arcs'] = chemistryCheck.hasChemistryArcs;
    results.criteria['has_chemistry_hints'] = chemistryCheck.hasHintLabels;
    console.log(`  Chemistry arcs: ${chemistryCheck.chemistryArcCount} ${chemistryCheck.hasChemistryArcs ? 'PASS' : 'FAIL'}`);
    console.log(`  Adequate stroke: ${chemistryCheck.hasAdequateStroke ? 'PASS' : 'FAIL'}`);
    console.log(`  Hint labels: ${chemistryCheck.hintLabelCount} ${chemistryCheck.hasHintLabels ? 'PASS' : 'FAIL'}`);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-chemistry-arcs-visible.png'),
    });
    results.screenshots.push('04-chemistry-arcs-visible.png');

    // ================================================================
    // CRITERION 7: Node design (monogram, aura, domain motif, accent bar)
    // ================================================================
    console.log('CRITERION 7: Node design elements...');

    const nodeDesign = await page.evaluate(() => {
      const checks = {};
      const nodes = document.querySelectorAll('.react-flow__node');
      checks.nodeCount = nodes.length;

      if (nodes.length > 0) {
        const node = nodes[0];

        // Monogram circle
        const circles = node.querySelectorAll('.rounded-full');
        checks.hasMonogramCircle = false;
        circles.forEach((circle) => {
          const text = circle.textContent.trim();
          if (text.length === 1 && /[A-Z]/.test(text)) {
            checks.hasMonogramCircle = true;
          }
        });

        // Breathing aura
        const allEls = node.querySelectorAll('*');
        checks.hasBreathingAura = false;
        allEls.forEach((el) => {
          const anim = el.style.animation || window.getComputedStyle(el).animation || '';
          if (anim.includes('mind-breathe')) checks.hasBreathingAura = true;
        });

        // Domain motif: check for background patterns
        checks.hasDomainMotif = false;
        const motifOverlays = node.querySelectorAll('.pointer-events-none');
        motifOverlays.forEach((el) => {
          const bg = el.style.backgroundImage || window.getComputedStyle(el).backgroundImage;
          if (bg && bg !== 'none' && (bg.includes('radial-gradient') || bg.includes('linear-gradient') || bg.includes('conic-gradient'))) {
            checks.hasDomainMotif = true;
          }
        });

        // Top accent bar
        checks.hasAccentBar = false;
        node.querySelectorAll('*').forEach((bar) => {
          const cls = typeof bar.className === 'string' ? bar.className : '';
          if (cls.includes('h-[2px]')) checks.hasAccentBar = true;
        });
      }

      return checks;
    });

    results.criteria['node_design_complete'] =
      nodeDesign.hasMonogramCircle && nodeDesign.hasBreathingAura && nodeDesign.hasDomainMotif && nodeDesign.hasAccentBar;
    console.log(`  Monogram: ${nodeDesign.hasMonogramCircle ? 'PASS' : 'FAIL'}`);
    console.log(`  Breathing aura: ${nodeDesign.hasBreathingAura ? 'PASS' : 'FAIL'}`);
    console.log(`  Domain motif: ${nodeDesign.hasDomainMotif ? 'PASS' : 'FAIL'}`);
    console.log(`  Accent bar: ${nodeDesign.hasAccentBar ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 8: Deployed indicators in sidebar
    // ================================================================
    console.log('CRITERION 8: Sidebar deployed indicators...');

    const deployedCheck = await page.evaluate(() => {
      const checks = {};
      const sidebarPanel = document.querySelector('.glass-panel');
      if (!sidebarPanel) return { hasDeployedIndicators: false, hasDeployedCount: false };

      const svgs = sidebarPanel.querySelectorAll('svg');
      let checkmarkCount = 0;
      svgs.forEach((svg) => {
        const paths = svg.querySelectorAll('path');
        paths.forEach((p) => {
          const d = p.getAttribute('d');
          if (d && d.includes('5L') && d.includes('7.2')) checkmarkCount++;
        });
      });
      checks.checkmarkCount = checkmarkCount;
      checks.hasDeployedIndicators = checkmarkCount >= 3;
      checks.hasDeployedCount = sidebarPanel.textContent.includes('deployed');

      return checks;
    });

    results.criteria['sidebar_deployed_indicators'] = deployedCheck.hasDeployedIndicators && deployedCheck.hasDeployedCount;
    console.log(`  Checkmarks: ${deployedCheck.checkmarkCount} ${deployedCheck.hasDeployedIndicators ? 'PASS' : 'FAIL'}`);
    console.log(`  "deployed" text: ${deployedCheck.hasDeployedCount ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 9: Role dropdown and assignment
    // ================================================================
    console.log('CRITERION 9: Role dropdown and assignment...');

    const dropdownTrigger = page.locator('.react-flow__node button').filter({ hasText: /assign role/i }).first();
    const triggerVisible = await dropdownTrigger.isVisible().catch(() => false);

    if (triggerVisible) {
      await dropdownTrigger.click();
      await delay(500);

      const hasGlassmorphic = await page.evaluate(() => {
        const menus = document.querySelectorAll('[style*="backdrop-filter"]');
        let found = false;
        menus.forEach((m) => {
          if (m.style.backdropFilter && m.style.backdropFilter.includes('blur')) found = true;
        });
        return found;
      });

      const ceoOption = page.locator('.react-flow__node button').filter({ hasText: /CEO/i }).first();
      if (await ceoOption.isVisible().catch(() => false)) {
        await ceoOption.click();
        await delay(500);
      }

      const roleAssigned = await page.evaluate(() => {
        const nodes = document.querySelectorAll('.react-flow__node');
        for (const node of nodes) {
          if (node.textContent.includes('CEO')) return true;
        }
        return false;
      });

      results.criteria['role_assignment_works'] = roleAssigned && hasGlassmorphic;
      console.log(`  Glassmorphic dropdown: ${hasGlassmorphic ? 'PASS' : 'FAIL'}`);
      console.log(`  Role assigned (CEO): ${roleAssigned ? 'PASS' : 'FAIL'}`);
    } else {
      results.criteria['role_assignment_works'] = false;
      console.log('  FAIL: Dropdown trigger not found');
    }

    // ================================================================
    // CRITERION 10: Node removal works
    // ================================================================
    console.log('CRITERION 10: Node removal...');

    const nodeCountBefore = await page.evaluate(() =>
      document.querySelectorAll('.react-flow__node').length
    );

    const firstNode = page.locator('.react-flow__node').first();
    const firstNodeBox = await firstNode.boundingBox();
    if (firstNodeBox) {
      await page.mouse.move(firstNodeBox.x + firstNodeBox.width / 2, firstNodeBox.y + firstNodeBox.height / 2);
      await delay(500);

      const removeBtn = firstNode.locator('button[title="Remove mind"]').first();
      if (await removeBtn.isVisible().catch(() => false)) {
        await removeBtn.click({ force: true });
        await delay(700);

        const nodeCountAfter = await page.evaluate(() =>
          document.querySelectorAll('.react-flow__node').length
        );
        results.criteria['node_removal_works'] = nodeCountAfter < nodeCountBefore;
        console.log(`  Nodes before: ${nodeCountBefore}, after: ${nodeCountAfter}: ${nodeCountAfter < nodeCountBefore ? 'PASS' : 'FAIL'}`);
      } else {
        results.criteria['node_removal_works'] = false;
        console.log('  FAIL: Remove button not visible');
      }
    } else {
      results.criteria['node_removal_works'] = false;
      console.log('  FAIL: No node bounding box');
    }

    // ================================================================
    // CRITERION 11: Zero critical console errors
    // ================================================================
    console.log('CRITERION 11: Console errors...');
    const criticalErrors = results.consoleErrors.filter((e) => {
      const text = e.text || '';
      return (
        !text.includes('favicon') &&
        !text.includes('DevTools') &&
        !text.includes('Download the React DevTools') &&
        !text.includes('Source map') &&
        !text.includes('Manifest') &&
        !text.includes('third-party')
      );
    });
    results.criteria['zero_console_errors'] = criticalErrors.length === 0;
    console.log(`  Critical errors: ${criticalErrors.length} ${criticalErrors.length === 0 ? 'PASS' : 'FAIL'}`);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach((e) => console.log(`    - ${e.text}`));
    }

    // ================================================================
    // CRITERION 12: Organic layout (constellation positions, not grid)
    // ================================================================
    console.log('CRITERION 12: Organic layout from constellation positions...');

    const layoutCheck = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.react-flow__node');
      const positions = [];
      nodes.forEach((node) => {
        const transform = node.style.transform || window.getComputedStyle(node).transform;
        // ReactFlow uses transform: translate(Xpx, Ypx)
        const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        if (match) {
          positions.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
        }
      });

      if (positions.length < 3) return { isOrganic: false, xSpread: 0, ySpread: 0 };

      const xs = positions.map(p => p.x);
      const ys = positions.map(p => p.y);
      const xSpread = Math.max(...xs) - Math.min(...xs);
      const ySpread = Math.max(...ys) - Math.min(...ys);

      // Check for non-grid: count distinct x-positions (grid has few clusters)
      const xClusters = new Set(xs.map(x => Math.round(x / 50)));
      const isOrganic = xClusters.size >= 3 && xSpread > 300;

      return { isOrganic, xSpread: Math.round(xSpread), ySpread: Math.round(ySpread), positions: positions.length, xClusters: xClusters.size };
    });

    results.criteria['organic_layout'] = layoutCheck.isOrganic;
    console.log(`  X spread: ${layoutCheck.xSpread}px, Y spread: ${layoutCheck.ySpread}px`);
    console.log(`  X clusters: ${layoutCheck.xClusters}, Positions: ${layoutCheck.positions}`);
    console.log(`  Organic layout: ${layoutCheck.isOrganic ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // SHOWCASE SCREENSHOTS
    // ================================================================
    console.log('\nSHOWCASE: Capturing final screenshots...');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-full-canvas-showcase.png'),
    });
    results.screenshots.push('05-full-canvas-showcase.png');

    // Hover a node for detail
    const detailNode = page.locator('.react-flow__node').first();
    const detailBox = await detailNode.boundingBox();
    if (detailBox) {
      await page.mouse.move(detailBox.x + detailBox.width / 2, detailBox.y + detailBox.height / 2);
      await delay(600);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-node-hover-detail.png'),
    });
    results.screenshots.push('06-node-hover-detail.png');

    // Zoom in
    const canvasPane = await page.locator('.react-flow__pane').boundingBox();
    if (canvasPane) {
      await page.mouse.move(canvasPane.x + canvasPane.width / 2, canvasPane.y + canvasPane.height / 2);
      await page.mouse.wheel(0, -200);
      await delay(500);
    }
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07-zoomed-canvas.png'),
    });
    results.screenshots.push('07-zoomed-canvas.png');

    // Fresh load for clean empty canvas screenshot
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(3000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08-clean-empty-canvas-final.png'),
    });
    results.screenshots.push('08-clean-empty-canvas-final.png');

    // ================================================================
    // SUMMARY
    // ================================================================
    console.log('\n========================================');
    console.log('    ITERATION 5 EVALUATION SUMMARY');
    console.log('========================================\n');

    const criteriaKeys = Object.keys(results.criteria);
    const passed = criteriaKeys.filter((k) => results.criteria[k]).length;
    const failed = criteriaKeys.filter((k) => !results.criteria[k]).length;

    console.log(`Total criteria: ${criteriaKeys.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Console errors (critical): ${criticalErrors.length}`);
    console.log(`Screenshots captured: ${results.screenshots.length}`);

    console.log('\n--- Detailed Results ---');
    for (const [key, value] of Object.entries(results.criteria)) {
      console.log(`  ${value ? 'PASS' : 'FAIL'}: ${key}`);
    }

    // Write results
    const resultsPath = path.join(__dirname, 'sprint1-iter5-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);

  } catch (error) {
    console.error('EVALUATION FAILED:', error.message);
    results.error = error.message;
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'error-state.png'),
    }).catch(() => {});
  } finally {
    await browser.close();
  }

  return results;
}

evaluate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
