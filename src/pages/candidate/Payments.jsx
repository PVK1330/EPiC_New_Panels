import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  PoundSterling,
  History,
  CircleCheck,
} from "lucide-react";
import Modal from "../../components/Modal";

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
      description: "Initial payment — visa + IHS fee",
      amount: "£1,200",
      amountClass: "text-gray-900",
      method: "Stripe",
      methodEmoji: "💳",
      status: "completed",
      receipt: true,
    },
    {
      id: "2",
      date: "5 Apr 2026",
      description: "Setup fee — legal & professional",
      amount: "£400",
      amountClass: "text-gray-900",
      method: "Razorpay",
      methodEmoji: "🔵",
      status: "completed",
      receipt: true,
    },
  ];
  if (settled && finalPayDateLabel) {
    base.push({
      id: "3",
      date: finalPayDateLabel,
      description: "Remaining balance — one-time settlement",
      amount: "£800",
      amountClass: "text-gray-900",
      method: "Stripe",
      methodEmoji: "💳",
      status: "completed",
      receipt: true,
    });
  } else {
    base.push({
      id: "3",
      date: "—",
      description: "Remaining balance",
      amount: "£800",
      amountClass: "text-amber-600",
      method: "—",
      methodEmoji: "",
      status: "pending",
      receipt: false,
    });
  }
  return base;
}

function digitsOnly(s) {
  return s.replace(/\D/g, "");
}

