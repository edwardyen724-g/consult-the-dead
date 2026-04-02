/**
 * Sprint 1, Iteration 3 -- Evaluation Test Suite
 * Tests all 9 success criteria with special focus on dark mode fix verification,
 * mobile overflow, and article typography (letter-spacing, vertical rhythm).
 */

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots", "iter3");
const RESULTS_PATH = path.join(__dirname, "sprint1-iter3-results.json");

// Ensure screenshot directory exists
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
    iteration: 3,
    criteria: {},
    darkMode: {},
    typography: {},
    screenshots: [],
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // ========================================
    // CRITERION 1: Homepage renders framework gallery with >= 1 framework
    // ========================================
    console.log("\n=== CRITERION 1: Homepage framework gallery ===");
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800); // let animations settle

    const frameworkCards = await page.$$("article");
    const cardCount = frameworkCards.length;
    results.criteria["1_homepage_gallery"] = {
      pass: cardCount >= 1,
      detail: `Found ${cardCount} framework card(s)`,
    };
    console.log(`  ${cardCount >= 1 ? "PASS" : "FAIL"}: ${cardCount} framework card(s)`);

    // Screenshot: homepage desktop light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-homepage-desktop-light.png"), fullPage: true });
    results.screenshots.push("01-homepage-desktop-light.png");

    // ========================================
    // CRITERION 2: Card shows archetype name, domain, perceptual lens excerpt
    // ========================================
    console.log("\n=== CRITERION 2: Card content ===");
    let hasArchetype = false;
    let hasDomain = false;
    let hasLensExcerpt = false;

    if (cardCount > 0) {
      const card = frameworkCards[0];
      const cardText = await card.textContent();
      // "The Innovator" archetype name
      hasArchetype = cardText.includes("The Innovator");
      // domain should be present (e.g., "Technology & Product Design")
      hasDomain = (await card.$$("span")).length > 0; // domain label present
      // perceptual lens excerpt in blockquote
      const blockquote = await card.$("blockquote");
      hasLensExcerpt = blockquote !== null;
    }
    results.criteria["2_card_content"] = {
      pass: hasArchetype && hasDomain && hasLensExcerpt,
      detail: `archetype=${hasArchetype}, domain=${hasDomain}, lens=${hasLensExcerpt}`,
    };
    console.log(`  ${hasArchetype && hasDomain && hasLensExcerpt ? "PASS" : "FAIL"}: archetype=${hasArchetype}, domain=${hasDomain}, lens=${hasLensExcerpt}`);

    // ========================================
    // CRITERION 3: Click framework => detail page with description + article list
    // ========================================
    console.log("\n=== CRITERION 3: Framework detail page ===");
    const cardLink = await page.$("article a, a:has(article)");
    if (!cardLink) {
      // Try clicking the card itself which might be wrapped in a link
      const firstLink = await page.$('a[href*="/frameworks/"]');
      if (firstLink) await firstLink.click();
    } else {
      await cardLink.click();
    }
    await page.waitForTimeout(800);

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
    // CRITERION 4: Click article => distraction-free reading with proper typography
    // ========================================
    console.log("\n=== CRITERION 4: Article reading view ===");
    if (articleLinks.length > 0) {
      await articleLinks[0].click();
    }
    await page.waitForTimeout(800);

    const articleUrl = page.url();
    const isOnArticle = articleUrl.includes("/articles/");
    const articleH1 = await page.$("h1");
    const articleH1Text = articleH1 ? await articleH1.textContent() : "";
    const articleBody = await page.$(".article-body");
    const hasArticleBody = articleBody !== null;

    // Check article max-width
    const articleContainer = await page.$('.article-body, [class*="max-w-[680px]"]');
    let articleMaxWidth = "unknown";
    if (articleContainer) {
      articleMaxWidth = await articleContainer.evaluate((el) => getComputedStyle(el).maxWidth);
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
    // TYPOGRAPHY CHECKS (letter-spacing and vertical rhythm)
    // ========================================
    console.log("\n=== TYPOGRAPHY: letter-spacing and vertical rhythm ===");

    const paragraphs = await page.$$(".article-body p");
    if (paragraphs.length > 0) {
      const pStyles = await paragraphs[0].evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          letterSpacing: cs.letterSpacing,
          marginBottom: cs.marginBottom,
          fontSize: cs.fontSize,
          lineHeight: cs.lineHeight,
        };
      });
      results.typography.paragraph = pStyles;
      console.log(`  paragraph letter-spacing: ${pStyles.letterSpacing}`);
      console.log(`  paragraph margin-bottom: ${pStyles.marginBottom}`);
      console.log(`  paragraph font-size: ${pStyles.fontSize}`);
      console.log(`  paragraph line-height: ${pStyles.lineHeight}`);

      // Check letter-spacing is not "normal" (should be -0.01em or ~-0.18px)
      const hasLetterSpacing = pStyles.letterSpacing !== "normal" && pStyles.letterSpacing !== "0px";
      results.typography.letterSpacingApplied = hasLetterSpacing;
      console.log(`  letter-spacing applied: ${hasLetterSpacing ? "YES" : "NO"}`);

      // Check margin-bottom is > 0 (vertical rhythm)
      const mbPx = parseFloat(pStyles.marginBottom);
      const hasVerticalRhythm = mbPx > 10; // 1.5em at 18px = 27px
      results.typography.verticalRhythmApplied = hasVerticalRhythm;
      console.log(`  vertical rhythm (margin-bottom > 10px): ${hasVerticalRhythm ? "YES (${mbPx}px)" : "NO (${mbPx}px)"}`);
    }

    const headings = await page.$$(".article-body h2");
    if (headings.length > 0) {
      const h2Styles = await headings[0].evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          marginTop: cs.marginTop,
          marginBottom: cs.marginBottom,
        };
      });
      results.typography.heading = h2Styles;
      console.log(`  h2 margin-top: ${h2Styles.marginTop}`);
      console.log(`  h2 margin-bottom: ${h2Styles.marginBottom}`);
    }

    // ========================================
    // CRITERION 5: Dark/light mode toggle works and persists across navigation
    // ========================================
    console.log("\n=== CRITERION 5: Dark/light mode toggle + persistence ===");

    // Go back to homepage first
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Check initial state
    const htmlClassBefore = await page.$eval("html", (el) => el.className);
    console.log(`  initial html class: ${htmlClassBefore}`);

    // Click theme toggle
    const themeToggle = await page.$('button[aria-label*="mode"]');
    if (themeToggle) {
      await themeToggle.click();
      await page.waitForTimeout(600);
    }

    const htmlClassAfter = await page.$eval("html", (el) => el.className);
    const toggleWorked = htmlClassBefore !== htmlClassAfter;
    console.log(`  after toggle html class: ${htmlClassAfter}`);
    console.log(`  toggle changed class: ${toggleWorked}`);

    // Ensure we're in dark mode for dark mode tests
    const isDarkNow = htmlClassAfter.includes("dark");
    if (!isDarkNow) {
      // Toggle again to get to dark
      if (themeToggle) {
        await themeToggle.click();
        await page.waitForTimeout(600);
      }
    }
    const htmlClassDark = await page.$eval("html", (el) => el.className);
    const inDarkMode = htmlClassDark.includes("dark");
    console.log(`  confirmed dark mode: ${inDarkMode}`);

    // Navigate to framework detail to check persistence
    const fwLink = await page.$('a[href*="/frameworks/"]');
    if (fwLink) await fwLink.click();
    await page.waitForTimeout(800);

    const htmlClassAfterNav = await page.$eval("html", (el) => el.className);
    const persistedDark = htmlClassAfterNav.includes("dark");
    console.log(`  dark mode persisted after nav: ${persistedDark}`);

    results.criteria["5_dark_mode_toggle"] = {
      pass: toggleWorked && persistedDark,
      detail: `toggleWorked=${toggleWorked}, persisted=${persistedDark}`,
    };
    console.log(`  ${toggleWorked && persistedDark ? "PASS" : "FAIL"}`);

    // ========================================
    // DARK MODE CONTRAST VERIFICATION (The big one)
    // ========================================
    console.log("\n=== DARK MODE: Contrast verification ===");

    // Screenshot: homepage dark
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    // Re-ensure dark mode
    const htmlCheck = await page.$eval("html", (el) => el.className);
    if (!htmlCheck.includes("dark")) {
      const toggle = await page.$('button[aria-label*="mode"]');
      if (toggle) { await toggle.click(); await page.waitForTimeout(600); }
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-homepage-dark.png"), fullPage: true });
    results.screenshots.push("04-homepage-dark.png");

    // Check homepage H1 color vs background
    const h1Dark = await page.$("h1");
    if (h1Dark) {
      const h1Colors = await h1Dark.evaluate((el) => {
        const cs = getComputedStyle(el);
        // Walk up to find effective background
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
        return {
          color: cs.color,
          background: bg,
        };
      });

      const fgRgb = parseRgb(h1Colors.color);
      const bgRgb = parseRgb(h1Colors.background);
      let ratio = null;
      if (fgRgb && bgRgb) {
        ratio = contrastRatio(fgRgb, bgRgb);
      }
      results.darkMode.homepage_h1 = {
        color: h1Colors.color,
        background: h1Colors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  Homepage H1 dark: color=${h1Colors.color}, bg=${h1Colors.background}, contrast=${ratio ? ratio.toFixed(2) : "N/A"}, AA=${ratio >= 4.5}`);
    }

    // Check card text in dark mode
    const cardInDark = await page.$("article h3");
    if (cardInDark) {
      const cardColors = await cardInDark.evaluate((el) => {
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
      const fgRgb = parseRgb(cardColors.color);
      const bgRgb = parseRgb(cardColors.background);
      let ratio = null;
      if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
      results.darkMode.card_title = {
        color: cardColors.color,
        background: cardColors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  Card title dark: color=${cardColors.color}, bg=${cardColors.background}, contrast=${ratio ? ratio.toFixed(2) : "N/A"}`);
    }

    // Navigate to article in dark mode
    const fwLinkDark = await page.$('a[href*="/frameworks/"]');
    if (fwLinkDark) await fwLinkDark.click();
    await page.waitForTimeout(600);

    // Screenshot: framework detail dark
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-framework-detail-dark.png"), fullPage: true });
    results.screenshots.push("05-framework-detail-dark.png");

    const artLinkDark = await page.$('a[href*="/articles/"]');
    if (artLinkDark) await artLinkDark.click();
    await page.waitForTimeout(800);

    // Screenshot: article dark
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-article-dark.png"), fullPage: true });
    results.screenshots.push("06-article-dark.png");

    // Check article body text in dark mode
    const bodyPDark = await page.$(".article-body p");
    if (bodyPDark) {
      const bodyColors = await bodyPDark.evaluate((el) => {
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
      const fgRgb = parseRgb(bodyColors.color);
      const bgRgb = parseRgb(bodyColors.background);
      let ratio = null;
      if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
      results.darkMode.article_body = {
        color: bodyColors.color,
        background: bodyColors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  Article body dark: color=${bodyColors.color}, bg=${bodyColors.background}, contrast=${ratio ? ratio.toFixed(2) : "N/A"}, AA=${ratio >= 4.5}`);
    }

    // Check article H1 in dark mode
    const artH1Dark = await page.$("h1");
    if (artH1Dark) {
      const h1ArtColors = await artH1Dark.evaluate((el) => {
        const cs = getComputedStyle(el);
        let bg = getComputedStyle(document.body).backgroundColor;
        return { color: cs.color, background: bg };
      });
      const fgRgb = parseRgb(h1ArtColors.color);
      const bgRgb = parseRgb(h1ArtColors.background);
      let ratio = null;
      if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
      results.darkMode.article_h1 = {
        color: h1ArtColors.color,
        background: h1ArtColors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  Article H1 dark: color=${h1ArtColors.color}, bg=${h1ArtColors.background}, contrast=${ratio ? ratio.toFixed(2) : "N/A"}`);
    }

    // Check muted text contrast in dark mode
    const mutedDark = await page.$(".article-body .text-muted, nav .text-muted, [class*='text-muted']");
    if (mutedDark) {
      const mutedColors = await mutedDark.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, background: getComputedStyle(document.body).backgroundColor };
      });
      const fgRgb = parseRgb(mutedColors.color);
      const bgRgb = parseRgb(mutedColors.background);
      let ratio = null;
      if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
      results.darkMode.muted_text = {
        color: mutedColors.color,
        background: mutedColors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  Muted text dark: color=${mutedColors.color}, bg=${mutedColors.background}, contrast=${ratio ? ratio.toFixed(2) : "N/A"}`);
    }

    // Dark mode overall pass: all text elements must have >= 4.5:1 contrast
    const darkModePass = Object.values(results.darkMode).every(
      (item) => item.meetsAA === true
    );
    results.darkMode.overallPass = darkModePass;
    console.log(`\n  DARK MODE OVERALL: ${darkModePass ? "PASS (all text meets AA)" : "FAIL (some text below AA)"}`);

    // ========================================
    // CRITERION 6: Legal disclaimer in footer on every page
    // ========================================
    console.log("\n=== CRITERION 6: Legal disclaimer in footer ===");

    const pagesToCheck = [BASE, `${BASE}/frameworks/the-innovator`];
    let disclaimerOnAll = true;

    for (const url of pagesToCheck) {
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
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
    console.log(`  ${disclaimerOnAll ? "PASS" : "FAIL"}: disclaimer on all pages`);

    // ========================================
    // CRITERION 7: No console errors on npm run dev
    // ========================================
    console.log("\n=== CRITERION 7: Console errors ===");
    const consoleErrors = [];
    const page2 = await context.newPage();
    page2.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await page2.goto(BASE, { waitUntil: "networkidle" });
    await page2.waitForTimeout(500);
    await page2.goto(`${BASE}/frameworks/the-innovator`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(500);
    await page2.goto(`${BASE}/articles/why-the-ai-hardware-race-is-already-over`, { waitUntil: "networkidle" });
    await page2.waitForTimeout(500);
    await page2.close();

    // Filter out non-critical errors (React hydration warnings, favicon, etc.)
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("hydration") &&
        !e.includes("Hydration") &&
        !e.includes("404")
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
    // CRITERION 8: Mobile responsive: homepage at 375px
    // ========================================
    console.log("\n=== CRITERION 8: Mobile homepage (375px) ===");

    // Switch to light mode for mobile screenshots
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const htmlModeCheck = await page.$eval("html", (el) => el.className);
    if (htmlModeCheck.includes("dark")) {
      const toggle = await page.$('button[aria-label*="mode"]');
      if (toggle) { await toggle.click(); await page.waitForTimeout(600); }
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    // Check for horizontal overflow
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
    console.log(`  ${!overflowInfo.hasOverflow ? "PASS" : "FAIL"}: docWidth=${overflowInfo.documentWidth}, overflow=${overflowInfo.overflowAmount}px`);

    // Screenshot: homepage mobile light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-homepage-mobile-light.png"), fullPage: true });
    results.screenshots.push("07-homepage-mobile-light.png");

    // Mobile dark mode
    const toggleMobile = await page.$('button[aria-label*="mode"]');
    if (toggleMobile) { await toggleMobile.click(); await page.waitForTimeout(600); }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-homepage-mobile-dark.png"), fullPage: true });
    results.screenshots.push("08-homepage-mobile-dark.png");

    // Check mobile dark mode h1 contrast
    const mobileH1Dark = await page.$("h1");
    if (mobileH1Dark) {
      const mh1Colors = await mobileH1Dark.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, background: getComputedStyle(document.body).backgroundColor };
      });
      const fgRgb = parseRgb(mh1Colors.color);
      const bgRgb = parseRgb(mh1Colors.background);
      let ratio = null;
      if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
      results.darkMode.mobile_h1 = {
        color: mh1Colors.color,
        background: mh1Colors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  Mobile H1 dark: color=${mh1Colors.color}, bg=${mh1Colors.background}, contrast=${ratio ? ratio.toFixed(2) : "N/A"}`);
    }

    // ========================================
    // CRITERION 9: Mobile responsive: article view at 375px
    // ========================================
    console.log("\n=== CRITERION 9: Mobile article (375px) ===");

    // Switch back to light mode
    const toggleBack = await page.$('button[aria-label*="mode"]');
    if (toggleBack) { await toggleBack.click(); await page.waitForTimeout(400); }

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
    console.log(`  ${!articleOverflow.hasOverflow ? "PASS" : "FAIL"}: docWidth=${articleOverflow.documentWidth}, overflow=${articleOverflow.overflowAmount}px`);

    // Screenshot: article mobile light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-article-mobile-light.png"), fullPage: true });
    results.screenshots.push("09-article-mobile-light.png");

    // Article mobile dark
    const artToggle = await page.$('button[aria-label*="mode"]');
    if (artToggle) { await artToggle.click(); await page.waitForTimeout(600); }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-article-mobile-dark.png"), fullPage: true });
    results.screenshots.push("10-article-mobile-dark.png");

    // Check article body text in dark mobile
    const mobileBodyP = await page.$(".article-body p");
    if (mobileBodyP) {
      const mbColors = await mobileBodyP.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, background: getComputedStyle(document.body).backgroundColor };
      });
      const fgRgb = parseRgb(mbColors.color);
      const bgRgb = parseRgb(mbColors.background);
      let ratio = null;
      if (fgRgb && bgRgb) ratio = contrastRatio(fgRgb, bgRgb);
      results.darkMode.mobile_article_body = {
        color: mbColors.color,
        background: mbColors.background,
        contrastRatio: ratio ? ratio.toFixed(2) : "N/A",
        meetsAA: ratio ? ratio >= 4.5 : false,
      };
      console.log(`  Mobile article body dark: color=${mbColors.color}, bg=${mbColors.background}, contrast=${ratio ? ratio.toFixed(2) : "N/A"}`);
    }

    // ========================================
    // Additional: Desktop dark mode screenshots at full size
    // ========================================
    await page.setViewportSize({ width: 1280, height: 900 });

    // Switch back to light mode for clean state
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const finalCheck = await page.$eval("html", (el) => el.className);
    if (finalCheck.includes("dark")) {
      const t = await page.$('button[aria-label*="mode"]');
      if (t) { await t.click(); await page.waitForTimeout(400); }
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log("\n========================================");
    console.log("SUMMARY");
    console.log("========================================\n");

    const allCriteria = Object.entries(results.criteria);
    let passCount = 0;
    for (const [key, val] of allCriteria) {
      const status = val.pass ? "PASS" : "FAIL";
      if (val.pass) passCount++;
      console.log(`  ${status}  ${key}: ${val.detail}`);
    }
    console.log(`\n  Criteria passed: ${passCount}/${allCriteria.length}`);

    console.log("\n  Dark Mode Contrast Results:");
    for (const [key, val] of Object.entries(results.darkMode)) {
      if (key === "overallPass") continue;
      if (typeof val === "object" && val.contrastRatio) {
        console.log(`    ${val.meetsAA ? "PASS" : "FAIL"} ${key}: ${val.contrastRatio}:1 (color=${val.color}, bg=${val.background})`);
      }
    }
    console.log(`  Dark mode overall: ${results.darkMode.overallPass ? "ALL PASS" : "SOME FAIL"}`);

    console.log("\n  Typography:");
    console.log(`    letter-spacing applied: ${results.typography.letterSpacingApplied ? "YES" : "NO"}`);
    console.log(`    vertical rhythm applied: ${results.typography.verticalRhythmApplied ? "YES" : "NO"}`);

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
