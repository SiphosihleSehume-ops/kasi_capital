// ─── Cross-border pool data ────────────────────────────────────────────────────
// Single source of truth: card fields for the landing grid, plus the extra
// fields the shared pool-detail page needs (cadence, goal, members, desc…).
// These get merged into SEED_POOLS (declared in poolDetail.js, which loads
// before this file) so "Pool Detail" works for cross-border pools exactly
// the same way it already does for local ones — no create-pool flow here,
// just browsing the default pools and donating to whichever you choose.
const CROSS_BORDER_POOLS = [
  {
    id: 'cb-1', name: 'Pan-African Agri-Fund', region: 'Zambia & Uganda',
    price: 'R 1,500', priceRaw: 1500, invest: 60, save: 40,
    tagIcon: 'trending_up', tagText: '12.4% p.a. projected', tagColor: 'text-growth-green',
    cadence: 'Monthly', goal: 'R 750,000', goalRaw: 750000, members: 120, maxMembers: 200,
    desc: 'Cross-border pool investing in smallholder agri-co-ops and grain storage infrastructure across Zambia and Uganda.',
    createdAtDaysAgo: 210,
  },
  {
    id: 'cb-2', name: 'West Africa Education Trust', region: 'Ghana & Benin',
    price: 'R 500', priceRaw: 500, invest: 25, save: 75,
    tagIcon: 'school', tagText: 'Stable growth', tagColor: 'text-on-surface-variant',
    cadence: 'Monthly', goal: 'R 200,000', goalRaw: 200000, members: 95, maxMembers: 150,
    desc: 'Funds scholarships and school infrastructure for students across Ghana and Benin.',
    createdAtDaysAgo: 150,
  },
  {
    id: 'cb-3', name: 'Pan-African Infrastructure Bond', region: "Rwanda & Côte d'Ivoire",
    price: 'R 4,000', priceRaw: 4000, invest: 40, save: 60,
    tagIcon: 'account_balance', tagText: 'Government Backed', tagColor: 'text-on-surface-variant',
    cadence: 'Quarterly', goal: 'R 2,000,000', goalRaw: 2000000, members: 58, maxMembers: 100,
    desc: "Government-backed bond financing road and utility infrastructure in Rwanda and Côte d'Ivoire.",
    createdAtDaysAgo: 300,
  },
  {
    id: 'cb-4', name: 'Diaspora Real Estate', region: 'Nigeria & South Africa',
    price: 'R 10,000', priceRaw: 10000, invest: 60, save: 40,
    tagIcon: 'apartment', tagText: 'Premium Yield', tagColor: 'text-growth-green',
    cadence: 'Monthly', goal: 'R 5,000,000', goalRaw: 5000000, members: 22, maxMembers: 50,
    desc: 'Diaspora-backed pool developing residential property across Nigeria and South Africa.',
    createdAtDaysAgo: 95,
  },
];

// Merge into the shared SEED_POOLS lookup (from poolDetail.js) so the
// pool-detail page can render these the same way it renders local pools.
if (typeof SEED_POOLS !== 'undefined') {
  CROSS_BORDER_POOLS.forEach(p => {
    SEED_POOLS[p.id] = {
      id:           p.id,
      name:         p.name,
      kind:         'cross-border',
      region:       p.region,
      cadence:      p.cadence,
      perMemberRaw: p.priceRaw,
      perMember:    `${p.price} / member`,
      goal:         p.goal,
      goalRaw:      p.goalRaw,
      desc:         p.desc,
      members:      p.members,
      maxMembers:   p.maxMembers,
      pct:          Math.round((p.members / p.maxMembers) * 100),
      createdAt:    Date.now() - 1000 * 60 * 60 * 24 * p.createdAtDaysAgo,
    };
  });
}

