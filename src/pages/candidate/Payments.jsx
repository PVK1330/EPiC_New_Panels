import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  PoundSterling,
  History,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Modal from "../../components/Modal";
import { getCandidateCcl, getCandidatePaymentSchedule } from "../../services/workflowApi";
import {
  createCaseCheckoutSession,
  verifyCheckoutSession,
} from "../../services/candidatePaymentApi";

const CASE_ID_FALLBACK = "—";

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payOpen, setPayOpen] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState("");
  const [payError, setPayError] = useState("");
  const [redirectState, setRedirectState] = useState("idle");

  const loadSchedule = useCallback(async () => {
    try {
      setScheduleLoading(true);
      setScheduleError("");
      const data = await getCandidatePaymentSchedule();

      if (data?.visible === true) {
        setSchedule(data);
        return;
      }

      const cclBundle = await getCandidateCcl().catch(() => null);
      if (cclBundle?.releasedToClient) {
        const totalFee =
          Number(cclBundle.case?.totalAmount) || Number(cclBundle.ccl?.feeAmount) || 0;
        const instalments = cclBundle.ccl?.installmentPlan || cclBundle.ccl?.installment_plan;
        if (totalFee > 0) {
          const paidAmount = Number(cclBundle.case?.paidAmount) || 0;
          setSchedule({
            visible: true,
            caseId: cclBundle.case?.caseId,
            totalFee,
            paidAmount,
            balanceDue: Math.max(0, totalFee - paidAmount),
            amountStatus: cclBundle.case?.amountStatus,
            installments:
              Array.isArray(instalments) && instalments.length > 0
                ? instalments
                : [{ label: "Full fee", amount: totalFee, dueDate: null }],
          });
          return;
        }
      }

      setSchedule(data);
    } catch (e) {
      setScheduleError(e?.response?.data?.message || e.message || "Failed to load payment schedule");
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  useEffect(() => {
    const paymentResult = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (paymentResult !== "success" || !sessionId) return;

    let cancelled = false;
    (async () => {
      setPayOpen(true);
      setRedirectState("redirecting");
      try {
        await verifyCheckoutSession(sessionId);
        if (!cancelled) {
          setRedirectState("paid");
          await loadSchedule();
        }
      } catch (e) {
        if (!cancelled) {
          setPayError(e?.response?.data?.message || e.message || "Could not verify payment");
          setRedirectState("idle");
          setPayOpen(false);
        }
      } finally {
        if (!cancelled) {
          setSearchParams({}, { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, setSearchParams, loadSchedule]);

  const paymentsVisible = schedule?.visible === true;
  const caseId = schedule?.caseId || CASE_ID_FALLBACK;
  const TOTAL = Number(schedule?.totalFee) || 0;
  const paidFromApi = Number(schedule?.paidAmount) || 0;
  const balanceFromApi = Number(schedule?.balanceDue) ?? Math.max(0, TOTAL - paidFromApi);

  const historyRows = useMemo(() => {
    if (!paymentsVisible || !Array.isArray(schedule?.installments)) return [];
    const paidSoFar = paidFromApi;
    let allocated = 0;
    return schedule.installments.map((row, i) => {
      const amount = Number(row.amount || 0);
      allocated += amount;
      const isPaid = paidSoFar >= allocated - 0.02;
      return {
        id: String(i + 1),
        date: row.dueDate
          ? new Date(row.dueDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
        description: row.label || `Instalment ${i + 1}`,
        amount: `£${amount.toLocaleString()}`,
        amountClass: "text-gray-900 font-bold",
        method: isPaid ? "Stripe" : "—",
        status: isPaid ? "Paid" : "Due",
        receipt: isPaid,
      };
    });
  }, [paymentsVisible, schedule, paidFromApi]);

  const paid = paidFromApi;
  const balance = balanceFromApi;
  const balanceSettled = paymentsVisible && balance <= 0.02;

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

  const handlePayClick = async () => {
    setPayError("");
    setRedirectState("redirecting");
    setPayOpen(true);
    try {
      const data = await createCaseCheckoutSession();
      const url = data?.url;
      if (!url) throw new Error("Stripe checkout could not be started");
      window.location.href = url;
    } catch (e) {
      setRedirectState("idle");
      setPayOpen(false);
      setPayError(e?.response?.data?.message || e.message || "Failed to start payment");
    }
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
          <span className="block text-sm font-black text-secondary">{caseId}</span>
        </div>
      </header>

      {scheduleLoading && (
        <p className="text-sm text-gray-500 font-bold">Loading payment schedule…</p>
      )}
      {scheduleError && (
        <p className="text-sm text-red-600 font-bold">{scheduleError}</p>
      )}
      {payError && (
        <p className="text-sm text-red-600 font-bold">{payError}</p>
      )}
      {!scheduleLoading && !paymentsVisible && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
          <Lock className="text-amber-700 shrink-0" size={28} />
          <div>
            <h3 className="text-base font-black text-amber-950">Payments not available yet</h3>
            <p className="text-sm text-amber-800 mt-1 leading-relaxed">
              {schedule?.message ||
                "Your payment schedule will appear here after your caseworker proposes fees and an administrator approves your Client Care Letter."}
            </p>
          </div>
        </div>
      )}

      {!scheduleLoading && paymentsVisible && (
      <>

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
          {balance > 0 && !balanceSettled ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-secondary">Outstanding balance</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Pay your approved instalment plan securely via Stripe.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePayClick}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white shadow-md"
              >
                Pay £{balance.toLocaleString()}
                <ArrowRight size={16} />
              </button>
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
          ) : null}
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

      </>
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
              <h3 className="text-base font-black text-secondary">Confirming your payment</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                Please wait while we verify your Stripe payment of{" "}
                <strong>£{balance.toLocaleString()}</strong> with our records.
              </p>
            </div>
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
