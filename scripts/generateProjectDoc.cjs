/*
 * generateProjectDoc.cjs
 * Builds a Microsoft Word-compatible (.doc) client workflow guide for the
 * EPiC Case CRM from the structured multi-agent review output.
 *
 * Output: docs/EPiC_CRM_Project_Workflow.doc  (Word HTML — opens natively in
 * Microsoft Word, Google Docs and LibreOffice).
 */
const fs = require('fs');

const INPUT =
  'C:/Users/pkk22/AppData/Local/Temp/claude/c--Users-pkk22-OneDrive-Desktop-TECHNOWEB-CMS-Admin-EPiC-API-EPiC-Frontend/102ee9f2-2399-4627-b5c8-11491bc5ab43/tasks/wobgxfjh9.output';
const OUTPUT =
  'C:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/CMS_Admin/EPiC_API/EPiC_Frontend/docs/EPiC_CRM_Project_Workflow.doc';

const DOC_TITLE = 'EPiC Case CRM';
const DOC_SUBTITLE = 'Platform Workflow & Functional Guide';
const DOC_DATE = '20 June 2026';

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const data = raw.result || raw;
const panels = data.panels || {};
const topics = data.topics || {};

// ---- helpers ---------------------------------------------------------------
const esc = (s) =>
  s == null
    ? ''
    : String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

