// @ts-check
import { test, expect } from '@playwright/test';

const SA_EMAIL    = 'superadmin@epic.com';
const SA_PASSWORD = 'Admin@123';
const BASE        = 'http://localhost:5173';

/* ─── helpers ────────────────────────────────────────────────────────────── */

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]', { timeout: 15000 });
  await page.fill('input[name="email"]',    SA_EMAIL);
  await page.fill('input[name="password"]', SA_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/superadmin\//, { timeout: 30000 });
}

async function waitForContent(page) {
  // Ignore tiny pulsing dots used as live-status indicators (e.g. the billing "Live" badge).
  // Only wait for substantial skeleton loaders (card-sized, > 30×30 px) to disappear.
  await page.waitForFunction(
    () => {
      const skeletons = [...document.querySelectorAll('.animate-pulse')];
      const realSkeletons = skeletons.filter(el => {
        const r = el.getBoundingClientRect();
        return r.width > 30 && r.height > 30;
      });
      return realSkeletons.length === 0;
    },
    { timeout: 15000 }
  );
}

/** Navigate and open Create Organisation modal */
async function openCreateOrgModal(page) {
  await page.goto(`${BASE}/superadmin/organisations`);
  await waitForContent(page);
  await page.getByRole('button', { name: /create organisation/i }).first().click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  return dialog;
}

/** Navigate and open Invite Team Member modal */
async function openInviteModal(page) {
  await page.goto(`${BASE}/superadmin/team`);
  await waitForContent(page);
  // "Invite" is the HeroButton label in the page header
  await page.getByRole('button', { name: /^invite$/i }).first().click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  return dialog;
}

/** Navigate and open Edit Plan modal */
async function openEditPlanModal(page) {
  await page.goto(`${BASE}/superadmin/plans`);
  await waitForContent(page);
  const editBtn = page.getByRole('button', { name: /edit plan/i }).first();
  await editBtn.waitFor({ timeout: 10000 });
  await editBtn.click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  return dialog;
}

/* ─── shared context ─────────────────────────────────────────────────────── */

let ctx;
let pg;

test.beforeAll(async ({ browser }) => {
  ctx = await browser.newContext();
  pg  = await ctx.newPage();
  await login(pg);
});

/** Re-authenticate if the session was lost between tests */
test.beforeEach(async () => {
  if (!pg) return;
  const url = pg.url();
  if (!url || url.includes('/login') || (!url.includes('/superadmin') && !url.includes('localhost'))) {
    await login(pg);
  }
});

test.afterAll(() => ctx?.close());

/* ═══════════════════════════════════════════════════════════════════════
   1. Create Organisation Modal
═══════════════════════════════════════════════════════════════════════ */

test('1a — Create Organisation modal opens', async () => {
  const dialog = await openCreateOrgModal(pg);
  await expect(dialog).toBeVisible();
  await pg.screenshot({ path: 'test-screenshots/1a-create-org-open.png' });
  // Leave open for 1b (same navigate)
});

test('1b — Create Organisation fields are visible', async () => {
  // Re-open fresh so test is self-contained
  const dialog = await openCreateOrgModal(pg);

  // CreateOrganizationModal uses Input with name prop — id and name attrs are set
  await expect(dialog.locator('input[name="name"]')).toBeVisible();
  await expect(dialog.locator('input[name="primaryEmail"]')).toBeVisible();
  await expect(dialog.locator('input[name="adminFirstName"]')).toBeVisible();
  await expect(dialog.locator('input[name="adminEmail"]')).toBeVisible();

  await pg.screenshot({ path: 'test-screenshots/1b-create-org-fields.png' });
});

