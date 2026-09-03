import { useMemo } from "react";
import {
  APPLICATION_FIELD_LABELS,
  APPLICATION_STEP_LABELS,
} from "./initialFormState";
import { candidateRowToApplicationForm } from "./applicationFormMapping";

const FIELD_SECTIONS = [
  {
    title: APPLICATION_STEP_LABELS[0],
    keys: [
      "applicationType",
      "firstName",
      "lastName",
      "email",
      "gender",
      "contactNumber",
      "relationshipStatus",
      "address",
      "addressStartDate",
      "housingStatus",
      "landlordName",
      "landlordContactNumber",
      "landlordEmail",
      "landlordAddress",
      "contactNumber2",
      "previousAddresses",
    ],
  },
  {
    title: APPLICATION_STEP_LABELS[1],
    keys: [
      "nationality",
      "birthCountry",
      "placeOfBirth",
      "dob",
      "passportNumber",
      "issuingAuthority",
      "issueDate",
      "expiryDate",
      "passportAvailable",
      "nationalIdNumber",
      "idIssuingAuthorityNational",
      "otherNationality",
      "ukLicense",
      "ukLicenseNumber",
      "medicalTreatment",
      "ukStayDuration",
    ],
  },
  {
    title: APPLICATION_STEP_LABELS[2],
    keys: [
      "illegalEntry",
      "overstayed",
      "breach",
      "falseInfo",
      "otherBreach",
      "refusedVisa",
      "refusedEntry",
      "refusedPermission",
      "refusedAsylum",
      "deported",
      "removed",
      "requiredToLeave",
      "banned",
    ],
  },
  {
    title: APPLICATION_STEP_LABELS[3],
    keys: [
      "parentName",
      "parentRelation",
      "parentDob",
      "parentNationality",
      "sameNationality",
      "parent2Name",
      "parent2Relation",
      "parent2Dob",
      "parent2Nationality",
      "parent2SameNationality",
    ],
  },
  {
    title: APPLICATION_STEP_LABELS[4],
    keys: [
      "visitedOther",
      "countryVisited",
      "visitReason",
      "entryDate",
      "leaveDate",
      "visaType",
      "brpNumber",
      "visaEndDate",
    ],
  },
  {
    title: APPLICATION_STEP_LABELS[5],
    keys: ["niNumber", "sponsored", "englishProof"],
  },
];

function formatDisplayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || "—";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const s = String(value).trim();
  if (s === "yes") return "Yes";
  if (s === "no") return "No";
  return s;
}

function buildSections(form, customFieldDefinitions = []) {
  const sections = FIELD_SECTIONS.map((section) => ({
    title: section.title,
    fields: section.keys
      .filter((key) => {
        if (!APPLICATION_FIELD_LABELS[key]) return false;
        if (
          ["landlordName", "landlordContactNumber", "landlordEmail", "landlordAddress"].includes(key) &&
          form.housingStatus !== "Rent"
        ) {
          return false;
        }
        if (key === "ukLicenseNumber" && form.ukLicense !== "Yes") {
          return false;
        }
        return true;
      })
      .map((key) => {
        let val = form[key];
        if (key === "nationality" && Array.isArray(form.nationalities) && form.nationalities.length > 0) {
          val = form.nationalities;
        }
        if (key === "previousAddresses") {
          const list = Array.isArray(form.previousAddresses) && form.previousAddresses.length > 0
            ? form.previousAddresses
            : (form.previousAddress ? [{ previousAddress: form.previousAddress, startDate: form.startDate, endDate: form.endDate }] : []);
          if (list.length === 0) {
            val = "—";
          } else {
            val = list.map((item, idx) => {
              const addr = item.previousAddress || item.address || "";
              const dates = [item.startDate, item.endDate].filter(Boolean).join(" to ");
              return `${idx + 1}. ${addr}${dates ? ` (${dates})` : ""}`;
            }).join("\n");
          }
        }
        return {
          key,
          label: APPLICATION_FIELD_LABELS[key],
          value: formatDisplayValue(val),
        };
      }),
  }));

  const custom = (customFieldDefinitions || []).filter((d) => d?.label && d?.id);
  if (custom.length) {
    const cr =
      form.customResponses && typeof form.customResponses === "object"
        ? form.customResponses
        : {};
    sections.push({
      title: "Additional questions",
      fields: custom.map((def) => ({
        key: def.id,
        label: def.label,
        value: formatDisplayValue(cr[def.id]),
      })),
    });
  }

  return sections;
}

export const APPLICATION_TAB_SECTIONS = {
  overview: null,
  immigration: [APPLICATION_STEP_LABELS[2], APPLICATION_STEP_LABELS[4]],
  employment: [APPLICATION_STEP_LABELS[5]],
  address: [APPLICATION_STEP_LABELS[0]],
  documents: [],
  timeline: [],
  communications: [],
};

export default function CandidateApplicationReadonly({
  candidate,
  customFieldDefinitions = [],
  tabId = "overview",
  printId = "candidate-application-print",
}) {
  const form = useMemo(
    () => candidateRowToApplicationForm(candidate || {}),
    [candidate],
  );

  const allSections = useMemo(
    () => buildSections(form, customFieldDefinitions),
    [form, customFieldDefinitions],
  );

  const sections = useMemo(() => {
    const filterTitles = APPLICATION_TAB_SECTIONS[tabId];
    if (!filterTitles || tabId === "overview") return allSections;
    if (filterTitles.length === 0) return [];
    return allSections.filter((s) => filterTitles.includes(s.title));
  }, [allSections, tabId]);

  if (tabId !== "overview" && APPLICATION_TAB_SECTIONS[tabId]?.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        {tabId === "documents"
          ? "Documents are available on the client’s case detail page."
          : `${tabId.charAt(0).toUpperCase() + tabId.slice(1)} is available on the case detail page.`}
      </p>
    );
  }

  return (
    <div
      id={printId}
      className="space-y-6 candidate-application-print-root bg-white text-gray-900"
    >
      {tabId === "overview" && candidate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-[#e0e7ff] bg-[#eef2ff]">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Client</p>
            <p className="text-sm font-black text-gray-900">
              {[candidate.first_name, candidate.last_name].filter(Boolean).join(" ") || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400">Email</p>
            <p className="text-sm font-semibold text-gray-800">{candidate.email || "—"}</p>
          </div>
        </div>
      )}

      {sections.map((section) => (
        <section key={section.title} className="break-inside-avoid">
          <h4 className="text-sm font-black text-[#4f46e5] uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
            {section.title}
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {section.fields.map(({ key, label, value }) => (
              <div key={key}>
                <dt className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {label}
                </dt>
                <dd className="text-sm font-semibold text-gray-800 whitespace-pre-wrap">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function printCandidateApplication() {
  window.print();
}
