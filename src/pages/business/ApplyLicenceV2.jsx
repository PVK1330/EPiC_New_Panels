// Sponsor licence applications now use a single, SIMPLE form instead of the
// multi-step wizard. This component keeps the /business/apply-licence-v2 route
// (and the "Apply for Licence" links that point to it) working by rendering the
// simple application form, which submits in one request to the proven
// POST /api/business/licence/apply endpoint.
//
// (The previous 8-step wizard saved drafts into the normalized V2 tables created
// by migrations/tenants/20260612120000-licence-application-v2.sql; until that
// migration is applied to a tenant DB, those draft saves return HTTP 500 — which
// is why the wizard was failing. The simple form below avoids that flow entirely.)
import ApplyLicence from "./ApplyLicence";

export default function ApplyLicenceV2() {
  return <ApplyLicence />;
}