Router.register('cross-border-pools', {
  title: 'Cross Border Pools',
  showChrome: true,
  render: () => `
    <div class="flex flex-col w-full gap-stack-lg pb-container-padding">
      <div class="px-container-padding pt-stack-sm flex flex-col gap-base relative overflow-hidden">
        <div class="flex items-center gap-2 text-primary font-label-md">
          <span class="material-symbols-outlined text-[18px]">public</span>
          <span>Cross-Border Opportunities</span>
        </div>
        <h1 class="font-display-lg-mobile text-display-lg-mobile text-on-surface">Cross-Border Wealth</h1>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-[85%]">Diversify your Stokvel portfolio across MTN MoMo's 14 African markets. Tap a pool to see details, or donate any amount you choose.</p>
      </div>

      <div class="flex flex-col gap-stack-sm px-container-padding" id="pools-container">
        ${CROSS_BORDER_POOLS.map(crossBorderCard).join('')}
      </div>
    </div>

    <!-- Donate Modal (voluntary, user-chosen amount — no fixed contribution / no pool creation) -->
    <div id="cb-modal" class="hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div class="bg-surface-white w-full max-w-md rounded-t-2xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 class="font-headline-sm text-on-surface" id="cb-modal-title">Donate to Pool</h3>
        <p class="font-body-md text-on-surface-variant" id="cb-modal-desc">Choose an amount and send your donation via MTN MoMo.</p>

        <label class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Donation Amount (ZAR)</span>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant pointer-events-none">R</span>
            <input id="cb-amount" type="number" min="1" step="1"
              class="w-full bg-surface-container rounded-lg pl-8 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
          </div>
          <span class="font-label-sm text-on-surface-variant" id="cb-suggested"></span>
        </label>

        <label class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Your MoMo Number (MSISDN)</span>
          <input id="cb-phone" type="tel" placeholder="e.g. 27821234567"
            class="bg-surface-container rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"/>
        </label>
        <p class="font-label-sm text-error hidden" id="cb-error"></p>
        <div class="flex gap-3">
          <button id="cb-cancel" class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-lg active:scale-95 transition-transform">Cancel</button>
          <button id="cb-confirm" class="flex-1 bg-primary text-on-primary-fixed font-label-md py-3 rounded-lg active:scale-95 transition-transform">Donate &amp; Pay</button>
        </div>
      </div>
    </div>
  `,
  init: () => {
    // Staggered entrance animation
    document.querySelectorAll('.pool-card').forEach((card, i) => {
      setTimeout(() => {
        card.classList.remove('opacity-0', 'translate-y-4');
        card.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
          card.querySelectorAll('[data-width]').forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
          });
        }, 300);
      }, i * 150);
    });

    // Modal plumbing
    const modal      = document.getElementById('cb-modal');
    const cbTitle     = document.getElementById('cb-modal-title');
    const cbDesc      = document.getElementById('cb-modal-desc');
    const cbAmount    = document.getElementById('cb-amount');
    const cbSuggested = document.getElementById('cb-suggested');
    const cbError     = document.getElementById('cb-error');
    const cbConfirm   = document.getElementById('cb-confirm');

    let activePool = null;
    let activeBtn  = null;

    document.getElementById('cb-cancel').addEventListener('click', () => modal.classList.add('hidden'));

    document.querySelectorAll('.join-pool-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation(); // don't trigger the card's "open detail" navigation
        activePool = btn.closest('.pool-card').dataset;
        activeBtn  = btn;
        cbTitle.textContent = `Donate to ${activePool.name}`;
        cbDesc.textContent  = `Send a once-off or recurring donation via MTN MoMo — any amount you choose.`;
        const suggested = activePool.price.replace(/[^0-9]/g, '');
        cbAmount.value = suggested;
        cbSuggested.textContent = `Suggested: ${activePool.price}, but donate whatever works for you.`;
        cbError.classList.add('hidden');
        document.getElementById('cb-phone').value = '';
        modal.classList.remove('hidden');
      });
    });

    // Card click → pool detail page (ignore clicks on the Donate button itself)
    document.addEventListener('click', function handleCrossBorderCardClick(e) {
      const card = e.target.closest('.pool-card');
      if (!card) return;
      if (!document.getElementById('app-root')?.contains(card)) return;
      const id = card.dataset.poolId;
      if (id) Router.navigate(`pool-detail?id=${id}`);
    });

    cbConfirm.addEventListener('click', async () => {
      const phone  = document.getElementById('cb-phone').value.trim();
      const amount = parseFloat(cbAmount.value);

      if (!amount || amount < 1) { showErr(cbError, 'Please enter a donation amount.'); return; }
      if (!phone) { showErr(cbError, 'Please enter your MoMo number.'); return; }

      cbConfirm.textContent = 'Processing…';
      cbConfirm.disabled = true;
      cbError.classList.add('hidden');

      try {
        const body = {
          amount:       String(Math.round(amount)),
          currency:     'ZAR',
          external_id:  `cb-${Date.now()}`,
          payer_message:`Kasi Capital – ${activePool.name}`,
          payee_note:   'Cross-border pool donation',
          payer: { partyIdType: 'MSISDN', partyId: phone },
        };
        const data = await API.momoFetch(API.momo.pay, { method: 'POST', body: JSON.stringify(body) });

        modal.classList.add('hidden');
        activeBtn.textContent = 'Donated ✓';
        activeBtn.disabled = true;
        activeBtn.classList.add('opacity-70', 'cursor-default');
        showToast(`Thank you! R${Math.round(amount).toLocaleString('en-ZA')} donated. Ref: ${data.reference_id}`);
      } catch (err) {
        showErr(cbError, err.message);
      } finally {
        cbConfirm.textContent = 'Donate & Pay';
        cbConfirm.disabled = false;
      }
    });

    function showErr(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }

    function showToast(msg) {
      const t = document.createElement('div');
      t.className = 'fixed bottom-28 left-1/2 -translate-x-1/2 bg-on-surface text-surface-white font-label-md px-5 py-3 rounded-full shadow-lg z-[60] animate-pop-in';
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 4000);
    }
  }
});

