import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchStatus, fetchQuote } from './api';

// connectionStatus: 'connecting' | 'online' | 'offline'
export function useApiStatus() {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastElapsed, setLastElapsed] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [quote, setQuote] = useState(null);
  const [quoteHistory, setQuoteHistory] = useState([]);
  const failureCount = useRef(0);
  const retryTimeout = useRef(null);
  const regularInterval = useRef(null);

  const checkStatus = useCallback(async () => {
    setConnectionStatus((prev) => (prev === 'offline' ? 'connecting' : prev === 'online' ? 'online' : 'connecting'));
    try {
      const res = await fetchStatus();
      if (res.ok) {
        failureCount.current = 0;
        setConnectionStatus('online');
        setLastElapsed(res.elapsed);
        setStatusData(res.data);
      } else {
        throw new Error('not ok');
      }
    } catch {
      failureCount.current += 1;
      if (failureCount.current >= 3) {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('connecting');
        // retry in 5s
        retryTimeout.current = setTimeout(checkStatus, 5000);
      }
    }
  }, []);

  const refreshQuote = useCallback(async () => {
    try {
      const res = await fetchQuote();
      if (res.ok && res.data) {
        setQuote(res.data);
        setQuoteHistory((prev) => {
          const price = parseFloat(res.data.sol_price_usd_live ?? res.data.sol_price_usd ?? res.data.price_usd ?? res.data.price ?? 0);
          if (!price) return prev;
          const next = [...prev, { price, time: Date.now() }].slice(-20);
          return next;
        });
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    checkStatus();
    refreshQuote();

    regularInterval.current = setInterval(() => {
      checkStatus();
    }, 30000);

    const quoteInterval = setInterval(refreshQuote, 5000);

    return () => {
      clearInterval(regularInterval.current);
      clearInterval(quoteInterval);
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
  }, [checkStatus, refreshQuote]);

  // legacy compat
  const online = connectionStatus === 'online' ? true : connectionStatus === 'offline' ? false : null;

  return { connectionStatus, online, lastElapsed, statusData, quote, quoteHistory };
}