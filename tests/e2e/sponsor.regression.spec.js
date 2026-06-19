// @ts-check
import { test, expect } from '@playwright/test';

const ORG_SLUG = 'regression-test-org';
const BASE     = `http://${ORG_SLUG}.localhost:5173`;
const EMAIL    = 'sponsor@regression.local';
const PASSWORD = 'Admin@123';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/business\//, { timeout: 30000 });
}

async function waitForContent(page) {
  await page.waitForFunction(
    () => [...document.querySelectorAll('.animate-pulse')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 30 && r.height > 30;
    }).length === 0,
    { timeout: 15000 }
  );
}

let ctx, pg;

test.beforeAll(async ({ browser }) => {
  ctx = await browser.newContext();
  pg  = await ctx.newPage();
  await login(pg);
});

test.beforeEach(async () => {
  const url = pg?.url() || '';
  if (!url || url.includes('/login') || !url.includes('/business')) {
    await login(pg);
  }
});

test.afterAll(() => ctx?.close());

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD
═══════════════════════════════════════════════════════════════ */

test('SP-01 — Sponsor dashboard loads', async () => {
  await pg.goto(`${BASE}/business/dashboard`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-01-dashboard.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   2. PROFILE
═══════════════════════════════════════════════════════════════ */

test('SP-02 — Business Profile page loads', async () => {
  await pg.goto(`${BASE}/business/profile`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-02-profile.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   3. LICENCE STATUS
═══════════════════════════════════════════════════════════════ */

test('SP-03 — Licence Status page loads', async () => {
  await pg.goto(`${BASE}/business/licence-status`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-03-licence-status.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   4. APPLY LICENCE (V2)
═══════════════════════════════════════════════════════════════ */

test('SP-04 — Apply Licence page loads (V2)', async () => {
  await pg.goto(`${BASE}/business/apply-licence`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-04-apply-licence.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   5. WORKERS
═══════════════════════════════════════════════════════════════ */

test('SP-05 — Workers page loads', async () => {
  await pg.goto(`${BASE}/business/workers`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-05-workers.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   6. COS REQUESTS
═══════════════════════════════════════════════════════════════ */

test('SP-06 — CoS Registration page loads', async () => {
  await pg.goto(`${BASE}/business/cos-registration`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-06-cos.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   7. COMPLIANCE
═══════════════════════════════════════════════════════════════ */

test('SP-07 — Compliance page loads', async () => {
  await pg.goto(`${BASE}/business/compliance`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-07-compliance.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   8. DOCUMENTS
═══════════════════════════════════════════════════════════════ */

test('SP-08 — Documents page loads', async () => {
  await pg.goto(`${BASE}/business/documents`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-08-documents.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   9. MESSAGES
═══════════════════════════════════════════════════════════════ */

test('SP-09 — Messages page loads', async () => {
  await pg.goto(`${BASE}/business/messages`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-09-messages.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   10. NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */

test('SP-10 — Notifications page loads', async () => {
  await pg.goto(`${BASE}/business/notifications`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-10-notifications.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   11. PAYMENTS
═══════════════════════════════════════════════════════════════ */

test('SP-11 — Payments page loads', async () => {
  await pg.goto(`${BASE}/business/payments`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-11-payments.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   12. REPORTING OBLIGATIONS
═══════════════════════════════════════════════════════════════ */

test('SP-12 — Reporting Obligations page loads', async () => {
  await pg.goto(`${BASE}/business/reporting-obligations`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-12-reporting.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   13. TASKS
═══════════════════════════════════════════════════════════════ */

test('SP-13 — Tasks page loads', async () => {
  await pg.goto(`${BASE}/business/tasks`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-13-tasks.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   14. SETTINGS
═══════════════════════════════════════════════════════════════ */

test('SP-14 — Settings page loads', async () => {
  await pg.goto(`${BASE}/business/settings`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/sp-14-settings.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   15. NO JS ERRORS
═══════════════════════════════════════════════════════════════ */

test('SP-15 — No uncaught JS errors on sponsor pages', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const issues = [];

  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (text.includes('favicon') || text.includes('net::ERR_') || text.includes('ResizeObserver')) return;
    issues.push(`[ERROR] ${text}`);
  });
  page.on('pageerror', err => issues.push(`[PAGEERROR] ${err.message}`));

  await login(page);

  const routes = [
    '/business/dashboard', '/business/profile', '/business/licence-status',
    '/business/workers', '/business/compliance', '/business/documents',
    '/business/messages', '/business/notifications',
  ];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await waitForContent(page);
  }

  await context.close();
  expect(issues, `Console errors:\n${issues.join('\n')}`).toHaveLength(0);
});
