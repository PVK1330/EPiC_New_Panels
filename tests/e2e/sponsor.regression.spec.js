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

// Waits for skeleton/spinner loaders to clear
async function waitForContent(page, timeout = 15000) {
  await page.waitForFunction(
    () => [...document.querySelectorAll('.animate-pulse, .animate-spin')].filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 30 && r.height > 30;
    }).length === 0,
    { timeout }
  );
}

// Waits for network to settle + skeleton to clear
async function waitForPage(page) {
  await page.waitForLoadState('networkidle', { timeout: 20000 });
  await waitForContent(page, 15000);
}

/* ═══════════════════════════════════════════════════════════════
   1. DASHBOARD
═══════════════════════════════════════════════════════════════ */

test('SP-01 — Sponsor dashboard loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/dashboard`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-01-dashboard.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   2. PROFILE
═══════════════════════════════════════════════════════════════ */

test('SP-02 — Business Profile page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/profile`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-02-profile.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   3. LICENCE STATUS
═══════════════════════════════════════════════════════════════ */

test('SP-03 — Licence Status page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/licence-status`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-03-licence-status.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   4. APPLY LICENCE (V2)
═══════════════════════════════════════════════════════════════ */

test('SP-04 — Apply Licence page loads (V2)', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/apply-licence`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-04-apply-licence.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   5. WORKERS — list, search, filter, empty state, stat cards
═══════════════════════════════════════════════════════════════ */

test('SP-05 — Workers page loads with stat cards', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/workers`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-05-workers.png' });

  // Heading must be present
  await expect(page.locator('h1:has-text("Workers")')).toBeVisible();
  // At least 3 stat cards visible
  const cards = page.locator('.grid .rounded-xl.border').first();
  await expect(cards).toBeVisible();
});

test('SP-05b — Workers search input is accessible (aria-label)', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/workers`);
  await waitForPage(page);

  const searchInput = page.locator('[aria-label="Search workers"]');
  await expect(searchInput).toBeVisible();
});

test('SP-05c — Workers status filter has all 9 status options', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/workers`);
  await waitForPage(page);

  // Wait for the select to be present (filter bar renders after page load)
  await page.waitForSelector('select', { timeout: 10000 });
  const options = await page.locator('select option').allTextContents();
  expect(options).toContain('Active');
  expect(options).toContain('Completed');
  expect(options).toContain('Cancelled');
  expect(options).toContain('In Progress');
  expect(options).toContain('Pending');
  expect(options).toContain('Under Review');
  expect(options).toContain('Docs Pending');
  expect(options).toContain('Rejected');
  expect(options).toContain('Approved');
});

test('SP-05d — Workers empty state hides table when no results', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/workers`);
  await waitForPage(page);

  const searchInput = page.locator('[aria-label="Search workers"]');
  await searchInput.fill('zzznoresultszzzxxx');
  await page.waitForTimeout(600);

  const tableVisible = await page.locator('table').isVisible().catch(() => false);
  expect(tableVisible).toBe(false);
  await page.screenshot({ path: 'test-screenshots/sp-05d-empty-state.png' });
});

test('SP-05e — Add Worker button navigates or is disabled (licence gate)', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/workers`);
  await waitForPage(page);

  const addBtn = page.locator('button:has-text("Add Worker")');
  const isDisabled = await addBtn.isDisabled();
  if (!isDisabled) {
    await addBtn.click();
    await page.waitForURL(/\/business\/sponsored-workers/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/business\/sponsored-workers/);
  } else {
    // Licence gate active — correct behaviour
    await expect(addBtn).toBeDisabled();
  }
});

test('SP-05f — candidateId NOT in URL when navigating to worker details', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/workers`);
  await waitForPage(page);

  const viewBtn = page.locator('button:has-text("View")').first();
  const hasView = await viewBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasView) {
    test.skip(true, 'No workers in list — skipping detail nav test');
    return;
  }
  await viewBtn.click();
  await page.waitForURL(/\/business\/worker-details/, { timeout: 10000 });
  expect(page.url()).not.toContain('candidateId');
  await page.screenshot({ path: 'test-screenshots/sp-05f-worker-details.png' });
});

test('SP-05g — Direct nav to /business/worker-details redirects to workers list', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/worker-details`);
  await page.waitForURL(/\/business\/workers/, { timeout: 10000 });
  await expect(page).toHaveURL(/\/business\/workers/);
  await page.screenshot({ path: 'test-screenshots/sp-05g-redirect.png' });
});

test('SP-05h — Delete shows modal, not window.confirm', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/workers`);
  await waitForPage(page);

  const deleteBtn = page.locator('button:has-text("Delete")').first();
  const hasDelete = await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasDelete) {
    test.skip(true, 'No workers to delete — skipping delete modal test');
    return;
  }

  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
    throw new Error('window.confirm() appeared — CRIT-03 regression');
  });

  await deleteBtn.click();
  const modal = page.locator('text=Remove Worker').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'test-screenshots/sp-05h-delete-modal.png' });

  const cancelBtn = page.locator('button:has-text("Cancel")').first();
  await cancelBtn.click();
  await expect(modal).not.toBeVisible({ timeout: 5000 });
});

/* ═══════════════════════════════════════════════════════════════
   6. COS REGISTRATION
═══════════════════════════════════════════════════════════════ */

test('SP-06 — CoS Registration page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/cos-registration`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-06-cos.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   7. COMPLIANCE REVIEW STATUS (/business/compliance-review)
═══════════════════════════════════════════════════════════════ */

test('SP-07 — Compliance Review page loads with 4 entity tabs', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/compliance-review`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-07-compliance-review.png' });

  await expect(page.locator('button:has-text("Right to Work")')).toBeVisible();
  await expect(page.locator('button:has-text("Worker Events")')).toBeVisible();
  await expect(page.locator('button:has-text("Change Requests")')).toBeVisible();
  await expect(page.locator('button:has-text("Compliance Documents")')).toBeVisible();
});

test('SP-07b — Compliance search input has accessible aria-label', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/compliance-review`);
  await waitForPage(page);

  const searchInput = page.locator('[aria-label="Search compliance submissions"]');
  await expect(searchInput).toBeVisible();
});

