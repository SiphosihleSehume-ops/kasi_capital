/**
 * Kasi Capital — API Configuration
 * Central source of truth for all backend URLs.
 * Swap values here to target staging or production.
 */
const API = (() => {
  const INVEST_BASE  = 'https://kasi-capital-invest-942060975592.europe-west1.run.app';
  const MOMO_BASE    = 'https://kasi-capital-566456393756.africa-south1.run.app';

  // ─── Invest API (MockBrokerageAPI) ──────────────────────────────────────────
  const invest = {
    base: INVEST_BASE,

    // Auth & utility
    createUser:      `${INVEST_BASE}/v1/test/create-user`,
    token:           `${INVEST_BASE}/v1/auth/token`,
    revokeToken:     `${INVEST_BASE}/v1/auth/revoke`,
    health:          `${INVEST_BASE}/v1/health`,

    // Accounts
    accounts:        `${INVEST_BASE}/v1/accounts`,
    account:         (id)      => `${INVEST_BASE}/v1/accounts/${id}`,
    accountSummary:  (id)      => `${INVEST_BASE}/v1/accounts/${id}/summary`,

    // Money movement
    bankLinks:       (id)      => `${INVEST_BASE}/v1/accounts/${id}/bank-links`,
    deposits:        (id)      => `${INVEST_BASE}/v1/accounts/${id}/deposits`,
    withdrawals:     (id)      => `${INVEST_BASE}/v1/accounts/${id}/withdrawals`,

    // Market data
    assets:          `${INVEST_BASE}/v1/assets`,
    asset:           (sym)     => `${INVEST_BASE}/v1/assets/${sym}`,
    quote:           (sym)     => `${INVEST_BASE}/v1/market/quotes/${sym}`,
    historical:      (sym)     => `${INVEST_BASE}/v1/market/historical/${sym}`,

    // Orders  (account_id sent as query param)
    orders:          (acctId)  => `${INVEST_BASE}/v1/orders?account_id=${acctId}`,
    order:           (ordId, acctId) => `${INVEST_BASE}/v1/orders/${ordId}?account_id=${acctId}`,

    // Positions
    positions:       (acctId)  => `${INVEST_BASE}/v1/positions?account_id=${acctId}`,
    position:        (sym, acctId) => `${INVEST_BASE}/v1/positions/${sym}?account_id=${acctId}`,

    // Watchlists
    watchlists:      (acctId)  => `${INVEST_BASE}/v1/watchlists?account_id=${acctId}`,
    watchlist:       (wlId, acctId) => `${INVEST_BASE}/v1/watchlists/${wlId}?account_id=${acctId}`,
    watchlistSymbol: (wlId, sym, acctId) => `${INVEST_BASE}/v1/watchlists/${wlId}/${sym}?account_id=${acctId}`,

    // Simulation control
    simStart:        `${INVEST_BASE}/v1/simulation/start`,
    simStop:         `${INVEST_BASE}/v1/simulation/stop`,
    simStatus:       `${INVEST_BASE}/v1/simulation/status`,
    simReset:        `${INVEST_BASE}/v1/simulation/reset`,
  };

  // ─── MoMo API (MTN Mobile Money) ────────────────────────────────────────────
  const momo = {
    base: MOMO_BASE,

    // Collection
    pay:             `${MOMO_BASE}/api/v1/pay`,
    paymentStatus:   (ref) => `${MOMO_BASE}/api/v1/payment-status/${ref}`,
    accountInfo:     (id)  => `${MOMO_BASE}/api/v1/account-info/${id}`,
    balance:         `${MOMO_BASE}/api/v1/balance`,
    refund:          (ref) => `${MOMO_BASE}/api/v1/refund/${ref}`,
    preApproval:     `${MOMO_BASE}/api/v1/pre-approval`,

    // Disbursement
    transfer:           `${MOMO_BASE}/api/v1/transfer`,
    transferStatus:     (ref) => `${MOMO_BASE}/api/v1/transfer-status/${ref}`,
    disbursementBalance:`${MOMO_BASE}/api/v1/disbursement-balance`,
    disbursementAccount:(id)  => `${MOMO_BASE}/api/v1/disbursement-account-info/${id}`,

    // Remittance
    remittanceTransfer: `${MOMO_BASE}/api/v1/remittance/transfer`,
    remittanceStatus:   (ref) => `${MOMO_BASE}/api/v1/remittance/transfer-status/${ref}`,
    remittanceBalance:  `${MOMO_BASE}/api/v1/remittance/balance`,
  };

  // ─── Shared helpers ──────────────────────────────────────────────────────────
  /**
   * Authenticated fetch wrapper for the Invest API.
   * Reads the bearer token from sessionStorage.
   */
  async function investFetch(url, options = {}) {
    const token = sessionStorage.getItem('kasi_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * Fetch wrapper for the MoMo API (no bearer token needed — server handles MTN auth).
   */
  async function momoFetch(url, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }
    return res.json();
  }

  return { invest, momo, investFetch, momoFetch };
})();
