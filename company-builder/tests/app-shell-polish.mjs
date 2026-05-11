import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:3001';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const loadingBanner = page.getByText('Rehydrating company memory...', { exact: true });
    await loadingBanner.waitFor({ state: 'visible', timeout: 3000 });
    const loadingVisible = await loadingBanner.isVisible();
    assert.equal(loadingVisible, true, 'expected the shell hydration banner to render on first load');

    await page.waitForLoadState('networkidle');

    const apiKeyTrigger = page.locator('button[aria-label*="API key"]');
    await apiKeyTrigger.click();
    await page.evaluate(() => {
      window.__CTD_OPEN_API_KEY_MODAL__?.();
    });

    const apiKeyInput = page.locator('input[placeholder="sk-ant-api03-..."]');
    await apiKeyInput.waitFor({ state: 'visible', timeout: 5000 });

    const focusedPlaceholder = await page.evaluate(() => document.activeElement?.getAttribute('placeholder'));
    assert.equal(focusedPlaceholder, 'sk-ant-api03-...', 'expected the API key modal to focus the key input');

    await page.keyboard.press('Escape');
    await delay(250);
    await apiKeyTrigger.waitFor({ state: 'visible', timeout: 5000 });

    const focusedAfterModalClose = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    assert.match(
      focusedAfterModalClose || '',
      /API key/,
      'expected focus to return to the API key trigger after closing the modal',
    );

    await page.evaluate(() => {
      window.__CTD_OPEN_COMMAND_PALETTE__?.();
    });
    const paletteInput = page.locator('input[placeholder="Search minds, actions..."]');
    await paletteInput.waitFor({ state: 'visible', timeout: 5000 });

    const paletteFocusedPlaceholder = await page.evaluate(() => document.activeElement?.getAttribute('placeholder'));
    assert.equal(
      paletteFocusedPlaceholder,
      'Search minds, actions...',
      'expected the command palette input to receive focus on open',
    );

    await page.keyboard.press('Escape');
    await delay(250);

    const focusedAfterPaletteClose = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    assert.match(
      focusedAfterPaletteClose || '',
      /API key/,
      'expected focus to return to the previously active control after closing the command palette',
    );

    console.log('app-shell polish regression passed');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
