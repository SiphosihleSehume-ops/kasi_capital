// ─── Transaction history (session-scoped) ────────────────────────────────────
const TxStore = (() => {
  const KEY = 'kasi_transactions';
  function all() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function add(tx) {
    const list = all();
    list.unshift(tx);
    sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  }
  function update(refId, patch) {
    const list = all().map(t => t.refId === refId ? { ...t, ...patch } : t);
    sessionStorage.setItem(KEY, JSON.stringify(list));
  }
  return { all, add, update };
})();

// ─── MoMo status polling ──────────────────────────────────────────────────────
async function pollMomoStatus(statusUrl, { interval = 4000, maxAttempts = 12 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, interval));
    const data = await API.momoFetch(statusUrl);
    const status = (data.status || '').toUpperCase();
    if (status === 'SUCCESSFUL' || status === 'FAILED') return data;
  }
  throw new Error('Transaction timed out — check your MoMo app to confirm.');
}

// ─── Input validation ─────────────────────────────────────────────────────────
function validateMsisdn(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return null;
  if (digits.startsWith('0') && digits.length === 10) return '27' + digits.slice(1);
  return digits;
}
function validateAmount(raw) {
  const n = parseFloat(raw);
  if (isNaN(n) || n < 1) return null;
  return String(Math.round(n * 100) / 100);
}

// ─── Modal manager — mounts/unmounts to <body> so fixed positioning is correct ─
const Modal = (() => {
  function open(el) {
    document.body.appendChild(el);
    // Force reflow before animating
    requestAnimationFrame(() => {
      el.classList.remove('opacity-0');
      el.querySelector('[data-sheet]')?.classList.remove('translate-y-full');
    });
  }
  function close(el) {
    el.querySelector('[data-sheet]')?.classList.add('translate-y-full');
    el.classList.add('opacity-0');
    setTimeout(() => el.remove(), 280);
  }
  return { open, close };
})();

// ─── Pool store (session) ─────────────────────────────────────────────────────
const PoolStore = (() => {
  const KEY = 'kasi_pools';
  function all() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function add(pool) {
    const list = all();
    list.unshift(pool);
    sessionStorage.setItem(KEY, JSON.stringify(list));
  }
  return { all, add };
})();

