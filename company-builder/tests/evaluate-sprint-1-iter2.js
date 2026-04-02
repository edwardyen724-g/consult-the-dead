const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'iter2');
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
    iteration: 2,
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
    // CRITERION 2: Canvas atmosphere - vignette, particles, noise
    // ================================================================
    console.log('CRITERION 2: Canvas atmosphere...');
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

      // Ambient particles (divs with particle-drift animation)
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

      // Check for particle-drift keyframes in stylesheets
      let hasParticleKeyframes = false;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'particle-drift') {
              hasParticleKeyframes = true;
              break;
            }
          }
        } catch (e) { /* cross-origin */ }
        if (hasParticleKeyframes) break;
      }
      checks.hasParticleKeyframes = hasParticleKeyframes;

      return checks;
    });

    results.criteria['has_vignette'] = atmosphere.hasVignetteOverlay;
    results.criteria['has_particles'] = atmosphere.hasParticles;
    results.criteria['has_noise_overlay'] = atmosphere.hasNoiseOverlay;
    console.log(`  Vignette overlay: ${atmosphere.hasVignetteOverlay ? 'PASS' : 'FAIL'}`);
    console.log(`  Particles: ${atmosphere.particleCount} (need >=20): ${atmosphere.hasParticles ? 'PASS' : 'FAIL'}`);
    console.log(`  Noise overlay: ${atmosphere.hasNoiseOverlay ? 'PASS' : 'FAIL'}`);
    console.log(`  Particle keyframes: ${atmosphere.hasParticleKeyframes ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 3: Mind nodes have monogram circles + breathing aura
    // ================================================================
    console.log('CRITERION 3: Mind node design (monogram + breathing aura)...');

    // Place Steve Jobs via click
    const steveJobs = page.getByText('Steve Jobs').first();
    await steveJobs.click();
    await delay(1500); // Wait for placement ceremony

    // Screenshot right after placement to capture ceremony
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-placement-ceremony.png'),
    });
    results.screenshots.push('02-placement-ceremony.png');

    await delay(1500); // Let ceremony finish

    const nodeDesign = await page.evaluate(() => {
      const checks = {};
      const nodes = document.querySelectorAll('.react-flow__node');
      checks.nodeCount = nodes.length;

      if (nodes.length > 0) {
        const node = nodes[0];

        // Monogram circle: look for a round element with a single letter
        const circles = node.querySelectorAll('.rounded-full');
        checks.hasMonogramCircle = false;
        circles.forEach((circle) => {
          const text = circle.textContent.trim();
          if (text.length === 1 && /[A-Z]/.test(text)) {
            checks.hasMonogramCircle = true;
            checks.monogramLetter = text;
          }
        });

        // Breathing aura: look for elements with mind-breathe animation
        const allEls = node.querySelectorAll('*');
        checks.hasBreathingAura = false;
        checks.hasGlowAnimation = false;
        allEls.forEach((el) => {
          const anim = el.style.animation || window.getComputedStyle(el).animation || '';
          if (anim.includes('mind-breathe')) checks.hasBreathingAura = true;
          if (anim.includes('mind-glow')) checks.hasGlowAnimation = true;
        });

        // Top accent bar (thin colored line at top)
        const bars = node.querySelectorAll('[class*="h-["]');
        checks.hasAccentBar = false;
        bars.forEach((bar) => {
          const h = bar.className;
          if (h.includes('h-[2px]') || h.includes('h-[3px]')) {
            checks.hasAccentBar = true;
          }
        });

        // Archetype text visible
        checks.hasArchetypeText = node.textContent.includes('Innovator') || node.textContent.includes('Theorist') || node.textContent.includes('Conqueror');

        // Domain text visible
        checks.hasDomainText = node.textContent.includes('Technology') || node.textContent.includes('Physics') || node.textContent.includes('Design');
      }

      return checks;
    });

    results.criteria['has_monogram_circle'] = nodeDesign.hasMonogramCircle;
    results.criteria['has_breathing_aura'] = nodeDesign.hasBreathingAura;
    results.criteria['has_glow_animation'] = nodeDesign.hasGlowAnimation;
    results.criteria['has_accent_bar'] = nodeDesign.hasAccentBar;
    console.log(`  Monogram circle (letter "${nodeDesign.monogramLetter || '?'}"): ${nodeDesign.hasMonogramCircle ? 'PASS' : 'FAIL'}`);
    console.log(`  Breathing aura (mind-breathe): ${nodeDesign.hasBreathingAura ? 'PASS' : 'FAIL'}`);
    console.log(`  Glow animation (mind-glow): ${nodeDesign.hasGlowAnimation ? 'PASS' : 'FAIL'}`);
    console.log(`  Accent bar: ${nodeDesign.hasAccentBar ? 'PASS' : 'FAIL'}`);
    console.log(`  Archetype text: ${nodeDesign.hasArchetypeText ? 'PASS' : 'INFO'}`);
    console.log(`  Domain text: ${nodeDesign.hasDomainText ? 'PASS' : 'INFO'}`);

    // ================================================================
    // CRITERION 4: Custom role dropdown (not native select)
    // ================================================================
    console.log('CRITERION 4: Custom role dropdown...');

    const dropdownCheck = await page.evaluate(() => {
      const checks = {};
      const nodes = document.querySelectorAll('.react-flow__node');

      // Should NOT have a native <select>
      checks.hasNativeSelect = false;
      nodes.forEach((node) => {
        if (node.querySelector('select')) checks.hasNativeSelect = true;
      });

      // Should have a custom dropdown trigger button
      checks.hasCustomDropdownButton = false;
      nodes.forEach((node) => {
        const buttons = node.querySelectorAll('button');
        buttons.forEach((btn) => {
          const text = btn.textContent.trim().toLowerCase();
          if (text.includes('assign role') || text.includes('ceo') || text.includes('cto')) {
            checks.hasCustomDropdownButton = true;
          }
        });
      });

      return checks;
    });

    results.criteria['no_native_select'] = !dropdownCheck.hasNativeSelect;
    results.criteria['has_custom_dropdown'] = dropdownCheck.hasCustomDropdownButton;
    console.log(`  No native select: ${!dropdownCheck.hasNativeSelect ? 'PASS' : 'FAIL'}`);
    console.log(`  Custom dropdown button: ${dropdownCheck.hasCustomDropdownButton ? 'PASS' : 'FAIL'}`);

    // Click the dropdown to open it
    const dropdownTrigger = page.locator('.react-flow__node button').filter({ hasText: /assign role/i }).first();
    const triggerVisible = await dropdownTrigger.isVisible().catch(() => false);

    if (triggerVisible) {
      await dropdownTrigger.click();
      await delay(500);

      // Screenshot: Custom dropdown open
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '03-custom-dropdown-open.png'),
      });
      results.screenshots.push('03-custom-dropdown-open.png');

      // Check the dropdown menu appeared with glassmorphic styling
      const dropdownMenu = await page.evaluate(() => {
        const checks = {};
        // Look for the animated dropdown menu
        const menus = document.querySelectorAll('[style*="backdrop-filter"]');
        checks.hasGlassmorphicMenu = false;
        menus.forEach((menu) => {
          const style = menu.style;
          if (style.backdropFilter && style.backdropFilter.includes('blur')) {
            checks.hasGlassmorphicMenu = true;
          }
        });

        // Check for role options with color indicators
        const roleButtons = document.querySelectorAll('.react-flow__node button');
        let coloredDotCount = 0;
        roleButtons.forEach((btn) => {
          const dots = btn.querySelectorAll('.rounded-full');
          dots.forEach((dot) => {
            const bg = dot.style.background || window.getComputedStyle(dot).backgroundColor;
            if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') coloredDotCount++;
          });
        });
        checks.hasColorIndicators = coloredDotCount >= 3;
        checks.coloredDotCount = coloredDotCount;

        return checks;
      });

      results.criteria['dropdown_glassmorphic'] = dropdownMenu.hasGlassmorphicMenu;
      results.criteria['dropdown_color_indicators'] = dropdownMenu.hasColorIndicators;
      console.log(`  Glassmorphic menu: ${dropdownMenu.hasGlassmorphicMenu ? 'PASS' : 'FAIL'}`);
      console.log(`  Color indicators (${dropdownMenu.coloredDotCount}): ${dropdownMenu.hasColorIndicators ? 'PASS' : 'FAIL'}`);

      // Select CEO role
      const ceoOption = page.locator('.react-flow__node button').filter({ hasText: /CEO/i }).first();
      if (await ceoOption.isVisible().catch(() => false)) {
        await ceoOption.click();
        await delay(500);
      }

      // Verify role was assigned
      const roleAssigned = await page.evaluate(() => {
        const nodes = document.querySelectorAll('.react-flow__node');
        for (const node of nodes) {
          if (node.textContent.includes('CEO')) return true;
        }
        return false;
      });
      results.criteria['role_assignment_works'] = roleAssigned;
      console.log(`  Role assignment works: ${roleAssigned ? 'PASS' : 'FAIL'}`);
    } else {
      results.criteria['dropdown_glassmorphic'] = false;
      results.criteria['dropdown_color_indicators'] = false;
      results.criteria['role_assignment_works'] = false;
      console.log('  FAIL: Could not find dropdown trigger');
    }

    // Screenshot after role assignment
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '04-role-assigned.png'),
    });
    results.screenshots.push('04-role-assigned.png');

    // ================================================================
    // CRITERION 5: Place 5+ minds and verify color bleed pools
    // ================================================================
    console.log('CRITERION 5: Place 5+ minds with color bleed pools...');

    const mindsToPlace = ['Albert Einstein', 'Sun Tzu', 'Marie Curie', 'Ada Lovelace', 'Leonardo da Vinci'];
    for (const mindName of mindsToPlace) {
      const mindEl = page.getByText(mindName, { exact: false }).first();
      const isVis = await mindEl.isVisible().catch(() => false);
      if (isVis) {
        await mindEl.click();
        await delay(600); // Allow placement ceremony per mind
      }
    }
    await delay(1500); // Let all animations settle

    const totalNodes = await page.evaluate(() => {
      return document.querySelectorAll('.react-flow__node').length;
    });
    results.criteria['five_plus_minds_placed'] = totalNodes >= 6; // 1 Steve Jobs + 5 others
    console.log(`  Total nodes: ${totalNodes} (need >= 6): ${totalNodes >= 6 ? 'PASS' : 'FAIL'}`);

    // Check for color bleed pools
    const colorBleed = await page.evaluate(() => {
      const checks = {};
      // Color bleed pools are divs with radial gradient, blur, and positioned absolutely
      const allDivs = document.querySelectorAll('div[style*="filter"]');
      let bleedCount = 0;
      allDivs.forEach((div) => {
        const style = div.style;
        if (
          style.filter &&
          style.filter.includes('blur') &&
          style.borderRadius === '50%' &&
          style.background &&
          style.background.includes('radial-gradient')
        ) {
          bleedCount++;
        }
      });
      checks.bleedPoolCount = bleedCount;
      checks.hasColorBleedPools = bleedCount >= 3;
      return checks;
    });

    results.criteria['has_color_bleed_pools'] = colorBleed.hasColorBleedPools;
    console.log(`  Color bleed pools: ${colorBleed.bleedPoolCount} (need >= 3): ${colorBleed.hasColorBleedPools ? 'PASS' : 'FAIL'}`);

    // Screenshot: Multiple glowing nodes on canvas
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '05-multiple-glowing-nodes.png'),
    });
    results.screenshots.push('05-multiple-glowing-nodes.png');

    // ================================================================
    // CRITERION 6: Hover reveals quote on node
    // ================================================================
    console.log('CRITERION 6: Hover reveals quote on node...');

    const firstNode = page.locator('.react-flow__node').first();
    const firstNodeBox = await firstNode.boundingBox();
    if (firstNodeBox) {
      await page.mouse.move(firstNodeBox.x + firstNodeBox.width / 2, firstNodeBox.y + firstNodeBox.height / 2);
      await delay(800);

      const hoverQuote = await page.evaluate(() => {
        const nodes = document.querySelectorAll('.react-flow__node');
        for (const node of nodes) {
          // Look for italic quote text
          const italics = node.querySelectorAll('[style*="font-style"]');
          for (const el of italics) {
            if (el.textContent.includes('\u201C') || el.textContent.includes('\u201D') || el.textContent.includes('"')) {
              return { hasQuote: true, text: el.textContent.trim().substring(0, 80) };
            }
          }
          // Also check for newsreader font italic elements
          const allEls = node.querySelectorAll('*');
          for (const el of allEls) {
            const cls = typeof el.className === 'string' ? el.className : '';
            if (cls.includes('italic') && el.textContent.length > 10) {
              return { hasQuote: true, text: el.textContent.trim().substring(0, 80) };
            }
          }
        }
        return { hasQuote: false };
      });

      results.criteria['hover_reveals_quote'] = hoverQuote.hasQuote;
      console.log(`  Hover quote: ${hoverQuote.hasQuote ? 'PASS' : 'FAIL'}${hoverQuote.text ? ` ("${hoverQuote.text}")` : ''}`);
    } else {
      results.criteria['hover_reveals_quote'] = false;
      console.log('  FAIL: Could not get node bounding box for hover');
    }

    // Screenshot: Hover state
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '06-hover-quote.png'),
    });
    results.screenshots.push('06-hover-quote.png');

    // ================================================================
    // CRITERION 7: Drag-and-drop with sidebar glow feedback
    // ================================================================
    console.log('CRITERION 7: Drag-and-drop with sidebar glow feedback...');

    // Reload for clean test
    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2500);

    const teslaCard = page.getByText('Nikola Tesla').first();
    const teslaVisible = await teslaCard.isVisible().catch(() => false);

    if (teslaVisible) {
      const cardBox = await teslaCard.boundingBox();
      const canvasBox = await page.locator('.react-flow__pane').boundingBox();

      if (cardBox && canvasBox) {
        // Start drag
        await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
        await page.mouse.down();

        // Move partway - screenshot mid-drag to capture canvas invite pulse
        await page.mouse.move(
          canvasBox.x + 100,
          canvasBox.y + canvasBox.height / 2,
          { steps: 5 }
        );
        await delay(300);

        // Screenshot: Mid-drag showing canvas invitation pulse
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '07-mid-drag-feedback.png'),
        });
        results.screenshots.push('07-mid-drag-feedback.png');

        // Check for canvas invite animation during drag
        const dragFeedback = await page.evaluate(() => {
          const checks = {};
          // Look for canvas-invite animation
          const allDivs = document.querySelectorAll('div');
          checks.hasCanvasInvite = false;
          allDivs.forEach((div) => {
            const anim = div.style.animation || window.getComputedStyle(div).animation || '';
            if (anim.includes('canvas-invite')) checks.hasCanvasInvite = true;
          });
          return checks;
        });

        results.criteria['canvas_invite_pulse'] = dragFeedback.hasCanvasInvite;
        console.log(`  Canvas invite pulse: ${dragFeedback.hasCanvasInvite ? 'PASS' : 'FAIL'}`);

        // Complete drop
        await page.mouse.move(
          canvasBox.x + canvasBox.width / 2,
          canvasBox.y + canvasBox.height / 2,
          { steps: 10 }
        );
        await page.mouse.up();
        await delay(1200);

        const nodesAfterDrag = await page.evaluate(() =>
          document.querySelectorAll('.react-flow__node').length
        );
        results.criteria['drag_drop_creates_node'] = nodesAfterDrag >= 1;
        console.log(`  Node created after drag: ${nodesAfterDrag >= 1 ? 'PASS' : 'FAIL'} (${nodesAfterDrag} nodes)`);

        // Screenshot: After drop with placement ceremony
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '08-after-drop.png'),
        });
        results.screenshots.push('08-after-drop.png');
      } else {
        results.criteria['canvas_invite_pulse'] = false;
        results.criteria['drag_drop_creates_node'] = false;
        console.log('  FAIL: Could not get bounding boxes');
      }
    } else {
      results.criteria['canvas_invite_pulse'] = false;
      results.criteria['drag_drop_creates_node'] = false;
      console.log('  FAIL: Tesla card not visible');
    }

    // ================================================================
    // CRITERION 8: Node selection scaling
    // ================================================================
    console.log('CRITERION 8: Node selection scaling...');

    const nodeForSelect = page.locator('.react-flow__node').first();
    const nodeSelectBox = await nodeForSelect.boundingBox().catch(() => null);
    if (nodeSelectBox) {
      // Use mouse click to avoid interception issues with overlapping nodes
      await page.mouse.click(nodeSelectBox.x + nodeSelectBox.width / 2, nodeSelectBox.y + nodeSelectBox.height / 2);
      await delay(500);

      const selectionEffect = await page.evaluate(() => {
        const nodes = document.querySelectorAll('.react-flow__node');
        const checks = {};
        if (nodes.length > 0) {
          const node = nodes[0];
          // Check for selected class or aria-selected
          checks.isSelected = node.getAttribute('aria-selected') === 'true' ||
                              node.classList.contains('selected');

          // Check for scale transform on the inner container
          const innerDivs = node.querySelectorAll('div');
          checks.hasScaleTransform = false;
          innerDivs.forEach((div) => {
            const transform = div.style.transform || window.getComputedStyle(div).transform;
            if (transform && transform.includes('scale') && !transform.includes('scale(1)')) {
              checks.hasScaleTransform = true;
            }
          });

          // Check for enhanced glow on selection (stronger box-shadow)
          checks.hasEnhancedGlow = false;
          innerDivs.forEach((div) => {
            const shadow = div.style.boxShadow || window.getComputedStyle(div).boxShadow;
            if (shadow && shadow.includes('rgba') && shadow.length > 30) {
              checks.hasEnhancedGlow = true;
            }
          });
        }
        return checks;
      });

      results.criteria['selection_has_effect'] = selectionEffect.hasEnhancedGlow || selectionEffect.hasScaleTransform;
      console.log(`  Selected: ${selectionEffect.isSelected}`);
      console.log(`  Scale transform: ${selectionEffect.hasScaleTransform ? 'PASS' : 'INFO'}`);
      console.log(`  Enhanced glow: ${selectionEffect.hasEnhancedGlow ? 'PASS' : 'INFO'}`);
      console.log(`  Selection effect: ${results.criteria['selection_has_effect'] ? 'PASS' : 'FAIL'}`);
    } else {
      results.criteria['selection_has_effect'] = false;
      console.log('  FAIL: No node to select (no bounding box)');
    }

    // ================================================================
    // CRITERION 9: Placement ceremony (flash + quote)
    // ================================================================
    console.log('CRITERION 9: Placement ceremony detection...');

    // Place a new mind and immediately screenshot to catch the ceremony
    const einsteinCard = page.getByText('Albert Einstein').first();
    if (await einsteinCard.isVisible().catch(() => false)) {
      await einsteinCard.click();

      // Rapid screenshots to capture the flash
      await delay(100);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09-placement-flash-early.png'),
      });
      results.screenshots.push('09-placement-flash-early.png');

      await delay(400);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09b-placement-quote.png'),
      });
      results.screenshots.push('09b-placement-quote.png');
    }

    // Check the code structure for placement ceremony features
    const ceremonyCheck = await page.evaluate(() => {
      const checks = {};

      // Check for mind-breathe keyframes
      let hasBreathKeyframes = false;
      let hasGlowKeyframes = false;
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.type === CSSRule.KEYFRAMES_RULE) {
              if (rule.name === 'mind-breathe') hasBreathKeyframes = true;
              if (rule.name === 'mind-glow') hasGlowKeyframes = true;
            }
          }
        } catch (e) { /* cross-origin */ }
      }
      checks.hasBreathKeyframes = hasBreathKeyframes;
      checks.hasGlowKeyframes = hasGlowKeyframes;

      return checks;
    });

    results.criteria['has_breath_keyframes'] = ceremonyCheck.hasBreathKeyframes;
    results.criteria['has_glow_keyframes'] = ceremonyCheck.hasGlowKeyframes;
    console.log(`  Breath keyframes: ${ceremonyCheck.hasBreathKeyframes ? 'PASS' : 'FAIL'}`);
    console.log(`  Glow keyframes: ${ceremonyCheck.hasGlowKeyframes ? 'PASS' : 'FAIL'}`);

    // ================================================================
    // CRITERION 10: Company bar editable
    // ================================================================
    console.log('CRITERION 10: Company bar editable...');

    const companyNameEl = page.getByText('Untitled Company').first();
    if (await companyNameEl.isVisible().catch(() => false)) {
      await companyNameEl.click();
      await delay(400);
      const nameInput = page.locator('.glass-panel input[type="text"]').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('Archon Labs');
        await nameInput.press('Enter');
        await delay(300);
        const nameUpdated = (await page.textContent('body')).includes('Archon Labs');
        results.criteria['company_name_editable'] = nameUpdated;
        console.log(`  Company name editable: ${nameUpdated ? 'PASS' : 'FAIL'}`);
      } else {
        results.criteria['company_name_editable'] = false;
        console.log('  FAIL: Name input not found');
      }
    } else {
      results.criteria['company_name_editable'] = false;
      console.log('  FAIL: Company name element not found');
    }

    // ================================================================
    // CRITERION 11: Search and category filters work
    // ================================================================
    console.log('CRITERION 11: Search and category filters...');

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('Curie');
      await delay(400);
      const searchFilterWorks = await page.evaluate(() => {
        const bodyText = document.body.textContent;
        return bodyText.includes('Marie Curie') && !bodyText.includes('Steve Jobs');
      });
      results.criteria['search_filter_works'] = searchFilterWorks;
      console.log(`  Search filter: ${searchFilterWorks ? 'PASS' : 'FAIL'}`);
      await searchInput.fill('');
      await delay(300);
    } else {
      results.criteria['search_filter_works'] = false;
    }

    const scienceBtn = page.getByText('SCIENCE', { exact: true }).first();
    if (await scienceBtn.isVisible().catch(() => false)) {
      await scienceBtn.click();
      await delay(400);
      const catFilterWorks = await page.evaluate(() => {
        const bodyText = document.body.textContent;
        return (bodyText.includes('Einstein') || bodyText.includes('Curie'));
      });
      results.criteria['category_filter_works'] = catFilterWorks;
      console.log(`  Category filter: ${catFilterWorks ? 'PASS' : 'FAIL'}`);

      // Reset
      const allBtn = page.getByText('ALL', { exact: true }).first();
      if (await allBtn.isVisible().catch(() => false)) await allBtn.click();
      await delay(300);
    } else {
      results.criteria['category_filter_works'] = false;
    }

    // ================================================================
    // CRITERION 12: Zero critical console errors
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

    // ================================================================
    // FINAL SHOWCASE: Reload, place 6 minds, assign roles, take wide shot
    // ================================================================
    console.log('\nFINAL SHOWCASE: Building full canvas...');

    await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await delay(2500);

    // Place 6 minds
    const showcaseMinds = [
      'Steve Jobs', 'Albert Einstein', 'Sun Tzu',
      'Marie Curie', 'Ada Lovelace', 'Cleopatra VII',
    ];
    for (const name of showcaseMinds) {
      const el = page.getByText(name, { exact: false }).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        await delay(700);
      }
    }
    await delay(2000);

    // Assign a role to the first node
    const showcaseDropdown = page.locator('.react-flow__node button').filter({ hasText: /assign role/i }).first();
    if (await showcaseDropdown.isVisible().catch(() => false)) {
      await showcaseDropdown.click();
      await delay(300);
      const ceoBtn = page.locator('.react-flow__node button').filter({ hasText: /CEO/i }).first();
      if (await ceoBtn.isVisible().catch(() => false)) {
        await ceoBtn.click();
        await delay(300);
      }
    }

    // Edit company name
    const finalCompanyName = page.getByText('Untitled Company').first();
    if (await finalCompanyName.isVisible().catch(() => false)) {
      await finalCompanyName.click();
      await delay(300);
      const input = page.locator('.glass-panel input[type="text"]').first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill('Archon Industries');
        await input.press('Enter');
        await delay(300);
      }
    }

    await delay(1500);

    // Final showcase screenshot
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '10-final-showcase-6-minds.png'),
    });
    results.screenshots.push('10-final-showcase-6-minds.png');

    // Another angle: zoom slightly for closer look at nodes
    const canvasArea = await page.locator('.react-flow__pane').boundingBox();
    if (canvasArea) {
      await page.mouse.move(canvasArea.x + canvasArea.width / 2, canvasArea.y + canvasArea.height / 2);
      await page.mouse.wheel(0, -200); // Zoom in slightly
      await delay(500);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '11-zoomed-showcase.png'),
    });
    results.screenshots.push('11-zoomed-showcase.png');

    // Hover over a node for the final shot
    const finalNode = page.locator('.react-flow__node').first();
    const finalNodeBox = await finalNode.boundingBox();
    if (finalNodeBox) {
      await page.mouse.move(finalNodeBox.x + finalNodeBox.width / 2, finalNodeBox.y + finalNodeBox.height / 2);
      await delay(600);
    }

    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '12-final-hover-detail.png'),
    });
    results.screenshots.push('12-final-hover-detail.png');

    // ================================================================
    // SUMMARY
    // ================================================================
    console.log('\n========================================');
    console.log('    ITERATION 2 EVALUATION SUMMARY');
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
    const resultsPath = path.join(__dirname, 'sprint1-iter2-results.json');
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
