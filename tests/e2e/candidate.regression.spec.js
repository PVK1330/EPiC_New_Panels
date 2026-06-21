// @ts-check
import { test, expect } from '@playwright/test';

const ORG_SLUG = 'regression-test-org';
const BASE     = `http://${ORG_SLUG}.localhost:5173`;
const EMAIL    = 'candidate@regression.local';
const PASSWORD = 'Admin@123';

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/candidate\//, { timeout: 30000 });
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
  if (!url || url.includes('/login') || !url.includes('/candidate')) {
    await login(pg);
  }
});

test.afterAll(() => ctx?.close());

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD
═══════════════════════════════════════════════════════════════ */

test('CAND-01 — Candidate dashboard loads', async () => {
  await pg.goto(`${BASE}/candidate/dashboard`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-01-dashboard.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   2. APPLICATION
═══════════════════════════════════════════════════════════════ */

test('CAND-02 — Application page loads', async () => {
  await pg.goto(`${BASE}/candidate/application`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-02-application.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   3. DOCUMENTS
═══════════════════════════════════════════════════════════════ */

test('CAND-03 — Documents page loads', async () => {
  await pg.goto(`${BASE}/candidate/documents`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-03-documents.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   4. DOCUMENT CHECKLIST
═══════════════════════════════════════════════════════════════ */

test('CAND-04 — Document checklist page loads', async () => {
  await pg.goto(`${BASE}/candidate/document-checklist`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-04-doc-checklist.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   5. MESSAGES
═══════════════════════════════════════════════════════════════ */

test('CAND-05 — Messages page loads', async () => {
  await pg.goto(`${BASE}/candidate/messages`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-05-messages.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   6. TASKS
═══════════════════════════════════════════════════════════════ */

test('CAND-06 — Tasks page loads', async () => {
  await pg.goto(`${BASE}/candidate/tasks`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-06-tasks.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   7. APPOINTMENTS
═══════════════════════════════════════════════════════════════ */

test('CAND-07 — Appointments page loads', async () => {
  await pg.goto(`${BASE}/candidate/appointments`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-07-appointments.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   8. PAYMENTS
═══════════════════════════════════════════════════════════════ */

test('CAND-08 — Payments page loads', async () => {
  await pg.goto(`${BASE}/candidate/payments`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-08-payments.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   9. CALENDAR
═══════════════════════════════════════════════════════════════ */

test('CAND-09 — Calendar page loads', async () => {
  await pg.goto(`${BASE}/candidate/calendar`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-09-calendar.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   10. NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */

test('CAND-10 — Notifications page loads', async () => {
  await pg.goto(`${BASE}/candidate/notifications`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-10-notifications.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   11. ACCOUNT
═══════════════════════════════════════════════════════════════ */

test('CAND-11 — Account/Profile page loads', async () => {
  await pg.goto(`${BASE}/candidate/account`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-11-account.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   12. VISA ENQUIRY
═══════════════════════════════════════════════════════════════ */

test('CAND-12 — Visa Enquiry page loads', async () => {
  await pg.goto(`${BASE}/candidate/visa-enquiry`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-12-visa-enquiry.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   13. ACTIVITY LOG
═══════════════════════════════════════════════════════════════ */

test('CAND-13 — Activity Log page loads', async () => {
  await pg.goto(`${BASE}/candidate/activity`);
  await waitForContent(pg);
  await pg.screenshot({ path: 'test-screenshots/cand-13-activity.png' });
  await expect(pg.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   14. NO JS ERRORS
═══════════════════════════════════════════════════════════════ */

test('CAND-14 — No uncaught JS errors on candidate pages', async ({ browser }) => {
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
    '/candidate/dashboard', '/candidate/application', '/candidate/documents',
    '/candidate/payments', '/candidate/messages', '/candidate/notifications',
  ];
  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await waitForContent(page);
  }

  await context.close();
  expect(issues, `Console errors:\n${issues.join('\n')}`).toHaveLength(0);
});
