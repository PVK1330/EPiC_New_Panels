import { test, expect } from '@playwright/test';

const ORG_SLUG = 'regression-test-org';
const BASE = `http://${ORG_SLUG}.localhost:5173`;

async function waitForReady(page) {
  // Wait for BOTH skeleton loaders AND auth spinner to disappear
  await page.waitForFunction(
    () => {
      const spins = [...document.querySelectorAll('.animate-spin, .animate-pulse')];
      return spins.filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 20 && r.height > 20;
      }).length === 0;
    },
    { timeout: 20000 }
  );
}

async function loginAndWait(page, email, password, urlPattern) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(urlPattern, { timeout: 30000 });
  await waitForReady(page);
}

test('Admin dashboard - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'admin@regression.local', 'Admin@123', /\/admin\//);
  await page.goto(`${BASE}/admin/dashboard`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-admin-dashboard.png' });
  await expect(page.locator('body')).toBeVisible();
});

test('Admin cases - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'admin@regression.local', 'Admin@123', /\/admin\//);
  await page.goto(`${BASE}/admin/cases`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-admin-cases.png' });
});

test('Caseworker dashboard - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'caseworker@regression.local', 'Admin@123', /\/caseworker\//);
  await page.goto(`${BASE}/caseworker/dashboard`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-cw-dashboard.png' });
});

test('Candidate dashboard - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'candidate@regression.local', 'Admin@123', /\/candidate\//);
  await page.goto(`${BASE}/candidate/dashboard`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-cand-dashboard.png' });
});

test('Sponsor dashboard - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'sponsor@regression.local', 'Admin@123', /\/business\//);
  await page.goto(`${BASE}/business/dashboard`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-sp-dashboard.png' });
});

test('Sponsor apply licence V2 - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'sponsor@regression.local', 'Admin@123', /\/business\//);
  await page.goto(`${BASE}/business/apply-licence`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-sp-apply-licence.png' });
});

test('Caseworker pipeline - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'caseworker@regression.local', 'Admin@123', /\/caseworker\//);
  await page.goto(`${BASE}/caseworker/pipeline`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-cw-pipeline.png' });
});

test('Admin finance - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'admin@regression.local', 'Admin@123', /\/admin\//);
  await page.goto(`${BASE}/admin/finance`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-admin-finance.png' });
});

test('Candidate documents - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'candidate@regression.local', 'Admin@123', /\/candidate\//);
  await page.goto(`${BASE}/candidate/documents`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-cand-documents.png' });
});

test('Sponsor compliance - fully loaded', async ({ page }) => {
  await loginAndWait(page, 'sponsor@regression.local', 'Admin@123', /\/business\//);
  await page.goto(`${BASE}/business/compliance`);
  await waitForReady(page);
  await page.screenshot({ path: 'test-screenshots/FULL-sp-compliance.png' });
});
