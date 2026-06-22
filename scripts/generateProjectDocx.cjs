/*
 * generateProjectDocx.cjs
 * Builds a genuine Microsoft Word .docx (OOXML / WordprocessingML) client
 * workflow guide for the EPiC Case CRM from the structured multi-agent review.
 * Uses `archiver` (already present in the Server's node_modules) to assemble
 * the .docx ZIP package — no network, no extra dependencies.
 *
 * Output: docs/EPiC_CRM_Project_Workflow.docx
 */
const fs = require('fs');
const archiver = require('c:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/CMS_Admin/EPiC_API/Server/node_modules/archiver');

const INPUT =
  'C:/Users/pkk22/AppData/Local/Temp/claude/c--Users-pkk22-OneDrive-Desktop-TECHNOWEB-CMS-Admin-EPiC-API-EPiC-Frontend/102ee9f2-2399-4627-b5c8-11491bc5ab43/tasks/wobgxfjh9.output';
const OUTPUT =
  'C:/Users/pkk22/OneDrive/Desktop/TECHNOWEB/CMS_Admin/EPiC_API/EPiC_Frontend/docs/EPiC_CRM_Project_Workflow.docx';

const DOC_TITLE = 'EPiC Case CRM';
const DOC_SUBTITLE = 'Platform Workflow & Functional Guide';
const DOC_DATE = '20 June 2026';

const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const data = raw.result || raw;
const panels = data.panels || {};
const topics = data.topics || {};

// ===== XML helpers ==========================================================
const escXml = (s) =>
  s == null
    ? ''
    : String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\t/g, ' ');

const CW = 9638; // usable page width in twips (A4 minus 2cm margins)

// numbered-list ids are allocated as we render, so each list restarts at 1
let numberedIds = [];
const allocNumId = () => {
  const id = 1000 + numberedIds.length;
  numberedIds.push(id);
  return id;
};
const stripLeadNum = (s) => String(s || '').replace(/^\s*\d+[.)]\s*/, '');

// ----- block builders -------------------------------------------------------
const h1 = (t) =>
  `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">${escXml(t)}</w:t></w:r></w:p>`;
const h2 = (t) =>
  `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t xml:space="preserve">${escXml(t)}</w:t></w:r></w:p>`;
const h3 = (t) =>
  `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr><w:r><w:t xml:space="preserve">${escXml(t)}</w:t></w:r></w:p>`;

const h3route = (name, route) => {
  const r = route
    ? `<w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:b w:val="0"/><w:color w:val="5B6B7A"/><w:sz w:val="17"/></w:rPr><w:t xml:space="preserve">    ${escXml(route)}</w:t></w:r>`
    : '';
  return `<w:p><w:pPr><w:pStyle w:val="Heading3"/></w:pPr><w:r><w:t xml:space="preserve">${escXml(name)}</w:t></w:r>${r}</w:p>`;
};

const bodyPara = (text) => {
  const lines = String(text).split(/\n/);
  const runs = lines
    .map(
      (ln, i) =>
        `${i > 0 ? '<w:r><w:br/></w:r>' : ''}<w:r><w:t xml:space="preserve">${escXml(ln)}</w:t></w:r>`
    )
    .join('');
  return `<w:p>${runs}</w:p>`;
};
const bodyBlock = (text) =>
  !text
    ? ''
    : String(text)
        .split(/\n\s*\n/)
        .map((p) => bodyPara(p.trim()))
        .join('');

const leadPara = (text) =>
  `<w:p><w:pPr><w:shd w:val="clear" w:color="auto" w:fill="EEF5FC"/><w:pBdr><w:left w:val="single" w:sz="24" w:space="6" w:color="2E7CD6"/></w:pBdr><w:spacing w:before="60" w:after="200"/><w:ind w:left="140" w:right="140"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="37506B"/></w:rPr><w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`;

const labelPara = (text) =>
  `<w:p><w:pPr><w:spacing w:before="80" w:after="40"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`;

