import { useState, useEffect } from 'react';
import { getGatewayStatus } from '../services/billingApi';

// Module-level cache so only one network request fires regardless of how many
// components call this hook during the same session.
let _cached = null;
let _pending = null;

function fetchPlatformCurrencyCode() {
  if (_cached) return Promise.resolve(_cached);
  if (!_pending) {
    _pending = getGatewayStatus()
      .then(res => {
        _cached = res.data?.data?.gateway?.currency || 'GBP';
        _pending = null;
        return _cached;
      })
      .catch(() => {
        _cached = 'GBP';
        _pending = null;
        return 'GBP';
      });
  }
  return _pending;
}

export default function usePlatformCurrency() {
  const [currency, setCurrency] = useState(_cached || 'GBP');

  useEffect(() => {
    let cancelled = false;
    fetchPlatformCurrencyCode().then(code => {
      if (!cancelled) setCurrency(code);
    });
    return () => { cancelled = true; };
  }, []);

  return currency;
}
