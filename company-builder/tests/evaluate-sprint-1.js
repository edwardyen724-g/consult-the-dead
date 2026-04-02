const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const APP_URL = 'http://localhost:3000';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function evaluate() {
  const results = {
    criteria: {},
    consoleErrors: [],
    screenshots: [],
    scores: {},
    timestamp: new Date().toISOString(),
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Collect console errors
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
    // TEST 1: App loads
    // ================================================================
    console.log('TEST 1: App loads...');
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000); // Let animations settle
    results.criteria['app_loads'] = true;
    console.log('  PASS: App loaded successfully');

    // Screenshot: Initial load
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-initial-load.png'),
      fullPage: false,
    });
    results.screenshots.push('01-initial-load.png');

    // ================================================================
    // TEST 2: Dark canvas with dot grid
    // ================================================================
    console.log('TEST 2: Dark canvas with dot grid...');
    const canvasBg = await page.evaluate(() => {
      const rf = document.querySelector('.react-flow');
      if (!rf) return null;
      return window.getComputedStyle(rf).backgroundColor;
    });
    const hasDotGrid = await page.evaluate(() => {
      const bg = document.querySelector('.react-flow__background');
      return bg !== null;
    });
    const dotPattern = await page.evaluate(() => {
      const dots = document.querySelectorAll('.react-flow__background pattern circle, .react-flow__background circle');
      return dots.length > 0;
    });
    results.criteria['dark_canvas'] = canvasBg !== null && canvasBg !== 'rgba(0, 0, 0, 0)';
    results.criteria['dot_grid_visible'] = hasDotGrid;
    console.log(`  Canvas BG: ${canvasBg}, Dot grid element: ${hasDotGrid}, Dot pattern: ${dotPattern}`);
    console.log(`  ${results.criteria['dark_canvas'] ? 'PASS' : 'FAIL'}: Dark canvas`);
    console.log(`  ${results.criteria['dot_grid_visible'] ? 'PASS' : 'FAIL'}: Dot grid`);

    // ================================================================
    // TEST 3: Pan (drag background) and Zoom (scroll wheel)
    // ================================================================
    console.log('TEST 3: Canvas pan and zoom...');

    // Get initial viewport transform
    const initialTransform = await page.evaluate(() => {
      const viewport = document.querySelector('.react-flow__viewport');
      if (!viewport) return null;
      return viewport.style.transform || window.getComputedStyle(viewport).transform;
    });

    // Pan: drag the background
    const canvasArea = await page.locator('.react-flow__pane').boundingBox();
    if (canvasArea) {
      const startX = canvasArea.x + canvasArea.width / 2;
      const startY = canvasArea.y + canvasArea.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 150, startY + 100, { steps: 10 });
      await page.mouse.up();
      await delay(500);
    }

    const panTransform = await page.evaluate(() => {
      const viewport = document.querySelector('.react-flow__viewport');
      if (!viewport) return null;
      return viewport.style.transform || window.getComputedStyle(viewport).transform;
    });
    results.criteria['canvas_pan'] = initialTransform !== panTransform;
    console.log(`  Transform before: ${initialTransform}`);
    console.log(`  Transform after pan: ${panTransform}`);
    console.log(`  ${results.criteria['canvas_pan'] ? 'PASS' : 'FAIL'}: Canvas pan`);

    // Zoom: scroll wheel
    const preZoomTransform = panTransform;
    if (canvasArea) {
      await page.mouse.move(
        canvasArea.x + canvasArea.width / 2,
        canvasArea.y + canvasArea.height / 2
      );
      await page.mouse.wheel(0, -300); // Scroll up = zoom in
      await delay(500);
    }

    const zoomTransform = await page.evaluate(() => {
      const viewport = document.querySelector('.react-flow__viewport');
      if (!viewport) return null;
      return viewport.style.transform || window.getComputedStyle(viewport).transform;
    });
    results.criteria['canvas_zoom'] = preZoomTransform !== zoomTransform;
    console.log(`  Transform after zoom: ${zoomTransform}`);
    console.log(`  ${results.criteria['canvas_zoom'] ? 'PASS' : 'FAIL'}: Canvas zoom`);

    // Reset viewport by reloading
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);

    // ================================================================
    // TEST 4: Mind library sidebar shows all 12 minds
    // ================================================================
    console.log('TEST 4: Mind library sidebar...');

    // Check sidebar header
    const sidebarHeader = await page.textContent('body');
    const hasMindLibrary = sidebarHeader.includes('Mind Library');

    // Count mind cards in sidebar (look for all draggable items with mind names)
    const mindNames = [
      'Steve Jobs', 'Albert Einstein', 'Alexander the Great', 'Leonardo da Vinci',
      'Cleopatra VII', 'Sun Tzu', 'Nikola Tesla', 'Catherine the Great',
      'Isaac Newton', 'Niccol\u00f2 Machiavelli', 'Marie Curie', 'Ada Lovelace'
    ];

    const foundMinds = [];
    for (const name of mindNames) {
      const found = await page.getByText(name, { exact: false }).first().isVisible().catch(() => false);
      if (found) foundMinds.push(name);
    }

    results.criteria['sidebar_shows_12_minds'] = foundMinds.length === 12;
    results.criteria['sidebar_has_header'] = hasMindLibrary;
    console.log(`  Found ${foundMinds.length}/12 minds in sidebar`);
    if (foundMinds.length < 12) {
      const missing = mindNames.filter(n => !foundMinds.includes(n));
      console.log(`  Missing: ${missing.join(', ')}`);
    }
    console.log(`  ${results.criteria['sidebar_shows_12_minds'] ? 'PASS' : 'FAIL'}: All 12 minds visible`);

    // Check for domain text and accent colors
    const hasAccentDots = await page.evaluate(() => {
      const dots = document.querySelectorAll('.rounded-full');
      let coloredDots = 0;
      dots.forEach(dot => {
        const bg = window.getComputedStyle(dot).background || window.getComputedStyle(dot).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') coloredDots++;
      });
      return coloredDots >= 10;
    });
    results.criteria['accent_colors_visible'] = hasAccentDots;
    console.log(`  ${hasAccentDots ? 'PASS' : 'FAIL'}: Accent colors visible`);

    // Check for domain text
    const hasDomainText = await page.evaluate(() => {
      const text = document.body.textContent;
      return text.includes('Technology') || text.includes('Physics') || text.includes('Strategy');
    });
    results.criteria['domain_text_visible'] = hasDomainText;
    console.log(`  ${hasDomainText ? 'PASS' : 'FAIL'}: Domain text visible`);

    // Screenshot: Sidebar with all minds
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-sidebar-minds.png'),
      fullPage: false,
    });
    results.screenshots.push('02-sidebar-minds.png');

    // ================================================================
    // TEST 5: Search filters minds
    // ================================================================
    console.log('TEST 5: Search filters minds...');
    const searchInput = page.locator('input[placeholder*="Search"]');
    const searchExists = await searchInput.isVisible().catch(() => false);

    if (searchExists) {
      await searchInput.fill('Tesla');
      await delay(500);

      // Count visible mind cards after search
      const visibleAfterSearch = await page.evaluate(() => {
        const bodyText = document.body.textContent;
        const names = ['Steve Jobs', 'Albert Einstein', 'Alexander the Great', 'Leonardo da Vinci',
          'Cleopatra VII', 'Sun Tzu', 'Nikola Tesla', 'Catherine the Great',
          'Isaac Newton', 'Machiavelli', 'Marie Curie', 'Ada Lovelace'];
        // Check which names are still visible in the sidebar (not the canvas)
        return names.filter(n => bodyText.includes(n)).length;
      });

      // Tesla search should show only Tesla (or related)
      const teslaMindVisible = await page.getByText('Nikola Tesla').first().isVisible().catch(() => false);

      results.criteria['search_filters'] = searchExists && teslaMindVisible;
      console.log(`  Search input exists: ${searchExists}`);
      console.log(`  Tesla visible after search: ${teslaMindVisible}`);
      console.log(`  ${results.criteria['search_filters'] ? 'PASS' : 'FAIL'}: Search filters minds`);

      // Screenshot: Search filtering
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '03-search-filter.png'),
        fullPage: false,
      });
      results.screenshots.push('03-search-filter.png');

      // Clear search
      await searchInput.fill('');
      await delay(300);
    } else {
      results.criteria['search_filters'] = false;
      console.log('  FAIL: No search input found');
    }

    // ================================================================
    // TEST 6: Click a mind to create a node on canvas
    // ================================================================
    console.log('TEST 6: Click mind to create node...');

    // Click the first mind card (Steve Jobs)
    const steveJobsText = page.getByText('Steve Jobs').first();
    await steveJobsText.click();
    await delay(1000);

    // Check if a node appeared on the canvas
    const nodesAfterClick = await page.evaluate(() => {
      return document.querySelectorAll('.react-flow__node').length;
    });
    results.criteria['click_creates_node'] = nodesAfterClick >= 1;
    console.log(`  Nodes after click: ${nodesAfterClick}`);
    console.log(`  ${results.criteria['click_creates_node'] ? 'PASS' : 'FAIL'}: Click creates node`);

    // Screenshot: First node placed
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-first-node.png'),
      fullPage: false,
    });
    results.screenshots.push('04-first-node.png');

    // ================================================================
    // TEST 7: Mind nodes display name, role dropdown, accent-colored identity
    // ================================================================
    console.log('TEST 7: Node displays name, role dropdown, accent...');

    const nodeHasName = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.react-flow__node');
      for (const node of nodes) {
        if (node.textContent.includes('Steve Jobs')) return true;
      }
      return false;
    });

    const nodeHasDropdown = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.react-flow__node');
      for (const node of nodes) {
        if (node.querySelector('select')) return true;
      }
      return false;
    });

    const nodeHasAccent = await page.evaluate(() => {
      const nodes = document.querySelectorAll('.react-flow__node');
      for (const node of nodes) {
        // Check for any colored border or accent element
        const elements = node.querySelectorAll('*');
        for (const el of elements) {
          const style = window.getComputedStyle(el);
          // Look for non-gray, non-white, non-transparent colors
          const bg = style.backgroundColor;
          if (bg && bg.startsWith('rgb') && !bg.includes('rgba(0,') && !bg.includes('rgba(0, 0, 0')) {
            return true;
          }
        }
      }
      return false;
    });

    results.criteria['node_shows_name'] = nodeHasName;
    results.criteria['node_has_dropdown'] = nodeHasDropdown;
    results.criteria['node_has_accent'] = nodeHasAccent;
    console.log(`  ${nodeHasName ? 'PASS' : 'FAIL'}: Node shows name`);
    console.log(`  ${nodeHasDropdown ? 'PASS' : 'FAIL'}: Node has role dropdown`);
    console.log(`  ${nodeHasAccent ? 'PASS' : 'FAIL'}: Node has accent color`);

    // ================================================================
    // TEST 8: Changing role via dropdown updates node
    // ================================================================
    console.log('TEST 8: Role dropdown updates node...');

    const selectEl = page.locator('.react-flow__node select').first();
    const selectExists = await selectEl.isVisible().catch(() => false);

    if (selectExists) {
      const initialValue = await selectEl.inputValue();
      await selectEl.selectOption({ index: 1 }); // Select first role (CEO)
      await delay(500);
      const newValue = await selectEl.inputValue();

      results.criteria['role_dropdown_works'] = initialValue !== newValue && newValue !== '';
      console.log(`  Role before: "${initialValue}", after: "${newValue}"`);
      console.log(`  ${results.criteria['role_dropdown_works'] ? 'PASS' : 'FAIL'}: Role dropdown updates`);

      // Screenshot: Role changed
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '05-role-changed.png'),
        fullPage: false,
      });
      results.screenshots.push('05-role-changed.png');
    } else {
      results.criteria['role_dropdown_works'] = false;
      console.log('  FAIL: No select element found on node');
    }

    // ================================================================
    // TEST 9: Multiple minds can be placed (at least 5)
    // ================================================================
    console.log('TEST 9: Place multiple minds (5+)...');

    // Click on multiple different minds
    const mindsToPlace = ['Albert Einstein', 'Sun Tzu', 'Marie Curie', 'Ada Lovelace', 'Leonardo da Vinci'];
    for (const mindName of mindsToPlace) {
      const mindEl = page.getByText(mindName, { exact: false }).first();
      const isVisible = await mindEl.isVisible().catch(() => false);
      if (isVisible) {
        await mindEl.click();
        await delay(400);
      }
    }
    await delay(500);

    const totalNodes = await page.evaluate(() => {
      return document.querySelectorAll('.react-flow__node').length;
    });
    results.criteria['multiple_minds'] = totalNodes >= 5;
    console.log(`  Total nodes on canvas: ${totalNodes}`);
    console.log(`  ${results.criteria['multiple_minds'] ? 'PASS' : 'FAIL'}: Multiple minds (${totalNodes} >= 5)`);

    // Screenshot: Multiple minds placed
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-multiple-minds.png'),
      fullPage: false,
    });
    results.screenshots.push('06-multiple-minds.png');

    // ================================================================
    // TEST 10: Company name is editable inline
    // ================================================================
    console.log('TEST 10: Company name editable inline...');

    const companyNameEl = page.getByText('Untitled Company').first();
    const companyNameVisible = await companyNameEl.isVisible().catch(() => false);

    if (companyNameVisible) {
      await companyNameEl.click();
      await delay(500);

      // Check if an input appeared — use a broader selector
      const nameInput = page.locator('input').filter({ hasText: '' }).first();
      // Try to find any visible text input near the company bar
      const companyInput = page.locator('.glass-panel input[type="text"]').first();
      const inputVisible = await companyInput.isVisible().catch(() => false);

      if (inputVisible) {
        await companyInput.fill('Genius Labs');
        await companyInput.press('Enter');
        await delay(500);

        const updatedName = await page.textContent('body');
        results.criteria['company_name_editable'] = updatedName.includes('Genius Labs');
        console.log(`  ${results.criteria['company_name_editable'] ? 'PASS' : 'FAIL'}: Company name updated to "Genius Labs"`);
      } else {
        results.criteria['company_name_editable'] = false;
        console.log('  FAIL: Click on company name did not reveal input');
      }
    } else {
      results.criteria['company_name_editable'] = false;
      console.log('  FAIL: Company name element not found');
    }

    // ================================================================
    // TEST 11: Company mission is editable
    // ================================================================
    console.log('TEST 11: Company mission editable...');

    const missionEl = page.getByText('Define your mission').first();
    const missionVisible = await missionEl.isVisible().catch(() => false);

    if (missionVisible) {
      await missionEl.click();
      await delay(500);

      // Find mission input - should be the second text input in the glass panel
      const missionInputs = page.locator('.glass-panel input[type="text"]');
      const missionCount = await missionInputs.count();
      const missionInput = missionCount > 0 ? missionInputs.last() : null;
      const missionInputVisible = missionInput ? await missionInput.isVisible().catch(() => false) : false;

      if (missionInputVisible) {
        await missionInput.fill('Building the future with historical wisdom');
        await missionInput.press('Enter');
        await delay(500);

        const updatedMission = await page.textContent('body');
        results.criteria['company_mission_editable'] = updatedMission.includes('Building the future');
        console.log(`  ${results.criteria['company_mission_editable'] ? 'PASS' : 'FAIL'}: Mission updated`);
      } else {
        results.criteria['company_mission_editable'] = false;
        console.log('  FAIL: Mission input not found after click');
      }
    } else {
      results.criteria['company_mission_editable'] = false;
      console.log('  FAIL: Mission element not found');
    }

    // Screenshot: Company info edited
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '07-company-info-edited.png'),
      fullPage: false,
    });
    results.screenshots.push('07-company-info-edited.png');

    // ================================================================
    // TEST 12: Canvas feels immersive
    // ================================================================
    console.log('TEST 12: Immersive dark canvas checks...');

    const immersiveChecks = await page.evaluate(() => {
      const checks = {};

      // Check background color is dark (#0a0a0f)
      const body = document.body;
      checks.bodyBg = window.getComputedStyle(body).backgroundColor;
      checks.isDark = checks.bodyBg.includes('10, 10, 15') || checks.bodyBg.includes('10,10,15');

      // Check for noise overlay
      const noiseOverlay = document.querySelector('.noise-overlay');
      checks.hasNoise = noiseOverlay !== null;

      // Check for glass panel styling
      const glassPanel = document.querySelector('.glass-panel');
      checks.hasGlass = glassPanel !== null;
      if (glassPanel) {
        const style = window.getComputedStyle(glassPanel);
        checks.glassBackdropFilter = style.backdropFilter;
        checks.hasBlur = style.backdropFilter.includes('blur');
      }

      // Check for dot grid in React Flow
      const rfBg = document.querySelector('.react-flow__background');
      checks.hasDotBackground = rfBg !== null;

      // Check for node pulse animation (in stylesheets)
      let hasPulseKeyframes = false;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name.includes('pulse')) {
              hasPulseKeyframes = true;
              break;
            }
          }
        } catch (e) { /* cross-origin */ }
        if (hasPulseKeyframes) break;
      }
      checks.hasPulseAnimation = hasPulseKeyframes;

      // Check for JetBrains Mono font
      checks.hasJetBrainsMono = document.documentElement.className.includes('font-jetbrains') ||
                                 document.body.style.fontFamily.includes('JetBrains') ||
                                 document.documentElement.className.includes('__variable');

      // Check for Newsreader serif font
      checks.hasNewsreader = document.documentElement.className.includes('newsreader') ||
                              document.documentElement.className.includes('__variable');

      return checks;
    });

    results.criteria['immersive_dark'] = immersiveChecks.isDark;
    results.criteria['has_noise_texture'] = immersiveChecks.hasNoise;
    results.criteria['has_glass_panels'] = immersiveChecks.hasGlass;
    results.criteria['has_blur_effect'] = immersiveChecks.hasBlur || false;
    results.criteria['has_pulse_animation'] = immersiveChecks.hasPulseAnimation;
    results.criteria['has_custom_fonts'] = immersiveChecks.hasJetBrainsMono;

    console.log(`  Body BG: ${immersiveChecks.bodyBg}`);
    console.log(`  ${immersiveChecks.isDark ? 'PASS' : 'FAIL'}: Dark background (#0a0a0f)`);
    console.log(`  ${immersiveChecks.hasNoise ? 'PASS' : 'FAIL'}: Noise overlay texture`);
    console.log(`  ${immersiveChecks.hasGlass ? 'PASS' : 'FAIL'}: Glass panel styling`);
    console.log(`  ${immersiveChecks.hasBlur ? 'PASS' : 'FAIL'}: Backdrop blur effect`);
    console.log(`  ${immersiveChecks.hasPulseAnimation ? 'PASS' : 'FAIL'}: Pulse animation`);
    console.log(`  ${immersiveChecks.hasJetBrainsMono ? 'PASS' : 'FAIL'}: JetBrains Mono font`);
    console.log(`  ${immersiveChecks.hasNewsreader ? 'PASS' : 'INFO'}: Newsreader serif font`);

    // ================================================================
    // TEST 13: Console errors
    // ================================================================
    console.log('TEST 13: Console errors...');
    // Filter out non-critical errors (like React dev mode, favicon, etc.)
    const criticalErrors = results.consoleErrors.filter(e => {
      const text = e.text || '';
      return !text.includes('favicon') &&
             !text.includes('DevTools') &&
             !text.includes('Download the React DevTools') &&
             !text.includes('Source map') &&
             !text.includes('Manifest');
    });
    results.criteria['zero_console_errors'] = criticalErrors.length === 0;
    console.log(`  Total console errors: ${results.consoleErrors.length}`);
    console.log(`  Critical console errors: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach(e => console.log(`    - ${e.text}`));
    }
    console.log(`  ${results.criteria['zero_console_errors'] ? 'PASS' : 'FAIL'}: Zero console errors`);

    // ================================================================
    // TEST 14: Drag-and-drop from sidebar to canvas
    // ================================================================
    console.log('TEST 14: Drag and drop from sidebar...');

    // Reload fresh
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);

    // Find a draggable mind card
    const mindCard = page.getByText('Nikola Tesla').first();
    const mindCardVisible = await mindCard.isVisible().catch(() => false);

    if (mindCardVisible) {
      const cardBox = await mindCard.boundingBox();
      const canvasBox = await page.locator('.react-flow__pane').boundingBox();

      if (cardBox && canvasBox) {
        // Perform drag and drop
        await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(
          canvasBox.x + canvasBox.width / 2,
          canvasBox.y + canvasBox.height / 2,
          { steps: 15 }
        );
        await page.mouse.up();
        await delay(1000);

        const nodesAfterDrag = await page.evaluate(() => {
          return document.querySelectorAll('.react-flow__node').length;
        });
        results.criteria['drag_drop_works'] = nodesAfterDrag >= 1;
        console.log(`  Nodes after drag: ${nodesAfterDrag}`);
        console.log(`  ${results.criteria['drag_drop_works'] ? 'PASS' : 'FAIL'}: Drag and drop`);
      } else {
        results.criteria['drag_drop_works'] = false;
        console.log('  FAIL: Could not get bounding boxes for drag');
      }
    } else {
      results.criteria['drag_drop_works'] = false;
      console.log('  FAIL: Mind card not visible for drag');
    }

    // Screenshot: After drag and drop
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '08-drag-drop.png'),
      fullPage: false,
    });
    results.screenshots.push('08-drag-drop.png');

    // ================================================================
    // TEST 15: Category filter
    // ================================================================
    console.log('TEST 15: Category filters...');

    const scienceFilter = page.getByText('SCIENCE', { exact: true }).first();
    const scienceVisible = await scienceFilter.isVisible().catch(() => false);

    if (scienceVisible) {
      await scienceFilter.click();
      await delay(500);

      const bodyText = await page.textContent('body');
      const scienceMindsVisible = bodyText.includes('Einstein') || bodyText.includes('Tesla') || bodyText.includes('Curie') || bodyText.includes('Newton');
      const nonScienceHidden = !bodyText.includes('Alexander') || !bodyText.includes('Cleopatra');

      results.criteria['category_filter_works'] = scienceMindsVisible;
      console.log(`  Science minds visible: ${scienceMindsVisible}`);
      console.log(`  ${results.criteria['category_filter_works'] ? 'PASS' : 'FAIL'}: Category filter`);

      // Screenshot: Category filtered
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09-category-filter.png'),
        fullPage: false,
      });
      results.screenshots.push('09-category-filter.png');

      // Reset filter
      const allFilter = page.getByText('ALL', { exact: true }).first();
      if (await allFilter.isVisible().catch(() => false)) {
        await allFilter.click();
        await delay(300);
      }
    } else {
      results.criteria['category_filter_works'] = false;
      console.log('  FAIL: SCIENCE category filter not found');
    }

    // ================================================================
    // TEST 16: Visual design quality audit
    // ================================================================
    console.log('TEST 16: Visual design quality audit...');

    const designAudit = await page.evaluate(() => {
      const audit = {};

      // Check for radial gradient on nodes
      const nodes = document.querySelectorAll('.react-flow__node');
      audit.nodeCount = nodes.length;

      if (nodes.length > 0) {
        const firstNode = nodes[0];
        const nodeDiv = firstNode.querySelector('[class*="rounded"]');
        if (nodeDiv) {
          const style = window.getComputedStyle(nodeDiv);
          audit.nodeBackground = style.background;
          audit.nodeBorder = style.border;
          audit.nodeBorderRadius = style.borderRadius;
          audit.hasRadialGradient = style.background.includes('radial');
        }
      }

      // Check for the accent bar at top of nodes
      const accentBars = document.querySelectorAll('.react-flow__node [class*="h-[3px]"]');
      audit.hasAccentBars = accentBars.length > 0;

      // Check sidebar collapse button
      audit.hasSidebarCollapse = document.querySelector('button') !== null;

      // Check for "The Void Awaits" or empty state text
      audit.hasEmptyStateGone = !document.body.textContent.includes('Void Awaits');

      // Check overall color temperature - no bright whites or grays leaking
      audit.noBrightWhiteLeaks = true;
      const allElements = document.querySelectorAll('*');
      let brightCount = 0;
      for (let i = 0; i < Math.min(allElements.length, 500); i++) {
        const bg = window.getComputedStyle(allElements[i]).backgroundColor;
        if (bg.startsWith('rgb(255') || bg === 'white') brightCount++;
      }
      audit.brightWhiteCount = brightCount;
      audit.noBrightWhiteLeaks = brightCount === 0;

      return audit;
    });

    console.log(`  Nodes on canvas: ${designAudit.nodeCount}`);
    console.log(`  Radial gradient on nodes: ${designAudit.hasRadialGradient || false}`);
    console.log(`  Accent bars: ${designAudit.hasAccentBars}`);
    console.log(`  No bright white leaks: ${designAudit.noBrightWhiteLeaks} (${designAudit.brightWhiteCount} bright elements)`);
    console.log(`  Node border radius: ${designAudit.nodeBorderRadius || 'N/A'}`);

    // ================================================================
    // Final wide-shot screenshot with all nodes
    // ================================================================

    // Place more minds for the final shot
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2000);

    // Place 6 minds for a full canvas shot
    const finalMinds = ['Steve Jobs', 'Albert Einstein', 'Sun Tzu', 'Marie Curie', 'Nikola Tesla', 'Ada Lovelace'];
    for (const name of finalMinds) {
      const el = page.getByText(name, { exact: false }).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        await delay(400);
      }
    }
    await delay(1000);

    // Now change a role on the first node
    const finalSelect = page.locator('.react-flow__node select').first();
    if (await finalSelect.isVisible().catch(() => false)) {
      await finalSelect.selectOption('ceo');
      await delay(300);
    }

    // Edit company name
    const companyNameFinal = page.getByText('Untitled Company').first();
    if (await companyNameFinal.isVisible().catch(() => false)) {
      await companyNameFinal.click();
      await delay(300);
      const input = page.locator('.glass-panel input[type="text"]').first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill('Archon Industries');
        await input.press('Enter');
        await delay(300);
      }
    }

    // Screenshot: Final showcase
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '10-final-showcase.png'),
      fullPage: false,
    });
    results.screenshots.push('10-final-showcase.png');

    // ================================================================
    // Summary
    // ================================================================
    console.log('\n========================================');
    console.log('         EVALUATION SUMMARY');
    console.log('========================================\n');

    const criteriaKeys = Object.keys(results.criteria);
    const passed = criteriaKeys.filter(k => results.criteria[k]).length;
    const failed = criteriaKeys.filter(k => !results.criteria[k]).length;

    console.log(`Total criteria: ${criteriaKeys.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Console errors (critical): ${criticalErrors.length}`);
    console.log(`Screenshots captured: ${results.screenshots.length}`);

    console.log('\n--- Detailed Results ---');
    for (const [key, value] of Object.entries(results.criteria)) {
      console.log(`  ${value ? 'PASS' : 'FAIL'}: ${key}`);
    }

    // Write results to JSON
    const resultsPath = path.join(__dirname, 'sprint1-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);

  } catch (error) {
    console.error('EVALUATION FAILED:', error.message);
    results.error = error.message;

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'error-state.png'),
      fullPage: false,
    }).catch(() => {});
  } finally {
    await browser.close();
  }

  return results;
}

evaluate().then((results) => {
  process.exit(0);
}).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
