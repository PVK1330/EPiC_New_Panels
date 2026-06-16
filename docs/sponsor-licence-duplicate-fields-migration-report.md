# Sponsor Licence — Duplicate Fields Migration Report

Generated: 2026-06-16  
Scope: Five data-collection surfaces in the sponsor licence flow  

---

## 1. Surfaces Audited

| ID | Surface | File / Component | Collects |
|----|---------|-----------------|---------|
| **BP** | Business Profile | `BusinessRegistration.jsx` | Company, address, AO, KC, L1, HR, billing |
| **V2-2** | Wizard Step 2 — Organisation Info | `Step2Organisation.jsx` | Legal structure, registration numbers, trading date |
| **V2-5** | Wizard Step 5 — Authorising Officer | `Step5AuthorisingOfficer.jsx` | AO personal details, NI, convictions |
| **V2-6** | Wizard Step 6 — Key Contact | `Step6KeyContact.jsx` | KC contact details |
| **V2-7** | Wizard Step 7 — Level 1 Users | `Step7Level1Users.jsx` | L1 user list |
| **SIF** | Sponsor Information Form (Intake) | `LicenceProcess.jsx` → `updateSponsorIntakeForm` | Company meta, AO contact, premises, CoS estimates |

---

## 2. Full Field Inventory

### Business Profile (`BP`)

```
Company          companyName, tradingName, registrationNumber, sponsorLicenceNumber,
                 licenceRating, industrySector, yearEstablished, website
Address          registeredAddress, tradingAddress, city, state, country, postalCode
AO               authorisingName*, authorisingPhone, authorisingEmail, authorisingJobTitle
KC               keyContactName*, keyContactPhone, keyContactEmail, keyContactDepartment
L1               level1Users[]  { name*, email, phone }
HR               hrName*, hrEmail, hrPhone, hrJobTitle
Ownership        ownershipType, shareholders[], directors[]
Billing          billingName, billingEmail, billingPhone, outstandingBalance, paymentTerms
```
> `*` = full-name string; V2 tables split into firstName + lastName

### Wizard Step 2 — Organisation Info (`V2-2`)

```
organisationType, companiesHouseNumber, payeReference, accountsOfficeReference,
vatNumber, tradingStartDate, charityStatus, charityNumber,
sicCodes[], regions[], accreditations[], previousTradingNames[]
```

### Wizard Step 5 — Authorising Officer (`V2-5`)

```
title, firstName, lastName, dob, nationality,
niNumber, immigrationStatus, email, phone,
hasConvictions, convictionsDetails
```

### Wizard Step 6 — Key Contact (`V2-6`)

```
sameAsAuthorisingOfficer, title, firstName, lastName,
email, phone, jobTitle
```

### Wizard Step 7 — Level 1 Users (`V2-7`)

```
level1Users[]  { firstName, lastName, email, phone, jobTitle, isAuthorisingOfficer }
```

### Sponsor Information Form — Intake (`SIF`)

```
tradingName, owningLimitedCompany, namedPersonOnLicence,
phoneNumber, niNumber, emailAddress, companyWebsite,
totalEmployees, employeesUnderImmigrationRules,
numberOfCosRequired, jobTitlesRequired[],
premisesAddress { line1, line2, city, county, postcode, country }
```

---

## 3. Duplication Matrix

Each row is one logical field. Columns show which surface collects it.

| Logical Field | BP | V2-2 | V2-5 | V2-6 | V2-7 | SIF | Status |
|---------------|:--:|:----:|:----:|:----:|:----:|:---:|--------|
| Company / trading name | `tradingName` | — | — | — | — | `tradingName` | **DUPLICATE** |
| Company registration number | `registrationNumber` | `companiesHouseNumber` | — | — | — | — | **DUPLICATE** |
| Company website | `website` | — | — | — | — | `companyWebsite` | **DUPLICATE** |
| Company address | `registeredAddress … postalCode` | — | — | — | — | `premisesAddress` | **DUPLICATE** |
| AO full name | `authorisingName` | — | `firstName`+`lastName` | — | — | `namedPersonOnLicence` | **TRIPLICATE** |
| AO phone | `authorisingPhone` | — | `phone` | — | — | `phoneNumber` | **TRIPLICATE** |
| AO email | `authorisingEmail` | — | `email` | — | — | `emailAddress` | **TRIPLICATE** |
| AO job title | `authorisingJobTitle` | — | *(missing)* | — | — | — | Gap in V2-5 |
| AO NI number | — | — | `niNumber` | — | — | `niNumber` | **DUPLICATE** |
| KC full name | `keyContactName` | — | — | `firstName`+`lastName` | — | — | **DUPLICATE** |
| KC phone | `keyContactPhone` | — | — | `phone` | — | — | **DUPLICATE** |
| KC email | `keyContactEmail` | — | — | `email` | — | — | **DUPLICATE** |
| KC department / job title | `keyContactDepartment` | — | — | `jobTitle` | — | — | **DUPLICATE** |
| L1 user list | `level1Users[]` | — | — | — | `level1Users[]` | — | **DUPLICATE** |
| Total employees | — | — | — | — | — | `totalEmployees` | Unique |
| Employees under Immigration Rules | — | — | — | — | — | `employeesUnderImmigrationRules` | Unique |
| Number of CoS required | — | — | — | — | — | `numberOfCosRequired` | Unique |
| Job titles required | — | — | — | — | — | `jobTitlesRequired[]` | Unique |
| Owning limited company | — | — | — | — | — | `owningLimitedCompany` | Unique |

**Summary: 14 fields are collected 2–3 times. 5 fields are unique to SIF and must remain.**

---

## 4. Root Causes

