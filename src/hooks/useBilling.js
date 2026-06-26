import { useCallback, useState } from "react";
import {
  getSubscriptions,
  getSubscriptionByOrg,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  exportInvoicesPdf,
  exportFinancials,
  getTransactions,
  exportTransactions,
  getTransactionById,
  getGatewayStatus,
  configureGateway,
  getDashboardStats,
} from "../services/billingApi";

export default function useBilling() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoicesPagination, setInvoicesPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [transactions, setTransactions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setSubscriptionsLoading(true);
    try {
      const res = await getSubscriptions();
      setSubscriptions(res.data?.data?.subscriptions || []);
      return { ok: true };
    } catch (e) {
      setSubscriptions([]);
      return { ok: false, error: e };
    } finally {
      setSubscriptionsLoading(false);
    }
  }, []);

  const fetchSubscriptionByOrg = useCallback(async (orgId) => {
    try {
      const res = await getSubscriptionByOrg(orgId);
      return { ok: true, data: res.data?.data?.subscription };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, []);

  const addSubscription = useCallback(async (data) => {
    return createSubscription(data);
  }, []);

  const editSubscription = useCallback(async (id, data) => {
    return updateSubscription(id, data);
  }, []);

  const removeSubscription = useCallback(async (id) => {
    return cancelSubscription(id);
  }, []);

  const renewSub = useCallback(async (id) => {
    return renewSubscription(id);
  }, []);

  const fetchInvoices = useCallback(async (params = {}) => {
    setInvoicesLoading(true);
    try {
      const res = await getInvoices(params);
      setInvoices(res.data?.data?.invoices || []);
      const meta = res.data?.data?.pagination;
      if (meta) {
        setInvoicesPagination({
          total: meta.total ?? 0,
          page: meta.page ?? params.page ?? 1,
          limit: meta.limit ?? params.limit ?? 20,
          totalPages: meta.totalPages ?? 0,
        });
      }
      return { ok: true };
    } catch (e) {
      setInvoices([]);
      return { ok: false, error: e };
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  const fetchInvoiceById = useCallback(async (id) => {
    try {
      const res = await getInvoiceById(id);
      return { ok: true, data: res.data?.data?.invoice };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, []);

  const changeInvoiceStatus = useCallback(async (id, data) => {
    return updateInvoiceStatus(id, data);
  }, []);

  const downloadInvoicesPdf = useCallback(async () => {
    return exportInvoicesPdf();
  }, []);

  const downloadFinancials = useCallback(async () => {
    return exportFinancials();
  }, []);

  const fetchTransactions = useCallback(async (params = {}) => {
    setTransactionsLoading(true);
    try {
      const res = await getTransactions(params);
      const data = res.data?.data || {};
      setTransactions(data.transactions || []);
      return { ok: true, pagination: data.pagination || null };
    } catch (e) {
      setTransactions([]);
      return { ok: false, error: e };
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const downloadTransactions = useCallback(async (params = {}) => {
    return exportTransactions(params);
  }, []);

  const fetchTransactionById = useCallback(async (id) => {
    try {
      const res = await getTransactionById(id);
      return { ok: true, data: res.data?.data?.transaction };
    } catch (e) {
      return { ok: false, error: e };
    }
  }, []);

  const fetchGatewayStatus = useCallback(async () => {
    setGatewayLoading(true);
    try {
      const res = await getGatewayStatus();
      setGatewayStatus(res.data?.data?.gateway || null);
      return { ok: true };
    } catch (e) {
      setGatewayStatus(null);
      return { ok: false, error: e };
    } finally {
      setGatewayLoading(false);
    }
  }, []);

  const saveGatewayConfig = useCallback(async (data) => {
    return configureGateway(data);
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await getDashboardStats();
      setDashboardStats(res.data?.data?.stats || null);
      return { ok: true };
    } catch (e) {
      setDashboardStats(null);
      return { ok: false, error: e };
    } finally {
      setStatsLoading(false);
    }
  }, []);

  return {
    subscriptions,
    subscriptionsLoading,
    fetchSubscriptions,
    fetchSubscriptionByOrg,
    addSubscription,
    editSubscription,
    removeSubscription,
    renewSub,
    invoices,
    invoicesLoading,
    invoicesPagination,
    fetchInvoices,
    fetchInvoiceById,
    changeInvoiceStatus,
    downloadInvoicesPdf,
    downloadFinancials,
    transactions,
    transactionsLoading,
    fetchTransactions,
    downloadTransactions,
    fetchTransactionById,
    gatewayStatus,
    gatewayLoading,
    fetchGatewayStatus,
    saveGatewayConfig,
    dashboardStats,
    statsLoading,
    fetchDashboardStats,
  };
}
