// ─── Transaction history (session-scoped) ────────────────────────────────────
const TxStore = (() => {
  const KEY = 'kasi_transactions';
  function all() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function add(tx) {
    const list = all();
    list.unshift(tx); // newest first
    sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  }
  function update(refId, patch) {
    const list = all().map(t => t.refId === refId ? { ...t, ...patch } : t);
    sessionStorage.setItem(KEY, JSON.stringify(list));
  }
  return { all, add, update };
})();

// ─── MoMo polling helper ─────────────────────────────────────────────────────
// Polls a status URL every `interval` ms up to `maxAttempts` times.
// Resolves with the final status object or rejects on timeout/error.
async function pollMomoStatus(statusUrl, { interval = 3000, maxAttempts = 10 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval));
    const data = await API.momoFetch(statusUrl);
    const status = (data.status || '').toUpperCase();
    if (status === 'SUCCESSFUL' || status === 'FAILED') return data;
    // PENDING → keep polling
  }
  throw new Error('Transaction timed out — check your MoMo app to confirm.');
}

// ─── Input validation helpers ────────────────────────────────────────────────
function validateMsisdn(raw) {
  // Accept formats: +27821234567 | 27821234567 | 0821234567 | 821234567
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return null;
  // Normalise to full international digits (no "+")
  if (digits.startsWith('0') && digits.length === 10) return '27' + digits.slice(1);
  return digits;
}

function validateAmount(raw) {
  const n = parseFloat(raw);
  if (isNaN(n) || n < 1) return null;
  return String(Math.round(n * 100) / 100); // two decimal places as string
}

