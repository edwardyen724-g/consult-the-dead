/**
 * Sprint 1, Iteration 5 -- Evaluation Test Suite
 * Dark mode fix verification on top of iteration 4's structural overhaul.
 *
 * Tests all 9 success criteria with CRITICAL focus on:
 * - Dark mode text contrast on ALL pages (homepage, framework, article)
 * - Both desktop (1280px) and mobile (375px) viewports
 * - Computed contrast ratios against WCAG AA (4.5:1 for normal text, 3:1 for large text)
 * - All iter4 structural features still intact
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots", "iter5");
const RESULTS_PATH = path.join(__dirname, "sprint1-iter5-results.json");

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

// Helper: get foreground color and effective background for an element
const getColorsScript = `(el) => {
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
  return { color: cs.color, background: bg, fontSize: cs.fontSize, fontWeight: cs.fontWeight };
}`;

function checkContrast(label, colors) {
  const fgRgb = parseRgb(colors.color);
  const bgRgb = parseRgb(colors.background);
  let ratio = null;
  if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
  // Large text: >= 24px, or >= 18.66px and bold (>=700)
  const fontSize = parseFloat(colors.fontSize) || 16;
  const fontWeight = parseInt(colors.fontWeight) || 400;
  const isLargeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
  const threshold = isLargeText ? 3.0 : 4.5;
  const result = {
    color: colors.color,
    background: colors.background,
    contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
    threshold: `${threshold}:1 (${isLargeText ? "large" : "normal"} text)`,
    meetsAA: ratio ? ratio >= threshold : false,
    fontSize: colors.fontSize,
    fontWeight: colors.fontWeight,
  };
  const icon = result.meetsAA ? "PASS" : "FAIL";
  console.log(`  ${icon} ${label}: ${result.contrastRatio}:1 (need ${threshold}:1) — ${colors.color} on ${colors.background}`);
  return result;
}

async function ensureDarkMode(page) {
  const cls = await page.$eval("html", (el) => el.className);
  if (!cls.includes("dark")) {
    const t = await page.$('button[aria-label*="mode"]');
    if (t) {
      await t.click();
      await page.waitForTimeout(600);
    }
  }
}

async function ensureLightMode(page) {
  const cls = await page.$eval("html", (el) => el.className);
  if (cls.includes("dark")) {
    const t = await page.$('button[aria-label*="mode"]');
    if (t) {
      await t.click();
      await page.waitForTimeout(600);
    }
  }
}

async function run() {
  const results = {
    timestamp: new Date().toISOString(),
    iteration: 5,
    criteria: {},
    darkModeContrast: {
      desktop: {},
      mobile: {},
    },
    iter4Features: {},
    screenshots: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // ========================================
    // CRITERION 1: Homepage renders with framework content (immersive hero)
    // ========================================
    console.log("\n=== CRITERION 1: Homepage immersive experience ===");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    const heroSection = await page.$("div.min-h-screen");
    const hasHero = heroSection !== null;

    const h1 = await page.$("h1");
    const h1Text = h1 ? await h1.textContent() : "";
    const hasArchetype = h1Text.includes("The Innovator");

    const fullPageText = await page.textContent("body");
    const hasPerceptualSection = fullPageText.includes("Perceptual Lens") || fullPageText.includes("sharp focus") || fullPageText.includes("In sharp focus");
    const hasConstructsSection = fullPageText.includes("Constructs") || fullPageText.includes("Core Constructs");
    const hasRecentThinking = fullPageText.includes("Recent Thinking") || fullPageText.includes("Thinking");

    results.criteria["1_homepage_immersive"] = {
      pass: hasHero && hasArchetype,
      detail: `hero=${hasHero}, archetype=${hasArchetype}, lens=${hasPerceptualSection}, constructs=${hasConstructsSection}, articles=${hasRecentThinking}`,
    };
    console.log(`  ${hasHero ? "PASS" : "FAIL"}: Full-viewport hero present`);
    console.log(`  ${hasArchetype ? "PASS" : "FAIL"}: "The Innovator" in H1`);

    // Screenshot: homepage desktop light (full page)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-homepage-desktop-light.png"), fullPage: true });
    results.screenshots.push("01-homepage-desktop-light.png");

    // Screenshot: hero viewport only
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01b-hero-viewport.png"), fullPage: false });
    results.screenshots.push("01b-hero-viewport.png");

    // ========================================
    // CRITERION 2: Shows archetype name, domain, perceptual lens
    // ========================================
    console.log("\n=== CRITERION 2: Homepage content (archetype, domain, lens) ===");

    // Domain text might be in various elements — check full body text
    const hasDomainText = fullPageText.includes("TECHNOLOGY") || fullPageText.includes("Technology") || fullPageText.includes("Product") || fullPageText.includes("DESIGN");

    const blockquote = await page.$("blockquote");
    const hasLensExcerpt = blockquote !== null;

    results.criteria["2_homepage_content"] = {
      pass: hasArchetype && hasDomainText && hasLensExcerpt,
      detail: `archetype=${hasArchetype}, domain=${hasDomainText}, lens=${hasLensExcerpt}`,
    };
    console.log(`  ${hasArchetype && hasDomainText && hasLensExcerpt ? "PASS" : "FAIL"}: archetype=${hasArchetype}, domain=${hasDomainText}, lens=${hasLensExcerpt}`);

    // ========================================
    // CRITERION 3: Click framework => detail page with articles
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
      pass: isOnDetail && articleLinks.length > 0,
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
    // CRITERION 5: Dark/light mode toggle works and persists
    // ========================================
    console.log("\n=== CRITERION 5: Dark/light mode toggle + persistence ===");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    await ensureLightMode(page);
    const htmlClassBefore = await page.$eval("html", (el) => el.className);
    const toggle = await page.$('button[aria-label*="mode"]');
    if (toggle) {
      await toggle.click();
      await page.waitForTimeout(800);
    }
    const htmlClassAfter = await page.$eval("html", (el) => el.className);
    const toggleWorked = htmlClassBefore !== htmlClassAfter;
    const isDarkNow = htmlClassAfter.includes("dark");

    // Navigate to verify persistence
    const navLink = await page.$('a[href*="/frameworks/"]');
    if (navLink) await navLink.click();
    await page.waitForTimeout(800);
    const htmlAfterNav = await page.$eval("html", (el) => el.className);
    const persistedDark = htmlAfterNav.includes("dark");

    results.criteria["5_dark_mode_toggle"] = {
      pass: toggleWorked && persistedDark,
      detail: `toggleWorked=${toggleWorked}, isDark=${isDarkNow}, persisted=${persistedDark}`,
    };
    console.log(`  ${toggleWorked && persistedDark ? "PASS" : "FAIL"}: toggle=${toggleWorked}, persist=${persistedDark}`);

    // ========================================
    // CRITERION 6: Legal disclaimer in footer
    // ========================================
    console.log("\n=== CRITERION 6: Legal disclaimer ===");
    const pagesToCheck = [
      BASE,
      `${BASE}/frameworks/the-innovator`,
      `${BASE}/articles/why-the-ai-hardware-race-is-already-over`,
    ];
    let disclaimerOnAll = true;
    for (const url of pagesToCheck) {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(400);
      const footer = await page.$("footer");
      const footerText = footer ? await footer.textContent() : "";
      const hasDisclaimer =
        footerText.toLowerCase().includes("not affiliated") ||
        footerText.toLowerCase().includes("analytical models") ||
        footerText.toLowerCase().includes("not definitive") ||
        footerText.toLowerCase().includes("abstract reasoning");
      if (!hasDisclaimer) {
        disclaimerOnAll = false;
        console.log(`  MISSING disclaimer on ${url}`);
      }
    }
    results.criteria["6_legal_disclaimer"] = {
      pass: disclaimerOnAll,
      detail: `Disclaimer present on all 3 pages: ${disclaimerOnAll}`,
    };
    console.log(`  ${disclaimerOnAll ? "PASS" : "FAIL"}: Legal disclaimer`);

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
      (e) =>
        !e.includes("favicon") &&
        !e.includes("hydration") &&
        !e.includes("Hydration") &&
        !e.includes("404") &&
        !e.includes("Download the React DevTools")
    );
    results.criteria["7_no_console_errors"] = {
      pass: criticalErrors.length === 0,
      detail: `${criticalErrors.length} critical errors, ${consoleErrors.length} total`,
      errors: criticalErrors,
    };
    console.log(`  ${criticalErrors.length === 0 ? "PASS" : "FAIL"}: ${criticalErrors.length} critical errors`);
    if (criticalErrors.length > 0) {
      criticalErrors.slice(0, 5).forEach((e) => console.log(`    ERROR: ${e}`));
    }

    // ========================================
    // CRITERION 8: Mobile responsive homepage at 375px
    // ========================================
    console.log("\n=== CRITERION 8: Mobile homepage (375px) ===");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await ensureLightMode(page);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    const overflowInfo = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      overflowAmount: document.documentElement.scrollWidth - window.innerWidth,
    }));

    results.criteria["8_mobile_homepage"] = {
      pass: !overflowInfo.hasOverflow,
      detail: `docWidth=${overflowInfo.documentWidth}, vpWidth=${overflowInfo.viewportWidth}, overflow=${overflowInfo.overflowAmount}px`,
    };
    console.log(`  ${!overflowInfo.hasOverflow ? "PASS" : "FAIL"}: overflow=${overflowInfo.overflowAmount}px`);

    // Screenshot: homepage mobile light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-homepage-mobile-light.png"), fullPage: true });
    results.screenshots.push("04-homepage-mobile-light.png");

    // ========================================
    // CRITERION 9: Mobile responsive article at 375px
    // ========================================
    console.log("\n=== CRITERION 9: Mobile article (375px) ===");
    await page.goto(`${BASE}/articles/why-the-ai-hardware-race-is-already-over`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const articleOverflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
      overflowAmount: document.documentElement.scrollWidth - window.innerWidth,
    }));

    results.criteria["9_mobile_article"] = {
      pass: !articleOverflow.hasOverflow,
      detail: `docWidth=${articleOverflow.documentWidth}, vpWidth=${articleOverflow.viewportWidth}, overflow=${articleOverflow.overflowAmount}px`,
    };
    console.log(`  ${!articleOverflow.hasOverflow ? "PASS" : "FAIL"}: overflow=${articleOverflow.overflowAmount}px`);

    // Screenshot: article mobile light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-article-mobile-light.png"), fullPage: true });
    results.screenshots.push("05-article-mobile-light.png");

    // ================================================================
    // DARK MODE CONTRAST VERIFICATION — THE CRITICAL ITER5 TEST
    // ================================================================
    console.log("\n========================================");
    console.log("DARK MODE CONTRAST — CRITICAL ITER5 VERIFICATION");
    console.log("========================================");

    // ---- Desktop Dark Mode ----
    console.log("\n--- Desktop (1280px) Dark Mode ---");
    await page.setViewportSize({ width: 1280, height: 900 });

    // Homepage dark
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await ensureDarkMode(page);
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-homepage-desktop-dark.png"), fullPage: true });
    results.screenshots.push("06-homepage-desktop-dark.png");

    // Homepage H1
    try {
      const h1Colors = await page.$eval("h1", eval(getColorsScript));
      results.darkModeContrast.desktop.homepage_h1 = checkContrast("Desktop Homepage H1", h1Colors);
    } catch (e) { console.log("  SKIP: H1 not found"); }

    // Homepage blockquote
    try {
      const bqColors = await page.$eval("blockquote p, blockquote", eval(getColorsScript));
      results.darkModeContrast.desktop.homepage_blockquote = checkContrast("Desktop Homepage Blockquote", bqColors);
    } catch (e) { console.log("  SKIP: blockquote not found"); }

    // Homepage body text (any paragraph outside hero)
    try {
      const bodyParas = await page.$$("p");
      if (bodyParas.length > 2) {
        const paraColors = await bodyParas[2].evaluate(eval(getColorsScript));
        results.darkModeContrast.desktop.homepage_body_text = checkContrast("Desktop Homepage body text", paraColors);
      }
    } catch (e) { console.log("  SKIP: body text not found"); }

    // Homepage muted text
    try {
      const mutedColors = await page.$eval(".text-muted, [class*='text-muted']", eval(getColorsScript));
      results.darkModeContrast.desktop.homepage_muted = checkContrast("Desktop Homepage muted text", mutedColors);
    } catch (e) { console.log("  SKIP: muted text not found"); }

    // Framework detail dark
    await page.goto(`${BASE}/frameworks/the-innovator`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await ensureDarkMode(page);
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-framework-detail-dark.png"), fullPage: true });
    results.screenshots.push("07-framework-detail-dark.png");

    try {
      const fwH1Colors = await page.$eval("h1", eval(getColorsScript));
      results.darkModeContrast.desktop.framework_h1 = checkContrast("Desktop Framework H1", fwH1Colors);
    } catch (e) { console.log("  SKIP: framework H1 not found"); }

    try {
      const fwBodyColors = await page.$eval("p", eval(getColorsScript));
      results.darkModeContrast.desktop.framework_body = checkContrast("Desktop Framework body", fwBodyColors);
    } catch (e) { console.log("  SKIP: framework body not found"); }

    // Diptych panels (spotlight/shadow)
    try {
      const diptychSpotlight = await page.$(".lens-spotlight");
      if (diptychSpotlight) {
        const spotColors = await diptychSpotlight.$eval("p, span, h3, h2, div", eval(getColorsScript));
        results.darkModeContrast.desktop.diptych_spotlight = checkContrast("Desktop Diptych Spotlight text", spotColors);
      }
    } catch (e) { console.log("  SKIP: diptych spotlight not found"); }

    try {
      const diptychShadow = await page.$(".lens-shadow");
      if (diptychShadow) {
        const shadowColors = await diptychShadow.$eval("p, span, h3, h2, div", eval(getColorsScript));
        results.darkModeContrast.desktop.diptych_shadow = checkContrast("Desktop Diptych Shadow text", shadowColors);
      }
    } catch (e) { console.log("  SKIP: diptych shadow not found"); }

    // Article dark
    await page.goto(`${BASE}/articles/why-the-ai-hardware-race-is-already-over`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await ensureDarkMode(page);
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-article-desktop-dark.png"), fullPage: true });
    results.screenshots.push("08-article-desktop-dark.png");

    try {
      const artH1Colors = await page.$eval("h1", eval(getColorsScript));
      results.darkModeContrast.desktop.article_h1 = checkContrast("Desktop Article H1", artH1Colors);
    } catch (e) { console.log("  SKIP: article H1 not found"); }

    try {
      const artBodyColors = await page.$eval(".article-body p", eval(getColorsScript));
      results.darkModeContrast.desktop.article_body = checkContrast("Desktop Article body", artBodyColors);
    } catch (e) { console.log("  SKIP: article body not found"); }

    // "Through the lens of..." intro
    try {
      const lensIntroEl = await page.$(".lens-intro, [class*='lens-intro']");
      if (lensIntroEl) {
        const lensColors = await lensIntroEl.$eval("p, span, div", eval(getColorsScript));
        results.darkModeContrast.desktop.lens_intro = checkContrast("Desktop Lens intro text", lensColors);
      }
    } catch (e) { console.log("  SKIP: lens intro not found"); }

    // Article accent text
    try {
      const accentColors = await page.$eval(".text-accent, [class*='text-accent']", eval(getColorsScript));
      results.darkModeContrast.desktop.article_accent = checkContrast("Desktop Article accent text", accentColors);
    } catch (e) { console.log("  SKIP: accent text not found"); }

    // ---- Mobile Dark Mode ----
    console.log("\n--- Mobile (375px) Dark Mode ---");
    await page.setViewportSize({ width: 375, height: 812 });

    // Homepage mobile dark
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await ensureDarkMode(page);
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-homepage-mobile-dark.png"), fullPage: true });
    results.screenshots.push("09-homepage-mobile-dark.png");

    try {
      const mH1Colors = await page.$eval("h1", eval(getColorsScript));
      results.darkModeContrast.mobile.homepage_h1 = checkContrast("Mobile Homepage H1", mH1Colors);
    } catch (e) { console.log("  SKIP: mobile H1 not found"); }

    try {
      const mBodyColors = await page.$eval("p", eval(getColorsScript));
      results.darkModeContrast.mobile.homepage_body = checkContrast("Mobile Homepage body", mBodyColors);
    } catch (e) { console.log("  SKIP: mobile body not found"); }

    // Framework mobile dark
    await page.goto(`${BASE}/frameworks/the-innovator`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await ensureDarkMode(page);
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-framework-mobile-dark.png"), fullPage: true });
    results.screenshots.push("10-framework-mobile-dark.png");

    try {
      const mfH1Colors = await page.$eval("h1", eval(getColorsScript));
      results.darkModeContrast.mobile.framework_h1 = checkContrast("Mobile Framework H1", mfH1Colors);
    } catch (e) { console.log("  SKIP: mobile framework H1 not found"); }

    // Article mobile dark
    await page.goto(`${BASE}/articles/why-the-ai-hardware-race-is-already-over`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await ensureDarkMode(page);
    await page.waitForTimeout(400);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11-article-mobile-dark.png"), fullPage: true });
    results.screenshots.push("11-article-mobile-dark.png");

    try {
      const maH1Colors = await page.$eval("h1", eval(getColorsScript));
      results.darkModeContrast.mobile.article_h1 = checkContrast("Mobile Article H1", maH1Colors);
    } catch (e) { console.log("  SKIP: mobile article H1 not found"); }

    try {
      const maBodyColors = await page.$eval(".article-body p", eval(getColorsScript));
      results.darkModeContrast.mobile.article_body = checkContrast("Mobile Article body", maBodyColors);
    } catch (e) { console.log("  SKIP: mobile article body not found"); }

    // ---- Dark Mode Summary ----
    console.log("\n--- Dark Mode Contrast Summary ---");
    const allContrastResults = [
      ...Object.values(results.darkModeContrast.desktop),
      ...Object.values(results.darkModeContrast.mobile),
    ];
    const contrastPassCount = allContrastResults.filter((r) => r.meetsAA).length;
    const contrastTotalCount = allContrastResults.length;
    const darkModeAllPass = contrastPassCount === contrastTotalCount;
    results.darkModeContrast.summary = {
      pass: darkModeAllPass,
      passed: contrastPassCount,
      total: contrastTotalCount,
      failedElements: allContrastResults.filter((r) => !r.meetsAA).map((r) => `${r.contrastRatio}:1 — ${r.color} on ${r.background}`),
    };
    console.log(`  Dark mode contrast: ${contrastPassCount}/${contrastTotalCount} pass WCAG AA`);
    console.log(`  Overall: ${darkModeAllPass ? "ALL PASS" : "SOME FAIL"}`);

    // ================================================================
    // ITER4 FEATURES — Verify structural changes still intact
    // ================================================================
    console.log("\n========================================");
    console.log("ITER4 FEATURES — Structural verification");
    console.log("========================================");

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    await ensureLightMode(page);

    // Perceptual lens diptych
    const diptychGrid = await page.$(".grid.md\\:grid-cols-2, [class*='grid'][class*='md:grid-cols-2']");
    const hasDiptych = diptychGrid !== null;
    results.iter4Features["perceptual_diptych"] = { present: hasDiptych };
    console.log(`\n  Perceptual lens diptych: ${hasDiptych ? "YES" : "NO"}`);

    // Construct tension lines
    const bodyTextFull = await page.textContent("body");
    const hasTensionLines = bodyTextFull.includes("Constructs") || bodyTextFull.includes("Core Constructs");
    results.iter4Features["construct_section"] = { present: hasTensionLines };
    console.log(`  Construct section: ${hasTensionLines ? "YES" : "NO"}`);

    // Thought-thread articles section
    const hasThoughtThreads = bodyTextFull.includes("Recent Thinking") || bodyTextFull.includes("Thinking");
    results.iter4Features["thought_threads"] = { present: hasThoughtThreads };
    console.log(`  Thought-thread section: ${hasThoughtThreads ? "YES" : "NO"}`);

    // Parallax hero
    const heroEl = await page.$("div.min-h-screen");
    results.iter4Features["parallax_hero"] = { present: !!heroEl };
    console.log(`  Full-viewport hero: ${heroEl ? "YES" : "NO"}`);

    // AnimatePresence theme toggle room names
    const themeToggle = await page.$('button[aria-label*="mode"]');
    let toggleHasRoom = false;
    if (themeToggle) {
      const toggleText = await themeToggle.textContent();
      toggleHasRoom = toggleText.includes("Reading Room") || toggleText.includes("Late Study");
    }
    results.iter4Features["theme_toggle_room_name"] = { present: toggleHasRoom };
    console.log(`  Theme toggle room name: ${toggleHasRoom ? "YES" : "NO"}`);

    // Navigate to article for remaining checks
    await page.goto(`${BASE}/articles/why-the-ai-hardware-race-is-already-over`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // "Through the lens of..." block
    const artText = await page.textContent("body");
    const hasLensIntro = artText.includes("Through the lens of");
    results.iter4Features["lens_intro_block"] = { present: hasLensIntro };
    console.log(`  "Through the lens of..." block: ${hasLensIntro ? "YES" : "NO"}`);

    // Left-margin construct tracker
    const constructTracker = await page.$("div.sticky, [class*='sticky']");
    const hasTracker = constructTracker !== null;
    results.iter4Features["construct_tracker"] = { present: hasTracker };
    console.log(`  Left-margin construct tracker: ${hasTracker ? "YES" : "NO"}`);

    // Drop cap
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
    results.iter4Features["drop_cap"] = { present: dropCapInfo.found, details: dropCapInfo };
    console.log(`  Drop cap: ${dropCapInfo.found ? "FOUND" : "NOT FOUND"} (fontSize=${dropCapInfo.fontSize})`);

    // Crafted HR
    const hrCrafted = await page.$(".hr-crafted");
    results.iter4Features["crafted_hr"] = { present: !!hrCrafted };
    console.log(`  Crafted gradient HR: ${hrCrafted ? "YES" : "NO"}`);

    // Noise texture
    const noiseOverlay = await page.evaluate(() => {
      const before = getComputedStyle(document.body, "::before");
      return {
        hasContent: before.content !== "none" && before.content !== "",
        opacity: before.opacity,
        pointerEvents: before.pointerEvents,
      };
    });
    const hasNoise = noiseOverlay.hasContent && noiseOverlay.pointerEvents === "none";
    results.iter4Features["noise_texture"] = { present: hasNoise, details: noiseOverlay };
    console.log(`  Noise texture overlay: ${hasNoise ? "YES" : "NO"} (opacity=${noiseOverlay.opacity})`);

    // Selection styling
    const selectionColors = await page.evaluate(() => {
      const sheets = Array.from(document.styleSheets);
      for (const sheet of sheets) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            if (rule.selectorText && rule.selectorText.includes("::selection")) {
              return { found: true, bg: rule.style.backgroundColor };
            }
          }
        } catch (e) {}
      }
      return { found: false };
    });
    results.iter4Features["selection_styling"] = selectionColors;
    console.log(`  Custom selection styling: ${selectionColors.found ? "YES" : "NO"}`);

    // Reading progress bar
    const progressBar = await page.$(".reading-progress");
    results.iter4Features["reading_progress"] = { present: !!progressBar };
    console.log(`  Reading progress bar: ${progressBar ? "YES" : "NO"}`);

    // Overflow fix — body should NOT have overflow-x: hidden
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const bodyOverflow = await page.$eval("body", (el) => ({
      overflowX: getComputedStyle(el).overflowX,
    }));
    const overflowFixedAtSource = bodyOverflow.overflowX !== "hidden";
    results.iter4Features["overflow_fixed_at_source"] = { value: bodyOverflow.overflowX, fixedAtSource: overflowFixedAtSource };
    console.log(`  Overflow fixed at source: ${overflowFixedAtSource ? "YES" : "NO"} (body overflow-x: ${bodyOverflow.overflowX})`);

    // dark: variant audit
    const darkVariants = await page.evaluate(() => {
      const all = document.querySelectorAll("*");
      const found = new Set();
      for (const el of all) {
        for (const cls of Array.from(el.classList)) {
          if (cls.startsWith("dark:")) found.add(cls);
        }
      }
      return [...found];
    });
    results.iter4Features["dark_variant_classes"] = { count: darkVariants.length, classes: darkVariants };
    console.log(`  dark: variant classes in DOM: ${darkVariants.length}${darkVariants.length > 0 ? " — " + darkVariants.join(", ") : ""}`);

    // ========================================
    // LIGHT MODE SCREENSHOTS (remaining)
    // ========================================
    await ensureLightMode(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/frameworks/the-innovator`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12-framework-detail-desktop-light.png"), fullPage: true });
    results.screenshots.push("12-framework-detail-desktop-light.png");

    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n\n========================================");
    console.log("SUMMARY — ITERATION 5");
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

    console.log("\nDARK MODE CONTRAST (Desktop):");
    for (const [key, val] of Object.entries(results.darkModeContrast.desktop)) {
      console.log(`  ${val.meetsAA ? "PASS" : "FAIL"} ${key}: ${val.contrastRatio}:1`);
    }

    console.log("\nDARK MODE CONTRAST (Mobile):");
    for (const [key, val] of Object.entries(results.darkModeContrast.mobile)) {
      console.log(`  ${val.meetsAA ? "PASS" : "FAIL"} ${key}: ${val.contrastRatio}:1`);
    }

    console.log(`\n  Dark mode overall: ${results.darkModeContrast.summary.pass ? "ALL PASS" : "SOME FAIL"} (${results.darkModeContrast.summary.passed}/${results.darkModeContrast.summary.total})`);

    console.log("\nITER4 FEATURES:");
    for (const [key, val] of Object.entries(results.iter4Features)) {
      if (val.present !== undefined) {
        console.log(`  ${val.present ? "YES" : "NO "}  ${key}`);
      }
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
