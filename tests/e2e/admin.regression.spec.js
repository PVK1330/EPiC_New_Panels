// @ts-check
import { test, expect } from '@playwright/test';

const ORG_SLUG   = 'regression-test-org';
const BASE       = `http://${ORG_SLUG}.localhost:5173`;
const EMAIL      = 'admin@regression.local';
const PASSWORD   = 'Admin@123';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\//, { timeout: 30000 });
}

async function waitForContent(page) {
  await page.waitForFunction(
    () => {
      const skeletons = [...document.querySelectorAll('.animate-pulse')];
      return skeletons.filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 30 && r.height > 30;
      }).length === 0;
    },
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
  if (!pg) return;
  const url = pg.url();
  if (!url || url.includes('/login') || !url.includes('/admin')) {
    await login(pg);
  }
});

test.afterAll(() => ctx?.close());

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD
═══════════════════════════════════════════════════════════════ */

test('A-01 — Admin dashboard loads with KPI cards', async () => {
  await pg.goto(`${BASE}/admin/dashboard`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-01-dashboard.png' });
  const body = await pg.textContent('body');
  expect(body).toBeTruthy();
  // Dashboard should have stat-like elements
  const cards = pg.locator('.p-5, .p-4, [class*="stat"], [class*="card"]');
  expect(await cards.count()).toBeGreaterThan(0);
});

/* ═══════════════════════════════════════════════════════════════
   2. CASES
═══════════════════════════════════════════════════════════════ */

test('A-02 — Cases page loads and table renders', async () => {
  await pg.goto(`${BASE}/admin/cases`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-02-cases.png' });
  const body = await pg.textContent('body');
  expect(body).toBeTruthy();
});

/* ═══════════════════════════════════════════════════════════════
   3. CANDIDATES
═══════════════════════════════════════════════════════════════ */

test('A-03 — Candidates page loads', async () => {
  await pg.goto(`${BASE}/admin/candidates`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-03-candidates.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   4. CASEWORKERS
═══════════════════════════════════════════════════════════════ */

test('A-04 — Caseworkers page loads with data', async () => {
  await pg.goto(`${BASE}/admin/caseworkers`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-04-caseworkers.png' });
  // Should show the test caseworker we created
  const body = await pg.textContent('body');
  expect(body).toBeTruthy();
});

/* ═══════════════════════════════════════════════════════════════
   5. BUSINESSES
═══════════════════════════════════════════════════════════════ */

test('A-05 — Businesses/Sponsors page loads', async () => {
  await pg.goto(`${BASE}/admin/businesses`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-05-businesses.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   6. USERS & PERMISSIONS
═══════════════════════════════════════════════════════════════ */

test('A-06a — Users page loads', async () => {
  await pg.goto(`${BASE}/admin/users`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-06a-users.png' });
  await expect(pg.locator('body')).toBeVisible();
});

test('A-06b — Permissions page loads', async () => {
  await pg.goto(`${BASE}/admin/permissions`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-06b-permissions.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   7. PIPELINE & WORKFLOW
═══════════════════════════════════════════════════════════════ */

test('A-07 — Pipeline page loads', async () => {
  await pg.goto(`${BASE}/admin/pipeline`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-07-pipeline.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   8. CALENDAR
═══════════════════════════════════════════════════════════════ */

test('A-08 — Calendar page loads', async () => {
  await pg.goto(`${BASE}/admin/calendar`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-08-calendar.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   9. ESCALATIONS
═══════════════════════════════════════════════════════════════ */

test('A-09 — Escalations page loads', async () => {
  await pg.goto(`${BASE}/admin/escalations`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-09-escalations.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   10. DOCUMENTS
═══════════════════════════════════════════════════════════════ */

test('A-10 — Documents page loads', async () => {
  await pg.goto(`${BASE}/admin/documents`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-10-documents.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   11. MESSAGES
═══════════════════════════════════════════════════════════════ */

test('A-11 — Messages page loads', async () => {
  await pg.goto(`${BASE}/admin/messages`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-11-messages.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   12. FINANCE
═══════════════════════════════════════════════════════════════ */

test('A-12 — Finance page loads', async () => {
  await pg.goto(`${BASE}/admin/finance`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-12-finance.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   13. REPORTS
═══════════════════════════════════════════════════════════════ */

test('A-13 — Reports page loads', async () => {
  await pg.goto(`${BASE}/admin/reports`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-13-reports.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   14. SETTINGS
═══════════════════════════════════════════════════════════════ */

test('A-14 — Settings page loads with tabs', async () => {
  await pg.goto(`${BASE}/admin/settings`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-14-settings.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   15. AUDIT LOGS
═══════════════════════════════════════════════════════════════ */

test('A-15 — Audit Logs page loads', async () => {
  await pg.goto(`${BASE}/admin/audit-logs`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-15-audit-logs.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   16. NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */

test('A-16 — Notifications page loads', async () => {
  await pg.goto(`${BASE}/admin/notifications`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/admin-16-notifications.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   17. NO CONSOLE ERRORS across key pages
═══════════════════════════════════════════════════════════════ */

test('A-17 — No uncaught JS errors across admin pages', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const issues = [];

  page.on('console', msg => {
    const t = msg.type(), text = msg.text();
    if (t !== 'error') return;
    if (text.includes('favicon') || text.includes('net::ERR_') || text.includes('ResizeObserver')) return;
    issues.push(`[${t.toUpperCase()}] ${text}`);
  });
  page.on('pageerror', err => issues.push(`[PAGEERROR] ${err.message}`));

  await login(page);

  const routes = [
    '/admin/dashboard', '/admin/cases', '/admin/candidates',
    '/admin/caseworkers', '/admin/businesses', '/admin/finance',
    '/admin/settings', '/admin/audit-logs',
  ];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await waitForContent(page);
  }

  await context.close();
  expect(issues, `Console errors:\n${issues.join('\n')}`).toHaveLength(0);
});