1. **BP uses full-name strings; V2 uses firstName + lastName** — no automated split → sponsors re-enter by hand.
2. **SIF was built independently of V2** — the intake form re-asks contact and company questions already answered in the wizard and the profile.
3. **No source-of-truth mapping exists** — each surface owns its own copy with no sync mechanism.

---

## 5. Proposed Resolution: Sponsor Information Summary

Replace the duplicate sections in the Sponsor Information Form with a **read-only summary card** auto-generated from Business Profile + Application data. Only the five genuinely unique intake fields remain as editable inputs.

### 5.1 Auto-generated fields (read-only in SIF)

| SIF field | Source | Derivation |
|-----------|--------|-----------|
| `tradingName` | BP `tradingName` | Direct copy |
| `namedPersonOnLicence` | Application AO `firstName + lastName` | Concatenate |
| `phoneNumber` | Application AO `phone` | Direct copy |
| `emailAddress` | Application AO `email` | Direct copy |
| `niNumber` | Application AO `niNumber` | Direct copy |
| `companyWebsite` | BP `website` | Direct copy |
| `premisesAddress` | BP `registeredAddress/city/state/country/postalCode` | Structural map |

### 5.2 Kept as user-editable inputs in SIF

| Field | Why it must stay |
|-------|-----------------|
| `totalEmployees` | Not collected anywhere else |
| `employeesUnderImmigrationRules` | Not collected anywhere else |
| `numberOfCosRequired` | Not collected anywhere else |
| `jobTitlesRequired[]` | Not collected anywhere else |
| `owningLimitedCompany` | Not collected anywhere else |

### 5.3 Proposed `SponsorInformationSummary` component

```
┌─ Sponsor Information Summary ──────────────────────────────────────┐
│  Auto-generated from Business Profile and Application              │
├────────────────────────────────────────────────────────────────────┤
│  Company Name      Acme Ltd            [from Business Profile]     │
│  Trading Name      Acme Trading        [from Business Profile]     │
│  Website           acme.co.uk          [from Business Profile]     │
│  Premises Address  12 High St, London  [from Business Profile]     │
├────────────────────────────────────────────────────────────────────┤
│  Authorising Officer                   [from Application]          │
│  Jane Smith · jane@acme.co.uk · +44 7700 000000                   │
│  NI: AB 12 34 56 C                                                 │
├────────────────────────────────────────────────────────────────────┤
│  Key Contact                           [from Application]          │
│  John Doe · john@acme.co.uk · +44 7700 111111 · HR Manager        │
├────────────────────────────────────────────────────────────────────┤
│  Level 1 Users (2)                     [from Application]          │
│  Sarah Jones · sarah@acme.co.uk · HR Coordinator                  │
│  Tom Brown  · tom@acme.co.uk   · Compliance Lead                  │
├────────────────────────────────────────────────────────────────────┤
│  [Edit Business Profile ↗]  [Edit Application ↗]                  │
└────────────────────────────────────────────────────────────────────┘

┌─ Additional Information (required for intake) ─────────────────────┐
│  Total Employees               [____]                              │
│  Employees Under Imm. Rules    [____]                              │
│  Number of CoS Required        [____]                              │
│  Job Titles Required           [____________________________]      │
│  Owning Limited Company        [____]                              │
└────────────────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Plan

### Phase A — No UI changes (data layer only)
1. Backend: implement `syncPersonnelFromProfile` (already in progress — auto-populates AO/KC/L1 from BP on draft create, exposes `POST /applications/:id/sync-from-profile`).
2. Backend: expose `GET /applications/:id/intake` with `summary` block containing derived fields from BP + Application.

### Phase B — Replace SIF duplicate section
3. Create `src/components/licence/SponsorInformationSummary.jsx` — read-only card rendering derived data.
4. In `LicenceProcess.jsx`, replace the 7 duplicate SIF fields with `<SponsorInformationSummary app={app} profile={profile} />`.
5. Keep the 5 unique fields as today.

### Phase C — Remove legacy BP duplication (V2 wizard already fixed by sync feature)
6. In `BusinessRegistration.jsx` and `BusinessProfile.jsx`, consider deprecating `authorisingName`, `keyContactName`, `level1Users` fields in favour of the V2 application's normalised tables as the canonical store post-application-start.
7. Show a "Your AO/KC/L1 are managed in your Licence Application" notice once an application is in progress.

### Phase D — Close the AO job title gap
8. Add `jobTitle` field to `Step5AuthorisingOfficer.jsx` (currently missing; BP has `authorisingJobTitle`).

---

## 7. Risk Register

| Risk | Severity | Mitigation |
|------|---------|-----------|
| Sponsors whose BP is incomplete will see blank summary fields | Medium | Show inline prompt "Complete your Business Profile to auto-fill" |
| Existing submitted intake forms have user-typed data in duplicate fields | Low | Read-only summary only applies to new/in-progress forms; submitted forms keep their data |
| BP address format doesn't match premisesAddress sub-fields | Low | Map `registeredAddress` (single string) to `premisesAddress.line1`; leave other sub-fields editable |
| `namedPersonOnLicence` may differ from AO if the licence names a different person | Medium | Keep the field editable with the AO name pre-filled; sponsor can override |

---

## 8. Fields Safe to Remove from SIF (after Phase B ships)

Once `SponsorInformationSummary` is live and verified, the following SIF fields become redundant and can be removed from the intake form:

- `tradingName`
- `namedPersonOnLicence`
- `phoneNumber`
- `emailAddress`
- `niNumber`
- `companyWebsite`
- `premisesAddress` (full block, 6 sub-fields)

**Total fields removed: 13 inputs** (the 6 address sub-fields count individually).  
**Fields remaining: 5 unique intake fields.**

---

*Do not make code changes based on this report until the implementation plan phases have been confirmed.*
