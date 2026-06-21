// @ts-check
import { test, expect } from '@playwright/test';

const ORG_SLUG = 'regression-test-org';
const BASE     = `http://${ORG_SLUG}.localhost:5173`;
const EMAIL    = 'caseworker@regression.local';
const PASSWORD = 'Admin@123';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/caseworker\//, { timeout: 30000 });
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
  if (!url || url.includes('/login') || !url.includes('/caseworker')) {
    await login(pg);
  }
});

test.afterAll(() => ctx?.close());

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD
═══════════════════════════════════════════════════════════════ */

test('CW-01 — Caseworker dashboard loads', async () => {
  await pg.goto(`${BASE}/caseworker/dashboard`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-01-dashboard.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   2. CASES
═══════════════════════════════════════════════════════════════ */

test('CW-02 — Cases list loads', async () => {
  await pg.goto(`${BASE}/caseworker/cases`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-02-cases.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   3. PIPELINE
═══════════════════════════════════════════════════════════════ */

test('CW-03 — Pipeline view loads', async () => {
  await pg.goto(`${BASE}/caseworker/pipeline`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-03-pipeline.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   4. DOCUMENTS
═══════════════════════════════════════════════════════════════ */

test('CW-04 — Documents page loads', async () => {
  await pg.goto(`${BASE}/caseworker/documents`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-04-documents.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   5. CLIENTS (Candidates & Sponsors)
═══════════════════════════════════════════════════════════════ */

test('CW-05 — Clients page loads', async () => {
  await pg.goto(`${BASE}/caseworker/clients`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-05-clients.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   6. MESSAGES
═══════════════════════════════════════════════════════════════ */

test('CW-06 — Messages page loads', async () => {
  await pg.goto(`${BASE}/caseworker/messages`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-06-messages.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   7. CALENDAR
═══════════════════════════════════════════════════════════════ */

test('CW-07 — Calendar page loads', async () => {
  await pg.goto(`${BASE}/caseworker/calendar`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-07-calendar.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   8. TASKS
═══════════════════════════════════════════════════════════════ */

test('CW-08 — Tasks page loads', async () => {
  await pg.goto(`${BASE}/caseworker/tasks`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-08-tasks.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   9. NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */

test('CW-09 — Notifications page loads', async () => {
  await pg.goto(`${BASE}/caseworker/notifications`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-09-notifications.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   10. MY ACCOUNT
═══════════════════════════════════════════════════════════════ */

test('CW-10 — My Account page loads', async () => {
  await pg.goto(`${BASE}/caseworker/account`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-10-account.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   11. COMPLIANCE REVIEW
═══════════════════════════════════════════════════════════════ */

test('CW-11 — Compliance Review page loads', async () => {
  await pg.goto(`${BASE}/caseworker/compliance-review`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-11-compliance.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   12. PERFORMANCE
═══════════════════════════════════════════════════════════════ */

test('CW-12 — Performance page loads', async () => {
  await pg.goto(`${BASE}/caseworker/performance`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-12-performance.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   13. FINANCE
═══════════════════════════════════════════════════════════════ */

test('CW-13 — Finance page loads', async () => {
  await pg.goto(`${BASE}/caseworker/finance`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cw-13-finance.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   14. NO JS ERRORS
═══════════════════════════════════════════════════════════════ */

test('CW-14 — No uncaught JS errors on caseworker pages', async ({ browser }) => {
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
    '/caseworker/dashboard', '/caseworker/cases', '/caseworker/pipeline',
    '/caseworker/documents', '/caseworker/messages', '/caseworker/notifications',
  ];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await waitForContent(page);
  }

  await context.close();
  expect(issues, `Console errors:\n${issues.join('\n')}`).toHaveLength(0);
});
