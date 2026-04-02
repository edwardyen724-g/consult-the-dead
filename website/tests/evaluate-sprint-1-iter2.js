const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots", "iter2");
const BASE_URL = "http://localhost:3000";

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const results = {
  criteria: {},
  newFeatures: {},
  consoleErrors: [],
  screenshots: [],
  details: {},
};

function screenshot(page, name) {
  const filePath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  results.screenshots.push({ name, path: filePath });
  return page.screenshot({ path: filePath, fullPage: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // ============================================================
  // DESKTOP TESTS (1280px) - LIGHT MODE
  // ============================================================
  console.log("\n=== DESKTOP VIEWPORT (1280x800) - LIGHT MODE ===\n");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
  });
  const desktopPage = await desktopContext.newPage();

  const consoleErrors = [];
  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  desktopPage.on("pageerror", (err) => consoleErrors.push(err.message));

  // ---- CRITERION 1: Homepage renders framework gallery ----
  console.log("C1: Homepage renders framework gallery...");
  try {
    await desktopPage.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    await desktopPage.waitForTimeout(1000); // wait for framer-motion animations
    await screenshot(desktopPage, "01-homepage-desktop-light");

    const h1 = await desktopPage.textContent("h1");
    const cards = await desktopPage.$$("article");
    results.criteria["C1_homepage_gallery"] = cards.length >= 1;
    console.log(`  Title: "${h1}", Frameworks: ${cards.length} => ${cards.length >= 1 ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C1_homepage_gallery"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 2: Card shows archetype, domain, lens ----
  console.log("C2: Framework card content...");
  try {
    const card = await desktopPage.$("article");
    const name = await card.$eval("h3", (el) => el.textContent.trim());
    const blockquote = await card.$("blockquote");
    const lens = blockquote ? await blockquote.textContent() : null;
    const domainSpan = await card.$eval("span", (el) => el.textContent.trim());
    results.criteria["C2_card_info"] = !!name && !!lens && !!domainSpan;
    console.log(`  Name: "${name}", Lens: ${!!lens}, Domain: "${domainSpan}" => ${results.criteria["C2_card_info"] ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C2_card_info"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 3: Click framework => detail page ----
  console.log("C3: Framework click navigation...");
  try {
    const link = await desktopPage.$('a[href^="/frameworks/"]');
    await link.click();
    await desktopPage.waitForURL("**/frameworks/**", { timeout: 10000 });
    await desktopPage.waitForLoadState("networkidle");
    await desktopPage.waitForTimeout(800);
    await screenshot(desktopPage, "02-framework-detail-light");

    const url = desktopPage.url();
    const hasDesc = await desktopPage.$("header p");
    const articles = await desktopPage.$$('a[href^="/articles/"]');
    results.criteria["C3_framework_detail"] = url.includes("/frameworks/") && !!hasDesc;
    console.log(`  URL: ${url}, Desc: ${!!hasDesc}, Articles: ${articles.length} => ${results.criteria["C3_framework_detail"] ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C3_framework_detail"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 4: Article reading view ----
  console.log("C4: Article reading view...");
  try {
    const artLink = await desktopPage.$('a[href^="/articles/"]');
    await artLink.click();
    await desktopPage.waitForURL("**/articles/**", { timeout: 10000 });
    await desktopPage.waitForLoadState("networkidle");
    await desktopPage.waitForTimeout(800);
    await screenshot(desktopPage, "03-article-reading-light");

    const articleEl = await desktopPage.$("article");
    const h1 = await desktopPage.$("article h1");
    const paragraphs = await desktopPage.$$("article p");
    const narrowContainer = await desktopPage.$('[class*="max-w-"]');
    results.criteria["C4_article_reading"] = !!articleEl && paragraphs.length > 0;
    console.log(`  Article: ${!!articleEl}, Paragraphs: ${paragraphs.length}, Narrow: ${!!narrowContainer} => ${results.criteria["C4_article_reading"] ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C4_article_reading"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 5: Theme toggle + persistence ----
  console.log("C5: Theme toggle...");
  try {
    await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(500);
    const initial = await desktopPage.evaluate(() => document.documentElement.classList.contains("dark") ? "dark" : "light");
    const btn = await desktopPage.$('button[aria-label*="Switch to"]');
    await btn.click();
    await desktopPage.waitForTimeout(500);
    const after = await desktopPage.evaluate(() => document.documentElement.classList.contains("dark") ? "dark" : "light");
    await screenshot(desktopPage, "04-theme-toggled");

    await desktopPage.goto(BASE_URL + "/frameworks/the-innovator", { waitUntil: "networkidle" });
    await desktopPage.waitForTimeout(500);
    const persisted = await desktopPage.evaluate(() => document.documentElement.classList.contains("dark") ? "dark" : "light");
    results.criteria["C5_theme_toggle"] = initial !== after && after === persisted;
    console.log(`  Initial: ${initial}, After: ${after}, Persisted: ${persisted} => ${results.criteria["C5_theme_toggle"] ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C5_theme_toggle"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 6: Legal disclaimer in footer ----
  console.log("C6: Legal disclaimer...");
  try {
    await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" });
    const footerText = await desktopPage.$eval("footer", (el) => el.textContent);
    const hasDisclaimer = footerText.includes("Not affiliated") || footerText.includes("analytical models");

    await desktopPage.goto(BASE_URL + "/frameworks/the-innovator", { waitUntil: "networkidle" });
    const fwFooter = await desktopPage.$eval("footer", (el) => el.textContent);
    const hasFw = fwFooter.includes("Not affiliated") || fwFooter.includes("analytical models");

    await desktopPage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", { waitUntil: "networkidle" });
    const artFooter = await desktopPage.$eval("footer", (el) => el.textContent);
    const hasArt = artFooter.includes("Not affiliated") || artFooter.includes("analytical models");

    results.criteria["C6_legal_disclaimer"] = hasDisclaimer && hasFw && hasArt;
    console.log(`  Home: ${hasDisclaimer}, Framework: ${hasFw}, Article: ${hasArt} => ${results.criteria["C6_legal_disclaimer"] ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C6_legal_disclaimer"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 7: No console errors ----
  console.log("C7: Console errors...");
  const significant = consoleErrors.filter(
    (e) => !e.includes("Download the React DevTools") && !e.includes("Third-party cookie") && !e.includes("favicon")
  );
  results.criteria["C7_no_console_errors"] = significant.length === 0;
  results.consoleErrors = significant;
  console.log(`  Errors: ${significant.length} => ${significant.length === 0 ? "PASS" : "FAIL"}`);
  significant.forEach((e) => console.log(`    - ${e}`));

  await desktopContext.close();

  // ============================================================
  // MOBILE TESTS (375px)
  // ============================================================
  console.log("\n=== MOBILE VIEWPORT (375x812) ===\n");
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: "light" });
  const mobilePage = await mobileCtx.newPage();

  // ---- CRITERION 8: Mobile homepage ----
  console.log("C8: Mobile homepage...");
  try {
    await mobilePage.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    await mobilePage.waitForTimeout(800);
    await screenshot(mobilePage, "05-homepage-mobile-light");
    const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    const h1Vis = await mobilePage.$eval("h1", (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    results.criteria["C8_mobile_homepage"] = !overflow && h1Vis;
    console.log(`  Overflow: ${overflow}, H1 visible: ${h1Vis} => ${results.criteria["C8_mobile_homepage"] ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C8_mobile_homepage"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 9: Mobile article ----
  console.log("C9: Mobile article...");
  try {
    await mobilePage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", { waitUntil: "networkidle" });
    await mobilePage.waitForTimeout(800);
    await screenshot(mobilePage, "06-article-mobile-light");
    const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    results.criteria["C9_mobile_article"] = !overflow;
    console.log(`  Overflow: ${overflow} => ${results.criteria["C9_mobile_article"] ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["C9_mobile_article"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  await mobileCtx.close();

  // ============================================================
  // DARK MODE DEEP INSPECTION
  // ============================================================
  console.log("\n=== DARK MODE CONTRAST INSPECTION ===\n");
  const darkCtx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" });
  const darkPage = await darkCtx.newPage();

  try {
    // Toggle to dark mode
    await darkPage.goto(BASE_URL, { waitUntil: "networkidle" });
    await darkPage.waitForTimeout(500);
    const btn = await darkPage.$('button[aria-label*="Switch to"]');
    if (btn) await btn.click();
    await darkPage.waitForTimeout(500);
    await screenshot(darkPage, "07-homepage-dark");

    // Inspect dark mode text contrast on homepage
    const darkHomeContrast = await darkPage.evaluate(() => {
      const h1 = document.querySelector("h1");
      const p = document.querySelector("section p");
      const body = document.body;
      return {
        bodyBg: window.getComputedStyle(body).backgroundColor,
        bodyColor: window.getComputedStyle(body).color,
        h1Color: h1 ? window.getComputedStyle(h1).color : null,
        pColor: p ? window.getComputedStyle(p).color : null,
      };
    });
    results.details["dark_home_contrast"] = darkHomeContrast;
    console.log("  Homepage dark mode:");
    console.log(`    Body BG: ${darkHomeContrast.bodyBg}`);
    console.log(`    Body color: ${darkHomeContrast.bodyColor}`);
    console.log(`    H1 color: ${darkHomeContrast.h1Color}`);
    console.log(`    P color: ${darkHomeContrast.pColor}`);

    // Navigate to article in dark mode
    await darkPage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", { waitUntil: "networkidle" });
    await darkPage.waitForTimeout(800);
    await screenshot(darkPage, "08-article-dark");

    const darkArticleContrast = await darkPage.evaluate(() => {
      const bodyPs = Array.from(document.querySelectorAll("article p")).filter(
        (p) => !p.closest("header") && !p.closest("nav")
      );
      const firstBody = bodyPs[0];
      const h1 = document.querySelector("article h1");
      return {
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
        h1Color: h1 ? window.getComputedStyle(h1).color : null,
        bodyPColor: firstBody ? window.getComputedStyle(firstBody).color : null,
        bodyPOpacity: firstBody ? window.getComputedStyle(firstBody).opacity : null,
        bodyPClass: firstBody ? firstBody.className : null,
      };
    });
    results.details["dark_article_contrast"] = darkArticleContrast;
    console.log("  Article dark mode:");
    console.log(`    Body BG: ${darkArticleContrast.bodyBg}`);
    console.log(`    H1 color: ${darkArticleContrast.h1Color}`);
    console.log(`    Body P color: ${darkArticleContrast.bodyPColor}`);
    console.log(`    Body P opacity: ${darkArticleContrast.bodyPOpacity}`);
    console.log(`    Body P class: ${darkArticleContrast.bodyPClass}`);

    // Check if /90 opacity is still used (the iter1 critique)
    const hasOpacity90 = darkArticleContrast.bodyPClass && darkArticleContrast.bodyPClass.includes("/90");
    results.newFeatures["dark_mode_no_opacity90"] = !hasOpacity90;
    console.log(`  Uses /90 opacity on body text: ${hasOpacity90 ? "YES (BAD)" : "NO (GOOD)"}`);

    // Framework detail page dark mode
    await darkPage.goto(BASE_URL + "/frameworks/the-innovator", { waitUntil: "networkidle" });
    await darkPage.waitForTimeout(800);
    await screenshot(darkPage, "09-framework-detail-dark");

    // Mobile dark mode
    await darkCtx.close();
    const darkMobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: "light" });
    const darkMobile = await darkMobileCtx.newPage();
    await darkMobile.goto(BASE_URL, { waitUntil: "networkidle" });
    await darkMobile.waitForTimeout(500);
    const mBtn = await darkMobile.$('button[aria-label*="Switch to"]');
    if (mBtn) await mBtn.click();
    await darkMobile.waitForTimeout(500);
    await screenshot(darkMobile, "10-homepage-mobile-dark");

    await darkMobile.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", { waitUntil: "networkidle" });
    await darkMobile.waitForTimeout(800);
    await screenshot(darkMobile, "11-article-mobile-dark");

    await darkMobileCtx.close();
  } catch (e) {
    console.log(`  Dark mode inspection error: ${e.message}`);
  }

  // ============================================================
  // NEW FEATURE INSPECTION (Iteration 2 additions)
  // ============================================================
  console.log("\n=== ITERATION 2 NEW FEATURES ===\n");
  const featureCtx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: "light" });
  const featurePage = await featureCtx.newPage();

  // -- Gm Monogram --
  console.log("Feature: Gm Monogram...");
  try {
    await featurePage.goto(BASE_URL, { waitUntil: "networkidle" });
    await featurePage.waitForTimeout(800);

    const monogram = await featurePage.evaluate(() => {
      const spans = Array.from(document.querySelectorAll("header span"));
      const gmSpan = spans.find((s) => s.textContent.trim() === "Gm");
      if (!gmSpan) return { found: false };
      // Check for diamond (rotated container)
      const parent = gmSpan.closest("span.relative");
      const diamond = parent ? parent.querySelector('[class*="rotate-45"]') : null;
      return {
        found: true,
        hasDiamond: !!diamond,
        fontSize: window.getComputedStyle(gmSpan).fontSize,
        fontWeight: window.getComputedStyle(gmSpan).fontWeight,
      };
    });
    results.newFeatures["monogram_renders"] = monogram.found;
    results.newFeatures["monogram_has_diamond"] = monogram.hasDiamond;
    results.details["monogram"] = monogram;
    console.log(`  Found: ${monogram.found}, Diamond: ${monogram.hasDiamond}`);
    console.log(`  Size: ${monogram.fontSize}, Weight: ${monogram.fontWeight}`);
  } catch (e) {
    results.newFeatures["monogram_renders"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Weighted Wordmark --
  console.log("Feature: Weighted wordmark...");
  try {
    const wordmark = await featurePage.evaluate(() => {
      const header = document.querySelector("header");
      const greatSpan = header?.querySelector("span.font-semibold");
      const mindsSpan = header?.querySelector("span.font-light");
      return {
        hasGreat: !!greatSpan && greatSpan.textContent.includes("Great"),
        hasMinds: !!mindsSpan && mindsSpan.textContent.includes("Minds"),
        greatWeight: greatSpan ? window.getComputedStyle(greatSpan).fontWeight : null,
        mindsWeight: mindsSpan ? window.getComputedStyle(mindsSpan).fontWeight : null,
      };
    });
    results.newFeatures["weighted_wordmark"] = wordmark.hasGreat && wordmark.hasMinds;
    results.details["wordmark"] = wordmark;
    console.log(`  Great (semibold): ${wordmark.hasGreat} (${wordmark.greatWeight})`);
    console.log(`  Minds (light): ${wordmark.hasMinds} (${wordmark.mindsWeight})`);
  } catch (e) {
    results.newFeatures["weighted_wordmark"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- 4px accent border on cards --
  console.log("Feature: Card accent borders...");
  try {
    const cardBorder = await featurePage.evaluate(() => {
      const card = document.querySelector("article");
      if (!card) return { found: false };
      const style = window.getComputedStyle(card);
      return {
        found: true,
        borderLeftWidth: style.borderLeftWidth,
        borderLeftColor: style.borderLeftColor,
        borderLeftStyle: style.borderLeftStyle,
      };
    });
    results.newFeatures["card_accent_border"] = cardBorder.found && parseInt(cardBorder.borderLeftWidth) >= 3;
    results.details["card_border"] = cardBorder;
    console.log(`  Left border: ${cardBorder.borderLeftWidth} ${cardBorder.borderLeftColor}`);
  } catch (e) {
    results.newFeatures["card_accent_border"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Reading Progress Bar --
  console.log("Feature: Reading progress bar...");
  try {
    await featurePage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", { waitUntil: "networkidle" });
    await featurePage.waitForTimeout(500);

    const progressBar = await featurePage.evaluate(() => {
      const bar = document.querySelector(".reading-progress");
      if (!bar) return { found: false };
      const style = window.getComputedStyle(bar);
      return {
        found: true,
        position: style.position,
        top: style.top,
        height: style.height,
        zIndex: style.zIndex,
      };
    });
    results.newFeatures["progress_bar"] = progressBar.found;
    results.details["progress_bar"] = progressBar;
    console.log(`  Found: ${progressBar.found}, Position: ${progressBar.position}, Height: ${progressBar.height}`);

    // Scroll to test progress
    await featurePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await featurePage.waitForTimeout(300);
    const barAfterScroll = await featurePage.evaluate(() => {
      const bar = document.querySelector(".reading-progress");
      return bar ? { width: bar.style.width, opacity: bar.style.opacity } : null;
    });
    console.log(`  After scroll: width=${barAfterScroll?.width}, opacity=${barAfterScroll?.opacity}`);
  } catch (e) {
    results.newFeatures["progress_bar"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Construct Accordion (framer-motion) --
  console.log("Feature: Construct accordion animation...");
  try {
    await featurePage.goto(BASE_URL + "/frameworks/the-innovator", { waitUntil: "networkidle" });
    await featurePage.waitForTimeout(800);

    const constructs = await featurePage.$$("button");
    const constructButtons = [];
    for (const btn of constructs) {
      const text = await btn.textContent();
      if (text.includes("vs.")) constructButtons.push(btn);
    }

    results.newFeatures["constructs_found"] = constructButtons.length > 0;
    console.log(`  Construct buttons: ${constructButtons.length}`);

    if (constructButtons.length > 0) {
      // Click first construct
      await constructButtons[0].click();
      await featurePage.waitForTimeout(500);
      await screenshot(featurePage, "12-construct-accordion-open");

      // Check for framer-motion animated content
      const hasAnimatedContent = await featurePage.evaluate(() => {
        // Look for expanded content with "Emergent pole" or "Implicit pole"
        const emergent = Array.from(document.querySelectorAll("span")).find(
          (s) => s.textContent.includes("Emergent pole")
        );
        return !!emergent;
      });
      results.newFeatures["construct_accordion_works"] = hasAnimatedContent;
      console.log(`  Accordion expanded with content: ${hasAnimatedContent}`);

      // Check for SVG chevron (not raw + character)
      const hasChevronSVG = await featurePage.evaluate(() => {
        const svgs = document.querySelectorAll("button svg");
        return svgs.length > 0;
      });
      results.newFeatures["chevron_svg"] = hasChevronSVG;
      console.log(`  SVG chevron (not +): ${hasChevronSVG}`);
    }
  } catch (e) {
    results.newFeatures["construct_accordion_works"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Perceptual Lens Spotlight/Shadow metaphor --
  console.log("Feature: Perceptual lens spotlight/shadow...");
  try {
    const lensMetaphor = await featurePage.evaluate(() => {
      const spotlightLabel = Array.from(document.querySelectorAll("h3")).find(
        (h) => h.textContent.includes("sharp focus") || h.textContent.includes("In sharp focus")
      );
      const shadowLabel = Array.from(document.querySelectorAll("h3")).find(
        (h) => h.textContent.includes("periphery") || h.textContent.includes("In the periphery")
      );
      // Check for spotlight vs shadow visual differentiation
      const gridSection = document.querySelector('[class*="grid"]');
      return {
        hasSpotlight: !!spotlightLabel,
        hasShadow: !!shadowLabel,
        hasGrid: !!gridSection,
        spotlightText: spotlightLabel?.textContent,
        shadowText: shadowLabel?.textContent,
      };
    });
    results.newFeatures["lens_spotlight_shadow"] = lensMetaphor.hasSpotlight && lensMetaphor.hasShadow;
    results.details["lens_metaphor"] = lensMetaphor;
    console.log(`  Spotlight: ${lensMetaphor.hasSpotlight} ("${lensMetaphor.spotlightText}")`);
    console.log(`  Shadow: ${lensMetaphor.hasShadow} ("${lensMetaphor.shadowText}")`);
    console.log(`  Grid layout: ${lensMetaphor.hasGrid}`);
  } catch (e) {
    results.newFeatures["lens_spotlight_shadow"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Staggered entrance animations (framer-motion) --
  console.log("Feature: Framer-motion page transitions...");
  try {
    await featurePage.goto(BASE_URL, { waitUntil: "networkidle" });
    // Check if framer-motion is rendering (elements have style attributes from motion)
    const hasMotion = await featurePage.evaluate(() => {
      const motionDivs = document.querySelectorAll('[style*="opacity"]');
      return motionDivs.length > 0;
    });
    results.newFeatures["framer_motion_active"] = hasMotion;
    console.log(`  Motion-styled elements found: ${hasMotion}`);
  } catch (e) {
    results.newFeatures["framer_motion_active"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Card hover effect (lift + glow) --
  console.log("Feature: Card hover classes...");
  try {
    const hoverClasses = await featurePage.evaluate(() => {
      const card = document.querySelector("article");
      if (!card) return { found: false };
      const cls = card.className;
      return {
        found: true,
        hasHoverShadow: cls.includes("hover:shadow"),
        hasHoverTranslate: cls.includes("hover:-translate"),
        hasTransition: cls.includes("transition"),
        className: cls,
      };
    });
    results.newFeatures["card_hover_lift_glow"] = hoverClasses.hasHoverShadow && hoverClasses.hasHoverTranslate;
    results.details["card_hover"] = hoverClasses;
    console.log(`  Hover shadow: ${hoverClasses.hasHoverShadow}, Translate: ${hoverClasses.hasHoverTranslate}`);
  } catch (e) {
    results.newFeatures["card_hover_lift_glow"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Typography: letter-spacing --
  console.log("Feature: Typography craft...");
  try {
    await featurePage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", { waitUntil: "networkidle" });
    await featurePage.waitForTimeout(500);

    const typo = await featurePage.evaluate(() => {
      const bodyPs = Array.from(document.querySelectorAll(".article-body p"));
      const p = bodyPs[0];
      if (!p) return null;
      const style = window.getComputedStyle(p);
      return {
        letterSpacing: style.letterSpacing,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        fontFamily: style.fontFamily.substring(0, 60),
        marginBottom: style.marginBottom,
      };
    });
    results.details["article_typography"] = typo;
    console.log(`  Letter-spacing: ${typo?.letterSpacing}`);
    console.log(`  Font-size: ${typo?.fontSize}`);
    console.log(`  Line-height: ${typo?.lineHeight}`);
    console.log(`  Margin-bottom: ${typo?.marginBottom}`);

    // Check vertical rhythm (h2 vs p spacing)
    const rhythm = await featurePage.evaluate(() => {
      const h2 = document.querySelector(".article-body h2");
      const p = document.querySelector(".article-body p");
      return {
        h2MarginTop: h2 ? window.getComputedStyle(h2).marginTop : null,
        h2MarginBottom: h2 ? window.getComputedStyle(h2).marginBottom : null,
        pMarginBottom: p ? window.getComputedStyle(p).marginBottom : null,
      };
    });
    results.details["vertical_rhythm"] = rhythm;
    const hasDistinctRhythm = rhythm.h2MarginTop !== rhythm.pMarginBottom;
    results.newFeatures["distinct_vertical_rhythm"] = hasDistinctRhythm;
    console.log(`  H2 margin-top: ${rhythm.h2MarginTop}, H2 margin-bottom: ${rhythm.h2MarginBottom}`);
    console.log(`  P margin-bottom: ${rhythm.pMarginBottom}`);
    console.log(`  Distinct rhythm: ${hasDistinctRhythm}`);
  } catch (e) {
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Footer design --
  console.log("Feature: Footer design...");
  try {
    const footer = await featurePage.evaluate(() => {
      const f = document.querySelector("footer");
      if (!f) return { found: false };
      const hr = f.querySelector('[class*="border-t"]');
      const brand = f.querySelector('[class*="font-serif"]');
      const tagline = Array.from(f.querySelectorAll("span")).find(
        (s) => s.textContent.includes("Library")
      );
      return {
        found: true,
        hasHR: !!hr,
        hasBrand: !!brand,
        hasTagline: !!tagline,
        brandText: brand?.textContent,
      };
    });
    results.details["footer_design"] = footer;
    console.log(`  HR: ${footer.hasHR}, Brand: ${footer.hasBrand}, Tagline: ${footer.hasTagline}`);
    console.log(`  Brand text: "${footer.brandText}"`);
  } catch (e) {
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Radial accent glow on cards --
  console.log("Feature: Radial accent glow...");
  try {
    await featurePage.goto(BASE_URL, { waitUntil: "networkidle" });
    await featurePage.waitForTimeout(500);
    const glow = await featurePage.evaluate(() => {
      const card = document.querySelector("article");
      if (!card) return { found: false };
      const glowDiv = card.querySelector('[class*="radial"]') ||
        card.querySelector('[style*="radial-gradient"]');
      return { found: !!glowDiv };
    });
    results.newFeatures["radial_glow"] = glow.found;
    console.log(`  Radial glow element: ${glow.found}`);
  } catch (e) {
    results.newFeatures["radial_glow"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  // -- Theme toggle labels visible --
  console.log("Feature: Theme toggle labels...");
  try {
    const labels = await featurePage.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="Switch to"]');
      if (!btn) return { found: false };
      const labelSpan = btn.querySelector("span");
      return {
        found: true,
        text: labelSpan?.textContent,
        visible: labelSpan ? window.getComputedStyle(labelSpan).display !== "none" : false,
      };
    });
    results.newFeatures["theme_label_visible"] = labels.visible;
    results.details["theme_labels"] = labels;
    console.log(`  Label: "${labels.text}", Visible: ${labels.visible}`);
  } catch (e) {
    results.newFeatures["theme_label_visible"] = false;
    console.log(`  FAIL: ${e.message}`);
  }

  await featureCtx.close();
  await browser.close();

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n=== SPRINT 1 - ITERATION 2 EVALUATION SUMMARY ===\n");

  const criteriaMap = {
    C1_homepage_gallery: "Homepage renders framework gallery with >= 1 framework",
    C2_card_info: "Card shows archetype name, domain, perceptual lens",
    C3_framework_detail: "Click framework => detail page with description + articles",
    C4_article_reading: "Click article => distraction-free reading view",
    C5_theme_toggle: "Dark/light toggle works and persists across navigation",
    C6_legal_disclaimer: "Legal disclaimer visible in footer on every page",
    C7_no_console_errors: "No console errors on npm run dev",
    C8_mobile_homepage: "Mobile responsive: homepage at 375px",
    C9_mobile_article: "Mobile responsive: article view at 375px",
  };

  let passed = 0;
  for (const [key, label] of Object.entries(criteriaMap)) {
    const ok = results.criteria[key] ? "PASS" : "FAIL";
    if (results.criteria[key]) passed++;
    console.log(`  [${ok}] ${label}`);
  }
  console.log(`\n  Criteria: ${passed}/${Object.keys(criteriaMap).length}\n`);

  console.log("  New Feature Checks:");
  for (const [key, val] of Object.entries(results.newFeatures)) {
    console.log(`    [${val ? "OK" : "MISSING"}] ${key}`);
  }

  console.log(`\n  Console errors captured: ${results.consoleErrors.length}`);
  console.log(`  Screenshots taken: ${results.screenshots.length}\n`);

  const outputPath = path.join(__dirname, "sprint1-iter2-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`  Results written to: ${outputPath}`);
}

run().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