// ─── Dashboard page ──────────────────────────────────────────────────────────
Router.register('dashboard', {
  title: 'Dashboard',
  showChrome: true,
  render: () => `
    <div class="flex flex-col w-full gap-stack-md px-container-padding pb-stack-lg">
      <div class="flex flex-col gap-base mt-stack-sm">
        <h1 class="font-headline-md text-on-surface">Welcome back, Siyabonga.</h1>
        <p class="font-body-md text-on-surface-variant">Your stokvel is building wealth, together.</p>
      </div>

      <!-- Portfolio Summary Card -->
      <div class="flex flex-col bg-surface-white rounded-xl shadow-md p-stack-md relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col gap-base">
          <span class="font-label-md text-on-surface-variant uppercase tracking-wider">Collective Pooled Sum</span>
          <div class="flex items-baseline gap-2">
            <span class="font-display-lg text-on-surface" id="portfolio-equity">R —</span>
            <span class="font-label-md text-growth-green flex items-center bg-growth-green/10 px-2 py-0.5 rounded-full">
              <span class="material-symbols-outlined text-[16px] mr-1">trending_up</span>
              <span id="portfolio-pl">Loading…</span>
            </span>
          </div>
          <div class="w-full h-1.5 bg-surface-container mt-4 rounded-full overflow-hidden">
            <div class="h-full bg-secondary rounded-full shadow-[0_0_8px_rgba(31,93,174,0.4)] transition-all duration-700" id="portfolio-bar" style="width:0%"></div>
          </div>
          <div class="flex justify-between mt-1">
            <span class="font-label-sm text-on-surface-variant" id="portfolio-cash">Cash: R —</span>
            <span class="font-label-sm text-on-surface-variant">2024 Goal: R 200k</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-gutter overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar">
        <button id="deposit-btn" class="snap-start shrink-0 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container font-label-md px-6 py-4 rounded-lg w-[45%] active:scale-95 transition-transform">
          <span class="material-symbols-outlined">add_circle</span> Deposit
        </button>
        <button id="withdraw-btn" class="snap-start shrink-0 flex items-center justify-center gap-2 bg-surface-white border border-border-soft text-on-surface font-label-md px-6 py-4 rounded-lg w-[45%] active:scale-95 transition-transform">
          <span class="material-symbols-outlined">payments</span> Withdraw
        </button>
        <button id="roundup-btn" class="snap-start shrink-0 flex items-center justify-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-label-md px-6 py-4 rounded-lg w-[45%] active:scale-95 transition-transform">
          <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">savings</span> Round-Up
        </button>
      </div>

      <!-- Active Goals (live from Invest API) -->
      <div class="flex flex-col gap-stack-sm">
        <div class="flex items-center justify-between">
          <h2 class="font-headline-sm text-on-surface">Active Goals</h2>
          <a href="#/local-pools" class="font-label-md text-secondary">View all</a>
        </div>
        <div class="grid grid-cols-1 gap-gutter" id="assets-list">
          <div class="bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex items-center justify-center min-h-[80px]">
            <span class="font-label-md text-on-surface-variant">Loading investments…</span>
          </div>
        </div>
        <p class="font-label-sm text-error hidden" id="assets-error"></p>
      </div>

      <!-- Transaction Feed -->
      <div class="flex flex-col gap-stack-sm mt-4">
        <h2 class="font-headline-sm text-on-surface">Recent Transactions</h2>
        <div class="flex flex-col gap-0 bg-surface-white rounded-xl shadow-sm border border-border-soft overflow-hidden" id="tx-feed">
          <!-- Seeded with static fallback; replaced dynamically -->
          <div class="flex items-center gap-4 p-4 border-b border-border-soft">
            <div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body-md text-on-surface truncate"><span class="font-label-md">Thabo M.</span> contributed to JSE Top 40</p>
              <p class="font-label-sm text-on-surface-variant">Today, 09:42 AM</p>
            </div>
            <div class="font-label-md text-growth-green shrink-0">+R 1,500</div>
          </div>
          <div class="flex items-center gap-4 p-4 border-b border-border-soft">
            <div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body-md text-on-surface truncate"><span class="font-label-md">Lerato N.</span> contributed to Community Trust</p>
              <p class="font-label-sm text-on-surface-variant">Yesterday, 14:15 PM</p>
            </div>
            <div class="font-label-md text-growth-green shrink-0">+R 500</div>
          </div>
          <div class="flex items-center gap-4 p-4">
            <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings:'FILL' 1;">savings</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body-md text-on-surface truncate">Weekly Round-ups processed</p>
              <p class="font-label-sm text-on-surface-variant">Mon, 00:01 AM</p>
            </div>
            <div class="font-label-md text-growth-green shrink-0">+R 142.50</div>
          </div>
        </div>
      </div>

      <!-- ── DEPOSIT MODAL ─────────────────────────────────────────────────── -->
      <div id="deposit-modal" class="hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-surface-white w-full max-w-md rounded-t-2xl shadow-xl flex flex-col" id="deposit-sheet">

          <!-- Step 1: Input form -->
          <div id="dep-step-form" class="p-6 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="font-headline-sm text-on-surface">Deposit via MoMo</h3>
              <button id="deposit-close" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
              </button>
            </div>
            <p class="font-body-md text-on-surface-variant text-sm">A payment request will be sent to your MTN MoMo number. Approve it in your MoMo app to complete the deposit.</p>
            <label class="flex flex-col gap-1">
              <span class="font-label-sm text-on-surface-variant">Amount (ZAR)</span>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant">R</span>
                <input id="deposit-amount" type="number" min="1" step="0.01" placeholder="0.00"
                  class="w-full bg-surface-container rounded-lg pl-7 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
              </div>
            </label>
            <label class="flex flex-col gap-1">
              <span class="font-label-sm text-on-surface-variant">Your MoMo Number</span>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-sm text-on-surface-variant">+</span>
                <input id="deposit-phone" type="tel" placeholder="27821234567"
                  class="w-full bg-surface-container rounded-lg pl-7 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
              </div>
              <span class="font-label-sm text-on-surface-variant">International format, e.g. 27821234567</span>
            </label>
            <p class="font-label-sm text-error hidden" id="deposit-error"></p>
            <div class="flex gap-3">
              <button id="deposit-cancel" class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-lg active:scale-95 transition-transform">Cancel</button>
              <button id="deposit-confirm" class="flex-1 bg-primary-container text-on-primary-container font-label-md py-3 rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">add_circle</span> Request Payment
              </button>
            </div>
          </div>

          <!-- Step 2: Pending / polling -->
          <div id="dep-step-pending" class="hidden p-6 flex flex-col items-center gap-5 py-10">
            <div class="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center relative">
              <div class="absolute inset-0 rounded-full border-4 border-primary-container border-t-primary animate-spin"></div>
              <span class="material-symbols-outlined text-[36px] text-on-primary-container">phone_android</span>
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <h3 class="font-headline-sm text-on-surface">Awaiting Approval</h3>
              <p class="font-body-md text-on-surface-variant" id="dep-pending-msg">Check your MoMo app and approve the payment request.</p>
            </div>
            <div class="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div class="h-full bg-primary-container animate-pulse w-full rounded-full"></div>
            </div>
            <p class="font-label-sm text-on-surface-variant" id="dep-ref-display"></p>
            <button id="dep-cancel-poll" class="font-label-md text-on-surface-variant underline text-sm mt-2">Cancel</button>
          </div>

          <!-- Step 3: Success -->
          <div id="dep-step-success" class="hidden p-6 flex flex-col items-center gap-4 py-10">
            <div class="w-20 h-20 rounded-full bg-growth-green/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-[48px] text-growth-green" style="font-variation-settings:'FILL' 1;">check_circle</span>
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <h3 class="font-headline-sm text-on-surface">Deposit Successful!</h3>
              <p class="font-body-md text-on-surface-variant" id="dep-success-msg"></p>
            </div>
            <p class="font-label-sm text-on-surface-variant bg-surface-container px-4 py-2 rounded-full" id="dep-success-ref"></p>
            <button id="dep-done" class="w-full bg-primary-container text-on-primary-container font-label-md py-3 rounded-lg mt-2 active:scale-95 transition-transform">Done</button>
          </div>

          <!-- Step 4: Failed -->
          <div id="dep-step-failed" class="hidden p-6 flex flex-col items-center gap-4 py-10">
            <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-[48px] text-error" style="font-variation-settings:'FILL' 1;">cancel</span>
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <h3 class="font-headline-sm text-on-surface">Payment Failed</h3>
              <p class="font-body-md text-on-surface-variant" id="dep-fail-msg">The payment was declined or timed out.</p>
            </div>
            <div class="flex gap-3 w-full mt-2">
              <button id="dep-retry" class="flex-1 bg-primary-container text-on-primary-container font-label-md py-3 rounded-lg active:scale-95 transition-transform">Try Again</button>
              <button id="dep-fail-close" class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-lg active:scale-95 transition-transform">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── WITHDRAW MODAL ────────────────────────────────────────────────── -->
      <div id="withdraw-modal" class="hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-surface-white w-full max-w-md rounded-t-2xl shadow-xl flex flex-col" id="withdraw-sheet">

          <!-- Step 1: Input form -->
          <div id="wdr-step-form" class="p-6 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="font-headline-sm text-on-surface">Withdraw via MoMo</h3>
              <button id="withdraw-close" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
              </button>
            </div>
            <p class="font-body-md text-on-surface-variant text-sm">Funds will be sent directly to the recipient's MTN MoMo wallet.</p>
            <label class="flex flex-col gap-1">
              <span class="font-label-sm text-on-surface-variant">Amount (ZAR)</span>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant">R</span>
                <input id="withdraw-amount" type="number" min="1" step="0.01" placeholder="0.00"
                  class="w-full bg-surface-container rounded-lg pl-7 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
              </div>
            </label>
            <label class="flex flex-col gap-1">
              <span class="font-label-sm text-on-surface-variant">Recipient MoMo Number</span>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-sm text-on-surface-variant">+</span>
                <input id="withdraw-phone" type="tel" placeholder="27821234567"
                  class="w-full bg-surface-container rounded-lg pl-7 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
              </div>
              <span class="font-label-sm text-on-surface-variant">International format, e.g. 27821234567</span>
            </label>
            <!-- Confirm amount display -->
            <div class="bg-surface-container-low rounded-xl p-4 flex items-center justify-between hidden" id="wdr-confirm-banner">
              <div class="flex flex-col">
                <span class="font-label-sm text-on-surface-variant">You are sending</span>
                <span class="font-headline-sm text-on-surface" id="wdr-confirm-amount"></span>
              </div>
              <div class="flex flex-col items-end">
                <span class="font-label-sm text-on-surface-variant">To</span>
                <span class="font-label-md text-on-surface" id="wdr-confirm-phone"></span>
              </div>
            </div>
            <p class="font-label-sm text-error hidden" id="withdraw-error"></p>
            <div class="flex gap-3">
              <button id="withdraw-cancel" class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-lg active:scale-95 transition-transform">Cancel</button>
              <button id="withdraw-confirm" class="flex-1 bg-secondary text-on-secondary font-label-md py-3 rounded-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">send</span> Send Money
              </button>
            </div>
          </div>

          <!-- Step 2: Pending / polling -->
          <div id="wdr-step-pending" class="hidden p-6 flex flex-col items-center gap-5 py-10">
            <div class="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center relative">
              <div class="absolute inset-0 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
              <span class="material-symbols-outlined text-[36px] text-secondary">send</span>
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <h3 class="font-headline-sm text-on-surface">Sending Funds</h3>
              <p class="font-body-md text-on-surface-variant">Your transfer is being processed by MTN MoMo.</p>
            </div>
            <div class="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div class="h-full bg-secondary animate-pulse w-full rounded-full"></div>
            </div>
            <p class="font-label-sm text-on-surface-variant" id="wdr-ref-display"></p>
          </div>

          <!-- Step 3: Success -->
          <div id="wdr-step-success" class="hidden p-6 flex flex-col items-center gap-4 py-10">
            <div class="w-20 h-20 rounded-full bg-growth-green/20 flex items-center justify-center">
              <span class="material-symbols-outlined text-[48px] text-growth-green" style="font-variation-settings:'FILL' 1;">check_circle</span>
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <h3 class="font-headline-sm text-on-surface">Transfer Successful!</h3>
              <p class="font-body-md text-on-surface-variant" id="wdr-success-msg"></p>
            </div>
            <p class="font-label-sm text-on-surface-variant bg-surface-container px-4 py-2 rounded-full" id="wdr-success-ref"></p>
            <button id="wdr-done" class="w-full bg-secondary text-on-secondary font-label-md py-3 rounded-lg mt-2 active:scale-95 transition-transform">Done</button>
          </div>

          <!-- Step 4: Failed -->
          <div id="wdr-step-failed" class="hidden p-6 flex flex-col items-center gap-4 py-10">
            <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
              <span class="material-symbols-outlined text-[48px] text-error" style="font-variation-settings:'FILL' 1;">cancel</span>
            </div>
            <div class="flex flex-col items-center gap-1 text-center">
              <h3 class="font-headline-sm text-on-surface">Transfer Failed</h3>
              <p class="font-body-md text-on-surface-variant" id="wdr-fail-msg">The transfer could not be completed.</p>
            </div>
            <div class="flex gap-3 w-full mt-2">
              <button id="wdr-retry" class="flex-1 bg-secondary text-on-secondary font-label-md py-3 rounded-lg active:scale-95 transition-transform">Try Again</button>
              <button id="wdr-fail-close" class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-lg active:scale-95 transition-transform">Close</button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 mt-stack-md py-4 opacity-70">
        <span class="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
        <span class="font-label-sm text-on-surface-variant">Verified by Kasi Capital Secure</span>
      </div>
    </div>
  `,

  init: async () => {

    // ── Helpers ───────────────────────────────────────────────────────────────
    function showErr(el, msg)  { el.textContent = msg; el.classList.remove('hidden'); }
    function hideErr(el)       { el.classList.add('hidden'); }
    function fmt(n)            { return `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`; }

    // Switch steps within a modal sheet (show one div, hide siblings)
    function showStep(prefix, step) {
      ['form','pending','success','failed'].forEach(s => {
        document.getElementById(`${prefix}-step-${s}`)?.classList.toggle('hidden', s !== step);
      });
    }

    // Prepend a live transaction row into the tx feed
    function prependTx(tx) {
      const feed = document.getElementById('tx-feed');
      const isDeposit = tx.type === 'deposit';
      const statusColor = tx.status === 'SUCCESSFUL' ? 'text-growth-green' : tx.status === 'FAILED' ? 'text-error' : 'text-on-surface-variant';
      const statusIcon  = tx.status === 'SUCCESSFUL' ? 'check_circle'     : tx.status === 'FAILED' ? 'cancel'   : 'schedule';
      const sign        = isDeposit ? '+' : '-';
      const row = document.createElement('div');
      row.id = `tx-${tx.refId}`;
      row.className = 'flex items-center gap-4 p-4 border-b border-border-soft animate-pop-in opacity-0';
      row.innerHTML = `
        <div class="w-10 h-10 rounded-full ${isDeposit ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[20px]">${isDeposit ? 'add_circle' : 'send'}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-body-md text-on-surface truncate">${isDeposit ? 'Deposit' : 'Withdrawal'} · <span class="font-label-sm text-on-surface-variant">${tx.phone}</span></p>
          <p class="font-label-sm text-on-surface-variant">${new Date().toLocaleTimeString('en-ZA', { hour:'2-digit', minute:'2-digit' })} · <span class="${statusColor} flex-inline items-center gap-0.5"><span class="material-symbols-outlined text-[13px] align-middle">${statusIcon}</span> ${tx.status}</span></p>
        </div>
        <div class="font-label-md ${statusColor} shrink-0">${sign}${fmt(tx.amount)}</div>
      `;
      feed.prepend(row);
    }

    function updateTxRow(refId, status) {
      const row = document.getElementById(`tx-${refId}`);
      if (!row) return;
      const statusColor = status === 'SUCCESSFUL' ? 'text-growth-green' : 'text-error';
      const statusIcon  = status === 'SUCCESSFUL' ? 'check_circle'      : 'cancel';
      const statusEl = row.querySelector('.font-label-sm span');
      if (statusEl) statusEl.outerHTML = `<span class="${statusColor}"><span class="material-symbols-outlined text-[13px] align-middle">${statusIcon}</span> ${status}</span>`;
      const amtEl = row.querySelector('.font-label-md');
      if (amtEl) { amtEl.className = amtEl.className.replace(/text-\S+/, '').trim() + ` font-label-md ${statusColor} shrink-0`; }
    }

    // ── Round-up button ───────────────────────────────────────────────────────
    document.getElementById('roundup-btn').addEventListener('click', () => {
      const icon = document.querySelector('#roundup-btn .material-symbols-outlined');
      icon.style.transform = 'scale(1.2)';
      icon.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      setTimeout(() => { icon.style.transform = 'scale(1)'; }, 200);
    });

    // ── Load live account summary ─────────────────────────────────────────────
    async function loadAccountSummary() {
      const accountId = sessionStorage.getItem('kasi_account_id');
      if (!accountId) return;
      try {
        const s = await API.investFetch(API.invest.accountSummary(accountId));
        const equity = s.total_equity ?? 0;
        const cash   = s.cash_balance  ?? 0;
        const pl     = s.unrealized_pl ?? 0;
        document.getElementById('portfolio-equity').textContent = fmt(equity);
        document.getElementById('portfolio-cash').textContent   = `Cash: ${fmt(cash)}`;
        const plSign = pl >= 0 ? '+' : '−';
        document.getElementById('portfolio-pl').textContent = `${plSign}${fmt(Math.abs(pl))} P&L`;
        const pct = Math.min(100, Math.round((equity / 200000) * 100));
        document.getElementById('portfolio-bar').style.width = `${pct}%`;
      } catch (_) { /* keep placeholders */ }
    }

    // ── Load live assets ──────────────────────────────────────────────────────
    async function loadAssets() {
      try {
        const assets = await API.investFetch(API.invest.assets);
        const list = document.getElementById('assets-list');
        list.innerHTML = assets.slice(0, 4).map(a => `
          <div class="bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex gap-4 items-center">
            <div class="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center shrink-0 relative">
              <div class="absolute inset-0 bg-gradient-to-br from-tertiary/20 to-transparent rounded-lg"></div>
              <span class="material-symbols-outlined text-tertiary text-[28px]">${assetIcon(a.type)}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-label-md text-on-surface truncate">${a.name}</h3>
              <p class="font-label-sm text-on-surface-variant capitalize">${a.type.replace(/_/g,' ')}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="font-label-sm text-on-surface-variant">${a.fractional ? 'Fractional' : 'Whole units'}</span>
                <span class="font-label-sm text-secondary ml-auto">${fmt(a.price)}</span>
              </div>
            </div>
          </div>`).join('');
      } catch (err) {
        showErr(document.getElementById('assets-error'), `Could not load investments: ${err.message}`);
      }
    }

    function assetIcon(type) {
      return ({ etf:'show_chart', bond:'account_balance', mutual_fund:'pie_chart',
        money_market:'savings', crypto_etf:'currency_bitcoin',
        fixed_deposit:'lock', hedge_fund:'shield' })[type] || 'trending_up';
    }

    // ── DEPOSIT FLOW ──────────────────────────────────────────────────────────
    const depositModal = document.getElementById('deposit-modal');

    function openDeposit()  { depositModal.classList.remove('hidden'); showStep('dep','form'); }
    function closeDeposit() { depositModal.classList.add('hidden'); }

    document.getElementById('deposit-btn').addEventListener('click', openDeposit);
    document.getElementById('deposit-close').addEventListener('click', closeDeposit);
    document.getElementById('deposit-cancel').addEventListener('click', closeDeposit);
    depositModal.addEventListener('click', e => { if (e.target === depositModal) closeDeposit(); });

    // Live confirmation banner as user types
    function updateDepBanner() {
      // no confirm banner on deposit — just validation
    }

    let depPollAbort = false;

    document.getElementById('dep-cancel-poll').addEventListener('click', () => {
      depPollAbort = true;
      closeDeposit();
    });

    document.getElementById('dep-done').addEventListener('click', () => {
      closeDeposit();
      loadAccountSummary();
    });

    document.getElementById('dep-retry').addEventListener('click', () => showStep('dep', 'form'));
    document.getElementById('dep-fail-close').addEventListener('click', closeDeposit);

    document.getElementById('deposit-confirm').addEventListener('click', async () => {
      const rawAmount = document.getElementById('deposit-amount').value.trim();
      const rawPhone  = document.getElementById('deposit-phone').value.trim();
      const errEl     = document.getElementById('deposit-error');
      hideErr(errEl);

      // Validate
      const amount = validateAmount(rawAmount);
      if (!amount) { showErr(errEl, 'Please enter a valid amount (minimum R1).'); return; }
      const phone = validateMsisdn(rawPhone);
      if (!phone) { showErr(errEl, 'Please enter a valid international phone number, e.g. 27821234567.'); return; }

      // Step → Pending
      showStep('dep', 'pending');
      document.getElementById('dep-pending-msg').textContent =
        `Approve the R${amount} payment in your MoMo app (${phone}).`;
      depPollAbort = false;

      let refId = null;
      try {
        // 1. Initiate payment request-to-pay
        const body = {
          amount,
          currency:     'ZAR',
          external_id:  `dep-${Date.now()}`,
          payer_message:'Kasi Capital deposit',
          payee_note:   'Pool contribution',
          payer: { partyIdType: 'MSISDN', partyId: phone },
        };
        const initData = await API.momoFetch(API.momo.pay, { method: 'POST', body: JSON.stringify(body) });
        refId = initData.reference_id;
        document.getElementById('dep-ref-display').textContent = `Ref: ${refId}`;

        // Record as PENDING in store + feed
        const tx = { type:'deposit', refId, amount, phone, status:'PENDING', ts: Date.now() };
        TxStore.add(tx);
        prependTx(tx);

        // 2. Poll for final status
        const result = await pollMomoStatus(API.momo.paymentStatus(refId), {
          interval: 4000, maxAttempts: 12,
        });

        if (depPollAbort) return;

        const finalStatus = (result.status || '').toUpperCase();
        TxStore.update(refId, { status: finalStatus });
        updateTxRow(refId, finalStatus);

        if (finalStatus === 'SUCCESSFUL') {
          document.getElementById('dep-success-msg').textContent = `${fmt(amount)} deposited to your pool wallet.`;
          document.getElementById('dep-success-ref').textContent = `Ref: ${refId}`;
          showStep('dep', 'success');
          loadAccountSummary();
        } else {
          document.getElementById('dep-fail-msg').textContent =
            result.message || 'The payment was declined. Please try again.';
          showStep('dep', 'failed');
        }
      } catch (err) {
        if (depPollAbort) return;
        if (refId) { TxStore.update(refId, { status:'FAILED' }); updateTxRow(refId, 'FAILED'); }
        document.getElementById('dep-fail-msg').textContent = err.message;
        showStep('dep', 'failed');
      }
    });

    // ── WITHDRAW FLOW ─────────────────────────────────────────────────────────
    const withdrawModal = document.getElementById('withdraw-modal');

    function openWithdraw()  { withdrawModal.classList.remove('hidden'); showStep('wdr','form'); }
    function closeWithdraw() { withdrawModal.classList.add('hidden'); }

    document.getElementById('withdraw-btn').addEventListener('click', openWithdraw);
    document.getElementById('withdraw-close').addEventListener('click', closeWithdraw);
    document.getElementById('withdraw-cancel').addEventListener('click', closeWithdraw);
    withdrawModal.addEventListener('click', e => { if (e.target === withdrawModal) closeWithdraw(); });

    document.getElementById('wdr-done').addEventListener('click', () => {
      closeWithdraw();
      loadAccountSummary();
    });
    document.getElementById('wdr-retry').addEventListener('click', () => showStep('wdr', 'form'));
    document.getElementById('wdr-fail-close').addEventListener('click', closeWithdraw);

    // Live confirm banner updates as user fills in fields
    function refreshWdrBanner() {
      const rawAmt   = document.getElementById('withdraw-amount').value.trim();
      const rawPhone = document.getElementById('withdraw-phone').value.trim();
      const banner   = document.getElementById('wdr-confirm-banner');
      const amt      = validateAmount(rawAmt);
      const phone    = validateMsisdn(rawPhone);
      if (amt && phone) {
        document.getElementById('wdr-confirm-amount').textContent = fmt(amt);
        document.getElementById('wdr-confirm-phone').textContent  = `+${phone}`;
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }
    document.getElementById('withdraw-amount').addEventListener('input', refreshWdrBanner);
    document.getElementById('withdraw-phone').addEventListener('input',  refreshWdrBanner);

    document.getElementById('withdraw-confirm').addEventListener('click', async () => {
      const rawAmount = document.getElementById('withdraw-amount').value.trim();
      const rawPhone  = document.getElementById('withdraw-phone').value.trim();
      const errEl     = document.getElementById('withdraw-error');
      hideErr(errEl);

      // Validate
      const amount = validateAmount(rawAmount);
      if (!amount) { showErr(errEl, 'Please enter a valid amount (minimum R1).'); return; }
      const phone = validateMsisdn(rawPhone);
      if (!phone) { showErr(errEl, 'Please enter a valid international phone number, e.g. 27821234567.'); return; }

      // Step → Pending
      showStep('wdr', 'pending');
      document.getElementById('wdr-ref-display').textContent = '';

      let refId = null;
      try {
        // 1. Initiate disbursement transfer
        const body = {
          amount,
          currency:     'ZAR',
          external_id:  `wdr-${Date.now()}`,
          payer_message:'Kasi Capital withdrawal',
          payee_note:   'Pool withdrawal',
          payee: { partyIdType: 'MSISDN', partyId: phone },
        };
        const initData = await API.momoFetch(API.momo.transfer, { method: 'POST', body: JSON.stringify(body) });
        refId = initData.reference_id;
        document.getElementById('wdr-ref-display').textContent = `Ref: ${refId}`;

        // Record PENDING
        const tx = { type:'withdrawal', refId, amount, phone, status:'PENDING', ts: Date.now() };
        TxStore.add(tx);
        prependTx(tx);

        // 2. Poll for final status
        const result = await pollMomoStatus(API.momo.transferStatus(refId), {
          interval: 4000, maxAttempts: 12,
        });

        const finalStatus = (result.status || '').toUpperCase();
        TxStore.update(refId, { status: finalStatus });
        updateTxRow(refId, finalStatus);

        if (finalStatus === 'SUCCESSFUL') {
          document.getElementById('wdr-success-msg').textContent = `${fmt(amount)} sent to +${phone}.`;
          document.getElementById('wdr-success-ref').textContent = `Ref: ${refId}`;
          showStep('wdr', 'success');
          loadAccountSummary();
        } else {
          document.getElementById('wdr-fail-msg').textContent =
            result.message || 'The transfer was declined. Please try again.';
          showStep('wdr', 'failed');
        }
      } catch (err) {
        if (refId) { TxStore.update(refId, { status:'FAILED' }); updateTxRow(refId, 'FAILED'); }
        document.getElementById('wdr-fail-msg').textContent = err.message;
        showStep('wdr', 'failed');
      }
    });

    // ── Boot ──────────────────────────────────────────────────────────────────
    loadAssets();
    loadAccountSummary();

    // Restore any existing session transactions into the feed
    TxStore.all().forEach(tx => prependTx(tx));
  }
});