const paras = (text) => {
  if (!text) return '';
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => `<p class=Body>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
};

const bullets = (arr) =>
  !arr || !arr.length
    ? ''
    : `<ul>${arr.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`;

const numSteps = (arr) =>
  !arr || !arr.length
    ? ''
    : `<ol>${arr.map((b) => `<li>${esc(b)}</li>`).join('')}</ol>`;

const stripLeadNum = (s) => String(s || '').replace(/^\s*\d+[.)]\s*/, '');

const pageBreak = `<br clear=all style='page-break-before:always'>`;

let TOC = [];
const tocAdd = (num, title) => TOC.push({ num, title });

// ---- panel renderer --------------------------------------------------------
function renderPanel(num, title, p) {
  if (!p) return `<h1>${num}. ${esc(title)}</h1><p class=Body><i>Section data unavailable.</i></p>`;
  tocAdd(num, title);
  let h = `<h1>${num}. ${esc(title)}</h1>`;
  if (p.oneLineSummary) h += `<p class=Lead>${esc(p.oneLineSummary)}</p>`;

  h += `<table class=meta><tr><td class=metaKey>Who uses it</td><td>${esc(p.audience || '')}</td></tr>`;
  h += `<tr><td class=metaKey>Web address</td><td><span class=mono>${esc(p.routePrefix || '')}</span></td></tr></table>`;

  let sub = 1;
  if (p.overview) {
    h += `<h2>${num}.${sub++} Overview</h2>${paras(p.overview)}`;
  }

  if (p.navigation && p.navigation.length) {
    h += `<h2>${num}.${sub++} Navigation &amp; menu</h2>`;
    h += `<table class=grid><tr><th style='width:22%'>Menu item</th><th style='width:24%'>Address</th><th>What it does</th></tr>`;
    p.navigation.forEach((n) => {
      h += `<tr><td><b>${esc(n.label)}</b></td><td><span class=mono>${esc(n.route || '')}</span></td><td>${esc(n.description || '')}</td></tr>`;
    });
    h += `</table>`;
  }

  if (p.keyPages && p.keyPages.length) {
    h += `<h2>${num}.${sub++} Screens &amp; features</h2>`;
    p.keyPages.forEach((pg) => {
      h += `<h3>${esc(pg.name)}${pg.route ? ` <span class=routeTag>${esc(pg.route)}</span>` : ''}</h3>`;
      if (pg.purpose) h += `<p class=Body>${esc(pg.purpose)}</p>`;
      if (pg.features && pg.features.length) h += bullets(pg.features);
    });
  }

  if (p.workflows && p.workflows.length) {
    h += `<h2>${num}.${sub++} Key workflows</h2>`;
    p.workflows.forEach((w) => {
      h += `<h3>${esc(w.name)}</h3>`;
      if (w.description) h += `<p class=Body>${esc(w.description)}</p>`;
      if (w.steps && w.steps.length) h += numSteps(w.steps);
    });
  }

  if (p.businessRules && p.businessRules.length) {
    h += `<h2>${num}.${sub++} Business rules &amp; safeguards</h2>${bullets(p.businessRules)}`;
  }

  if (p.integrations && p.integrations.length) {
    h += `<h2>${num}.${sub++} Integrations</h2>${bullets(p.integrations)}`;
  }

  if (p.backend && (p.backend.summary || (p.backend.modules || []).length)) {
    h += `<h2>${num}.${sub++} Behind the scenes (technical)</h2>`;
    if (p.backend.summary) h += paras(p.backend.summary);
    if (p.backend.modules && p.backend.modules.length) {
      h += `<p class=Body><b>Backend modules:</b></p>${bullets(p.backend.modules)}`;
    }
    if (p.backend.keyEndpoints && p.backend.keyEndpoints.length) {
      h += `<p class=Body><b>Key API endpoints:</b></p><ul>${p.backend.keyEndpoints
        .map((e) => `<li><span class=mono>${esc(e)}</span></li>`)
        .join('')}</ul>`;
    }
  }
  return h;
}

// ---- topic renderer --------------------------------------------------------
function renderTopic(num, title, t) {
  if (!t) return `<h1>${num}. ${esc(title)}</h1><p class=Body><i>Section data unavailable.</i></p>`;
  tocAdd(num, title);
  let h = `<h1>${num}. ${esc(title)}</h1>`;
  if (t.summary) h += `<p class=Lead>${esc(t.summary)}</p>`;
  let sub = 1;
  (t.sections || []).forEach((s) => {
    h += `<h2>${num}.${sub++} ${esc(stripLeadNum(s.heading))}</h2>`;
    if (s.body) h += paras(s.body);
    if (s.bullets && s.bullets.length) h += bullets(s.bullets);
  });
  if (t.flowSteps && t.flowSteps.length) {
    h += `<h2>${num}.${sub++} End-to-end flow</h2>`;
    h += `<div class=flowbox>${numSteps(t.flowSteps)}</div>`;
  }
  return h;
}

// ---- counts for executive summary -----------------------------------------
const panelKeys = ['superadmin', 'admin', 'caseworker', 'candidate', 'business'];
const totalPages = panelKeys.reduce(
  (acc, k) => acc + ((panels[k] && panels[k].keyPages) ? panels[k].keyPages.length : 0),
  0
);

// ---- executive summary (section 1) ----------------------------------------
tocAdd(1, 'Executive Summary');
const execSummary = `
<h1>1. Executive Summary</h1>
<p class=Lead>EPiC Case CRM is a multi-tenant, cloud-based case-management platform built for UK immigration advisory firms. It runs an entire firm's day-to-day operations — from the first client enquiry through to a granted visa or sponsor licence — and is sold as a subscription service to many separate firms at once.</p>

<h2>1.1 What the platform does</h2>
<p class=Body>The system brings five different audiences together on one platform, each with their own secure, role-specific portal ("panel"):</p>
<ul>
<li><b>The platform owner (Superadmin)</b> — the company that sells EPiC. They onboard client firms, set the subscription plans and pricing, and oversee the whole platform.</li>
<li><b>The firm administrator (Admin)</b> — the manager at a client firm who oversees all cases, staff, finance and settings for that one firm.</li>
<li><b>The caseworker</b> — the immigration adviser who handles the day-to-day work on individual cases.</li>
<li><b>The candidate</b> — the individual visa applicant, who uses a self-service portal to submit information, upload documents, pay and track progress.</li>
<li><b>The business / sponsor</b> — an employer applying for and holding a UK Sponsor Licence so it can employ overseas workers.</li>
</ul>

<h2>1.2 How it is structured</h2>
<p class=Body>EPiC is a "software-as-a-service" (SaaS) product. Each client firm is a separate <b>tenant</b> (called an "organisation") whose data is isolated from every other firm. The platform owner manages all tenants centrally, while each tenant runs independently with its own staff, clients, branding and subscription. A single shared engine powers common features — messaging, notifications, documents, calendars, tasks and audit trails — across every panel.</p>

<table class=meta>
<tr><td class=metaKey>Product</td><td>EPiC Case CRM — Immigration case &amp; sponsor-licence management</td></tr>
<tr><td class=metaKey>Model</td><td>Multi-tenant SaaS (one platform, many isolated firms)</td></tr>
<tr><td class=metaKey>User panels</td><td>5 working panels: Superadmin, Admin, Caseworker, Candidate, Business/Sponsor (plus Staff &amp; Agent placeholders)</td></tr>
<tr><td class=metaKey>Screens documented</td><td>${totalPages}+ distinct screens across the five panels</td></tr>
<tr><td class=metaKey>Technology</td><td>React single-page web app · Node.js/Express API · SQL database (platform + per-tenant) · real-time websockets · Stripe payments</td></tr>
</table>

<h2>1.3 How to read this document</h2>
<p class=Body>Section 2 explains the technical foundation, user roles and security in plain language. Sections 3 to 7 walk through each of the five panels in turn — who uses it, what every screen does, and the step-by-step workflows the user performs. Section 8 follows the platform's headline feature, the Sponsor Licence journey, end to end across panels. Section 9 covers the shared services that appear everywhere, and Section 10 covers the commercial subscription and billing layer. A glossary of terms closes the document.</p>
`;

// ---- assemble sections -----------------------------------------------------
const sections = [];
sections.push(execSummary);
sections.push(renderTopic(2, 'Platform Architecture, Roles & Security', topics['architecture']));
sections.push(renderPanel(3, 'Superadmin Panel — Platform Owner', panels['superadmin']));
sections.push(renderPanel(4, 'Admin Panel — Firm Administrator', panels['admin']));
sections.push(renderPanel(5, 'Caseworker Panel — Immigration Adviser', panels['caseworker']));
sections.push(renderPanel(6, 'Candidate Panel — Visa Applicant', panels['candidate']));
sections.push(renderPanel(7, 'Business / Sponsor Panel — Employer', panels['business']));
sections.push(renderTopic(8, 'The Sponsor Licence Journey — End to End', topics['sponsor-licence']));
sections.push(renderTopic(9, 'Shared Services Across All Panels', topics['shared-services']));
sections.push(renderTopic(10, 'Subscription, Billing & Modules', topics['billing']));

// ---- glossary (section 11) -------------------------------------------------
tocAdd(11, 'Glossary of Terms');
const glossary = [
  ['CRM', 'Customer Relationship Management — software that manages a firm’s clients, cases and interactions in one place.'],
  ['Tenant / Organisation', 'A single client firm on the platform. Each tenant’s data is fully isolated from every other tenant.'],
  ['Superadmin', 'The platform owner (the SaaS provider) who runs the whole platform and manages all tenants.'],
  ['Admin', 'A client firm’s administrator/manager, who oversees that one firm’s cases, staff and settings.'],
  ['Caseworker', 'An immigration adviser who works individual cases day to day.'],
  ['Candidate', 'An individual visa applicant using the self-service portal.'],
  ['Sponsor / Business', 'An employer applying for or holding a UK Sponsor Licence to employ overseas workers.'],
  ['Sponsor Licence', 'UK Home Office permission that lets an employer sponsor migrant workers.'],
  ['CoS — Certificate of Sponsorship', 'An electronic record a licensed sponsor assigns to a worker so they can apply for a visa.'],
  ['CCL — Client Care Letter', 'A regulator-required letter setting out the work the firm will do and the fees, which the client reviews and accepts.'],
  ['Right to Work', 'Checks confirming a worker is legally allowed to work in the UK.'],
  ['Data Capture Sheet', 'A structured form the candidate completes so the firm has all the information needed for the application.'],
  ['UKVI', 'UK Visas and Immigration — the Home Office division handling visa applications.'],
  ['SLA', 'Service-Level Agreement — a target turnaround time; the system flags breaches.'],
  ['Module', 'A switchable feature area. Modules are bundled into subscription plans to control what each firm can use.'],
  ['Plan', 'A subscription tier (price + billing cycle + included modules) that a firm subscribes to.'],
  ['MRR / ARR', 'Monthly / Annual Recurring Revenue — standard subscription-business revenue measures.'],
  ['Impersonation ("Login as")', 'A secure feature letting the platform owner view a tenant exactly as that tenant’s admin sees it.'],
  ['Audit Log / Timeline', 'A locked, chronological record of who did what and when, used for compliance.'],
];
let glossaryHtml = `<h1>11. Glossary of Terms</h1><table class=grid><tr><th style='width:28%'>Term</th><th>Meaning</th></tr>`;
glossary.forEach(([t, d]) => {
  glossaryHtml += `<tr><td><b>${esc(t)}</b></td><td>${esc(d)}</td></tr>`;
});
glossaryHtml += `</table>`;
sections.push(glossaryHtml);

// ---- table of contents -----------------------------------------------------
const tocHtml = `
<div class=toc>
<h1 class=noTopRule>Table of Contents</h1>
<table class=tocTable>
${TOC.map((t) => `<tr><td class=tocNum>${t.num}.</td><td class=tocTitle>${esc(t.title)}</td></tr>`).join('\n')}
</table>
</div>`;

// ---- cover -----------------------------------------------------------------
const cover = `
<div class=cover>
  <p class=coverKicker>CLIENT DOCUMENTATION</p>
  <p class=coverTitle>${esc(DOC_TITLE)}</p>
  <p class=coverSub>${esc(DOC_SUBTITLE)}</p>
  <div class=coverRule></div>
  <p class=coverBlurb>A complete, plain-English guide to how the platform works &mdash; every panel, every workflow, end to end.</p>
  <table class=coverMeta>
    <tr><td>Document</td><td>Project Workflow &amp; Functional Guide</td></tr>
    <tr><td>Audience</td><td>Client / Stakeholders</td></tr>
    <tr><td>Version</td><td>1.0</td></tr>
    <tr><td>Date</td><td>${esc(DOC_DATE)}</td></tr>
  </table>
</div>`;

// ---- full document ---------------------------------------------------------
const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${esc(DOC_TITLE)} — ${esc(DOC_SUBTITLE)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
<style>
@page Section1 {
  size: 21cm 29.7cm;
  margin: 2.0cm 2.0cm 2.0cm 2.0cm;
  mso-header-margin: 1.2cm;
  mso-footer-margin: 1.2cm;
  mso-footer: f1;
}
div.Section1 { page: Section1; }
body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11.0pt; color: #232a31; line-height: 1.45; }
h1 { font-size: 19pt; color: #14365c; border-bottom: 2.5pt solid #2E7CD6; padding-bottom: 4pt; margin: 26pt 0 12pt 0; mso-style-next: Body; page-break-after: avoid; }
h1.noTopRule { border-bottom: 2.5pt solid #2E7CD6; }
h2 { font-size: 13.5pt; color: #1b4a7a; margin: 18pt 0 6pt 0; page-break-after: avoid; }
h3 { font-size: 11.5pt; color: #2E7CD6; margin: 13pt 0 3pt 0; page-break-after: avoid; }
p { margin: 0 0 8pt 0; }
p.Body { margin: 0 0 8pt 0; }
p.Lead { font-size: 11.5pt; font-style: italic; color:#37506b; background:#eef5fc; border-left:3pt solid #2E7CD6; padding:8pt 12pt; margin:0 0 12pt 0; }
ul, ol { margin: 0 0 10pt 0; }
li { margin: 0 0 4pt 0; }
span.mono, .mono { font-family: 'Consolas', 'Courier New', monospace; font-size: 9.5pt; color: #0a5c8a; background:#f1f5f9; padding:1pt 4pt; }
span.routeTag, .routeTag { font-family: 'Consolas','Courier New',monospace; font-size:9pt; color:#5b6b7a; font-weight:normal; }
table.grid { border-collapse: collapse; width: 100%; margin: 4pt 0 12pt 0; }
table.grid th { background: #14365c; color: #ffffff; text-align: left; padding: 6pt 8pt; font-size: 10pt; border: 0.5pt solid #14365c; }
table.grid td { border: 0.5pt solid #c3cfdb; padding: 5pt 8pt; font-size: 10pt; vertical-align: top; }
table.grid tr { mso-yfti-irow: 0; }
table.meta { border-collapse: collapse; width: 100%; margin: 4pt 0 12pt 0; background:#f7fafd; }
table.meta td { border: 0.5pt solid #d4dde7; padding: 5pt 9pt; font-size: 10pt; vertical-align: top; }
td.metaKey { background:#eaf1f8; font-weight:bold; color:#14365c; width: 22%; }
div.flowbox { background:#f3f8ff; border:0.5pt solid #b9d4f0; padding:6pt 14pt; margin:6pt 0 12pt 0; }
/* Cover */
div.cover { text-align:left; padding-top: 120pt; }
p.coverKicker { letter-spacing: 4pt; font-size: 11pt; color: #2E7CD6; font-weight: bold; margin-bottom: 18pt; }
p.coverTitle { font-size: 46pt; font-weight: bold; color: #14365c; margin: 0; line-height: 1.05; }
p.coverSub { font-size: 20pt; color: #46627d; margin: 6pt 0 0 0; }
div.coverRule { height: 3pt; background: #2E7CD6; width: 40%; margin: 22pt 0; }
p.coverBlurb { font-size: 13pt; color: #46627d; font-style: italic; margin-bottom: 60pt; width:80%; }
table.coverMeta { border-collapse: collapse; margin-top: 30pt; }
table.coverMeta td { padding: 5pt 14pt 5pt 0; font-size: 11pt; color:#37506b; }
table.coverMeta td:first-child { font-weight:bold; color:#14365c; }
/* TOC */
div.toc { margin-top: 6pt; }
table.tocTable { border-collapse: collapse; margin-top: 8pt; }
td.tocNum { font-weight:bold; color:#2E7CD6; padding: 4pt 12pt 4pt 0; font-size: 12pt; vertical-align:top; }
td.tocTitle { padding: 4pt 0; font-size: 12pt; color:#1b3a5a; }
p.MsoFooter { font-size: 8.5pt; color:#7a8896; border-top:0.5pt solid #d4dde7; padding-top:4pt; }
</style>
</head>
<body>
<div class=Section1>
${cover}
${pageBreak}
${tocHtml}
${pageBreak}
${sections.join('\n' + pageBreak + '\n')}

<div style='mso-element:footer' id=f1>
<p class=MsoFooter>${esc(DOC_TITLE)} &mdash; ${esc(DOC_SUBTITLE)}<span style='mso-tab-count:1'></span>Page <!--[if supportFields]><span style='mso-element:field-begin'></span>PAGE<span style='mso-element:field-end'></span><![endif]--></p>
</div>
</div>
</body>
</html>`;

fs.writeFileSync(OUTPUT, html, 'utf8');
console.log('Wrote ' + OUTPUT);
console.log('Bytes: ' + Buffer.byteLength(html, 'utf8'));
console.log('Sections: ' + sections.length + ' | TOC entries: ' + TOC.length + ' | Screens counted: ' + totalPages);
