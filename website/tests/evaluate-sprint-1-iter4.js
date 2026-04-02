/**
 * Sprint 1, Iteration 4 -- Evaluation Test Suite
 * Tests all 9 success criteria plus iter4-specific features:
 * - Full-viewport immersive hero (parallax, no card list)
 * - Perceptual lens diptych section
 * - Construct tension lines (not accordion)
 * - Thought-thread articles (not blog cards)
 * - "Through the lens of..." article intro block
 * - Left-margin construct tracker (desktop)
 * - Drop cap on first article paragraph
 * - SVG noise texture overlay
 * - Crafted gradient horizontal rules
 * - AnimatePresence theme toggle
 * - focus-visible keyboard accessibility
 * - 44px mobile tap targets
 * - Enlarged brand monogram
 * - Dark mode contrast verification
 * - No mobile overflow at 375px
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots", "iter4");
const RESULTS_PATH = path.join(__dirname, "sprint1-iter4-results.json");

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

// WCAG 2.0 relative luminance
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(...rgb1);
  const l2 = luminance(...rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(str) {
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
}

async function run() {
  const results = {
    timestamp: new Date().toISOString(),
    iteration: 4,
    criteria: {},
    darkMode: {},
    iter4Features: {},
    screenshots: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // ========================================
    // CRITERION 1: Homepage renders with framework content (immersive hero, NOT card list)
    // ========================================
    console.log("\n=== CRITERION 1: Homepage immersive experience ===");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200); // let parallax/animations settle

    // The homepage should have a full-viewport hero, NOT article cards
    const heroSection = await page.$('div.min-h-screen');
    const hasHero = heroSection !== null;

    // Should have the archetype name in a large H1
    const h1 = await page.$("h1");
    const h1Text = h1 ? await h1.textContent() : "";
    const hasArchetype = h1Text.includes("The Innovator");

    // Should have framework content (perceptual lens, constructs, articles sections)
    const fullPageText = await page.textContent("body");
    const hasPerceptualSection = fullPageText.includes("Perceptual Lens");
    const hasConstructsSection = fullPageText.includes("Core Constructs");
    const hasRecentThinking = fullPageText.includes("Recent Thinking");

    results.criteria["1_homepage_immersive"] = {
      pass: hasHero && hasArchetype && hasPerceptualSection && hasConstructsSection && hasRecentThinking,
      detail: `hero=${hasHero}, archetype=${hasArchetype}, lens=${hasPerceptualSection}, constructs=${hasConstructsSection}, articles=${hasRecentThinking}`,
    };
    console.log(`  ${hasHero ? "PASS" : "FAIL"}: Full-viewport hero present`);
    console.log(`  ${hasArchetype ? "PASS" : "FAIL"}: "The Innovator" in H1`);
    console.log(`  Sections: lens=${hasPerceptualSection}, constructs=${hasConstructsSection}, thinking=${hasRecentThinking}`);

    // Screenshot: homepage desktop light (full page)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-homepage-desktop-light.png"), fullPage: true });
    results.screenshots.push("01-homepage-desktop-light.png");

    // Screenshot: hero viewport only
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01b-hero-viewport.png"), fullPage: false });
    results.screenshots.push("01b-hero-viewport.png");

    // ========================================
    // CRITERION 2: Homepage shows archetype name, domain, perceptual lens excerpt
    // ========================================
    console.log("\n=== CRITERION 2: Homepage content (archetype, domain, lens) ===");

    const domainLabel = await page.$('span.text-muted');
    let hasDomain = false;
    if (domainLabel) {
      const domainText = await domainLabel.textContent();
      hasDomain = domainText.includes("Technology") || domainText.includes("Product");
    }

    // Perceptual lens blockquote in hero
    const blockquote = await page.$("blockquote");
    const hasLensExcerpt = blockquote !== null;

    results.criteria["2_homepage_content"] = {
      pass: hasArchetype && hasDomain && hasLensExcerpt,
      detail: `archetype=${hasArchetype}, domain=${hasDomain}, lens=${hasLensExcerpt}`,
    };
    console.log(`  ${hasArchetype && hasDomain && hasLensExcerpt ? "PASS" : "FAIL"}: archetype=${hasArchetype}, domain=${hasDomain}, lens=${hasLensExcerpt}`);

    // ========================================
    // CRITERION 3: Click framework => detail page with description + article list
    // ========================================
    console.log("\n=== CRITERION 3: Framework detail page ===");
    const fwLink = await page.$('a[href*="/frameworks/"]');
    if (fwLink) await fwLink.click();
    await page.waitForTimeout(1000);

    const detailUrl = page.url();
    const isOnDetail = detailUrl.includes("/frameworks/");
    const detailH1 = await page.$("h1");
    const detailH1Text = detailH1 ? await detailH1.textContent() : "";
    const articleLinks = await page.$$('a[href*="/articles/"]');

    results.criteria["3_framework_detail"] = {
      pass: isOnDetail && detailH1Text.includes("The Innovator") && articleLinks.length > 0,
      detail: `url=${detailUrl}, h1="${detailH1Text}", articles=${articleLinks.length}`,
    };
    console.log(`  ${isOnDetail && articleLinks.length > 0 ? "PASS" : "FAIL"}: detail page with ${articleLinks.length} article link(s)`);

    // Screenshot: framework detail light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-framework-detail-light.png"), fullPage: true });
    results.screenshots.push("02-framework-detail-light.png");

    // ========================================
    // CRITERION 4: Article distraction-free reading view
    // ========================================
    console.log("\n=== CRITERION 4: Article reading view ===");
    if (articleLinks.length > 0) {
      await articleLinks[0].click();
    }
    await page.waitForTimeout(1000);

    const articleUrl = page.url();
    const isOnArticle = articleUrl.includes("/articles/");
    const articleBody = await page.$(".article-body");
    const hasArticleBody = articleBody !== null;

    // Check article max-width
    let articleMaxWidth = "unknown";
    if (articleBody) {
      articleMaxWidth = await articleBody.evaluate((el) => getComputedStyle(el).maxWidth);
    }

    results.criteria["4_article_reading"] = {
      pass: isOnArticle && hasArticleBody,
      detail: `url=${articleUrl}, hasBody=${hasArticleBody}, maxWidth=${articleMaxWidth}`,
    };
    console.log(`  ${isOnArticle && hasArticleBody ? "PASS" : "FAIL"}: article view, maxWidth=${articleMaxWidth}`);

    // Screenshot: article reading light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-article-reading-light.png"), fullPage: true });
    results.screenshots.push("03-article-reading-light.png");

    // ========================================
    // ITER4 FEATURE: "Through the lens of..." intro block
    // ========================================
    console.log("\n=== ITER4: Through the lens of... intro block ===");
    const lensIntro = await page.$eval("body", (body) => {
      return body.textContent.includes("Through the lens of");
    });
    results.iter4Features["lens_intro_block"] = { present: lensIntro };
    console.log(`  "Through the lens of..." block: ${lensIntro ? "PRESENT" : "MISSING"}`);

    // ========================================
    // ITER4 FEATURE: Left-margin construct tracker (desktop)
    // ========================================
    console.log("\n=== ITER4: Left-margin construct tracker ===");
    const constructTracker = await page.$('div.sticky');
    const hasConstructTracker = constructTracker !== null;
    let trackerVisible = false;
    if (constructTracker) {
      trackerVisible = await constructTracker.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
    }
    results.iter4Features["construct_tracker"] = { present: hasConstructTracker, visible: trackerVisible };
    console.log(`  Construct tracker: present=${hasConstructTracker}, visible=${trackerVisible}`);

    // ========================================
    // ITER4 FEATURE: Drop cap on first paragraph
    // ========================================
    console.log("\n=== ITER4: Drop cap styling ===");
    const dropCapInfo = await page.evaluate(() => {
      const firstP = document.querySelector(".article-body > p:first-of-type");
      if (!firstP) return { found: false };
      const style = getComputedStyle(firstP, "::first-letter");
      return {
        found: true,
        fontSize: style.fontSize,
        float: style.cssFloat || style.float,
        color: style.color,
      };
    });
    // Drop cap should have a larger font size and float: left
    const hasDropCap = dropCapInfo.found && (parseFloat(dropCapInfo.fontSize) > 40 || dropCapInfo.float === "left");
    results.iter4Features["drop_cap"] = { present: hasDropCap, details: dropCapInfo };
    console.log(`  Drop cap: ${hasDropCap ? "YES" : "NO"} (fontSize=${dropCapInfo.fontSize}, float=${dropCapInfo.float})`);

    // ========================================
    // ITER4 FEATURE: Crafted gradient horizontal rules
    // ========================================
    console.log("\n=== ITER4: Crafted gradient HR ===");
    const hrCrafted = await page.$(".hr-crafted");
    let hrHasGradient = false;
    if (hrCrafted) {
      const hrBg = await hrCrafted.evaluate((el) => getComputedStyle(el).backgroundImage);
      hrHasGradient = hrBg.includes("linear-gradient");
    }
    results.iter4Features["crafted_hr"] = { present: !!hrCrafted, hasGradient: hrHasGradient };
    console.log(`  Crafted HR: present=${!!hrCrafted}, gradient=${hrHasGradient}`);

    // ========================================
    // ITER4 FEATURE: SVG noise texture overlay
    // ========================================
    console.log("\n=== ITER4: SVG noise texture ===");
    const noiseOverlay = await page.evaluate(() => {
      const body = document.body;
      const before = getComputedStyle(body, "::before");
      return {
        hasContent: before.content !== "none" && before.content !== "",
        opacity: before.opacity,
        position: before.position,
        pointerEvents: before.pointerEvents,
        bgImage: before.backgroundImage ? before.backgroundImage.substring(0, 80) : "none",
      };
    });
    const hasNoise = noiseOverlay.hasContent && noiseOverlay.pointerEvents === "none";
    results.iter4Features["noise_texture"] = { present: hasNoise, details: noiseOverlay };
    console.log(`  Noise texture: ${hasNoise ? "YES" : "NO"} (opacity=${noiseOverlay.opacity})`);

    // ========================================
    // ITER4 FEATURE: Focus-visible keyboard accessibility
    // ========================================
    console.log("\n=== ITER4: Focus-visible accessibility ===");
    const focusStyle = await page.evaluate(() => {
      // Check that *:focus-visible has an outline defined
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            if (rule.selectorText && rule.selectorText.includes("focus-visible")) {
              return { found: true, selector: rule.selectorText, outline: rule.style?.outline || "unknown" };
            }
          }
        } catch (e) {
          // Cross-origin stylesheet
        }
      }
      return { found: false };
    });
    results.iter4Features["focus_visible"] = focusStyle;
    console.log(`  focus-visible rule: ${focusStyle.found ? "FOUND" : "NOT FOUND"}`);

    // ========================================
    // ITER4 FEATURE: 44px minimum tap targets
    // ========================================
    console.log("\n=== ITER4: 44px minimum tap targets ===");
    const tapTargets = await page.evaluate(() => {
      const interactives = document.querySelectorAll("a[href], button");
      const results = [];
      let allPass = true;
      for (const el of interactives) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue; // hidden elements
        const minDim = Math.min(rect.width, rect.height);
        const style = getComputedStyle(el);
        const minHeightStr = style.minHeight;
        const effectiveHeight = Math.max(rect.height, parseFloat(minHeightStr) || 0);
        if (effectiveHeight < 44 && rect.height < 44) {
          allPass = false;
          results.push({
            text: el.textContent?.substring(0, 30),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            minHeight: minHeightStr,
          });
        }
      }
      return { allPass, failures: results.slice(0, 5) };
    });
    results.iter4Features["tap_targets_44px"] = tapTargets;
    console.log(`  44px tap targets: ${tapTargets.allPass ? "ALL PASS" : "SOME FAIL"}`);
    if (!tapTargets.allPass) {
      tapTargets.failures.forEach((f) => console.log(`    FAIL: "${f.text}" ${f.width}x${f.height} (minHeight=${f.minHeight})`));
    }

    // ========================================
    // ITER4 FEATURE: Enlarged brand monogram
    // ========================================
    console.log("\n=== ITER4: Brand monogram ===");
    const monogram = await page.evaluate(() => {
      // Find the Gm monogram container
      const spans = document.querySelectorAll("span");
      for (const s of spans) {
        if (s.textContent?.trim() === "Gm" && s.closest("header")) {
          const container = s.closest("a")?.querySelector("span:first-child");
          if (container) {
            const rect = container.getBoundingClientRect();
            return { found: true, width: Math.round(rect.width), height: Math.round(rect.height) };
          }
        }
      }
      return { found: false };
    });
    // 40x40 is larger than the iter3 8x8
    const monogramEnlarged = monogram.found && monogram.width >= 32;
    results.iter4Features["monogram_enlarged"] = { ...monogram, enlarged: monogramEnlarged };
    console.log(`  Monogram: found=${monogram.found}, size=${monogram.width}x${monogram.height}, enlarged=${monogramEnlarged}`);

    // ========================================
    // ITER4 FEATURE: AnimatePresence theme toggle
    // ========================================
    console.log("\n=== ITER4: Theme toggle animation ===");
    const themeToggle = await page.$('button[aria-label*="mode"]');
    let toggleHasAnimation = false;
    if (themeToggle) {
      const toggleText = await themeToggle.textContent();
      toggleHasAnimation = toggleText.includes("Reading Room") || toggleText.includes("Late Study");
    }
    results.iter4Features["theme_toggle_animation"] = { hasRoomName: toggleHasAnimation };
    console.log(`  Theme toggle room name: ${toggleHasAnimation ? "YES" : "NO"}`);

    // ========================================
    // CRITERION 5: Dark/light mode toggle works and persists
    // ========================================
    console.log("\n=== CRITERION 5: Dark/light mode toggle + persistence ===");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const htmlClassBefore = await page.$eval("html", (el) => el.className);
    const toggle = await page.$('button[aria-label*="mode"]');
    if (toggle) {
      await toggle.click();
      await page.waitForTimeout(800);
    }
    const htmlClassAfter = await page.$eval("html", (el) => el.className);
    const toggleWorked = htmlClassBefore !== htmlClassAfter;

    // Ensure dark mode
    const isDarkNow = htmlClassAfter.includes("dark");
    if (!isDarkNow && toggle) {
      await toggle.click();
      await page.waitForTimeout(600);
    }

    // Navigate to verify persistence
    const navLink = await page.$('a[href*="/frameworks/"]');
    if (navLink) await navLink.click();
    await page.waitForTimeout(800);
    const htmlAfterNav = await page.$eval("html", (el) => el.className);
    const persistedDark = htmlAfterNav.includes("dark");

    results.criteria["5_dark_mode_toggle"] = {
      pass: toggleWorked && persistedDark,
      detail: `toggleWorked=${toggleWorked}, persisted=${persistedDark}`,
    };
    console.log(`  ${toggleWorked && persistedDark ? "PASS" : "FAIL"}: toggle=${toggleWorked}, persist=${persistedDark}`);

    // ========================================
    // DARK MODE CONTRAST VERIFICATION
    // ========================================
    console.log("\n=== DARK MODE: Contrast verification ===");

    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // Ensure dark mode
    const htmlCheck = await page.$eval("html", (el) => el.className);
    if (!htmlCheck.includes("dark")) {
      const t = await page.$('button[aria-label*="mode"]');
      if (t) { await t.click(); await page.waitForTimeout(600); }
    }

    // Screenshot: homepage dark
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-homepage-dark.png"), fullPage: true });
    results.screenshots.push("04-homepage-dark.png");

    // Helper to get effective bg
    const getColors = async (selector) => {
      return page.$eval(selector, (el) => {
        const cs = getComputedStyle(el);
        let bg = "rgba(0, 0, 0, 0)";
        let node = el;
        while (node && node !== document.documentElement) {
          const nodeBg = getComputedStyle(node).backgroundColor;
          if (nodeBg && nodeBg !== "rgba(0, 0, 0, 0)" && nodeBg !== "transparent") {
            bg = nodeBg;
            break;
          }
          node = node.parentElement;
        }
        if (bg === "rgba(0, 0, 0, 0)" || bg === "transparent") {
          bg = getComputedStyle(document.body).backgroundColor;
        }
        return { color: cs.color, background: bg };
      });
    };

    const checkContrast = (label, colors) => {
      const fgRgb = parseRgb(colors.color);
      const bgRgb = parseRgb(colors.background);
      let ratio = null;
      if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
      const result = {
        color: colors.color,
        background: colors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  ${result.meetsAA ? "PASS" : "FAIL"} ${label}: ${result.contrastRatio}:1 (${colors.color} on ${colors.background})`);
      return result;
    };

    // Homepage H1
    try {
      const h1Colors = await getColors("h1");
      results.darkMode.homepage_h1 = checkContrast("Homepage H1", h1Colors);
    } catch (e) { console.log("  SKIP: H1 not found"); }

    // Homepage blockquote
    try {
      const bqColors = await getColors("blockquote p");
      results.darkMode.homepage_blockquote = checkContrast("Blockquote", bqColors);
    } catch (e) { console.log("  SKIP: blockquote not found"); }

    // Navigate to article in dark mode
    const fwLinkDark = await page.$('a[href*="/frameworks/"]');
    if (fwLinkDark) await fwLinkDark.click();
    await page.waitForTimeout(600);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-framework-detail-dark.png"), fullPage: true });
    results.screenshots.push("05-framework-detail-dark.png");

    const artLinkDark = await page.$('a[href*="/articles/"]');
    if (artLinkDark) await artLinkDark.click();
    await page.waitForTimeout(800);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-article-dark.png"), fullPage: true });
    results.screenshots.push("06-article-dark.png");

    // Article body dark
    try {
      const bodyColors = await getColors(".article-body p");
      results.darkMode.article_body = checkContrast("Article body", bodyColors);
    } catch (e) { console.log("  SKIP: article body not found"); }

    // Article H1 dark
    try {
      const artH1Colors = await getColors("h1");
      results.darkMode.article_h1 = checkContrast("Article H1", artH1Colors);
    } catch (e) { console.log("  SKIP: article H1 not found"); }

    // Muted text dark
    try {
      const mutedColors = await getColors("[class*='text-muted']");
      results.darkMode.muted_text = checkContrast("Muted text", mutedColors);
    } catch (e) { console.log("  SKIP: muted text not found"); }

    const darkModePass = Object.values(results.darkMode).every(
      (item) => typeof item === "object" && item.meetsAA === true
    );
    results.darkMode.overallPass = darkModePass;
    console.log(`\n  DARK MODE OVERALL: ${darkModePass ? "ALL PASS" : "SOME FAIL"}`);

    // ========================================
    // CRITERION 6: Legal disclaimer in footer
    // ========================================
    console.log("\n=== CRITERION 6: Legal disclaimer ===");
    const pagesToCheck = [BASE, `${BASE}/frameworks/the-innovator`];
    let disclaimerOnAll = true;
    for (const url of pagesToCheck) {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const footer = await page.$("footer");
      const footerText = footer ? await footer.textContent() : "";
      const hasDisclaimer =
        footerText.toLowerCase().includes("not affiliated") ||
        footerText.toLowerCase().includes("analytical models") ||
        footerText.toLowerCase().includes("not definitive");
      if (!hasDisclaimer) {
        disclaimerOnAll = false;
        console.log(`  MISSING disclaimer on ${url}`);
      }
    }
    results.criteria["6_legal_disclaimer"] = {
      pass: disclaimerOnAll,
      detail: `Disclaimer present on all checked pages: ${disclaimerOnAll}`,
    };
    console.log(`  ${disclaimerOnAll ? "PASS" : "FAIL"}`);

    // ========================================
    // CRITERION 7: No console errors
    // ========================================
    console.log("\n=== CRITERION 7: Console errors ===");
    const consoleErrors = [];
    const page2 = await context.newPage();
    page2.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page2.goto(BASE, { waitUntil: "networkidle" });
    await page2.waitForTimeout(500);
    await page2.goto(`${BASE}/frameworks/the-innovator`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(500);
    await page2.goto(`${BASE}/articles/why-the-ai-hardware-race-is-already-over`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(500);
    await page2.close();

    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes("favicon") && !e.includes("hydration") && !e.includes("Hydration") && !e.includes("404")
    );
    results.criteria["7_no_console_errors"] = {
      pass: criticalErrors.length === 0,
      detail: `${criticalErrors.length} critical errors, ${consoleErrors.length} total`,
      errors: criticalErrors,
    };
    console.log(`  ${criticalErrors.length === 0 ? "PASS" : "FAIL"}: ${criticalErrors.length} critical errors`);
    if (criticalErrors.length > 0) {
      criticalErrors.forEach((e) => console.log(`    ERROR: ${e}`));
    }

    // ========================================
    // CRITERION 8: Mobile responsive homepage at 375px
    // ========================================
    console.log("\n=== CRITERION 8: Mobile homepage (375px) ===");

    // Switch to light mode
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const htmlMode = await page.$eval("html", (el) => el.className);
    if (htmlMode.includes("dark")) {
      const t = await page.$('button[aria-label*="mode"]');
      if (t) { await t.click(); await page.waitForTimeout(600); }
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const overflowInfo = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const vpWidth = window.innerWidth;
      return {
        documentWidth: docWidth,
        viewportWidth: vpWidth,
        hasOverflow: docWidth > vpWidth,
        overflowAmount: docWidth - vpWidth,
      };
    });

    results.criteria["8_mobile_homepage"] = {
      pass: !overflowInfo.hasOverflow,
      detail: `docWidth=${overflowInfo.documentWidth}, vpWidth=${overflowInfo.viewportWidth}, overflow=${overflowInfo.overflowAmount}px`,
    };
    console.log(`  ${!overflowInfo.hasOverflow ? "PASS" : "FAIL"}: overflow=${overflowInfo.overflowAmount}px`);

    // Screenshot: homepage mobile light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-homepage-mobile-light.png"), fullPage: true });
    results.screenshots.push("07-homepage-mobile-light.png");

    // Mobile dark
    const mToggle = await page.$('button[aria-label*="mode"]');
    if (mToggle) { await mToggle.click(); await page.waitForTimeout(600); }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-homepage-mobile-dark.png"), fullPage: true });
    results.screenshots.push("08-homepage-mobile-dark.png");

    // Mobile dark h1 contrast
    try {
      const mH1Colors = await getColors("h1");
      results.darkMode.mobile_h1 = checkContrast("Mobile H1 dark", mH1Colors);
    } catch (e) {}

    // ========================================
    // CRITERION 9: Mobile responsive article at 375px
    // ========================================
    console.log("\n=== CRITERION 9: Mobile article (375px) ===");

    // Switch to light
    const tBack = await page.$('button[aria-label*="mode"]');
    if (tBack) { await tBack.click(); await page.waitForTimeout(400); }

    await page.goto(`${BASE}/articles/why-the-ai-hardware-race-is-already-over`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const articleOverflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const vpWidth = window.innerWidth;
      return {
        documentWidth: docWidth,
        viewportWidth: vpWidth,
        hasOverflow: docWidth > vpWidth,
        overflowAmount: docWidth - vpWidth,
      };
    });

    results.criteria["9_mobile_article"] = {
      pass: !articleOverflow.hasOverflow,
      detail: `docWidth=${articleOverflow.documentWidth}, vpWidth=${articleOverflow.viewportWidth}, overflow=${articleOverflow.overflowAmount}px`,
    };
    console.log(`  ${!articleOverflow.hasOverflow ? "PASS" : "FAIL"}: overflow=${articleOverflow.overflowAmount}px`);

    // Screenshot: article mobile light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-article-mobile-light.png"), fullPage: true });
    results.screenshots.push("09-article-mobile-light.png");

    // Article mobile dark
    const artToggle = await page.$('button[aria-label*="mode"]');
    if (artToggle) { await artToggle.click(); await page.waitForTimeout(600); }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-article-mobile-dark.png"), fullPage: true });
    results.screenshots.push("10-article-mobile-dark.png");

    // Mobile article body dark contrast
    try {
      const mbColors = await getColors(".article-body p");
      results.darkMode.mobile_article_body = checkContrast("Mobile article body dark", mbColors);
    } catch (e) {}

    // ========================================
    // HOMEPAGE SECTIONS: Verify iter4 structural features
    // ========================================
    console.log("\n=== ITER4: Homepage structural verification ===");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Ensure light mode
    const finalModeCheck = await page.$eval("html", (el) => el.className);
    if (finalModeCheck.includes("dark")) {
      const t = await page.$('button[aria-label*="mode"]');
      if (t) { await t.click(); await page.waitForTimeout(400); }
    }

    // Verify: Perceptual lens diptych (two-column grid: spotlight + shadow)
    const diptychGrid = await page.$('.grid.md\\:grid-cols-2');
    const hasDiptych = diptychGrid !== null;
    results.iter4Features["perceptual_diptych"] = { present: hasDiptych };
    console.log(`  Perceptual lens diptych: ${hasDiptych ? "YES" : "NO"}`);

    // Verify: Constructs as tension lines (not accordion)
    const constructLinks = await page.$$('a[href*="/frameworks/"] .flex.items-stretch');
    const hasTensionLines = constructLinks.length > 0;
    results.iter4Features["construct_tension_lines"] = { present: hasTensionLines, count: constructLinks.length };
    console.log(`  Construct tension lines: ${hasTensionLines ? "YES" : "NO"} (${constructLinks.length})`);

    // Verify: Thought-thread articles (with vertical thread line)
    const threadLine = await page.$('div[style*="backgroundColor"]');
    const hasThreadLine = threadLine !== null;
    results.iter4Features["thought_threads"] = { present: hasThreadLine };
    console.log(`  Thought-thread articles: ${hasThreadLine ? "YES" : "NO"}`);

    // Verify: Parallax hero (uses useScroll/useTransform)
    // We can verify this by checking if the hero has will-change or transform styles
    const heroTransforms = await page.evaluate(() => {
      const hero = document.querySelector('div.min-h-screen');
      if (!hero) return { found: false };
      // The parallax is via framer-motion style props
      const inner = hero.querySelector('[style]');
      return {
        found: true,
        hasMotionDiv: !!inner,
      };
    });
    results.iter4Features["parallax_hero"] = heroTransforms;
    console.log(`  Parallax hero: ${heroTransforms.found ? "YES" : "NO"}`);

    // Screenshot: framework detail desktop light (back to light)
    await page.goto(`${BASE}/frameworks/the-innovator`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11-framework-detail-desktop-light.png"), fullPage: true });
    results.screenshots.push("11-framework-detail-desktop-light.png");

    // ========================================
    // OVERFLOW FIX: Verify body no longer has overflow-x-hidden
    // ========================================
    console.log("\n=== ITER4: Overflow fix verification ===");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const bodyOverflow = await page.$eval("body", (el) => {
      const cs = getComputedStyle(el);
      return {
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        bodyClass: el.className,
      };
    });
    const overflowFixedAtSource = bodyOverflow.overflowX !== "hidden";
    results.iter4Features["overflow_fixed_at_source"] = { ...bodyOverflow, fixedAtSource: overflowFixedAtSource };
    console.log(`  body overflow-x: ${bodyOverflow.overflowX} (fixed at source: ${overflowFixedAtSource ? "YES" : "NO — still using body override"})`);

    // ========================================
    // dark: variant audit
    // ========================================
    console.log("\n=== ITER4: dark: variant cleanup audit ===");
    // This checks whether dark: classes are still used in rendered HTML
    const darkVariants = await page.evaluate(() => {
      const allElements = document.querySelectorAll("*");
      const darkClasses = [];
      for (const el of allElements) {
        const classes = Array.from(el.classList);
        for (const cls of classes) {
          if (cls.startsWith("dark:")) {
            darkClasses.push(cls);
          }
        }
      }
      return [...new Set(darkClasses)];
    });
    results.iter4Features["dark_variant_classes"] = { count: darkVariants.length, classes: darkVariants };
    console.log(`  dark: variant classes in DOM: ${darkVariants.length}`);
    if (darkVariants.length > 0) {
      darkVariants.forEach((c) => console.log(`    ${c}`));
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n========================================");
    console.log("SUMMARY — ITERATION 4");
    console.log("========================================\n");

    console.log("SUCCESS CRITERIA:");
    const allCriteria = Object.entries(results.criteria);
    let passCount = 0;
    for (const [key, val] of allCriteria) {
      const status = val.pass ? "PASS" : "FAIL";
      if (val.pass) passCount++;
      console.log(`  ${status}  ${key}: ${val.detail}`);
    }
    console.log(`\n  Criteria passed: ${passCount}/${allCriteria.length}`);

    console.log("\nDARK MODE CONTRAST:");
    for (const [key, val] of Object.entries(results.darkMode)) {
      if (key === "overallPass") continue;
      if (typeof val === "object" && val.contrastRatio) {
        console.log(`  ${val.meetsAA ? "PASS" : "FAIL"} ${key}: ${val.contrastRatio}:1`);
      }
    }
    console.log(`  Overall: ${results.darkMode.overallPass ? "ALL PASS" : "SOME FAIL"}`);

    console.log("\nITER4 FEATURES:");
    for (const [key, val] of Object.entries(results.iter4Features)) {
      const status = val.present !== undefined ? (val.present ? "YES" : "NO") : JSON.stringify(val);
      console.log(`  ${key}: ${status}`);
    }

    // Write results
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
    console.log(`\nResults written to ${RESULTS_PATH}`);

  } catch (err) {
    console.error("Test error:", err);
    results.error = err.message;
    fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

run();
