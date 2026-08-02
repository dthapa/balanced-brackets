import { test } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

test.describe('Balanced Brackets App Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Dismiss splash modal if present
    const splashButton = page.locator('button:has-text("Let\'s Start")');
    if (await splashButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await splashButton.click();
      await page.waitForTimeout(400);
    }
  });

  test('Learn Mode intro screenshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="nav-learn"]');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'learn-intro.png'),
      fullPage: true,
    });
  });

  test('Learn Mode step-by-step screenshots', async ({ page }) => {
    await page.waitForSelector('[data-testid="nav-learn"]');

    for (let i = 1; i <= 4; i++) {
      await page.click('button:has-text("Next →")');
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `step-${i}.png`),
        fullPage: true,
      });
    }
  });

  test('Practice Mode - Push or Pop screenshot', async ({ page }) => {
    await page.click('[data-testid="nav-practice"]');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'practice-push-or-pop.png'),
      fullPage: true,
    });
  });

  test('Practice Mode - Code Fill-In screenshot', async ({ page }) => {
    await page.click('[data-testid="nav-practice"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="practice-tab-code-fill"]');
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'practice-code-fill.png'),
      fullPage: true,
    });
  });

  test('Practice Mode - Reconstruct Steps screenshot', async ({ page }) => {
    await page.click('[data-testid="nav-practice"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="practice-tab-reconstruct"]');
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'practice-reconstruct.png'),
      fullPage: true,
    });
  });

  test('Practice Mode - Full Trace screenshot', async ({ page }) => {
    await page.click('[data-testid="nav-practice"]');
    await page.waitForTimeout(300);
    await page.click('[data-testid="practice-tab-trace"]');
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'practice-trace.png'),
      fullPage: true,
    });
  });
});