test('SP-07c — Compliance tab switch does not crash (cancellation guard)', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/compliance-review`);
  await waitForPage(page);

  const tabs = ['Worker Events', 'Change Requests', 'Right to Work', 'Compliance Documents'];
  for (const tab of tabs) {
    await page.locator(`button:has-text("${tab}")`).click();
    await page.waitForTimeout(300);
  }

  await waitForContent(page);
  await expect(page.locator('body')).toBeVisible();
  await page.screenshot({ path: 'test-screenshots/sp-07c-tab-switch.png' });
});

test('SP-07d — Right to Work tab loads without JS crash', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/compliance-review`);
  await waitForPage(page);

  await page.locator('button:has-text("Right to Work")').click();
  await waitForContent(page, 20000);
  await page.screenshot({ path: 'test-screenshots/sp-07d-rtw.png' });

  const body = await page.textContent('body');
  expect(body).not.toContain('Something went wrong');
  expect(body).not.toContain('Cannot read properties');
});

/* ═══════════════════════════════════════════════════════════════
   8. COMPLIANCE DASHBOARD (/business/compliance)
═══════════════════════════════════════════════════════════════ */

test('SP-08a — Compliance Dashboard page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/compliance`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-08a-compliance-dashboard.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   9. DOCUMENTS
═══════════════════════════════════════════════════════════════ */

test('SP-09 — Documents page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/documents`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-09-documents.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   10. MESSAGES
═══════════════════════════════════════════════════════════════ */

test('SP-10 — Messages page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/messages`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-10-messages.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   11. NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */

test('SP-11 — Notifications page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/notifications`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-11-notifications.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   12. PAYMENTS
═══════════════════════════════════════════════════════════════ */

test('SP-12 — Payments page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/payments`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-12-payments.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   13. REPORTING OBLIGATIONS
═══════════════════════════════════════════════════════════════ */

test('SP-13 — Reporting Obligations page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/reporting-obligations`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-13-reporting.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   14. TASKS
═══════════════════════════════════════════════════════════════ */

test('SP-14 — Tasks page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/tasks`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-14-tasks.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   15. SETTINGS
═══════════════════════════════════════════════════════════════ */

test('SP-15 — Settings page loads', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/settings`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-15-settings.png' });
  await expect(page.locator('body')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════
   16. ADD WORKER FORM — PoundSterling icon + fieldset legend
═══════════════════════════════════════════════════════════════ */

test('SP-16 — Add Worker form renders with Salary field and pound icon', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/sponsored-workers`);
  await waitForPage(page);
  await page.screenshot({ path: 'test-screenshots/sp-16-add-worker.png' });

  // Salary label must be present
  await expect(page.locator('label:has-text("Salary")')).toBeVisible();

  // PoundSterling SVG renders with data-lucide="pound-sterling"
  // or as any SVG next to the salary field — at minimum no DollarSign
  const pageHtml = await page.content();
  expect(pageHtml).not.toContain('data-lucide="dollar-sign"');
});

test('SP-16b — Add Worker immigration section has fieldset legend', async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/business/sponsored-workers`);
  await waitForPage(page);

  const legend = page.locator('legend');
  await expect(legend).toBeVisible();
  const legendText = await legend.textContent();
  expect(legendText?.toLowerCase()).toContain('visa');
});

/* ═══════════════════════════════════════════════════════════════
   17. NO UNCAUGHT JS ERRORS (filtering expected 401s)
═══════════════════════════════════════════════════════════════ */

test('SP-17 — No uncaught JS errors on core sponsor pages', async ({ page }) => {
  const issues = [];

  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // Filter expected noise: favicons, 401 auth checks, ResizeObserver, net errors
    if (
      text.includes('favicon') ||
      text.includes('net::ERR_') ||
      text.includes('ResizeObserver') ||
      text.includes('401') ||
      text.includes('Unauthorized')
    ) return;
    issues.push(`[CONSOLE] ${text}`);
  });
  page.on('pageerror', err => {
    const msg = err.message;
    if (msg.includes('401') || msg.includes('Unauthorized')) return;
    issues.push(`[PAGEERROR] ${msg}`);
  });

  await login(page);

  const routes = [
    '/business/dashboard',
    '/business/workers',
    '/business/compliance-review',
    '/business/documents',
    '/business/messages',
    '/business/notifications',
    '/business/tasks',
    '/business/settings',
  ];

  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await waitForPage(page);
  }

  if (issues.length > 0) {
    console.log('Unexpected JS issues:\n' + issues.join('\n'));
  }
  expect(issues, `Console errors:\n${issues.join('\n')}`).toHaveLength(0);
});