// ─── Dashboard ────────────────────────────────────────────────────────────────
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

      <!-- Active Goals -->
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

      <div class="flex items-center justify-center gap-2 mt-stack-md py-4 opacity-70">
        <span class="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
        <span class="font-label-sm text-on-surface-variant">Verified by Kasi Capital Secure</span>
      </div>
    </div>
  `,

  init: async () => {
    // ── Shared helpers ────────────────────────────────────────────────────────
    const fmt = n => `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
    const showErr  = (el, msg) => { el.textContent = msg; el.classList.remove('hidden'); };
    const hideErr  = el => el.classList.add('hidden');

    // ── Round-up animation ────────────────────────────────────────────────────
    document.getElementById('roundup-btn').addEventListener('click', () => {
      const icon = document.querySelector('#roundup-btn .material-symbols-outlined');
      icon.style.transform = 'scale(1.2)';
      icon.style.transition = 'transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275)';
      setTimeout(() => { icon.style.transform = 'scale(1)'; }, 200);
    });

    // ── Portfolio summary ─────────────────────────────────────────────────────
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
        document.getElementById('portfolio-bar').style.width = `${Math.min(100, Math.round((equity / 200000) * 100))}%`;
      } catch (_) { /* keep placeholders */ }
    }

    // ── Live assets ───────────────────────────────────────────────────────────
    async function loadAssets() {
      try {
        const assets = await API.investFetch(API.invest.assets);
        const iconMap = { etf:'show_chart', bond:'account_balance', mutual_fund:'pie_chart',
          money_market:'savings', crypto_etf:'currency_bitcoin', fixed_deposit:'lock', hedge_fund:'shield' };
        document.getElementById('assets-list').innerHTML = assets.slice(0, 4).map(a => `
          <div class="bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex gap-4 items-center">
            <div class="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center shrink-0 relative">
              <div class="absolute inset-0 rounded-lg bg-gradient-to-br from-tertiary/20 to-transparent"></div>
              <span class="material-symbols-outlined text-tertiary text-[28px]">${iconMap[a.type] || 'trending_up'}</span>
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

    // ── Transaction feed helpers ──────────────────────────────────────────────
    function prependTx(tx) {
      const feed = document.getElementById('tx-feed');
      if (!feed) return;
      const isDeposit   = tx.type === 'deposit';
      const statusColor = tx.status === 'SUCCESSFUL' ? 'text-growth-green' : tx.status === 'FAILED' ? 'text-error' : 'text-on-surface-variant';
      const statusIcon  = tx.status === 'SUCCESSFUL' ? 'check_circle'     : tx.status === 'FAILED' ? 'cancel'     : 'schedule';
      const sign        = isDeposit ? '+' : '−';
      const row         = document.createElement('div');
      row.id            = `tx-${tx.refId}`;
      row.className     = 'flex items-center gap-4 p-4 border-b border-border-soft animate-pop-in opacity-0';
      row.innerHTML = `
        <div class="w-10 h-10 rounded-full ${isDeposit ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[20px]">${isDeposit ? 'add_circle' : 'send'}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-body-md text-on-surface truncate">${isDeposit ? 'Deposit' : 'Withdrawal'} · <span class="font-label-sm text-on-surface-variant">+${tx.phone}</span></p>
          <p class="font-label-sm text-on-surface-variant flex items-center gap-1" id="txstatus-${tx.refId}">
            <span class="material-symbols-outlined text-[13px] ${statusColor}">${statusIcon}</span>
            <span class="${statusColor}">${tx.status}</span>
          </p>
        </div>
        <div class="font-label-md ${statusColor} shrink-0" id="txamt-${tx.refId}">${sign}${fmt(tx.amount)}</div>`;
      feed.prepend(row);
    }

    function updateTxRow(refId, status) {
      const statusColor = status === 'SUCCESSFUL' ? 'text-growth-green' : 'text-error';
      const statusIcon  = status === 'SUCCESSFUL' ? 'check_circle'      : 'cancel';
      const statusEl    = document.getElementById(`txstatus-${refId}`);
      const amtEl       = document.getElementById(`txamt-${refId}`);
      if (statusEl) statusEl.innerHTML = `<span class="material-symbols-outlined text-[13px] ${statusColor}">${statusIcon}</span> <span class="${statusColor}">${status}</span>`;
      if (amtEl)    amtEl.className    = amtEl.className.replace(/text-\S+/g, '').trim() + ` font-label-md ${statusColor} shrink-0`;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ── MODAL BUILDER ─────────────────────────────────────────────────────────
    // All modals are built as detached DOM nodes, appended to <body> on open,
    // and removed on close — this guarantees fixed positioning works correctly
    // regardless of where in the page tree the button sits.
    // ══════════════════════════════════════════════════════════════════════════
    function buildModal(id, content) {
      const el = document.createElement('div');
      el.id = id;
      // Overlay: covers full viewport
      el.className = 'fixed inset-0 z-[100] flex items-end justify-center opacity-0 transition-opacity duration-250';
      el.style.backgroundColor = 'rgba(0,0,0,0.5)';
      // Sheet: slides up from bottom
      el.innerHTML = `
        <div data-sheet class="bg-surface-white w-full max-w-md rounded-t-2xl shadow-2xl translate-y-full transition-transform duration-280 ease-out overflow-y-auto max-h-[90dvh]">
          ${content}
        </div>`;
      return el;
    }

    // Shared step-switcher — only one step div visible at a time
    function showStep(modal, stepId) {
      modal.querySelectorAll('[data-step]').forEach(s => {
        s.style.display = s.dataset.step === stepId ? 'flex' : 'none';
      });
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ── DEPOSIT MODAL ─────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    function openDepositModal() {
      const modal = buildModal('deposit-modal', `
        <!-- STEP: form -->
        <div data-step="form" style="display:flex" class="flex-col gap-4 p-6">
          <div class="flex items-center justify-between">
            <h3 class="font-headline-sm text-on-surface">Deposit via MoMo</h3>
            <button data-close class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-transform">
              <span class="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
            </button>
          </div>
          <p class="font-body-md text-on-surface-variant text-sm leading-relaxed">
            A payment request is sent to your MTN MoMo number. Approve it in your MoMo app to complete the deposit.
          </p>
          <label class="flex flex-col gap-1">
            <span class="font-label-sm text-on-surface-variant">Amount (ZAR)</span>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant pointer-events-none">R</span>
              <input data-input="amount" type="number" min="1" step="0.01" placeholder="0.00"
                class="w-full bg-surface-container rounded-xl pl-8 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
            </div>
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-label-sm text-on-surface-variant">Your MoMo Number</span>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-sm text-on-surface-variant pointer-events-none">+</span>
              <input data-input="phone" type="tel" placeholder="27821234567"
                class="w-full bg-surface-container rounded-xl pl-7 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
            </div>
            <span class="font-label-sm text-on-surface-variant">International format — e.g. 27821234567</span>
          </label>
          <p data-err class="font-label-sm text-error hidden"></p>
          <div class="flex gap-3 pb-2">
            <button data-cancel class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-xl active:scale-95 transition-transform">Cancel</button>
            <button data-submit class="flex-1 bg-primary-container text-on-primary-container font-label-md py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">add_circle</span> Request Payment
            </button>
          </div>
        </div>

        <!-- STEP: pending -->
        <div data-step="pending" style="display:none" class="flex-col items-center gap-5 p-6 py-12">
          <div class="w-20 h-20 rounded-full bg-primary-container/30 flex items-center justify-center relative">
            <div class="absolute inset-0 rounded-full border-4 border-primary-container/40 border-t-primary animate-spin"></div>
            <span class="material-symbols-outlined text-[36px] text-on-primary-container">phone_android</span>
          </div>
          <div class="flex flex-col items-center gap-2 text-center">
            <h3 class="font-headline-sm text-on-surface">Awaiting Approval</h3>
            <p data-pending-msg class="font-body-md text-on-surface-variant">Check your MoMo app and approve the payment request.</p>
          </div>
          <div class="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div class="h-full bg-primary-container rounded-full" style="animation:shimmer 1.8s infinite;background:linear-gradient(90deg,#ffcc00 25%,#f1c100 50%,#ffcc00 75%);background-size:200% 100%"></div>
          </div>
          <p data-ref class="font-label-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full"></p>
          <button data-cancel-poll class="font-label-sm text-on-surface-variant underline">Cancel</button>
        </div>

        <!-- STEP: success -->
        <div data-step="success" style="display:none" class="flex-col items-center gap-4 p-6 py-12">
          <div class="w-20 h-20 rounded-full bg-growth-green/15 flex items-center justify-center">
            <span class="material-symbols-outlined text-[52px] text-growth-green" style="font-variation-settings:'FILL' 1;">check_circle</span>
          </div>
          <div class="flex flex-col items-center gap-1 text-center">
            <h3 class="font-headline-sm text-on-surface">Deposit Successful!</h3>
            <p data-success-msg class="font-body-md text-on-surface-variant"></p>
          </div>
          <p data-success-ref class="font-label-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full"></p>
          <button data-done class="w-full bg-primary-container text-on-primary-container font-label-md py-3 rounded-xl mt-2 active:scale-95 transition-transform">Done</button>
        </div>

        <!-- STEP: failed -->
        <div data-step="failed" style="display:none" class="flex-col items-center gap-4 p-6 py-12">
          <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-[52px] text-error" style="font-variation-settings:'FILL' 1;">cancel</span>
          </div>
          <div class="flex flex-col items-center gap-1 text-center">
            <h3 class="font-headline-sm text-on-surface">Payment Failed</h3>
            <p data-fail-msg class="font-body-md text-on-surface-variant">The payment was declined or timed out.</p>
          </div>
          <div class="flex gap-3 w-full mt-2">
            <button data-retry class="flex-1 bg-primary-container text-on-primary-container font-label-md py-3 rounded-xl active:scale-95 transition-transform">Try Again</button>
            <button data-close class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-xl active:scale-95 transition-transform">Close</button>
          </div>
        </div>
      `);

      const closeModal = () => Modal.close(modal);
      modal.querySelectorAll('[data-close],[data-cancel]').forEach(b => b.addEventListener('click', closeModal));
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
      modal.querySelector('[data-retry]').addEventListener('click', () => showStep(modal, 'form'));

      let pollAbort = false;
      modal.querySelector('[data-cancel-poll]').addEventListener('click', () => { pollAbort = true; closeModal(); });
      modal.querySelector('[data-done]').addEventListener('click', () => { closeModal(); loadAccountSummary(); });

      modal.querySelector('[data-submit]').addEventListener('click', async () => {
        const amtRaw   = modal.querySelector('[data-input="amount"]').value.trim();
        const phoneRaw = modal.querySelector('[data-input="phone"]').value.trim();
        const errEl    = modal.querySelector('[data-err]');
        hideErr(errEl);

        const amount = validateAmount(amtRaw);
        if (!amount) { showErr(errEl, 'Please enter a valid amount (minimum R1).'); return; }
        const phone = validateMsisdn(phoneRaw);
        if (!phone)  { showErr(errEl, 'Enter a valid international number — e.g. 27821234567.'); return; }

        showStep(modal, 'pending');
        modal.querySelector('[data-pending-msg]').textContent = `Approve the ${fmt(amount)} request in your MoMo app (${phone}).`;
        pollAbort = false;

        let refId = null;
        try {
          const resp = await API.momoFetch(API.momo.pay, {
            method: 'POST',
            body: JSON.stringify({
              amount,
              currency:     'ZAR',
              external_id:  `dep-${Date.now()}`,
              payer_message:'Kasi Capital deposit',
              payee_note:   'Pool contribution',
              payer: { partyIdType:'MSISDN', partyId: phone },
            }),
          });
          refId = resp.reference_id;
          modal.querySelector('[data-ref]').textContent = `Ref: ${refId}`;

          const tx = { type:'deposit', refId, amount, phone, status:'PENDING', ts: Date.now() };
          TxStore.add(tx);
          prependTx(tx);

          const result      = await pollMomoStatus(API.momo.paymentStatus(refId));
          if (pollAbort) return;
          const finalStatus = (result.status || '').toUpperCase();
          TxStore.update(refId, { status: finalStatus });
          updateTxRow(refId, finalStatus);

          if (finalStatus === 'SUCCESSFUL') {
            modal.querySelector('[data-success-msg]').textContent = `${fmt(amount)} deposited to your pool wallet.`;
            modal.querySelector('[data-success-ref]').textContent = `Ref: ${refId}`;
            showStep(modal, 'success');
            loadAccountSummary();
          } else {
            modal.querySelector('[data-fail-msg]').textContent = result.message || 'Payment was declined.';
            showStep(modal, 'failed');
          }
        } catch (err) {
          if (pollAbort) return;
          if (refId) { TxStore.update(refId, { status:'FAILED' }); updateTxRow(refId, 'FAILED'); }
          modal.querySelector('[data-fail-msg]').textContent = err.message;
          showStep(modal, 'failed');
        }
      });

      Modal.open(modal);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ── WITHDRAW MODAL ────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════
    function openWithdrawModal() {
      const modal = buildModal('withdraw-modal', `
        <!-- STEP: form -->
        <div data-step="form" style="display:flex" class="flex-col gap-4 p-6">
          <div class="flex items-center justify-between">
            <h3 class="font-headline-sm text-on-surface">Withdraw via MoMo</h3>
            <button data-close class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-transform">
              <span class="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
            </button>
          </div>
          <p class="font-body-md text-on-surface-variant text-sm leading-relaxed">
            Funds are sent directly to the recipient's MTN MoMo wallet.
          </p>
          <label class="flex flex-col gap-1">
            <span class="font-label-sm text-on-surface-variant">Amount (ZAR)</span>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant pointer-events-none">R</span>
              <input data-input="amount" type="number" min="1" step="0.01" placeholder="0.00"
                class="w-full bg-surface-container rounded-xl pl-8 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
            </div>
          </label>
          <label class="flex flex-col gap-1">
            <span class="font-label-sm text-on-surface-variant">Recipient MoMo Number</span>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-sm text-on-surface-variant pointer-events-none">+</span>
              <input data-input="phone" type="tel" placeholder="27821234567"
                class="w-full bg-surface-container rounded-xl pl-7 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
            </div>
            <span class="font-label-sm text-on-surface-variant">International format — e.g. 27821234567</span>
          </label>
          <!-- Confirm banner -->
          <div data-confirm-banner class="bg-secondary/8 border border-secondary/20 rounded-xl p-4 hidden">
            <div class="flex items-center justify-between">
              <div class="flex flex-col gap-0.5">
                <span class="font-label-sm text-on-surface-variant">Sending</span>
                <span data-confirm-amount class="font-headline-sm text-on-surface"></span>
              </div>
              <span class="material-symbols-outlined text-secondary text-[20px]">east</span>
              <div class="flex flex-col gap-0.5 items-end">
                <span class="font-label-sm text-on-surface-variant">To</span>
                <span data-confirm-phone class="font-label-md text-on-surface font-mono"></span>
              </div>
            </div>
          </div>
          <p data-err class="font-label-sm text-error hidden"></p>
          <div class="flex gap-3 pb-2">
            <button data-cancel class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-xl active:scale-95 transition-transform">Cancel</button>
            <button data-submit class="flex-1 bg-secondary text-on-secondary font-label-md py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">send</span> Send Money
            </button>
          </div>
        </div>

        <!-- STEP: pending -->
        <div data-step="pending" style="display:none" class="flex-col items-center gap-5 p-6 py-12">
          <div class="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center relative">
            <div class="absolute inset-0 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin"></div>
            <span class="material-symbols-outlined text-[36px] text-secondary">send</span>
          </div>
          <div class="flex flex-col items-center gap-2 text-center">
            <h3 class="font-headline-sm text-on-surface">Sending Funds</h3>
            <p class="font-body-md text-on-surface-variant">Your transfer is being processed by MTN MoMo.</p>
          </div>
          <div class="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div class="h-full bg-secondary rounded-full" style="animation:shimmer 1.8s infinite;background:linear-gradient(90deg,#1f5dae 25%,#4a82cc 50%,#1f5dae 75%);background-size:200% 100%"></div>
          </div>
          <p data-ref class="font-label-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full"></p>
        </div>

        <!-- STEP: success -->
        <div data-step="success" style="display:none" class="flex-col items-center gap-4 p-6 py-12">
          <div class="w-20 h-20 rounded-full bg-growth-green/15 flex items-center justify-center">
            <span class="material-symbols-outlined text-[52px] text-growth-green" style="font-variation-settings:'FILL' 1;">check_circle</span>
          </div>
          <div class="flex flex-col items-center gap-1 text-center">
            <h3 class="font-headline-sm text-on-surface">Transfer Successful!</h3>
            <p data-success-msg class="font-body-md text-on-surface-variant"></p>
          </div>
          <p data-success-ref class="font-label-sm text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full"></p>
          <button data-done class="w-full bg-secondary text-on-secondary font-label-md py-3 rounded-xl mt-2 active:scale-95 transition-transform">Done</button>
        </div>

        <!-- STEP: failed -->
        <div data-step="failed" style="display:none" class="flex-col items-center gap-4 p-6 py-12">
          <div class="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-[52px] text-error" style="font-variation-settings:'FILL' 1;">cancel</span>
          </div>
          <div class="flex flex-col items-center gap-1 text-center">
            <h3 class="font-headline-sm text-on-surface">Transfer Failed</h3>
            <p data-fail-msg class="font-body-md text-on-surface-variant">The transfer could not be completed.</p>
          </div>
          <div class="flex gap-3 w-full mt-2">
            <button data-retry class="flex-1 bg-secondary text-on-secondary font-label-md py-3 rounded-xl active:scale-95 transition-transform">Try Again</button>
            <button data-close class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-xl active:scale-95 transition-transform">Close</button>
          </div>
        </div>
      `);

      const closeModal = () => Modal.close(modal);
      modal.querySelectorAll('[data-close],[data-cancel]').forEach(b => b.addEventListener('click', closeModal));
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
      modal.querySelector('[data-retry]').addEventListener('click', () => showStep(modal, 'form'));
      modal.querySelector('[data-done]').addEventListener('click', () => { closeModal(); loadAccountSummary(); });

      // Live confirm banner
      const updateBanner = () => {
        const amt   = validateAmount(modal.querySelector('[data-input="amount"]').value.trim());
        const phone = validateMsisdn(modal.querySelector('[data-input="phone"]').value.trim());
        const banner = modal.querySelector('[data-confirm-banner]');
        if (amt && phone) {
          modal.querySelector('[data-confirm-amount]').textContent = fmt(amt);
          modal.querySelector('[data-confirm-phone]').textContent  = `+${phone}`;
          banner.classList.remove('hidden');
        } else {
          banner.classList.add('hidden');
        }
      };
      modal.querySelector('[data-input="amount"]').addEventListener('input', updateBanner);
      modal.querySelector('[data-input="phone"]').addEventListener('input',  updateBanner);

      modal.querySelector('[data-submit]').addEventListener('click', async () => {
        const amtRaw   = modal.querySelector('[data-input="amount"]').value.trim();
        const phoneRaw = modal.querySelector('[data-input="phone"]').value.trim();
        const errEl    = modal.querySelector('[data-err]');
        hideErr(errEl);

        const amount = validateAmount(amtRaw);
        if (!amount) { showErr(errEl, 'Please enter a valid amount (minimum R1).'); return; }
        const phone = validateMsisdn(phoneRaw);
        if (!phone)  { showErr(errEl, 'Enter a valid international number — e.g. 27821234567.'); return; }

        showStep(modal, 'pending');

        let refId = null;
        try {
          const resp = await API.momoFetch(API.momo.transfer, {
            method: 'POST',
            body: JSON.stringify({
              amount,
              currency:     'ZAR',
              external_id:  `wdr-${Date.now()}`,
              payer_message:'Kasi Capital withdrawal',
              payee_note:   'Pool withdrawal',
              payee: { partyIdType:'MSISDN', partyId: phone },
            }),
          });
          refId = resp.reference_id;
          modal.querySelector('[data-ref]').textContent = `Ref: ${refId}`;

          const tx = { type:'withdrawal', refId, amount, phone, status:'PENDING', ts: Date.now() };
          TxStore.add(tx);
          prependTx(tx);

          const result      = await pollMomoStatus(API.momo.transferStatus(refId));
          const finalStatus = (result.status || '').toUpperCase();
          TxStore.update(refId, { status: finalStatus });
          updateTxRow(refId, finalStatus);

          if (finalStatus === 'SUCCESSFUL') {
            modal.querySelector('[data-success-msg]').textContent = `${fmt(amount)} sent to +${phone}.`;
            modal.querySelector('[data-success-ref]').textContent = `Ref: ${refId}`;
            showStep(modal, 'success');
            loadAccountSummary();
          } else {
            modal.querySelector('[data-fail-msg]').textContent = result.message || 'Transfer was declined.';
            showStep(modal, 'failed');
          }
        } catch (err) {
          if (refId) { TxStore.update(refId, { status:'FAILED' }); updateTxRow(refId, 'FAILED'); }
          modal.querySelector('[data-fail-msg]').textContent = err.message;
          showStep(modal, 'failed');
        }
      });

      Modal.open(modal);
    }

    // Wire top-level buttons
    document.getElementById('deposit-btn').addEventListener('click',  openDepositModal);
    document.getElementById('withdraw-btn').addEventListener('click', openWithdrawModal);

    // ── Boot ──────────────────────────────────────────────────────────────────
    loadAssets();
    loadAccountSummary();
    TxStore.all().forEach(tx => prependTx(tx));
  }
});
