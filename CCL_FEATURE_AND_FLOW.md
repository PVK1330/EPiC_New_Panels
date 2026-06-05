# Client Care Letter (CCL) — Feature, Flow & Pending Items

**Status:** Functionally complete and tested. Requires the two go-live steps in §7 to operate.
**Scope:** Dynamic, per-organisation CCL templates with tag substitution, per-case editing, `.docx` upload-and-edit, branded PDF issue, candidate download/sign — across Admin, Caseworker and Candidate.

---

## 1. Overview

The CCL is **stage 9 (`client_care_letter`)** of the 16-stage immigration workflow, between *Draft Application Review (8)* and *Application Submitted (10)*.

Previously the CCL was a **static `.docx`** copied per visa type — no personalisation. It is now **generated dynamically**: each org authors its own template(s) with `{{tags}}` that are filled per candidate (name, dates, fees, installment table, org logo) and rendered to a **branded PDF** the candidate downloads and signs.

**Generation precedence (used everywhere):**
1. Per-case `draftHtml` (a caseworker/admin edited or uploaded letter for this one case)
2. Org `CclTemplate` (visa-specific active → org default), tags interpolated
3. Legacy `.docx` fallback (only if no DB template/draft exists)

---

## 2. Architecture

| Layer | Component |
|---|---|
| Data | `ccl_templates` (per-tenant table → per-org), `case_ccl_records.draft_html` |
| Tags | `cclTags.service.js` — registry (24 tags / 4 groups), context builder, interpolation, `amountToWords`, installment table |
| Generation | `cclGenerator.service.js` — resolve template → fill tags → `html-to-pdfmake` → branded PDF (org logo letterhead via `Organisation.logoUrl`, normalised to PNG by `sharp`) |
| Issue point | `cclTemplate.service.js → attachCclTemplateToCase()` — single generation point used by **every** issue path (admin fee flow, candidate lazy-render, caseworker panel) |
| APIs | `modules/Shared/Ccl/` mounted at `/api/ccl`, gated **Admin + Caseworker** |
| Seeders | default CCL template, visa document checklists, process email templates |
| UI | Admin/Caseworker: template manager (Quill + tag palette + preview) and per-case panel (edit / upload .docx / preview / issue). Candidate: view / download / sign |

---

## 3. End-to-end flow

### A. One-time setup — Admin or Caseworker
`Settings → CCL Templates` (admin) / `Caseworker → CCL Templates`:
- Create a template — **organisation default** or **per visa type** — using the `{{tag}}` palette.
- **Preview** renders sample data + the org logo.
- A sensible **default template is seeded automatically**, so issuing works on day one.

### B. Per-case — Caseworker/Admin (case → "Client Care Letter" tab)
1. Open the tab → the letter is **auto-filled** from the matching template with the candidate's real data (or shows the saved draft).
2. Personalise via any of: **edit** in the rich editor · **Upload .docx** (converted to editable HTML) · **Regenerate from template**.
3. **Save draft** / **Preview PDF**.
4. **Issue letter** → generates the final branded PDF and sets `status = issued` → **released to the candidate**.
   - The **CCL fee** is set via the fee flow (admin), which sets the amount, advances the case stage, and emails the candidate. *(Today, Issue and fee/email are separate steps — see §6 item 3.)*

### C. Candidate — candidate portal → "Client Care Letter"
1. Once released (`status = issued`, or stage reached, or fee approved), the candidate **sees and downloads** the personalised PDF.
2. **Signs**, uploads the signed copy (`signedDocumentId`), and **pays** the fee.

### D. Gate
**Submission (stage 10) is blocked** until the CCL is **issued AND signed AND fee paid/partial** (`assertSubmissionGate`).

```
Template (org default / per visa)         ── one-time, admin/caseworker
        │  (tags filled per candidate)
        ▼
Per-case draft  ── edit / upload .docx / regenerate ── save / preview
        │
        ▼  Issue  (status = issued → released)
Branded PDF (org logo + candidate data) ──► Candidate: download → sign → pay
        │
        ▼  issued + signed + paid
   Submission gate opens (stage 10)
```

---

## 4. Tag reference

Grouped, available in the editor palette and `GET /api/ccl/templates/tags`.

- **Organisation:** `org_name`, `org_logo`*, `org_address`, `org_email`, `org_phone`
- **Candidate:** `candidate_name`, `candidate_first_name`, `candidate_email`, `candidate_address`, `candidate_phone`, `candidate_dob`, `passport_number`, `nationality`
- **Case:** `case_ref`, `visa_type`, `petition_type`, `caseworker_name`, `date_today`, `date_issued`
- **Fees:** `proposed_amount`, `total_amount`, `fee_amount`, `amount_in_words`, `installment_plan`*

\*`org_logo` is rendered as the letterhead image (not inline); `installment_plan` renders an HTML table.