function formatCardDisplay(digits) {
  const g = digits.slice(0, 16);
  return g.replace(/(.{4})/g, "$1 ").trim();
}

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payOpen, setPayOpen] = useState(false);
  const [paymentSnapshot, setPaymentSnapshot] = useState(loadSavedPaymentState);
  const balanceSettled = paymentSnapshot.settled;
  const finalPayDate = paymentSnapshot.paidAt;

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [payError, setPayError] = useState("");

  const historyRows = useMemo(
    () => buildHistoryRows(balanceSettled, finalPayDate),
    [balanceSettled, finalPayDate],
  );

  const paid = balanceSettled ? TOTAL : INITIAL_PAID;
  const balance = balanceSettled ? 0 : BALANCE_DUE;
  const paymentCount = balanceSettled ? 3 : 2;
  const progressPct = Math.min(100, Math.round((paid / TOTAL) * 1000) / 10);

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

  const cardDigits = digitsOnly(cardNumber);
  const expDigits = digitsOnly(expiry);
  const cvvDigits = digitsOnly(cvv);
  const canSubmitOneTimePay =
    cardDigits.length >= 16 &&
    expDigits.length === 4 &&
    cvvDigits.length >= 3 &&
    !balanceSettled;

  const openModal = () => {
    if (balanceSettled) return;
    setPayError("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    setPayOpen(true);
  };

  const closeModal = () => {
    setPayOpen(false);
    setPayError("");
  };

  const completeOneTimePayment = () => {
    if (!canSubmitOneTimePay) {
      setPayError("Enter a valid card (16 digits), expiry (MMYY), and CVV.");
      return;
    }
    const paidAtLabel = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    savePaymentSettled(paidAtLabel);
    setPaymentSnapshot({ settled: true, paidAt: paidAtLabel });
    closeModal();
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
          Payments
        </h1>
        <p className="text-sm font-bold text-gray-500 mt-1">
          Manage your visa application fees and payment history.
        </p>
      </header>

      <div
        className="inline-flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-50/80 p-1"
        role="tablist"
        aria-label="Payments sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "summary"}
          onClick={() => setTab("summary")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all ${
            tab === "summary"
              ? "bg-secondary text-white shadow-md shadow-secondary/20"
              : "text-gray-600 hover:text-primary"
          }`}
        >
          <PoundSterling size={16} strokeWidth={2.5} />
          Summary
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wide transition-all ${
            tab === "history"
              ? "bg-secondary text-white shadow-md shadow-secondary/20"
              : "text-gray-600 hover:text-primary"
          }`}
        >
          <History size={16} strokeWidth={2.5} />
          History
        </button>
      </div>

      {tab === "summary" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Total fee
              </p>
              <p className="text-3xl font-black text-secondary mt-1 tabular-nums">
                £{TOTAL.toLocaleString("en-GB")}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Skilled Worker visa + 1 dependant
              </p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                Amount paid
              </p>
              <p className="text-3xl font-black text-emerald-600 mt-1 tabular-nums">
                £{paid.toLocaleString("en-GB")}
              </p>
              <p className="text-xs font-bold text-gray-500 mt-1">
                Across {paymentCount} payments
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 mb-4">
              Payment progress
            </h2>
            <div className="mb-1 flex justify-between text-xs font-bold text-gray-500">
              <span>Paid: £{paid.toLocaleString("en-GB")}</span>
              <span>Remaining: £{balance.toLocaleString("en-GB")}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-secondary transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {balanceSettled ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm md:flex-row md:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CircleCheck size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-900">
                  Balance paid in full
                </h3>
                <p className="text-sm font-bold text-emerald-800/80 mt-1">
                  Your one-time settlement was received on {finalPayDate}. No
                  further payment is required for this case.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl border border-secondary/25 bg-gradient-to-br from-secondary/10 to-secondary/[0.02] p-6 shadow-sm md:flex-row md:items-center md:gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-gray-900">
                  Pay remaining balance — £{BALANCE_DUE.toLocaleString("en-GB")}{" "}
                  <span className="text-xs font-black text-gray-500 normal-case">
                    (one-time)
                  </span>
                </h3>
                <p className="text-sm font-bold text-gray-500 mt-1">
                  Settle the full remaining balance in a single payment. After
                  this, your fees for this case are complete.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                  <span>Accepted:</span>
                  {["Stripe", "Razorpay", "Bank transfer"].map((m) => (
                    <span
                      key={m}
                      className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-gray-600"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={openModal}
                className="shrink-0 rounded-xl bg-secondary px-6 py-3 text-sm font-black text-white shadow-md shadow-secondary/25 transition-colors hover:bg-secondary/90 md:self-center"
              >
                Pay now
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6 overflow-x-auto">
          <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
            <History size={18} className="text-secondary" />
            Payment history
          </h2>
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {["Date", "Description", "Amount", "Method", "Status", "Receipt"].map(
                  (h) => (
                    <th
                      key={h}
                      className="py-3 px-3 text-[11px] font-black uppercase tracking-wider text-gray-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-50">
                  <td className="py-3 px-3 text-sm font-bold text-gray-800 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-3 text-sm font-bold text-gray-700">
                    {row.description}
                  </td>
                  <td
                    className={`py-3 px-3 text-sm font-black tabular-nums ${row.amountClass}`}
                  >
                    {row.amount}
                  </td>
                  <td className="py-3 px-3">
                    {row.method === "—" ? (
                      <span className="text-gray-400 text-sm">—</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                        <span aria-hidden>{row.methodEmoji}</span>
                        {row.method}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                        row.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {row.receipt ? (
                      <button
                        type="button"
                        onClick={() =>
                          window.alert("Demo: receipt download would start here.")
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] font-black text-gray-600 hover:border-secondary/40 hover:text-secondary"
                      >
                        <Download size={12} />
                        Download
                      </button>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={payOpen}
        onClose={closeModal}
        title="Complete one-time payment"
        maxWidthClass="max-w-md"
      >
        <p className="text-sm font-bold text-gray-500 mb-4">
          Paying the full remaining balance for case {CASE_ID}. This is a single
          charge — you will not be asked to pay this balance again.
        </p>
        <div className="flex justify-between gap-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 mb-5">
          <span className="text-sm font-bold text-gray-500">Payment amount</span>
          <span className="text-xl font-black text-amber-600 tabular-nums">
            £{BALANCE_DUE.toLocaleString("en-GB")}
          </span>
        </div>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
              Card number
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={formatCardDisplay(cardDigits)}
              onChange={(e) => {
                setCardNumber(digitsOnly(e.target.value).slice(0, 16));
                setPayError("");
              }}
              placeholder="1234 5678 9012 3456"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
                Expiry (MM / YY)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={
                  expDigits.length > 2
                    ? `${expDigits.slice(0, 2)} / ${expDigits.slice(2)}`
                    : expDigits
                }
                onChange={(e) => {
                  setExpiry(digitsOnly(e.target.value).slice(0, 4));
                  setPayError("");
                }}
                placeholder="MM / YY"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">
                CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvvDigits}
                onChange={(e) => {
                  setCvv(digitsOnly(e.target.value).slice(0, 4));
                  setPayError("");
                }}
                placeholder="•••"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 focus:border-secondary focus:ring-2 focus:ring-secondary/15 outline-none"
              />
            </div>
          </div>
        </div>
        {payError && (
          <p className="text-xs font-bold text-red-600 mb-3">{payError}</p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-black text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={completeOneTimePayment}
            disabled={!canSubmitOneTimePay}
            className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-black text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 disabled:opacity-45 disabled:pointer-events-none"
          >
            Pay £{BALANCE_DUE.toLocaleString("en-GB")}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Payments;
