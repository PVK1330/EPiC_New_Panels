import { Handshake } from "lucide-react";

const ThirdPartyDocs = () => (
  <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm max-w-2xl animate-in fade-in duration-500">
    <Handshake className="text-primary mb-4" size={36} />
    <h1 className="text-2xl font-black text-secondary tracking-tight">
      Third-party documents
    </h1>
    <p className="text-sm font-bold text-gray-500 mt-2">
      Request or upload documents from sponsors, employers, or other parties.
      This section will connect to your caseworker workflow when the backend is
      ready.
    </p>
  </div>
);

export default ThirdPartyDocs;
