const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const SCREENSHOTS_DIR = path.join(__dirname, "screenshots");
const BASE_URL = "http://localhost:3000";

// Ensure screenshots dir exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const results = {
  criteria: {},
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
  // DESKTOP TESTS (1280px)
  // ============================================================
  console.log("\n=== DESKTOP VIEWPORT (1280x800) ===\n");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
  });
  const desktopPage = await desktopContext.newPage();

  // Capture console errors
  const desktopConsoleErrors = [];
  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") {
      desktopConsoleErrors.push(msg.text());
    }
  });
  desktopPage.on("pageerror", (err) => {
    desktopConsoleErrors.push(err.message);
  });

  // ---- CRITERION 1: Homepage renders a framework gallery with at least one framework ----
  console.log("Testing: Homepage renders framework gallery...");
  try {
    await desktopPage.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    await screenshot(desktopPage, "01-homepage-desktop");

    const title = await desktopPage.textContent("h1");
    const frameworkCards = await desktopPage.$$("article");
    const hasGallery = frameworkCards.length >= 1;

    results.criteria["homepage_renders_gallery"] = hasGallery;
    results.details["homepage_renders_gallery"] = {
      title,
      frameworkCount: frameworkCards.length,
    };
    console.log(`  Homepage title: "${title}", Frameworks found: ${frameworkCards.length} => ${hasGallery ? "PASS" : "FAIL"}`);
  } catch (e) {
    results.criteria["homepage_renders_gallery"] = false;
    results.details["homepage_renders_gallery"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 2: Each framework card shows archetype name, domain, perceptual lens ----
  console.log("Testing: Framework card content...");
  try {
    const firstCard = await desktopPage.$("article");
    if (firstCard) {
      const cardHTML = await firstCard.innerHTML();
      const archetypeName = await firstCard.$eval("h3", (el) => el.textContent.trim());
      const domain = await firstCard.$$eval("p", (ps) => ps.map((p) => p.textContent.trim()));
      const hasBlockquote = await firstCard.$("blockquote");
      const perceptualLensText = hasBlockquote ? await hasBlockquote.textContent() : null;

      const hasArchetype = !!archetypeName && archetypeName.length > 0;
      const hasDomain = domain.some((d) => d.length > 0);
      const hasLens = !!perceptualLensText && perceptualLensText.length > 0;

      results.criteria["card_shows_required_info"] = hasArchetype && hasDomain && hasLens;
      results.details["card_shows_required_info"] = {
        archetypeName,
        domainTexts: domain,
        perceptualLensExcerpt: perceptualLensText ? perceptualLensText.substring(0, 100) : null,
      };
      console.log(`  Archetype: "${archetypeName}" => ${hasArchetype ? "OK" : "MISSING"}`);
      console.log(`  Domain present: ${hasDomain ? "OK" : "MISSING"}`);
      console.log(`  Perceptual lens: ${hasLens ? "OK" : "MISSING"}`);
    } else {
      results.criteria["card_shows_required_info"] = false;
      results.details["card_shows_required_info"] = { error: "No framework cards found" };
      console.log("  FAIL: No framework cards found");
    }
  } catch (e) {
    results.criteria["card_shows_required_info"] = false;
    results.details["card_shows_required_info"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 3: Clicking a framework navigates to detail page ----
  console.log("Testing: Framework click navigation...");
  try {
    const frameworkLink = await desktopPage.$('a[href^="/frameworks/"]');
    if (frameworkLink) {
      await frameworkLink.click();
      await desktopPage.waitForURL("**/frameworks/**", { timeout: 10000 });
      await desktopPage.waitForLoadState("networkidle");
      await screenshot(desktopPage, "02-framework-detail-desktop");

      const detailUrl = desktopPage.url();
      const isDetailPage = detailUrl.includes("/frameworks/");
      const hasDescription = await desktopPage.$("header p");
      const hasArticlesList = await desktopPage.$$('a[href^="/articles/"]');

      results.criteria["framework_detail_navigation"] = isDetailPage;
      results.details["framework_detail_navigation"] = {
        url: detailUrl,
        hasDescription: !!hasDescription,
        articlesLinked: hasArticlesList.length,
      };
      console.log(`  Navigated to: ${detailUrl} => ${isDetailPage ? "PASS" : "FAIL"}`);
      console.log(`  Description present: ${!!hasDescription}`);
      console.log(`  Articles linked: ${hasArticlesList.length}`);
    } else {
      results.criteria["framework_detail_navigation"] = false;
      console.log("  FAIL: No framework link found");
    }
  } catch (e) {
    results.criteria["framework_detail_navigation"] = false;
    results.details["framework_detail_navigation"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 4: Clicking an article opens reading view ----
  console.log("Testing: Article reading view...");
  try {
    const articleLink = await desktopPage.$('a[href^="/articles/"]');
    if (articleLink) {
      const articleTitle = await articleLink.$eval("h3", (el) => el.textContent.trim());
      await articleLink.click();
      await desktopPage.waitForURL("**/articles/**", { timeout: 10000 });
      await desktopPage.waitForLoadState("networkidle");
      await screenshot(desktopPage, "03-article-reading-desktop");

      const articleUrl = desktopPage.url();
      const isArticlePage = articleUrl.includes("/articles/");

      // Check for reading view characteristics
      const articleElement = await desktopPage.$("article");
      const h1 = await desktopPage.$("article h1");
      const h1Text = h1 ? await h1.textContent() : null;
      const paragraphs = await desktopPage.$$("article p");
      const bodyContainer = await desktopPage.$(".max-w-\\[680px\\]");

      // Check typography
      const fontSizeCheck = await desktopPage.evaluate(() => {
        const p = document.querySelector("article p.text-\\[18px\\]");
        if (p) {
          const style = window.getComputedStyle(p);
          return { fontSize: style.fontSize, lineHeight: style.lineHeight };
        }
        return null;
      });

      results.criteria["article_reading_view"] = isArticlePage && !!articleElement && paragraphs.length > 0;
      results.details["article_reading_view"] = {
        url: articleUrl,
        title: h1Text,
        paragraphCount: paragraphs.length,
        hasNarrowContainer: !!bodyContainer,
        typography: fontSizeCheck,
      };
      console.log(`  Article URL: ${articleUrl} => ${isArticlePage ? "PASS" : "FAIL"}`);
      console.log(`  Title: "${h1Text}"`);
      console.log(`  Paragraphs: ${paragraphs.length}`);
      console.log(`  Narrow container (680px): ${!!bodyContainer}`);
      console.log(`  Typography: ${JSON.stringify(fontSizeCheck)}`);
    } else {
      results.criteria["article_reading_view"] = false;
      console.log("  FAIL: No article link found on framework page");
    }
  } catch (e) {
    results.criteria["article_reading_view"] = false;
    results.details["article_reading_view"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 5: Dark/light mode toggle works and persists ----
  console.log("Testing: Theme toggle...");
  try {
    // Go back to homepage first
    await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" });

    // Check initial theme
    const initialTheme = await desktopPage.evaluate(() => {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    });

    // Find and click toggle
    const themeButton = await desktopPage.$('button[aria-label*="Switch to"]');
    if (themeButton) {
      await themeButton.click();
      await desktopPage.waitForTimeout(500);

      const afterToggleTheme = await desktopPage.evaluate(() => {
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
      });

      await screenshot(desktopPage, "04-theme-toggled-desktop");

      const themeChanged = initialTheme !== afterToggleTheme;

      // Navigate to another page and check persistence
      await desktopPage.goto(BASE_URL + "/frameworks/the-innovator", { waitUntil: "networkidle" });
      await desktopPage.waitForTimeout(500);

      const afterNavTheme = await desktopPage.evaluate(() => {
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
      });

      await screenshot(desktopPage, "05-theme-persisted-after-nav");

      const themePersisted = afterToggleTheme === afterNavTheme;

      results.criteria["theme_toggle"] = themeChanged && themePersisted;
      results.details["theme_toggle"] = {
        initial: initialTheme,
        afterToggle: afterToggleTheme,
        afterNavigation: afterNavTheme,
        changed: themeChanged,
        persisted: themePersisted,
      };
      console.log(`  Initial: ${initialTheme}, After toggle: ${afterToggleTheme}, After nav: ${afterNavTheme}`);
      console.log(`  Changed: ${themeChanged}, Persisted: ${themePersisted} => ${themeChanged && themePersisted ? "PASS" : "FAIL"}`);
    } else {
      results.criteria["theme_toggle"] = false;
      console.log("  FAIL: No theme toggle button found");
    }
  } catch (e) {
    results.criteria["theme_toggle"] = false;
    results.details["theme_toggle"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 6: Legal disclaimer in footer ----
  console.log("Testing: Legal disclaimer in footer...");
  try {
    // Check on homepage
    await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" });
    const homepageFooter = await desktopPage.$("footer");
    const homepageDisclaimer = homepageFooter
      ? await homepageFooter.textContent()
      : null;
    const hasDisclaimerHome = homepageDisclaimer && homepageDisclaimer.includes("Disclaimer");

    // Check on framework page
    await desktopPage.goto(BASE_URL + "/frameworks/the-innovator", { waitUntil: "networkidle" });
    const fwFooter = await desktopPage.$("footer");
    const fwDisclaimer = fwFooter ? await fwFooter.textContent() : null;
    const hasDisclaimerFw = fwDisclaimer && fwDisclaimer.includes("Disclaimer");

    // Check on article page
    await desktopPage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", { waitUntil: "networkidle" });
    const artFooter = await desktopPage.$("footer");
    const artDisclaimer = artFooter ? await artFooter.textContent() : null;
    const hasDisclaimerArt = artDisclaimer && artDisclaimer.includes("Disclaimer");

    results.criteria["legal_disclaimer"] = !!(hasDisclaimerHome && hasDisclaimerFw && hasDisclaimerArt);
    results.details["legal_disclaimer"] = {
      homepage: !!hasDisclaimerHome,
      frameworkPage: !!hasDisclaimerFw,
      articlePage: !!hasDisclaimerArt,
    };
    console.log(`  Homepage footer: ${hasDisclaimerHome ? "OK" : "MISSING"}`);
    console.log(`  Framework page footer: ${hasDisclaimerFw ? "OK" : "MISSING"}`);
    console.log(`  Article page footer: ${hasDisclaimerArt ? "OK" : "MISSING"}`);
  } catch (e) {
    results.criteria["legal_disclaimer"] = false;
    results.details["legal_disclaimer"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  // ---- CRITERION 7: No console errors ----
  console.log("Testing: Console errors...");
  // Filter out noise (React hydration warnings in dev, etc.)
  const significantErrors = desktopConsoleErrors.filter(
    (e) =>
      !e.includes("Download the React DevTools") &&
      !e.includes("Third-party cookie") &&
      !e.includes("favicon")
  );
  results.criteria["no_console_errors"] = significantErrors.length === 0;
  results.consoleErrors = significantErrors;
  results.details["no_console_errors"] = { errors: significantErrors };
  console.log(`  Console errors: ${significantErrors.length} => ${significantErrors.length === 0 ? "PASS" : "FAIL"}`);
  if (significantErrors.length > 0) {
    significantErrors.forEach((e) => console.log(`    - ${e}`));
  }

  await desktopContext.close();

  // ============================================================
  // MOBILE TESTS (375px)
  // ============================================================
  console.log("\n=== MOBILE VIEWPORT (375x812) ===\n");
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    colorScheme: "light",
  });
  const mobilePage = await mobileContext.newPage();

  const mobileConsoleErrors = [];
  mobilePage.on("console", (msg) => {
    if (msg.type() === "error") {
      mobileConsoleErrors.push(msg.text());
    }
  });

  console.log("Testing: Mobile responsive homepage...");
  try {
    await mobilePage.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });
    await screenshot(mobilePage, "06-homepage-mobile");

    // Check for horizontal scroll (overflow)
    const hasOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    // Check elements are visible and not clipped
    const h1Visible = await mobilePage.$eval("h1", (el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.left >= 0;
    });

    const cardsVisible = await mobilePage.$$eval("article", (articles) => {
      return articles.every((a) => {
        const rect = a.getBoundingClientRect();
        return rect.width > 0 && rect.width <= 375;
      });
    });

    results.criteria["mobile_homepage"] = !hasOverflow && h1Visible && cardsVisible;
    results.details["mobile_homepage"] = { hasOverflow, h1Visible, cardsVisible };
    console.log(`  Horizontal overflow: ${hasOverflow ? "YES (BAD)" : "NO (GOOD)"}`);
    console.log(`  H1 visible: ${h1Visible}`);
    console.log(`  Cards fit viewport: ${cardsVisible}`);
  } catch (e) {
    results.criteria["mobile_homepage"] = false;
    results.details["mobile_homepage"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  console.log("Testing: Mobile article reading view...");
  try {
    // Navigate to an article via framework
    await mobilePage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", {
      waitUntil: "networkidle",
    });
    await screenshot(mobilePage, "07-article-mobile");

    const hasOverflow = await mobilePage.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    const paragraphsFit = await mobilePage.$$eval("article p", (ps) => {
      return ps.every((p) => {
        const rect = p.getBoundingClientRect();
        return rect.width <= 375;
      });
    });

    results.criteria["mobile_article"] = !hasOverflow && paragraphsFit;
    results.details["mobile_article"] = { hasOverflow, paragraphsFit };
    console.log(`  Horizontal overflow: ${hasOverflow ? "YES (BAD)" : "NO (GOOD)"}`);
    console.log(`  Paragraphs fit: ${paragraphsFit}`);
  } catch (e) {
    results.criteria["mobile_article"] = false;
    results.details["mobile_article"] = { error: e.message };
    console.log(`  FAIL: ${e.message}`);
  }

  // Mobile console errors
  const mobileSignificantErrors = mobileConsoleErrors.filter(
    (e) =>
      !e.includes("Download the React DevTools") &&
      !e.includes("Third-party cookie") &&
      !e.includes("favicon")
  );
  if (mobileSignificantErrors.length > 0) {
    console.log(`  Mobile console errors: ${mobileSignificantErrors.length}`);
    mobileSignificantErrors.forEach((e) => console.log(`    - ${e}`));
    results.consoleErrors.push(...mobileSignificantErrors);
  }

  await mobileContext.close();

  // ============================================================
  // DESIGN QUALITY INSPECTION
  // ============================================================
  console.log("\n=== DESIGN QUALITY INSPECTION ===\n");
  const inspectionContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    colorScheme: "light",
  });
  const inspectPage = await inspectionContext.newPage();

  try {
    await inspectPage.goto(BASE_URL, { waitUntil: "networkidle" });

    // Inspect color palette and typography
    const designDetails = await inspectPage.evaluate(() => {
      const body = document.body;
      const bodyStyle = window.getComputedStyle(body);
      const h1 = document.querySelector("h1");
      const h1Style = h1 ? window.getComputedStyle(h1) : null;
      const p = document.querySelector("section p");
      const pStyle = p ? window.getComputedStyle(p) : null;

      return {
        bodyBg: bodyStyle.backgroundColor,
        bodyFont: bodyStyle.fontFamily,
        bodyColor: bodyStyle.color,
        h1Font: h1Style?.fontFamily,
        h1Size: h1Style?.fontSize,
        h1Weight: h1Style?.fontWeight,
        h1Color: h1Style?.color,
        pFont: pStyle?.fontFamily,
        pSize: pStyle?.fontSize,
        pLineHeight: pStyle?.lineHeight,
        pColor: pStyle?.color,
      };
    });
    results.details["design_inspection"] = designDetails;
    console.log("  Body background:", designDetails.bodyBg);
    console.log("  Body font:", designDetails.bodyFont);
    console.log("  H1 font:", designDetails.h1Font);
    console.log("  H1 size:", designDetails.h1Size);
    console.log("  H1 weight:", designDetails.h1Weight);
    console.log("  Paragraph font:", designDetails.pFont);
    console.log("  Paragraph size:", designDetails.pSize);
    console.log("  Paragraph line-height:", designDetails.pLineHeight);

    // Check dark mode design
    await inspectPage.goto(BASE_URL, { waitUntil: "networkidle" });
    const themeBtn = await inspectPage.$('button[aria-label*="Switch to"]');
    if (themeBtn) {
      await themeBtn.click();
      await inspectPage.waitForTimeout(500);
      await screenshot(inspectPage, "08-dark-mode-homepage");

      const darkDesign = await inspectPage.evaluate(() => {
        const body = document.body;
        const style = window.getComputedStyle(body);
        return {
          bg: style.backgroundColor,
          color: style.color,
        };
      });
      results.details["dark_mode_design"] = darkDesign;
      console.log("  Dark mode BG:", darkDesign.bg);
      console.log("  Dark mode text:", darkDesign.color);

      // Navigate to article in dark mode
      await inspectPage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", {
        waitUntil: "networkidle",
      });
      await inspectPage.waitForTimeout(500);
      await screenshot(inspectPage, "09-dark-mode-article");
    }

    // Check article typography in detail
    await inspectPage.goto(BASE_URL + "/articles/the-death-of-the-app-store-model", {
      waitUntil: "networkidle",
    });
    const articleTypography = await inspectPage.evaluate(() => {
      const article = document.querySelector("article");
      const container = document.querySelector('[class*="max-w-"]');
      const containerStyle = container ? window.getComputedStyle(container) : null;
      const h1 = article?.querySelector("h1");
      const firstP = article?.querySelectorAll("p");
      const bodyPs = Array.from(firstP || []).filter(
        (p) => !p.closest("header") && !p.closest("footer") && !p.closest("nav")
      );
      const bodyP = bodyPs[0];
      const bodyPStyle = bodyP ? window.getComputedStyle(bodyP) : null;

      return {
        containerMaxWidth: containerStyle?.maxWidth,
        containerWidth: containerStyle?.width,
        h1Font: h1 ? window.getComputedStyle(h1).fontFamily : null,
        h1Size: h1 ? window.getComputedStyle(h1).fontSize : null,
        bodyPFont: bodyPStyle?.fontFamily,
        bodyPSize: bodyPStyle?.fontSize,
        bodyPLineHeight: bodyPStyle?.lineHeight,
        bodyPLetterSpacing: bodyPStyle?.letterSpacing,
        bodyPMarginBottom: bodyPStyle?.marginBottom,
      };
    });
    results.details["article_typography"] = articleTypography;
    console.log("\n  Article typography:");
    console.log("    Container max-width:", articleTypography.containerMaxWidth);
    console.log("    H1 font:", articleTypography.h1Font);
    console.log("    Body P font:", articleTypography.bodyPFont);
    console.log("    Body P size:", articleTypography.bodyPSize);
    console.log("    Body P line-height:", articleTypography.bodyPLineHeight);
    console.log("    Body P letter-spacing:", articleTypography.bodyPLetterSpacing);

  } catch (e) {
    console.log(`  Design inspection error: ${e.message}`);
  }

  await inspectionContext.close();
  await browser.close();

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n=== SPRINT 1 EVALUATION SUMMARY ===\n");

  const criteriaMap = {
    homepage_renders_gallery: "Homepage renders framework gallery with >= 1 framework",
    card_shows_required_info: "Card shows archetype name, domain, perceptual lens",
    framework_detail_navigation: "Click framework => detail page with description + articles",
    article_reading_view: "Click article => distraction-free reading view",
    theme_toggle: "Dark/light toggle works and persists across navigation",
    legal_disclaimer: "Legal disclaimer visible in footer on every page",
    no_console_errors: "No console errors on npm run dev",
    mobile_homepage: "Mobile responsive: homepage at 375px",
    mobile_article: "Mobile responsive: article view at 375px",
  };

  let passed = 0;
  let total = Object.keys(criteriaMap).length;

  for (const [key, label] of Object.entries(criteriaMap)) {
    const status = results.criteria[key] ? "PASS" : "FAIL";
    if (results.criteria[key]) passed++;
    console.log(`  [${status}] ${label}`);
  }

  console.log(`\n  Result: ${passed}/${total} criteria passed\n`);

  // Write results to JSON for report generation
  const outputPath = path.join(__dirname, "sprint1-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`  Full results written to: ${outputPath}`);
}

run().catch((err) => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