---

## 5. API reference (`/api/ccl`, Admin + Caseworker)

**Templates**
| Method | Path | Purpose |
|---|---|---|
| GET | `/templates/tags` | Tag registry for the palette |
| GET | `/templates` | List templates |
| POST | `/templates` | Create (auto-deactivates prior active for the slot) |
| GET | `/templates/:id` | Get one |
| PUT | `/templates/:id` | Update |
| DELETE | `/templates/:id` | Delete |
| POST | `/templates/preview` | Render unsaved HTML + sample data → PDF |

**Per-case**
| Method | Path | Purpose |
|---|---|---|
| GET | `/cases/:caseId` | Editable letter (draft or template-filled) + `source`/`hasTemplate` |
| PUT | `/cases/:caseId/draft` | Save `draftHtml` |
| POST | `/cases/:caseId/draft/import` | Upload `.docx` → editable HTML draft |
| POST | `/cases/:caseId/preview` | Preview the case CCL → PDF |
| POST | `/cases/:caseId/issue` | (Re)generate the issued PDF from draft/template |

---

## 6. Pending items

### 🔴 Required to go live (operational)
1. **Run tenant migrations** — `npm run migrate:tenants` (adds `ccl_templates`, `draft_html`). Without it the CCL APIs 500 on existing tenants.
2. **Set `CSRF_SECRET`** in production (≥32 chars, ≠ `JWT_SECRET`) — server refuses to boot otherwise.

### 🟡 Behaviour to tighten (medium)
3. **"Issue letter" does not email the candidate.** Issue sets `status = issued` (candidate can see/download) and generates the PDF, but the `ccl_issued` email + fee amount + stage move come from the separate CCL-fee flow. *Recommend:* have `issueCaseCcl` also send the `ccl_issued` email (and optionally release the stage).
4. **Re-issue after signing.** Re-issuing regenerates the issued document; if the candidate already signed, the signature refers to an older version. *Recommend:* block/warn on re-issue once `status === "signed"`.

### 🟢 Polish (low)
5. **Header/footer not editable** in the template editor (model + generator support them; preview ignores them). Add fields or drop the columns.
6. **No `zod` validation** on `/api/ccl/*` (other routes use `validate()`).
7. **Deprecated `.docx` per-visa upload** still shown in Admin Settings → Visa & Petitions (superseded — hide to avoid confusion).
8. **Sponsor Licence** seeder still `createIfMissing: true` (creates a "Sponsor Licence" case visa type) — decide keep/remove.
9. **`.docx` import** yields basic HTML (advanced Word layout/images simplify) — acceptable; note for users.

### ⚪ Pre-existing (not from this feature)
10. 5 backend tests fail: 2 use `@jest/globals` (not installed; project uses `node:test`), 3 need a live DB/socket. New `tests/ccl.test.js`: **9/9 pass**.
11. Pre-existing unused-import lint errors in `AdminCaseDetail.jsx`, `Cases.jsx`, `AdminSettings.jsx`.

---

## 7. Go-live checklist
1. `npm run migrate:tenants` (apply `ccl_templates` + `draft_html`).
2. Set `CSRF_SECRET` (and confirm `JWT_SECRET`) in the server `.env`.
3. Restart the server → seeders create the default CCL template, visa checklists, and process email templates for each tenant.
4. (Optional) implement medium item #3 so the per-case "Issue" notifies the candidate.

---

## 8. Key files

**Backend**
- `Server/src/models/tenant/cclTemplate.model.js`, `caseCclRecord.model.js` (`draft_html`)
- `Server/src/migrations/tenants/20260605120000-create-ccl-templates.sql`, `…130000-add-draft-html-to-ccl-records.sql`
- `Server/src/services/cclTags.service.js`, `cclGenerator.service.js`, `cclTemplate.service.js`
- `Server/src/modules/Shared/Ccl/ccl.controller.js`, `ccl.routes.js`
- `Server/src/seeders/cclTemplate.seeder.js`, `documentChecklist.seeder.js`, `workflowEmailTemplates.seeder.js`
- `Server/src/constants/visaDocumentChecklists.js`
- `Server/tests/ccl.test.js`

**Frontend**
- `EPiC_Frontend/src/services/cclApi.js`
- `EPiC_Frontend/src/components/admin/settings/CclTemplateEditor.jsx`, `CclTemplateSettings.jsx`
- `EPiC_Frontend/src/components/caseDetail/CaseDetailCcl.jsx`
- `EPiC_Frontend/src/pages/caseworker/CaseworkerCclTemplates.jsx`
- Wiring: `AdminSettings.jsx`, `AdminCaseDetail.jsx`, `caseDetailData.js`, `caseworker/Cases.jsx`, `caseworkerNavSections.js`, `routes/AppRouter.jsx`
