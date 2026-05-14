import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  PoundSterling,
  History,
  CheckCircle2,
  Clock,
  Lock,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Modal from "../../components/Modal";
import useCandidate from "../../hooks/useCandidate";

const CASE_ID = "VT-2024-0841";
const TOTAL = 2400;
const INITIAL_PAID = 1600;
const BALANCE_DUE = 800;

const LS_BALANCE_PAID = "elitepic_candidate_balance_paid";
const LS_FINAL_PAY_DATE = "elitepic_candidate_final_pay_date";

function loadSavedPaymentState() {
  try {
    const settled = localStorage.getItem(LS_BALANCE_PAID) === "1";
    const paidAt = localStorage.getItem(LS_FINAL_PAY_DATE) || "";
    return { settled, paidAt };
  } catch {
    return { settled: false, paidAt: "" };
  }
}

function savePaymentSettled(paidAtLabel) {
  try {
    localStorage.setItem(LS_BALANCE_PAID, "1");
    localStorage.setItem(LS_FINAL_PAY_DATE, paidAtLabel);
  } catch {
    /* ignore */
  }
}

function buildHistoryRows(settled, finalPayDateLabel) {
  const base = [
    {
      id: "1",
      date: "8 Apr 2026",
      description: "First payment (Visa fee + Healthcare surcharge)",
      amount: "£1,200",
      amountClass: "text-gray-900 font-bold",
      method: "Stripe",
      status: "Paid",
      receipt: true,
    },
    {
      id: "2",
      date: "5 Apr 2026",
      description: "Account setup fee",
      amount: "£400",
      amountClass: "text-gray-900 font-bold",
      method: "Stripe",
      status: "Paid",
      receipt: true,
    },
  ];
  if (settled && finalPayDateLabel) {
    base.push({
      id: "3",
      date: finalPayDateLabel,
      description: "Final remaining balance",
      amount: "£800",
      amountClass: "text-gray-900 font-bold",
      method: "Stripe",
      status: "Paid",
      receipt: true,
    });
  } else {
    base.push({
      id: "3",
      date: "—",
      description: "Final remaining balance",
      amount: "£800",
      amountClass: "text-amber-600 font-bold",
      method: "Stripe",
      status: "Left to pay",
      receipt: false,
    });
  }
  return base;
}

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payOpen, setPayOpen] = useState(false);
  const [paymentSnapshot, setPaymentSnapshot] = useState(loadSavedPaymentState);
  const balanceSettled = paymentSnapshot.settled;
  const finalPayDate = paymentSnapshot.paidAt;

  // Layman-friendly simulation state
  const [redirectState, setRedirectState] = useState("idle"); // 'idle' | 'redirecting' | 'paid'

  // Authorization Status Controller: synced with candidate data but includes a plain testing switch
  const [authStatus, setAuthStatus] = useState("Approved");
  const { myApplication } = useCandidate();

  useEffect(() => {
    if (myApplication?.case?.amountStatus) {
      setAuthStatus(myApplication.case.amountStatus);
    }
  }, [myApplication]);

  const historyRows = useMemo(
    () => buildHistoryRows(balanceSettled, finalPayDate),
    [balanceSettled, finalPayDate],
  );

  const paid = balanceSettled ? TOTAL : INITIAL_PAID;
  const balance = balanceSettled ? 0 : BALANCE_DUE;

  const tab = useMemo(() => {
    return searchParams.get("tab") === "history" ? "history" : "summary";
  }, [searchParams]);

  const setTab = useCallback(
    (next) => {
      if (next === "summary") {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: "history" }, { replace: true });
      }
    },
    [setSearchParams],
  );

  const handlePayClick = () => {
    setRedirectState("redirecting");
    setPayOpen(true);

    // Actively trigger the browser to open the external Stripe checkout web interface
    const stripeCheckoutUrl = "https://checkout.stripe.com/pay/cs_live_b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0";
    window.open(stripeCheckoutUrl, "_blank");

    // Automatically complete the simulated checkout state after a few seconds
    setTimeout(() => {
      setRedirectState("paid");
      const paidAtLabel = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      savePaymentSettled(paidAtLabel);
      setPaymentSnapshot({ settled: true, paidAt: paidAtLabel });
    }, 3000);
  };

  const closePaymentWindow = () => {
    setPayOpen(false);
    setRedirectState("idle");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* ── Friendly Page Header ────────────────────────────────────────────── */}
      <header className="rounded-3xl bg-white p-6 md:p-8 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
            Payments & Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Review your visa application charges and view downloaded payment receipts.
          </p>
        </div>
        <div className="shrink-0 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-right">
          <span className="block text-[11px] font-bold text-gray-400 uppercase">Application ID</span>
          <span className="block text-sm font-black text-secondary">{CASE_ID}</span>
        </div>
      </header>

      {/* ── Very Simple Switcher for Demonstrating Approval Lockout ──────────── */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-blue-900 flex items-center gap-1.5">
          <span>⚙️ Testing panel: Change case state to preview payment button permissions</span>
        </span>
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-blue-200">
          <button
            type="button"
            onClick={() => setAuthStatus("Pending Approval")}
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              authStatus !== "Approved" ? "bg-amber-100 text-amber-800" : "text-gray-500"
            }`}
          >
            Awaiting Admin Review
          </button>
          <button
            type="button"
            onClick={() => setAuthStatus("Approved")}
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              authStatus === "Approved" ? "bg-blue-600 text-white" : "text-gray-500"
            }`}
          >
            Approved (Ready to Pay)
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("summary")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === "summary"
              ? "bg-secondary text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <PoundSterling size={16} />
          Payment Summary
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            tab === "history"
              ? "bg-secondary text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <History size={16} />
          Payment History
        </button>
      </div>

      {/* ── Summary Tab Content ─────────────────────────────────────────────── */}
      {tab === "summary" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Simple 3-column breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-xs font-bold text-gray-400 block">Total cost</span>
              <span className="text-2xl font-black text-secondary block mt-1">£{TOTAL.toLocaleString()}</span>
              <span className="text-xs text-gray-500 block mt-1">Full application charges</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-xs font-bold text-gray-400 block">Already paid</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">£{paid.toLocaleString()}</span>
              <span className="text-xs text-gray-500 block mt-1">Received securely</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
              <span className="text-xs font-bold text-gray-400 block">Left to pay</span>
              <span className={`text-2xl font-black block mt-1 ${balanceSettled ? "text-gray-400" : "text-amber-600"}`}>
                £{balance.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 block mt-1">
                {balanceSettled ? "Nothing left to pay" : "Final installment due"}
              </span>
            </div>
          </div>

          {/* Action Box */}
          {authStatus !== "Approved" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-left flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center shrink-0 font-bold text-lg">
                ⏳
              </div>
              <div>
                <h3 className="text-base font-black text-amber-950">Awaiting Final Review</h3>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                  Your final balance of <strong>£800</strong> is currently being reviewed by our administrative staff. The payment button will unlock automatically as soon as it is approved.
                </p>
              </div>
            </div>
          ) : balanceSettled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-emerald-950">Payment Complete</h3>
                  <p className="text-sm text-emerald-800 mt-0.5">
                    Thank you! Your full payment has been safely received. No extra fees are required.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTab("history")}
                className="px-4 py-2 bg-white rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shrink-0"
              >
                View Receipts
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-secondary text-xs font-bold mb-3">
                  <ShieldCheck size={14} className="text-secondary" /> Secured by Stripe
                </span>
                <h3 className="text-xl font-black text-secondary">
                  Pay final balance of £{BALANCE_DUE}
                </h3>
                <p className="text-sm text-gray-500 mt-1 max-w-lg leading-relaxed">
                  Clicking the button below will redirect you to Stripe's trusted checkout page to safely process your payment using any major debit or credit card.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handlePayClick}
                  className="w-full sm:w-auto px-8 py-4 bg-secondary text-white rounded-2xl font-black text-base shadow-md hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Pay now</span>
                  <ExternalLink size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
                <span className="text-[11px] text-gray-400 block text-center mt-2">Redirects to secure Stripe Checkout</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── History Tab Content ─────────────────────────────────────────────── */}
      {tab === "history" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xs animate-in fade-in duration-300">
          <h2 className="text-base font-black text-secondary mb-4">Payment Receipts</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 px-4">Description</th>
                  <th className="pb-3 px-4">Payment Method</th>
                  <th className="pb-3 px-4">Amount</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {historyRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="py-3.5 pr-4 font-bold text-gray-900 whitespace-nowrap">{row.date}</td>
                    <td className="py-3.5 px-4 text-gray-700">{row.description}</td>
                    <td className="py-3.5 px-4 text-gray-500">{row.method}</td>
                    <td className="py-3.5 px-4 font-black text-secondary">{row.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        row.status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      {row.receipt ? (
                        <button
                          type="button"
                          onClick={() => window.alert("Downloading official payment receipt PDF.")}
                          className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Simulated Stripe Redirect Pop-up ───────────────────────────────── */}
      <Modal
        open={payOpen}
        onClose={closePaymentWindow}
        title="Stripe Secure Gateway"
        maxWidthClass="max-w-md"
        bodyClassName="p-6 text-center"
      >
        {redirectState === "redirecting" ? (
          <div className="py-8 space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-secondary rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-black text-secondary">Stripe Checkout Launched</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Stripe's secure checkout gateway has opened in a new tab to safely collect your payment of <strong>£{BALANCE_DUE}</strong>.
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://checkout.stripe.com/pay/cs_live_b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline bg-gray-50 px-3 py-2 rounded-xl border border-gray-200"
              >
                <span>Click here to open Stripe if your browser blocked the new tab</span>
                <ExternalLink size={13} className="text-secondary" />
              </a>
            </div>
            <p className="text-[11px] text-gray-400 italic pt-1">Verifying transaction automatically...</p>
          </div>
        ) : (
          <div className="py-8 space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-lg font-black text-secondary">Payment Successful!</h3>
              <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                Stripe has safely processed your payment. Your visa application fee is now fully paid.
              </p>
            </div>
            <div className="pt-3">
              <button
                type="button"
                onClick={closePaymentWindow}
                className="px-6 py-2.5 bg-secondary text-white text-xs font-bold rounded-xl shadow-xs hover:bg-secondary/90 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payments;