function bulletItem(text, boldLead) {
  let runs;
  if (boldLead && text.includes(' — ')) {
    const idx = text.indexOf(' — ');
    runs =
      `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escXml(text.slice(0, idx))}</w:t></w:r>` +
      `<w:r><w:t xml:space="preserve">${escXml(text.slice(idx))}</w:t></w:r>`;
  } else {
    runs = `<w:r><w:t xml:space="preserve">${escXml(text)}</w:t></w:r>`;
  }
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>${runs}</w:p>`;
}
const bulletList = (arr, boldLead) => (arr || []).map((x) => bulletItem(x, boldLead)).join('');

function numberedList(arr) {
  if (!arr || !arr.length) return '';
  const id = allocNumId();
  return arr
    .map(
      (it) =>
        `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="${id}"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escXml(it)}</w:t></w:r></w:p>`
    )
    .join('');
}

const monoEndpoints = (arr) =>
  (arr || [])
    .map(
      (e) =>
        `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/><w:color w:val="0A5C8A"/></w:rPr><w:t xml:space="preserve">${escXml(e)}</w:t></w:r></w:p>`
    )
    .join('');

function cell(spec, w) {
  const o = spec && typeof spec === 'object' ? spec : { text: spec == null ? '' : String(spec) };
  const shd = o.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${o.fill}"/>` : '';
  const rpr =
    `${o.bold ? '<w:b/>' : ''}` +
    `${o.color ? `<w:color w:val="${o.color}"/>` : ''}` +
    `${o.mono ? '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="18"/>' : ''}`;
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${shd}<w:vAlign w:val="top"/></w:tcPr><w:p><w:pPr><w:spacing w:before="20" w:after="20" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${rpr}</w:rPr><w:t xml:space="preserve">${escXml(o.text)}</w:t></w:r></w:p></w:tc>`;
}

function tableXml(widthsPct, headers, rows) {
  const widths = widthsPct.map((p) => Math.round((CW * p) / 100));
  const grid = `<w:tblGrid>${widths.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`;
  const b = (n) => `<w:${n} w:val="single" w:sz="4" w:space="0" w:color="C3CFDB"/>`;
  const borders = `<w:tblBorders>${b('top')}${b('left')}${b('bottom')}${b('right')}${b('insideH')}${b('insideV')}</w:tblBorders>`;
  const tblPr = `<w:tblPr><w:tblW w:w="5000" w:type="pct"/>${borders}<w:tblLayout w:type="fixed"/><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr>`;
  let rowsXml = '';
  if (headers) {
    rowsXml += `<w:tr><w:trPr><w:tblHeader/></w:trPr>${headers
      .map((hd, i) => cell({ text: hd, fill: '14365C', bold: true, color: 'FFFFFF' }, widths[i]))
      .join('')}</w:tr>`;
  }
  rows.forEach((r) => {
    rowsXml += `<w:tr>${r.map((c, i) => cell(c, widths[i])).join('')}</w:tr>`;
  });
  return `<w:tbl>${tblPr}${grid}${rowsXml}</w:tbl><w:p><w:pPr><w:spacing w:after="120" w:line="120" w:lineRule="auto"/></w:pPr></w:p>`;
}

const pageBreakP = () => `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
const spacerP = () => `<w:p/>`;

// ===== content model ========================================================
let TOC = [];
const tocAdd = (n, t) => TOC.push({ n, t });
const KEY = { bold: true, fill: 'EAF1F8', color: '14365C' };

function renderPanel(num, title, p) {
  if (!p) return h1(`${num}. ${title}`) + bodyPara('Section data unavailable.');
  tocAdd(num, title);
  let x = h1(`${num}. ${title}`);
  if (p.oneLineSummary) x += leadPara(p.oneLineSummary);
  x += tableXml(
    [22, 78],
    null,
    [
      [{ text: 'Who uses it', ...KEY }, { text: p.audience || '' }],
      [{ text: 'Web address', ...KEY }, { text: p.routePrefix || '', mono: true }],
    ]
  );
  let s = 1;
  if (p.overview) x += h2(`${num}.${s++} Overview`) + bodyBlock(p.overview);

  if (p.navigation && p.navigation.length) {
    x += h2(`${num}.${s++} Navigation & menu`);
    x += tableXml(
      [22, 24, 54],
      ['Menu item', 'Address', 'What it does'],
      p.navigation.map((n) => [
        { text: n.label, bold: true },
        { text: n.route || '', mono: true },
        { text: n.description || '' },
      ])
    );
  }

  if (p.keyPages && p.keyPages.length) {
    x += h2(`${num}.${s++} Screens & features`);
    p.keyPages.forEach((pg) => {
      x += h3route(pg.name, pg.route);
      if (pg.purpose) x += bodyPara(pg.purpose);
      if (pg.features && pg.features.length) x += bulletList(pg.features);
    });
  }

  if (p.workflows && p.workflows.length) {
    x += h2(`${num}.${s++} Key workflows`);
    p.workflows.forEach((w) => {
      x += h3(w.name);
      if (w.description) x += bodyPara(w.description);
      if (w.steps && w.steps.length) x += numberedList(w.steps);
    });
  }

  if (p.businessRules && p.businessRules.length)
    x += h2(`${num}.${s++} Business rules & safeguards`) + bulletList(p.businessRules);
  if (p.integrations && p.integrations.length)
    x += h2(`${num}.${s++} Integrations`) + bulletList(p.integrations);

  if (p.backend && (p.backend.summary || (p.backend.modules || []).length)) {
    x += h2(`${num}.${s++} Behind the scenes (technical)`);
    if (p.backend.summary) x += bodyBlock(p.backend.summary);
    if (p.backend.modules && p.backend.modules.length)
      x += labelPara('Backend modules:') + bulletList(p.backend.modules);
    if (p.backend.keyEndpoints && p.backend.keyEndpoints.length)
      x += labelPara('Key API endpoints:') + monoEndpoints(p.backend.keyEndpoints);
  }
  return x;
}

function renderTopic(num, title, t) {
  if (!t) return h1(`${num}. ${title}`) + bodyPara('Section data unavailable.');
  tocAdd(num, title);
  let x = h1(`${num}. ${title}`);
  if (t.summary) x += leadPara(t.summary);
  let s = 1;
  (t.sections || []).forEach((sec) => {
    x += h2(`${num}.${s++} ${stripLeadNum(sec.heading)}`);
    if (sec.body) x += bodyBlock(sec.body);
    if (sec.bullets && sec.bullets.length) x += bulletList(sec.bullets);
  });
  if (t.flowSteps && t.flowSteps.length) {
    x += h2(`${num}.${s++} End-to-end flow`) + numberedList(t.flowSteps);
  }
  return x;
}

// ----- executive summary ----------------------------------------------------
const panelKeys = ['superadmin', 'admin', 'caseworker', 'candidate', 'business'];
const totalPages = panelKeys.reduce(
  (a, k) => a + (panels[k] && panels[k].keyPages ? panels[k].keyPages.length : 0),
  0
);

tocAdd(1, 'Executive Summary');
let exec = h1('1. Executive Summary');
exec += leadPara(
  'EPiC Case CRM is a multi-tenant, cloud-based case-management platform built for UK immigration advisory firms. It runs an entire firm’s day-to-day operations — from the first client enquiry through to a granted visa or sponsor licence — and is sold as a subscription service to many separate firms at once.'
);
exec += h2('1.1 What the platform does');
exec += bodyPara(
  'The system brings five different audiences together on one platform, each with their own secure, role-specific portal ("panel"):'
);
exec += bulletList(
  [
    'The platform owner (Superadmin) — the company that sells EPiC. They onboard client firms, set the subscription plans and pricing, and oversee the whole platform.',
    'The firm administrator (Admin) — the manager at a client firm who oversees all cases, staff, finance and settings for that one firm.',
    'The caseworker — the immigration adviser who handles the day-to-day work on individual cases.',
    'The candidate — the individual visa applicant, who uses a self-service portal to submit information, upload documents, pay and track progress.',
    'The business / sponsor — an employer applying for and holding a UK Sponsor Licence so it can employ overseas workers.',
  ],
  true
);
exec += h2('1.2 How it is structured');
exec += bodyPara(
  'EPiC is a "software-as-a-service" (SaaS) product. Each client firm is a separate tenant (called an "organisation") whose data is isolated from every other firm. The platform owner manages all tenants centrally, while each tenant runs independently with its own staff, clients, branding and subscription. A single shared engine powers common features — messaging, notifications, documents, calendars, tasks and audit trails — across every panel.'
);
exec += tableXml(
  [22, 78],
  null,
  [
    [{ text: 'Product', ...KEY }, { text: 'EPiC Case CRM — Immigration case & sponsor-licence management' }],
    [{ text: 'Model', ...KEY }, { text: 'Multi-tenant SaaS (one platform, many isolated firms)' }],
    [{ text: 'User panels', ...KEY }, { text: '5 working panels: Superadmin, Admin, Caseworker, Candidate, Business/Sponsor (plus Staff & Agent placeholders)' }],
    [{ text: 'Screens documented', ...KEY }, { text: `${totalPages}+ distinct screens across the five panels` }],
    [{ text: 'Technology', ...KEY }, { text: 'React single-page web app · Node.js/Express API · SQL database (platform + per-tenant) · real-time websockets · Stripe payments' }],
  ]
);
exec += h2('1.3 How to read this document');
exec += bodyPara(
  'Section 2 explains the technical foundation, user roles and security in plain language. Sections 3 to 7 walk through each of the five panels in turn — who uses it, what every screen does, and the step-by-step workflows the user performs. Section 8 follows the platform’s headline feature, the Sponsor Licence journey, end to end across panels. Section 9 covers the shared services that appear everywhere, and Section 10 covers the commercial subscription and billing layer. A glossary of terms closes the document.'
);

// ----- glossary -------------------------------------------------------------
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
tocAdd(11, 'Glossary of Terms');
let glossaryXml = h1('11. Glossary of Terms');
glossaryXml += tableXml(
  [28, 72],
  ['Term', 'Meaning'],
  glossary.map(([t, d]) => [{ text: t, bold: true }, { text: d }])
);

// ----- assemble body sections ----------------------------------------------
const sections = [];
sections.push(exec);
sections.push(renderTopic(2, 'Platform Architecture, Roles & Security', topics['architecture']));
sections.push(renderPanel(3, 'Superadmin Panel — Platform Owner', panels['superadmin']));
sections.push(renderPanel(4, 'Admin Panel — Firm Administrator', panels['admin']));
sections.push(renderPanel(5, 'Caseworker Panel — Immigration Adviser', panels['caseworker']));
sections.push(renderPanel(6, 'Candidate Panel — Visa Applicant', panels['candidate']));
sections.push(renderPanel(7, 'Business / Sponsor Panel — Employer', panels['business']));
sections.push(renderTopic(8, 'The Sponsor Licence Journey — End to End', topics['sponsor-licence']));
sections.push(renderTopic(9, 'Shared Services Across All Panels', topics['shared-services']));
sections.push(renderTopic(10, 'Subscription, Billing & Modules', topics['billing']));
sections.push(glossaryXml);

// ----- cover ----------------------------------------------------------------
const coverP = (text, sz, color, bold, after, spacingBefore) =>
  `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="${spacingBefore || 0}" w:after="${after || 0}" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${bold ? '<w:b/>' : ''}<w:color w:val="${color}"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`;

let cover = spacerP() + spacerP() + spacerP() + spacerP();
cover += coverP('CLIENT DOCUMENTATION', 24, '2E7CD6', true, 280);
cover += coverP(DOC_TITLE, 92, '14365C', true, 80);
cover += coverP(DOC_SUBTITLE, 40, '46627D', false, 240);
cover +=
  `<w:p><w:pPr><w:jc w:val="center"/><w:pBdr><w:bottom w:val="single" w:sz="24" w:space="6" w:color="2E7CD6"/></w:pBdr><w:spacing w:after="240"/></w:pPr></w:p>`;
cover += coverP(
  'A complete, plain-English guide to how the platform works — every panel, every workflow, end to end.',
  26,
  '46627D',
  false,
  600
);
cover += tableXml(
  [30, 70],
  null,
  [
    [{ text: 'Document', bold: true, color: '14365C' }, { text: 'Project Workflow & Functional Guide' }],
    [{ text: 'Audience', bold: true, color: '14365C' }, { text: 'Client / Stakeholders' }],
    [{ text: 'Version', bold: true, color: '14365C' }, { text: '1.0' }],
    [{ text: 'Date', bold: true, color: '14365C' }, { text: DOC_DATE }],
  ]
);

// ----- table of contents ----------------------------------------------------
let toc = h1('Table of Contents');
toc += TOC.map(
  (e) =>
    `<w:p><w:pPr><w:spacing w:after="100" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="2E7CD6"/></w:rPr><w:t xml:space="preserve">${e.n}.   </w:t></w:r><w:r><w:rPr><w:color w:val="1B3A5A"/></w:rPr><w:t xml:space="preserve">${escXml(e.t)}</w:t></w:r></w:p>`
).join('');

// ----- final body -----------------------------------------------------------
const sectPr = `<w:sectPr><w:footerReference w:type="default" r:id="rId3"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/><w:cols w:space="708"/></w:sectPr>`;

const bodyXml =
  cover +
  pageBreakP() +
  toc +
  pageBreakP() +
  sections.join(pageBreakP()) +
  sectPr;

// ===== package parts ========================================================
const XMLHEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS_W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const NS_R = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';

const documentXml = `${XMLHEAD}<w:document ${NS_W} ${NS_R}><w:body>${bodyXml}</w:body></w:document>`;

const stylesXml = `${XMLHEAD}<w:styles ${NS_W}>
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Segoe UI" w:hAnsi="Segoe UI" w:cs="Segoe UI"/><w:sz w:val="21"/><w:szCs w:val="21"/><w:lang w:val="en-GB"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="140" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="18" w:space="2" w:color="2E7CD6"/></w:pBdr><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="14365C"/><w:sz w:val="38"/><w:szCs w:val="38"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:color w:val="1B4A7A"/><w:sz w:val="27"/><w:szCs w:val="27"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="160" w:after="40"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:color w:val="2E7CD6"/><w:sz w:val="23"/><w:szCs w:val="23"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/><w:ind w:left="600"/></w:pPr></w:style>
</w:styles>`;

const bulletLvl =
  '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="600" w:hanging="300"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:hint="default"/></w:rPr></w:lvl>';
const decimalLvl =
  '<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="600" w:hanging="360"/></w:pPr></w:lvl>';

const numXml =
  `${XMLHEAD}<w:numbering ${NS_W}>` +
  `<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${bulletLvl}</w:abstractNum>` +
  `<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${decimalLvl}</w:abstractNum>` +
  `<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>` +
  numberedIds
    .map(
      (id) =>
        `<w:num w:numId="${id}"><w:abstractNumId w:val="1"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>`
    )
    .join('') +
  `</w:numbering>`;

const footerXml = `${XMLHEAD}<w:ftr ${NS_W} ${NS_R}><w:p><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="4" w:color="D4DDE7"/></w:pBdr><w:jc w:val="center"/><w:spacing w:after="0"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="7A8896"/></w:rPr><w:t xml:space="preserve">${escXml(DOC_TITLE + ' — ' + DOC_SUBTITLE)}    |    Page </w:t></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="7A8896"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="7A8896"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="16"/><w:color w:val="7A8896"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

const contentTypes = `${XMLHEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const rootRels = `${XMLHEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const docRels = `${XMLHEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;

const coreXml = `${XMLHEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${escXml(DOC_TITLE + ' — ' + DOC_SUBTITLE)}</dc:title>
<dc:creator>EPiC Platform Team</dc:creator>
<cp:lastModifiedBy>EPiC Platform Team</cp:lastModifiedBy>
</cp:coreProperties>`;

const appXml = `${XMLHEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
<Application>EPiC Doc Builder</Application><Company>EPiC Case CRM</Company>
</Properties>`;

// ===== zip it ===============================================================
const out = fs.createWriteStream(OUTPUT);
const archive = archiver('zip', { zlib: { level: 9 } });
out.on('close', () => {
  console.log('Wrote ' + OUTPUT);
  console.log('Bytes: ' + archive.pointer());
  console.log('Sections: ' + sections.length + ' | TOC: ' + TOC.length + ' | numbered lists: ' + numberedIds.length + ' | screens: ' + totalPages);
});
archive.on('error', (err) => {
  throw err;
});
archive.pipe(out);
archive.append(contentTypes, { name: '[Content_Types].xml' });
archive.append(rootRels, { name: '_rels/.rels' });
archive.append(documentXml, { name: 'word/document.xml' });
archive.append(stylesXml, { name: 'word/styles.xml' });
archive.append(numXml, { name: 'word/numbering.xml' });
archive.append(footerXml, { name: 'word/footer1.xml' });
archive.append(docRels, { name: 'word/_rels/document.xml.rels' });
archive.append(coreXml, { name: 'docProps/core.xml' });
archive.append(appXml, { name: 'docProps/app.xml' });
archive.finalize();
