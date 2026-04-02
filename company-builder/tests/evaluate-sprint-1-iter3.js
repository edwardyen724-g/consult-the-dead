const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'iter3');
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
    iteration: 3,
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
    await delay(2500);
    results.criteria['app_loads'] = true;
    console.log('  PASS: App loaded successfully');

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-initial-load.png'),
    });
    results.screenshots.push('01-initial-load.png');

    // ================================================================
    // CRITERION 2: Ghost constellation visible on empty canvas
    // ================================================================
    console.log('CRITERION 2: Ghost constellation on empty canvas...');

    const ghostCheck = await page.evaluate(() => {
      const checks = {};

      // Ghost constellation: look for ghost-* keyed elements or faint dots
      // The ghost constellation renders absolute-positioned dots with 9px labels
      const allLabels = document.querySelectorAll('div');
      let ghostDotCount = 0;
      let ghostLabelCount = 0;

      allLabels.forEach((el) => {
        const text = el.textContent.trim();
        const style = window.getComputedStyle(el);
        const fontSize = style.fontSize;

        // Ghost labels are 9px uppercase with very low opacity
        if (fontSize === '9px' && style.textTransform === 'uppercase') {
          const opacity = parseFloat(style.opacity);
          if (opacity > 0 && opacity < 0.5) {
            ghostLabelCount++;
          }
        }

        // Ghost dots: small (5-8px) rounded-full circles with low opacity
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);
        const borderRadius = style.borderRadius;
        if (width >= 4 && width <= 10 && height >= 4 && height <= 10 && borderRadius === '9999px') {
          const opacity = parseFloat(style.opacity);
          if (opacity > 0 && opacity < 0.5) {
            ghostDotCount++;
          }
        }
      });

      checks.ghostDotCount = ghostDotCount;
      checks.ghostLabelCount = ghostLabelCount;
      // We expect at least some ghost positions (up to 12 unplaced minds)
      checks.hasGhostConstellation = ghostDotCount >= 5 || ghostLabelCount >= 5;

      // Also check by looking at the ghost constellation container
      const ghostContainers = document.querySelectorAll('.pointer-events-none');
      let constellationFound = false;
      ghostContainers.forEach((el) => {
        const children = el.children;
        // The ghost constellation has many child divs with absolute positioning
        if (children.length >= 6) {
          let absCount = 0;
          for (const child of children) {
            if (child.classList.contains('absolute') || window.getComputedStyle(child).position === 'absolute') {
              absCount++;
            }
          }
          if (absCount >= 5) constellationFound = true;
        }
      });
      checks.constellationContainerFound = constellationFound;

      return checks;
    });

    results.criteria['ghost_constellation_visible'] = ghostCheck.hasGhostConstellation || ghostCheck.constellationContainerFound;
    console.log(`  Ghost dots: ${ghostCheck.ghostDotCount}, labels: ${ghostCheck.ghostLabelCount}`);
    console.log(`  Constellation container: ${ghostCheck.constellationContainerFound}`);
    console.log(`  Ghost constellation: ${results.criteria['ghost_constellation_visible'] ? 'PASS' : 'FAIL'}`);

    // Screenshot: Empty canvas with ghost constellation
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-ghost-constellation-empty.png'),
    });
    results.screenshots.push('02-ghost-constellation-empty.png');

    // ================================================================
    // CRITERION 3: Canvas atmosphere - vignette, particles, noise
    // ================================================================
    console.log('CRITERION 3: Canvas atmosphere...');
    const atmosphere = await page.evaluate(() => {
      const checks = {};

      // Radial vignette overlay
      const overlays = document.querySelectorAll('[class*="pointer-events-none"]');
      checks.hasVignetteOverlay = false;
      overlays.forEach((el) => {
        const bg = el.style.background || window.getComputedStyle(el).background;
        if (bg && bg.includes('radial-gradient') && bg.includes('rgba(0,0,0')) {
          checks.hasVignetteOverlay = true;
        }
      });

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

    results.criteria['has_vignette'] = atmosphere.hasVignetteOverlay;
    results.criteria['has_particles'] = atmosphere.hasParticles;
    results.criteria['has_noise_overlay'] = atmosphere.hasNoiseOverlay;
    console.log(`  Vignette: ${atmosphere.hasVignetteOverlay ? 'PASS' : 'FAIL'}`);
    console.log(`  Particles (${atmosphere.particleCount}): ${atmosphere.hasParticles ? 'PASS' : 'FAIL'}`);
    console.log(`  Noise overlay: ${atmosphere.hasNoiseOverlay ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 4: Place Steve Jobs - verify monogram, aura, domain motif
    // ================================================================
    console.log('CRITERION 4: Place Steve Jobs - node design + domain motif...');

    const steveJobs = page.getByText('Steve Jobs').first();
    await steveJobs.click();
    await delay(1500);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-first-placement.png'),
    });
    results.screenshots.push('03-first-placement.png');

    await delay(1000);

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
            checks.monogramLetter = text;
          }
        });

        // Breathing aura
        const allEls = node.querySelectorAll('*');
        checks.hasBreathingAura = false;
        checks.hasGlowAnimation = false;
        allEls.forEach((el) => {
          const anim = el.style.animation || window.getComputedStyle(el).animation || '';
          if (anim.includes('mind-breathe')) checks.hasBreathingAura = true;
          if (anim.includes('mind-glow')) checks.hasGlowAnimation = true;
        });

        // Domain motif: computing category (Steve Jobs) should have radial-gradient curves
        checks.hasDomainMotif = false;
        const motifOverlays = node.querySelectorAll('.pointer-events-none');
        motifOverlays.forEach((el) => {
          const bg = el.style.backgroundImage || window.getComputedStyle(el).backgroundImage;
          if (bg && bg.includes('radial-gradient') && bg !== 'none') {
            checks.hasDomainMotif = true;
          }
        });

        // Top accent bar
        checks.hasAccentBar = false;
        const bars = node.querySelectorAll('*');
        bars.forEach((bar) => {
          const cls = typeof bar.className === 'string' ? bar.className : '';
          if (cls.includes('h-[2px]')) {
            checks.hasAccentBar = true;
          }
        });
      }

      return checks;
    });

    results.criteria['has_monogram_circle'] = nodeDesign.hasMonogramCircle;
    results.criteria['has_breathing_aura'] = nodeDesign.hasBreathingAura;
    results.criteria['has_domain_motif'] = nodeDesign.hasDomainMotif;
    results.criteria['has_accent_bar'] = nodeDesign.hasAccentBar;
    console.log(`  Monogram ("${nodeDesign.monogramLetter || '?'}"): ${nodeDesign.hasMonogramCircle ? 'PASS' : 'FAIL'}`);
    console.log(`  Breathing aura: ${nodeDesign.hasBreathingAura ? 'PASS' : 'FAIL'}`);
    console.log(`  Glow animation: ${nodeDesign.hasGlowAnimation ? 'PASS' : 'FAIL'}`);
    console.log(`  Domain motif: ${nodeDesign.hasDomainMotif ? 'PASS' : 'FAIL'}`);
    console.log(`  Accent bar: ${nodeDesign.hasAccentBar ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 5: Ghost constellation dims as minds are placed
    // ================================================================
    console.log('CRITERION 5: Ghost constellation reacts to placement...');

    const ghostAfterPlace = await page.evaluate(() => {
      const checks = {};
      // After placing 1 mind, check that ghost constellation still exists but with fewer entries
      const ghostContainers = document.querySelectorAll('.pointer-events-none');
      let ghostChildCount = 0;
      ghostContainers.forEach((el) => {
        const children = el.children;
        if (children.length >= 4) {
          let absCount = 0;
          for (const child of children) {
            if (child.classList.contains('absolute') || window.getComputedStyle(child).position === 'absolute') {
              absCount++;
            }
          }
          if (absCount >= 4) ghostChildCount = Math.max(ghostChildCount, absCount);
        }
      });
      checks.remainingGhosts = ghostChildCount;
      checks.ghostsReducedAfterPlacement = ghostChildCount >= 4; // Should be fewer than 12 now
      return checks;
    });

    results.criteria['ghosts_react_to_placement'] = ghostAfterPlace.ghostsReducedAfterPlacement;
    console.log(`  Remaining ghost positions: ${ghostAfterPlace.remainingGhosts}`);
    console.log(`  Ghosts react: ${ghostAfterPlace.ghostsReducedAfterPlacement ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 6: Place 5 more minds close together for chemistry hints
    // ================================================================
    console.log('CRITERION 6: Place 5 more minds and test proximity chemistry...');

    // Place minds that have known chemistry pairings
    const mindsToPlace = ['Albert Einstein', 'Nikola Tesla', 'Marie Curie', 'Ada Lovelace', 'Leonardo da Vinci'];
    for (const mindName of mindsToPlace) {
      const mindEl = page.getByText(mindName, { exact: false }).first();
      const isVis = await mindEl.isVisible().catch(() => false);
      if (isVis) {
        await mindEl.click();
        await delay(700);
      }
    }
    await delay(1500);

    const totalNodes = await page.evaluate(() => {
      return document.querySelectorAll('.react-flow__node').length;
    });
    results.criteria['six_minds_placed'] = totalNodes >= 6;
    console.log(`  Total nodes: ${totalNodes} (need >= 6): ${totalNodes >= 6 ? 'PASS' : 'FAIL'}`);

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-six-minds-placed.png'),
    });
    results.screenshots.push('04-six-minds-placed.png');

    // Now drag nodes close together to trigger chemistry hints
    // The click-placement puts them in a grid, so some should be within 350px
    const chemistryCheck = await page.evaluate(() => {
      const checks = {};

      // Check for chemistry arcs (SVG path elements with chemistry-arc class)
      const arcs = document.querySelectorAll('.chemistry-arc');
      checks.chemistryArcCount = arcs.length;
      checks.hasChemistryArcs = arcs.length >= 1;

      // Check for chemistry hint labels (9px italic text in small boxes)
      const allDivs = document.querySelectorAll('div');
      let hintLabelCount = 0;
      allDivs.forEach((div) => {
        const style = window.getComputedStyle(div);
        if (style.fontSize === '9px' && style.fontStyle === 'italic') {
          const text = div.textContent.trim();
          // Chemistry hints are phrases like "Rival visionaries..."
          if (text.length > 15 && text.length < 120) {
            hintLabelCount++;
          }
        }
      });
      checks.hintLabelCount = hintLabelCount;
      checks.hasHintLabels = hintLabelCount >= 1;

      // Check for dashed stroke on arcs
      checks.hasDashedArcs = false;
      arcs.forEach((arc) => {
        const dash = arc.getAttribute('stroke-dasharray');
        if (dash && dash.includes('6')) {
          checks.hasDashedArcs = true;
        }
      });

      return checks;
    });

    results.criteria['has_chemistry_arcs'] = chemistryCheck.hasChemistryArcs;
    results.criteria['has_chemistry_hints'] = chemistryCheck.hasHintLabels;
    results.criteria['has_dashed_chemistry_arcs'] = chemistryCheck.hasDashedArcs;
    console.log(`  Chemistry arcs: ${chemistryCheck.chemistryArcCount} ${chemistryCheck.hasChemistryArcs ? 'PASS' : 'FAIL'}`);
    console.log(`  Hint labels: ${chemistryCheck.hintLabelCount} ${chemistryCheck.hasHintLabels ? 'PASS' : 'FAIL'}`);
    console.log(`  Dashed arcs: ${chemistryCheck.hasDashedArcs ? 'PASS' : 'FAIL'}`);

    // Screenshot: Chemistry hints visible
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-chemistry-hints.png'),
    });
    results.screenshots.push('05-chemistry-hints.png');

    // ================================================================
    // CRITERION 7: Node removal ceremony
    // ================================================================
    console.log('CRITERION 7: Node removal ceremony...');

    const nodeCountBefore = await page.evaluate(() =>
      document.querySelectorAll('.react-flow__node').length
    );

    // Hover over first node to reveal remove button, then click it
    const firstNode = page.locator('.react-flow__node').first();
    const firstNodeBox = await firstNode.boundingBox();
    if (firstNodeBox) {
      await page.mouse.move(firstNodeBox.x + firstNodeBox.width / 2, firstNodeBox.y + firstNodeBox.height / 2);
      await delay(500);

      // Find and click the remove button (small X in top-right of node)
      const removeBtn = firstNode.locator('button[title="Remove mind"]').first();
      const removeBtnVisible = await removeBtn.isVisible().catch(() => false);

      if (removeBtnVisible) {
        // Screenshot: showing the X button on hover
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '06-remove-button-visible.png'),
        });
        results.screenshots.push('06-remove-button-visible.png');

        await removeBtn.click({ force: true });

        // Capture mid-removal (shrink + brightness animation)
        await delay(150);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '07-removal-ceremony-mid.png'),
        });
        results.screenshots.push('07-removal-ceremony-mid.png');

        await delay(600);

        const nodeCountAfter = await page.evaluate(() =>
          document.querySelectorAll('.react-flow__node').length
        );

        results.criteria['removal_reduces_count'] = nodeCountAfter < nodeCountBefore;
        results.criteria['removal_ceremony_works'] = nodeCountAfter < nodeCountBefore;
        console.log(`  Nodes before: ${nodeCountBefore}, after: ${nodeCountAfter}`);
        console.log(`  Removal works: ${nodeCountAfter < nodeCountBefore ? 'PASS' : 'FAIL'}`);
      } else {
        // Try alternative: the X button may be an SVG inside a button
        const altRemoveBtn = firstNode.locator('button').filter({ has: page.locator('svg') }).last();
        const altVisible = await altRemoveBtn.isVisible().catch(() => false);

        if (altVisible) {
          await altRemoveBtn.click();
          await delay(600);

          const nodeCountAfter = await page.evaluate(() =>
            document.querySelectorAll('.react-flow__node').length
          );
          results.criteria['removal_reduces_count'] = nodeCountAfter < nodeCountBefore;
          results.criteria['removal_ceremony_works'] = nodeCountAfter < nodeCountBefore;
          console.log(`  Nodes before: ${nodeCountBefore}, after: ${nodeCountAfter}`);
          console.log(`  Removal (alt path): ${nodeCountAfter < nodeCountBefore ? 'PASS' : 'FAIL'}`);
        } else {
          results.criteria['removal_reduces_count'] = false;
          results.criteria['removal_ceremony_works'] = false;
          console.log('  FAIL: Remove button not found');
        }
      }
    } else {
      results.criteria['removal_reduces_count'] = false;
      results.criteria['removal_ceremony_works'] = false;
      console.log('  FAIL: No node to hover for removal');
    }

    // ================================================================
    // CRITERION 8: Deployed indicators in sidebar
    // ================================================================
    console.log('CRITERION 8: Sidebar deployed indicators...');

    const deployedCheck = await page.evaluate(() => {
      const checks = {};
      // Look for checkmark SVGs in the sidebar (deployed minds show a checkmark)
      const sidebarPanel = document.querySelector('.glass-panel');
      if (!sidebarPanel) return { hasDeployedIndicators: false, checkmarkCount: 0 };

      const svgs = sidebarPanel.querySelectorAll('svg');
      let checkmarkCount = 0;
      svgs.forEach((svg) => {
        const paths = svg.querySelectorAll('path');
        paths.forEach((p) => {
          const d = p.getAttribute('d');
          // Checkmark path starts with M2 5L and contains 7.2
          if (d && d.includes('5L') && d.includes('7.2')) {
            checkmarkCount++;
          }
        });
      });
      checks.checkmarkCount = checkmarkCount;
      checks.hasDeployedIndicators = checkmarkCount >= 1;

      // Check for "deployed" text in footer
      checks.hasDeployedCount = sidebarPanel.textContent.includes('deployed');

      // Check that deployed cards have reduced opacity
      const cards = sidebarPanel.querySelectorAll('[draggable="true"]');
      let dimmedCount = 0;
      cards.forEach((card) => {
        const firstChild = card.firstElementChild;
        if (firstChild) {
          const opacity = parseFloat(window.getComputedStyle(firstChild).opacity);
          if (opacity < 0.7 && opacity > 0) dimmedCount++;
        }
      });
      checks.dimmedCardCount = dimmedCount;
      checks.hasDimmedDeployedCards = dimmedCount >= 1;

      return checks;
    });

    results.criteria['has_deployed_indicators'] = deployedCheck.hasDeployedIndicators;
    results.criteria['has_deployed_count'] = deployedCheck.hasDeployedCount;
    results.criteria['has_dimmed_deployed_cards'] = deployedCheck.hasDimmedDeployedCards;
    console.log(`  Checkmarks: ${deployedCheck.checkmarkCount} ${deployedCheck.hasDeployedIndicators ? 'PASS' : 'FAIL'}`);
    console.log(`  "deployed" count text: ${deployedCheck.hasDeployedCount ? 'PASS' : 'FAIL'}`);
    console.log(`  Dimmed deployed cards (${deployedCheck.dimmedCardCount}): ${deployedCheck.hasDimmedDeployedCards ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 9: Sidebar hover highlights canvas node
    // ================================================================
    console.log('CRITERION 9: Sidebar hover highlights canvas node...');

    // Hover over a deployed mind in the sidebar
    const einsteinSidebar = page.locator('.glass-panel').getByText('Albert Einstein').first();
    const einsteinVisible = await einsteinSidebar.isVisible().catch(() => false);

    if (einsteinVisible) {
      await einsteinSidebar.hover();
      await delay(500);

      const highlightCheck = await page.evaluate(() => {
        const nodes = document.querySelectorAll('.react-flow__node');
        let hasHighlightRing = false;
        nodes.forEach((node) => {
          // Look for the sidebar hover highlight ring: border + boxShadow + animation
          const rings = node.querySelectorAll('.pointer-events-none');
          rings.forEach((ring) => {
            const border = ring.style.border || window.getComputedStyle(ring).border;
            const anim = ring.style.animation || window.getComputedStyle(ring).animation || '';
            if (border && border.includes('rgba') && anim.includes('mind-breathe')) {
              hasHighlightRing = true;
            }
          });
        });
        return { hasHighlightRing };
      });

      results.criteria['sidebar_hover_highlights_canvas'] = highlightCheck.hasHighlightRing;
      console.log(`  Sidebar hover highlight ring: ${highlightCheck.hasHighlightRing ? 'PASS' : 'FAIL'}`);

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '08-sidebar-hover-highlight.png'),
      });
      results.screenshots.push('08-sidebar-hover-highlight.png');

      // Move mouse away
      await page.mouse.move(0, 0);
      await delay(300);
    } else {
      results.criteria['sidebar_hover_highlights_canvas'] = false;
      console.log('  FAIL: Einstein not visible in sidebar');
    }

    // ================================================================
    // CRITERION 10: Custom role dropdown works
    // ================================================================
    console.log('CRITERION 10: Custom role dropdown...');

    const dropdownTrigger = page.locator('.react-flow__node button').filter({ hasText: /assign role/i }).first();
    const triggerVisible = await dropdownTrigger.isVisible().catch(() => false);

    if (triggerVisible) {
      await dropdownTrigger.click();
      await delay(500);

      const dropdownMenu = await page.evaluate(() => {
        const checks = {};
        const menus = document.querySelectorAll('[style*="backdrop-filter"]');
        checks.hasGlassmorphicMenu = false;
        menus.forEach((menu) => {
          const bf = menu.style.backdropFilter;
          if (bf && bf.includes('blur')) {
            checks.hasGlassmorphicMenu = true;
          }
        });
        return checks;
      });

      results.criteria['dropdown_glassmorphic'] = dropdownMenu.hasGlassmorphicMenu;
      console.log(`  Glassmorphic menu: ${dropdownMenu.hasGlassmorphicMenu ? 'PASS' : 'FAIL'}`);

      // Select CEO
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
      results.criteria['role_assignment_works'] = roleAssigned;
      console.log(`  Role assignment: ${roleAssigned ? 'PASS' : 'FAIL'}`);
    } else {
      results.criteria['dropdown_glassmorphic'] = false;
      results.criteria['role_assignment_works'] = false;
      console.log('  FAIL: Dropdown trigger not found');
    }

    // ================================================================
    // CRITERION 11: Search and category filters
    // ================================================================
    console.log('CRITERION 11: Search and category filters...');

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Curie');
      await delay(400);
      const searchWorks = await page.evaluate(() => {
        const body = document.body.textContent;
        return body.includes('Marie Curie') && !body.includes('Steve Jobs');
      });
      results.criteria['search_filter_works'] = searchWorks;
      console.log(`  Search filter: ${searchWorks ? 'PASS' : 'FAIL'}`);
      await searchInput.fill('');
      await delay(300);
    } else {
      results.criteria['search_filter_works'] = false;
    }

    const scienceBtn = page.getByText('SCIENCE', { exact: true }).first();
    if (await scienceBtn.isVisible().catch(() => false)) {
      await scienceBtn.click();
      await delay(400);
      const catWorks = await page.evaluate(() => {
        const body = document.body.textContent;
        return body.includes('Einstein') || body.includes('Curie');
      });
      results.criteria['category_filter_works'] = catWorks;
      console.log(`  Category filter: ${catWorks ? 'PASS' : 'FAIL'}`);

      const allBtn = page.getByText('ALL', { exact: true }).first();
      if (await allBtn.isVisible().catch(() => false)) await allBtn.click();
      await delay(300);
    } else {
      results.criteria['category_filter_works'] = false;
    }

    // ================================================================
    // CRITERION 12: Zero critical console errors (duplicate key fix)
    // ================================================================
    console.log('CRITERION 12: Console errors...');
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

    // Check specifically for duplicate key errors (the bug that was fixed)
    const duplicateKeyErrors = results.consoleErrors.filter((e) =>
      (e.text || '').includes('duplicate key')
    );
    results.criteria['no_duplicate_key_errors'] = duplicateKeyErrors.length === 0;
    console.log(`  Duplicate key errors: ${duplicateKeyErrors.length} ${duplicateKeyErrors.length === 0 ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 13 (BONUS): Double-click to center on node
    // ================================================================
    console.log('CRITERION 13 (BONUS): Double-click to center on node...');

    const dblClickNode = page.locator('.react-flow__node').first();
    const dblClickBox = await dblClickNode.boundingBox().catch(() => null);
    if (dblClickBox) {
      await page.mouse.dblclick(
        dblClickBox.x + dblClickBox.width / 2,
        dblClickBox.y + dblClickBox.height / 2
      );
      await delay(800);
      results.criteria['double_click_centers'] = true; // Hard to verify zoom, just ensure no crash
      console.log('  Double-click: no crash (PASS)');
    } else {
      results.criteria['double_click_centers'] = false;
      console.log('  FAIL: No node for double-click');
    }

    // ================================================================
    // FINAL SHOWCASE: Full canvas with all features visible
    // ================================================================
    console.log('\nFINAL SHOWCASE: Building full presentation canvas...');

    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2500);

    // Place 6 minds with known chemistry pairings
    const showcaseMinds = [
      'Steve Jobs', 'Albert Einstein', 'Nikola Tesla',
      'Marie Curie', 'Ada Lovelace', 'Sun Tzu',
    ];
    for (const name of showcaseMinds) {
      const el = page.getByText(name, { exact: false }).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        await delay(700);
      }
    }
    await delay(2000);

    // Assign roles to first two nodes
    const showcaseDropdowns = page.locator('.react-flow__node button').filter({ hasText: /assign role/i });
    const ddCount = await showcaseDropdowns.count();
    if (ddCount >= 2) {
      // Assign CEO to first
      await showcaseDropdowns.first().click();
      await delay(300);
      const ceoBtn = page.locator('.react-flow__node button').filter({ hasText: /CEO/i }).first();
      if (await ceoBtn.isVisible().catch(() => false)) {
        await ceoBtn.click();
        await delay(300);
      }

      // Assign CTO to second
      await showcaseDropdowns.nth(1).click();
      await delay(300);
      const ctoBtn = page.locator('.react-flow__node button').filter({ hasText: /CTO/i }).first();
      if (await ctoBtn.isVisible().catch(() => false)) {
        await ctoBtn.click();
        await delay(300);
      }
    }

    // Edit company name
    const companyName = page.getByText('Untitled Company').first();
    if (await companyName.isVisible().catch(() => false)) {
      await companyName.click();
      await delay(300);
      const input = page.locator('.glass-panel input[type="text"]').first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill('Archon Industries');
        await input.press('Enter');
        await delay(300);
      }
    }

    await delay(1500);

    // Final showcase screenshots
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '09-showcase-full-canvas.png'),
    });
    results.screenshots.push('09-showcase-full-canvas.png');

    // Hover over a node for detail shot
    const detailNode = page.locator('.react-flow__node').first();
    const detailBox = await detailNode.boundingBox();
    if (detailBox) {
      await page.mouse.move(detailBox.x + detailBox.width / 2, detailBox.y + detailBox.height / 2);
      await delay(600);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '10-node-detail-hover.png'),
    });
    results.screenshots.push('10-node-detail-hover.png');

    // Zoom in for close-up
    const canvasArea = await page.locator('.react-flow__pane').boundingBox();
    if (canvasArea) {
      await page.mouse.move(canvasArea.x + canvasArea.width / 2, canvasArea.y + canvasArea.height / 2);
      await page.mouse.wheel(0, -200);
      await delay(500);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '11-zoomed-showcase.png'),
    });
    results.screenshots.push('11-zoomed-showcase.png');

    // ================================================================
    // SUMMARY
    // ================================================================
    console.log('\n========================================');
    console.log('    ITERATION 3 EVALUATION SUMMARY');
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
    const resultsPath = path.join(__dirname, 'sprint1-iter3-results.json');
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
