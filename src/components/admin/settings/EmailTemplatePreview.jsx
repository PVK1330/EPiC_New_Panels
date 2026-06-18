import { FiMonitor, FiSmartphone, FiArrowLeft } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import Button from "../../Button";
import { getOrganisationBranding } from "../../../services/settingsService";
import { resolveOrganisationLogoUrl } from "../../../utils/assetUrl";

// Palette mirrors the backend master shell (utils/epicEmailLayout.js) so admins
// preview an email that looks exactly like what is actually sent.
const C = {
  navy: "#0B2E5E",
  blue: "#1D70B8",
  border: "#DDE3EA",
  pageBg: "#EEF1F5",
  ink: "#0B0C0C",
  body: "#33414F",
  muted: "#6B7785",
};

export default function EmailTemplatePreview({ template, onClose }) {
  const [device, setDevice] = useState("desktop");
  const [org, setOrg] = useState(null);

  useEffect(() => {
    let active = true;
    getOrganisationBranding()
      .then((res) => {
        if (active) setOrg(res.data?.data?.organisation || null);
      })
      .catch(() => {
        if (active) setOrg(null);
      });
    return () => {
      active = false;
    };
  }, []);

  // BUG-004: sanitise the template HTML before rendering to prevent stored XSS.
  const sanitizedBody = useMemo(
    () => DOMPurify.sanitize(template?.body ?? ""),
    [template?.body],
  );

  if (!template) return null;

  const orgName = org?.name || "Your Organisation";
  const logoSrc = resolveOrganisationLogoUrl(org);
  const isMobile = device === "mobile";

  return (
    <div className="bg-gray-100/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[85vh] border border-gray-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h3 className="text-base font-black text-secondary tracking-tight">
              Preview: {template.template_key}
            </h3>
            <p className="text-xs text-gray-400 font-medium italic">
              Subject: {template.subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-2 rounded-xl transition-all ${device === "desktop" ? "bg-white text-primary shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            <FiMonitor size={16} />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-2 rounded-xl transition-all ${isMobile ? "bg-white text-primary shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"}`}
          >
            <FiSmartphone size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar"
        style={{ backgroundColor: C.pageBg }}
      >
        <div
          className={`transition-all duration-500 flex flex-col ${isMobile ? "w-[380px] rounded-[3rem] p-3 border-[8px] border-secondary ring-4 ring-gray-200 bg-secondary" : "w-full max-w-2xl"}`}
        >
          {/* Inbox sender line — reflects the real From display-name (the org). */}
          <div className={`px-1 pb-3 ${isMobile ? "pt-2" : ""}`}>
            <p className="text-[11px] font-semibold text-gray-400">
              From:{" "}
              <span className="text-gray-600">
                {orgName} &lt;notifications@{(orgName || "org").toLowerCase().replace(/[^a-z0-9]+/g, "")}.example&gt;
              </span>
            </p>
          </div>

          {/* The branded email frame (mirrors utils/epicEmailLayout.js) */}
          <div
            className="bg-white overflow-hidden"
            style={{
              borderRadius: 14,
              boxShadow: "0 6px 24px rgba(11,46,94,0.08)",
            }}
          >
            {/* UK accent bar */}
            <div style={{ height: 4, backgroundColor: C.navy }} />

            {/* Header / brand mark */}
            <div
              className="flex items-center justify-center"
              style={{
                padding: "28px 40px 22px",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={orgName}
                  style={{ maxHeight: 44, width: "auto", display: "block" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: "-0.4px",
                    color: C.navy,
                  }}
                >
                  {orgName}
                </span>
              )}
            </div>

            {/* Body */}
            <div style={{ padding: "34px 40px" }}>
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "#EAF0F7",
                  color: C.navy,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  padding: "5px 11px",
                  borderRadius: 6,
                  marginBottom: 16,
                }}
              >
                {template.template_key?.replace(/_/g, " ") || "Notification"}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: C.body,
                  lineHeight: 1.65,
                  whiteSpace: sanitizedBody.includes("<") ? "normal" : "pre-wrap",
                }}
                dangerouslySetInnerHTML={{ __html: sanitizedBody }}
              />
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "22px 40px 28px",
                borderTop: `1px solid ${C.border}`,
                backgroundColor: "#FBFCFD",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 12, color: C.muted, margin: "0 0 4px" }}>
                &copy; {new Date().getFullYear()} {orgName}. All rights reserved.
              </p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                This is an automated message — please do not reply directly to this email.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-3 px-2">
            Live preview of the shared branded template. The logo, organisation name and
            sender are applied automatically when the email is sent.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white flex justify-end px-8">
        <Button onClick={onClose} className="rounded-xl px-8">
          Close Preview
        </Button>
      </div>
    </div>
  );
}