test('1c — Create Organisation submit triggers validation (modal stays open)', async () => {
  const dialog = await openCreateOrgModal(pg);

  // Click submit without filling fields — toast fires, modal stays open
  await dialog.getByRole('button', { name: /create organisation/i }).click();
  await expect(dialog).toBeVisible({ timeout: 4000 });

  await pg.screenshot({ path: 'test-screenshots/1c-create-org-validation.png' });
  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

/* ═══════════════════════════════════════════════════════════════════════
   2. Invite Team Member Modal
═══════════════════════════════════════════════════════════════════════ */

test('2a — Invite Team Member modal opens', async () => {
  const dialog = await openInviteModal(pg);
  await expect(dialog).toBeVisible();
  await pg.screenshot({ path: 'test-screenshots/2a-invite-modal-open.png' });
});

test('2b — Invite Team Member fields are visible', async () => {
  const dialog = await openInviteModal(pg);

  // Inputs have no name/id attributes (no name prop passed in JSX).
  // Use type and placeholder to identify them.
  const inputs = dialog.locator('input');
  await expect(inputs.first()).toBeVisible(); // First name
  expect(await inputs.count()).toBeGreaterThanOrEqual(3); // first, last, email

  // Email input has type="email"
  await expect(dialog.locator('input[type="email"]')).toBeVisible();
  // Work Email placeholder
  await expect(dialog.locator('input[placeholder="sarah@epic.com"]')).toBeVisible();

  await pg.screenshot({ path: 'test-screenshots/2b-invite-fields.png' });
});

test('2c — Invite Team Member submit fires validation', async () => {
  const dialog = await openInviteModal(pg);

  await dialog.getByRole('button', { name: /send invitation/i }).click();
  await expect(dialog).toBeVisible({ timeout: 4000 });

  await pg.screenshot({ path: 'test-screenshots/2c-invite-validation.png' });
  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

/* ═══════════════════════════════════════════════════════════════════════
   3. Edit Plan Modal
═══════════════════════════════════════════════════════════════════════ */

test('3a — Edit Plan modal opens', async () => {
  const dialog = await openEditPlanModal(pg);
  await expect(dialog).toBeVisible();
  await pg.screenshot({ path: 'test-screenshots/3a-edit-plan-open.png' });
});

test('3b — Edit Plan modal loads existing data (fields pre-filled)', async () => {
  const dialog = await openEditPlanModal(pg);

  // Plan Name input: label "Plan Name", placeholder "e.g. Professional"
  // No name/id prop in JSX, but can match by placeholder
  const nameInput = dialog.locator('input[placeholder="e.g. Professional"]');
  await expect(nameInput).toBeVisible({ timeout: 8000 });

  const nameValue = await nameInput.inputValue();
  expect(nameValue.length, `Plan Name should be pre-filled but was empty`).toBeGreaterThan(0);

  // Price input: only number input in the form
  const priceInput = dialog.locator('input[type="number"]').first();
  await expect(priceInput).toBeVisible();
  const priceValue = await priceInput.inputValue();
  expect(priceValue.length, `Price should be pre-filled but was empty`).toBeGreaterThan(0);

  await pg.screenshot({ path: 'test-screenshots/3b-edit-plan-data.png' });
});

test('3c — Edit Plan save button is visible and enabled', async () => {
  const dialog = await openEditPlanModal(pg);

  const saveBtn = dialog.getByRole('button', { name: /update plan|save plan/i });
  await expect(saveBtn).toBeVisible();
  await expect(saveBtn).toBeEnabled();

  await pg.screenshot({ path: 'test-screenshots/3c-edit-plan-save.png' });
  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

/* ═══════════════════════════════════════════════════════════════════════
   4. Notification Preferences
═══════════════════════════════════════════════════════════════════════ */

test('4a — Notification Preferences modal opens', async () => {
  await pg.goto(`${BASE}/superadmin/notifications`);
  await waitForContent(pg);
  await pg.getByRole('button', { name: /preferences/i }).click();

  const dialog = pg.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await pg.screenshot({ path: 'test-screenshots/4a-notif-prefs-open.png' });
});

test('4b — Notification Preferences toggles function', async () => {
  // Re-open fresh
  await pg.goto(`${BASE}/superadmin/notifications`);
  await waitForContent(pg);
  await pg.getByRole('button', { name: /preferences/i }).click();
  const dialog = pg.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });

  const toggleRows = dialog.locator('.cursor-pointer');
  const count = await toggleRows.count();
  expect(count, 'Expected at least 1 toggle row').toBeGreaterThan(0);

  await toggleRows.first().click();
  await expect(dialog).toBeVisible();
  await pg.screenshot({ path: 'test-screenshots/4b-notif-prefs-toggle.png' });
});

test('4c — Notification Preferences Save button present', async () => {
  await pg.goto(`${BASE}/superadmin/notifications`);
  await waitForContent(pg);
  await pg.getByRole('button', { name: /preferences/i }).click();
  const dialog = pg.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });

  const saveBtn = dialog.getByRole('button', { name: /save/i });
  await expect(saveBtn).toBeVisible();
  await pg.screenshot({ path: 'test-screenshots/4c-notif-prefs-save.png' });

  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

/* ═══════════════════════════════════════════════════════════════════════
   5. Billing KPIs match Dashboard KPIs
   Note: Dashboard uses formatCurrency (abbreviates ≥1k); Billing uses
   formatCurrencyExact (always full). For this environment (MRR < £1k)
   both render identical text. Active Subscriptions is a plain integer
   — compared exactly.
═══════════════════════════════════════════════════════════════════════ */

test('5 — Billing Active Subscriptions matches Dashboard; MRR is non-zero on both', async () => {
  // ── Dashboard ─────────────────────────────────────────────────────────
  await pg.goto(`${BASE}/superadmin/dashboard`);
  await waitForContent(pg);

  // StatCard renders: <p class="text-xs ...">Active Subscriptions</p> then <h3 class="text-2xl ...">N</h3>
  const dashActiveSubs = await pg.locator('.p-5')
    .filter({ hasText: 'Active Subscriptions' })
    .locator('h3')
    .first()
    .textContent({ timeout: 8000 });

  const dashMRR = await pg.locator('.p-5')
    .filter({ hasText: 'Monthly Revenue' })
    .locator('h3')
    .first()
    .textContent({ timeout: 8000 });

  console.log(`Dashboard: MRR="${dashMRR?.trim()}"  ActiveSubs="${dashActiveSubs?.trim()}"`);
  await pg.screenshot({ path: 'test-screenshots/5a-dashboard-kpis.png' });

  // ── Billing ───────────────────────────────────────────────────────────
  await pg.goto(`${BASE}/superadmin/billing`);
  await waitForContent(pg);

  // Billing card: <p class="text-2xl ...">value</p>
  const billActiveSubs = await pg.locator('.p-5')
    .filter({ hasText: 'Active Subscriptions' })
    .locator('[class*="text-2xl"]')
    .first()
    .textContent({ timeout: 8000 });

  const billMRR = await pg.locator('.p-5')
    .filter({ hasText: 'Monthly Recurring' })
    .locator('[class*="text-2xl"]')
    .first()
    .textContent({ timeout: 8000 });

  console.log(`Billing:   MRR="${billMRR?.trim()}"  ActiveSubs="${billActiveSubs?.trim()}"`);
  await pg.screenshot({ path: 'test-screenshots/5b-billing-kpis.png' });

  // Active Subscriptions is a plain integer — must match exactly
  expect(dashActiveSubs?.trim(), 'Dashboard Active Subscriptions should be non-null').toBeTruthy();
  expect(billActiveSubs?.trim(), 'Billing Active Subscriptions should be non-null').toBeTruthy();
  expect(dashActiveSubs?.trim()).toBe(billActiveSubs?.trim());

  // MRR: just verify both are non-zero (formatting may differ for ≥£1k values)
  expect(dashMRR?.trim(), 'Dashboard MRR should be non-empty').toBeTruthy();
  expect(billMRR?.trim(), 'Billing MRR should be non-empty').toBeTruthy();
  expect(dashMRR?.trim()).not.toBe('£0.00');
  expect(billMRR?.trim()).not.toBe('£0.00');
});

/* ═══════════════════════════════════════════════════════════════════════
   6. Security Settings — HTTP 200, no ERR_ABORTED on security calls
═══════════════════════════════════════════════════════════════════════ */

test('6 — Security Settings: no abort, data loads, toggles visible', async () => {
  // Navigate first, then attach listeners to avoid capturing aborts from prior navigation
  await pg.goto(`${BASE}/superadmin/settings`);
  await waitForContent(pg);

  const abortedSecurity = [];
  const failedSecurity  = [];

  const onAbort = (req) => {
    const url = req.url();
    if (url.includes('/api/superadmin/security') || url.includes('/api/superadmin/settings')) {
      abortedSecurity.push(`ABORTED ${req.method()} ${url}`);
    }
  };
  const onResponse = (res) => {
    const url = res.url();
    if (
      (url.includes('/api/superadmin/security') || url.includes('/api/superadmin/settings')) &&
      res.status() >= 400
    ) {
      failedSecurity.push(`${res.status()} ${url}`);
    }
  };
  pg.on('requestfailed', onAbort);
  pg.on('response',      onResponse);

  // Click Security tab
  await pg.getByRole('button', { name: /security/i }).click();
  await pg.waitForSelector('text=Access Policy', { timeout: 10000 });

  pg.off('requestfailed', onAbort);
  pg.off('response',      onResponse);

  await pg.screenshot({ path: 'test-screenshots/6-security-settings.png' });

  expect(abortedSecurity, `Aborted: ${abortedSecurity.join(', ')}`).toHaveLength(0);
  expect(failedSecurity,  `Failed: ${failedSecurity.join(', ')}`).toHaveLength(0);

  await expect(pg.locator('text=Enforce MFA')).toBeVisible();
  await expect(pg.locator('text=IP Restrictions')).toBeVisible();
  await expect(pg.locator('text=Stay Logged In')).toBeVisible();
});

/* ═══════════════════════════════════════════════════════════════════════
   7. Console — no React warnings / uncaught errors
═══════════════════════════════════════════════════════════════════════ */

test('7 — No React warnings or uncaught errors across key pages', async ({ browser }) => {
  const context = await browser.newContext();
  const page    = await context.newPage();

  const issues = [];
  page.on('console', msg => {
    const t = msg.type(), text = msg.text();
    if (t !== 'error' && t !== 'warning') return;
    if (text.includes('favicon') || text.includes('net::ERR_') || text.includes('ResizeObserver') || text.includes('Violation')) return;
    if (text.includes('Warning:') || text.includes('React') || text.includes('Uncaught')) {
      issues.push(`[${t.toUpperCase()}] ${text}`);
    }
  });
  page.on('pageerror', err => issues.push(`[PAGEERROR] ${err.message}`));

  await login(page);

  const routes = [
    '/superadmin/dashboard',
    '/superadmin/organisations',
    '/superadmin/plans',
    '/superadmin/billing',
    '/superadmin/notifications',
    '/superadmin/settings',
  ];

  for (const route of routes) {
    await page.goto(`${BASE}${route}`);
    await waitForContent(page);
    await page.screenshot({ path: `test-screenshots/7-console-${route.split('/').pop()}.png` });
  }

  await context.close();

  expect(issues, `Console issues found:\n${issues.join('\n')}`).toHaveLength(0);
});

/* ═══════════════════════════════════════════════════════════════════════
   8. Accessibility — role="dialog", aria-modal, Escape, focus trap
═══════════════════════════════════════════════════════════════════════ */

test('8a — Modal has role=dialog and aria-modal=true', async () => {
  const dialog = await openCreateOrgModal(pg);

  expect(await dialog.getAttribute('role')).toBe('dialog');
  expect(await dialog.getAttribute('aria-modal')).toBe('true');

  await pg.screenshot({ path: 'test-screenshots/8a-modal-aria.png' });
  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

test('8b — Modal closes on Escape key', async () => {
  const dialog = await openCreateOrgModal(pg);
  await expect(dialog).toBeVisible();

  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 5000 });
  await pg.screenshot({ path: 'test-screenshots/8b-modal-escape.png' });
});

test('8c — Focus trap: Tab stays within the dialog', async () => {
  const dialog = await openCreateOrgModal(pg);
  await expect(dialog).toBeVisible();

  await pg.keyboard.press('Tab');
  await pg.keyboard.press('Tab');
  await pg.keyboard.press('Tab');

  const focusedEl = pg.locator(':focus');
  const dialogBox = await dialog.boundingBox();
  const focusBox  = await focusedEl.boundingBox();

  if (dialogBox && focusBox) {
    const inside =
      focusBox.x >= dialogBox.x - 5 &&
      focusBox.y >= dialogBox.y - 5 &&
      focusBox.x + focusBox.width  <= dialogBox.x + dialogBox.width  + 5 &&
      focusBox.y + focusBox.height <= dialogBox.y + dialogBox.height + 5;
    expect(inside, 'Focused element is outside the dialog').toBe(true);
  }

  await pg.screenshot({ path: 'test-screenshots/8c-focus-trap.png' });
  await pg.keyboard.press('Escape');
});

test('8d — Modal has aria-labelledby and aria-describedby', async () => {
  const dialog = await openCreateOrgModal(pg);

  // aria-labelledby must exist and point to a non-empty heading inside the dialog
  const labelledBy = await dialog.getAttribute('aria-labelledby');
  expect(labelledBy?.trim(), 'Modal must have aria-labelledby').toBeTruthy();

  // The title element referenced by aria-labelledby must be visible within the dialog
  const titleEl = dialog.locator(`#${labelledBy}`);
  await expect(titleEl).toBeVisible({ timeout: 5000 });
  const titleText = await titleEl.textContent();
  expect(titleText?.trim().length).toBeGreaterThan(0);

  // aria-describedby required when subtitle is present (Create Org modal has a subtitle)
  const describedBy = await dialog.getAttribute('aria-describedby');
  expect(describedBy?.trim(), 'Modal with subtitle must have aria-describedby').toBeTruthy();

  await pg.screenshot({ path: 'test-screenshots/8d-modal-aria-labelledby.png' });
  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

test('8e — Modal close button has aria-label', async () => {
  const dialog = await openCreateOrgModal(pg);

  // The close ✕ button is icon-only — must have aria-label
  const closeBtn = dialog.locator('button[aria-label="Close dialog"]');
  await expect(closeBtn).toBeVisible();

  await pg.screenshot({ path: 'test-screenshots/8e-close-btn-aria-label.png' });
  await pg.keyboard.press('Escape');
});

/* ═══════════════════════════════════════════════════════════════════════
   9. Notification Preferences Persistence
   Save → reload page → reopen modal → values persisted
═══════════════════════════════════════════════════════════════════════ */

test('9 — Notification Preferences persist across page reload', async () => {
  // Open preferences and read current state of first toggle
  await pg.goto(`${BASE}/superadmin/notifications`);
  await waitForContent(pg);
  await pg.getByRole('button', { name: /preferences/i }).click();
  const dialog = pg.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 5000 });

  // Wait for preferences to load from API
  await pg.waitForFunction(
    () => !document.querySelector('[role="dialog"] .animate-spin'),
    { timeout: 8000 }
  );

  // Read current state of first switch
  const firstSwitch = dialog.locator('[role="switch"]').first();
  await expect(firstSwitch).toBeVisible({ timeout: 5000 });
  const initialChecked = await firstSwitch.getAttribute('aria-checked');

  // Toggle it
  await firstSwitch.click();
  const afterToggle = await firstSwitch.getAttribute('aria-checked');
  expect(afterToggle).not.toBe(initialChecked);

  // Save
  await dialog.getByRole('button', { name: /save preferences/i }).click();
  // Wait for modal to close (save succeeded)
  await expect(dialog).not.toBeVisible({ timeout: 8000 });

  await pg.screenshot({ path: 'test-screenshots/9a-prefs-saved.png' });

  // Reload and reopen
  await pg.goto(`${BASE}/superadmin/notifications`);
  await waitForContent(pg);
  await pg.getByRole('button', { name: /preferences/i }).click();
  const dialog2 = pg.locator('[role="dialog"]');
  await expect(dialog2).toBeVisible({ timeout: 5000 });

  // Wait for API load
  await pg.waitForFunction(
    () => !document.querySelector('[role="dialog"] .animate-spin'),
    { timeout: 8000 }
  );

  const persistedSwitch = dialog2.locator('[role="switch"]').first();
  await expect(persistedSwitch).toBeVisible({ timeout: 5000 });
  const persistedChecked = await persistedSwitch.getAttribute('aria-checked');

  expect(persistedChecked, 'Preference should persist after save + reload').toBe(afterToggle);

  await pg.screenshot({ path: 'test-screenshots/9b-prefs-persisted.png' });
  await pg.keyboard.press('Escape');
});

/* ═══════════════════════════════════════════════════════════════════════
   10. Form Accessibility — name/id attrs on previously-broken modals
═══════════════════════════════════════════════════════════════════════ */

test('10a — Invite modal inputs now have name attributes', async () => {
  const dialog = await openInviteModal(pg);

  // Phase 3 fix: these inputs now have name props → id and name attributes on the DOM
  await expect(dialog.locator('input[name="first_name"]')).toBeVisible();
  await expect(dialog.locator('input[name="last_name"]')).toBeVisible();
  await expect(dialog.locator('input[name="email"]')).toBeVisible();

  await pg.screenshot({ path: 'test-screenshots/10a-invite-name-attrs.png' });
  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

test('10b — Plan modal inputs now have name attributes', async () => {
  const dialog = await openEditPlanModal(pg);

  // Phase 3 fix: plan modal inputs now have name attrs
  await expect(dialog.locator('input[name="plan_name"]')).toBeVisible();
  await expect(dialog.locator('input[name="plan_description"]')).toBeVisible();
  await expect(dialog.locator('input[name="plan_price"]')).toBeVisible();

  await pg.screenshot({ path: 'test-screenshots/10b-plan-name-attrs.png' });
  await pg.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible({ timeout: 3000 });
});

/* ═══════════════════════════════════════════════════════════════════════
   11. Remaining superadmin routes — page loads + key content visible
═══════════════════════════════════════════════════════════════════════ */

test('11a — Team page loads and member table renders', async () => {
  await pg.goto(`${BASE}/superadmin/team`);
  await waitForContent(pg);

  // Table with scope="col" headers (Phase 4 fix)
  await expect(pg.locator('th[scope="col"]').first()).toBeVisible({ timeout: 8000 });

  await pg.screenshot({ path: 'test-screenshots/11a-team-page.png' });
});

test('11b — Payments page loads and transactions table renders', async () => {
  await pg.goto(`${BASE}/superadmin/payments`);
  await waitForContent(pg);

  await expect(pg.locator('th[scope="col"]').first()).toBeVisible({ timeout: 8000 });

  await pg.screenshot({ path: 'test-screenshots/11b-payments-page.png' });
});

test('11c — Audit Log page loads and log table renders', async () => {
  await pg.goto(`${BASE}/superadmin/audit-log`);
  await waitForContent(pg);

  await expect(pg.locator('th[scope="col"]').first()).toBeVisible({ timeout: 8000 });

  await pg.screenshot({ path: 'test-screenshots/11c-audit-log-page.png' });
});

test('11d — Organisations page loads and table renders', async () => {
  await pg.goto(`${BASE}/superadmin/organisations`);
  await waitForContent(pg);

  await expect(pg.locator('th[scope="col"]').first()).toBeVisible({ timeout: 8000 });

  await pg.screenshot({ path: 'test-screenshots/11d-organisations-page.png' });
});

test('11e — Billing page loads with KPI cards', async () => {
  await pg.goto(`${BASE}/superadmin/billing`);
  await waitForContent(pg);

  // At least one KPI card
  await expect(pg.locator('.p-5').first()).toBeVisible({ timeout: 8000 });

  await pg.screenshot({ path: 'test-screenshots/11e-billing-page.png' });
});

test('11f — Plans page loads with at least one plan card', async () => {
  await pg.goto(`${BASE}/superadmin/plans`);
  await waitForContent(pg);

  // Edit button confirms plan data loaded
  await expect(pg.getByRole('button', { name: /edit plan/i }).first()).toBeVisible({ timeout: 8000 });

  await pg.screenshot({ path: 'test-screenshots/11f-plans-page.png' });
});