function crossBorderCard(pool) {
  return `
    <div class="pool-card bg-surface-white rounded-2xl p-container-padding shadow-[0_4px_12px_rgba(15,26,69,0.05)] flex flex-col gap-stack-sm relative overflow-hidden transform transition-transform duration-300 active:scale-[0.98] opacity-0 translate-y-4 cursor-pointer"
         data-pool-id="${pool.id}" data-name="${pool.name}" data-price="${pool.price}">
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-surface-container flex-shrink-0 flex items-center justify-center">
            <span class="material-symbols-outlined text-on-surface-variant">public</span>
          </div>
          <div class="flex flex-col">
            <h3 class="font-label-md text-label-md text-on-surface">${pool.name}</h3>
            <span class="font-label-sm text-label-sm text-on-surface-variant">${pool.region}</span>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span class="font-headline-sm text-headline-sm text-on-surface">${pool.price}</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant">suggested</span>
        </div>
      </div>
      <div class="flex flex-col gap-1 mt-2">
        <div class="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
          <span>Investment: ${pool.invest}%</span>
          <span>Savings: ${pool.save}%</span>
        </div>
        <div class="w-full h-2 rounded-full bg-surface-container overflow-hidden flex">
          <div class="h-full bg-primary transition-all duration-1000 ease-out w-0" data-width="${pool.invest}%"></div>
          <div class="h-full bg-secondary transition-all duration-1000 ease-out delay-100 w-0" data-width="${pool.save}%"></div>
        </div>
      </div>
      <div class="flex items-center justify-between mt-1 pt-stack-sm relative before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-surface-container before:to-transparent">
        <div class="flex items-center gap-1 ${pool.tagColor} font-label-sm">
          <span class="material-symbols-outlined text-[14px]">${pool.tagIcon}</span>
          <span>${pool.tagText}</span>
        </div>
        <button class="join-pool-btn bg-primary text-on-primary-fixed px-4 py-2 rounded-full font-label-md text-label-md active:bg-primary-container transition-colors">Donate</button>
      </div>
    </div>
  `;
}