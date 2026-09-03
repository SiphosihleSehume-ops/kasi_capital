// ─── Pool store (session-scoped, shared with dashboard) ───────────────────────
// PoolStore is defined in dashboard.js, which loads before this file.
// Guarded with window.PoolStore (assignment, not a declaration) so it's still
// safe if this page is ever loaded standalone, without colliding with the
// `const PoolStore` in dashboard.js.
if (typeof PoolStore === 'undefined') {
  window.PoolStore = (() => {
    const KEY = 'kasi_pools';
    function all()  { try { return JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch { return []; } }
    function add(p) { const l = all(); l.unshift(p); sessionStorage.setItem(KEY, JSON.stringify(l)); }
    return { all, add };
  })();
}

// Cadence options for the create-pool form
const CADENCE_OPTIONS = ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'];

// ─── Create Pool Modal ────────────────────────────────────────────────────────
function openCreatePoolModal(onCreated) {
  const el = document.createElement('div');
  el.className = 'fixed inset-0 z-[100] flex items-end justify-center opacity-0 transition-opacity duration-250';
  el.style.backgroundColor = 'rgba(0,0,0,0.5)';
  el.innerHTML = `
    <div data-sheet class="bg-surface-white w-full max-w-md rounded-t-2xl shadow-2xl translate-y-full transition-transform duration-280 ease-out overflow-y-auto max-h-[90dvh]">

      <!-- STEP: form -->
      <div data-step="form" style="display:flex" class="flex-col gap-4 p-6">
        <!-- Drag handle -->
        <div class="w-10 h-1 rounded-full bg-surface-container mx-auto mb-1"></div>

        <div class="flex items-center justify-between">
          <h3 class="font-headline-sm text-on-surface">Create a Pool</h3>
          <button data-close class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center active:scale-90 transition-transform">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>

        <!-- Pool name -->
        <label class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Pool Name <span class="text-error">*</span></span>
          <input data-input="name" type="text" maxlength="60" placeholder="e.g. Soweto Savings Circle"
            class="w-full bg-surface-container rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"/>
        </label>

        <!-- Contribution cadence -->
        <div class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Contribution Cadence <span class="text-error">*</span></span>
          <div class="flex gap-2 flex-wrap" id="cadence-chips">
            ${CADENCE_OPTIONS.map((c, i) => `
              <button type="button" data-cadence="${c}"
                class="cadence-chip px-4 py-2 rounded-full font-label-md border transition-colors
                  ${i === 2 ? 'bg-primary-container text-on-primary-container border-transparent' : 'bg-surface-container text-on-surface-variant border-transparent'}">
                ${c}
              </button>`).join('')}
          </div>
        </div>

        <!-- Contribution per member -->
        <label class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Contribution per Member (ZAR) <span class="text-error">*</span></span>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant pointer-events-none">R</span>
            <input data-input="amount" type="number" min="1" step="0.01" placeholder="0.00"
              class="w-full bg-surface-container rounded-xl pl-8 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"/>
          </div>
        </label>

        <!-- Goal amount -->
        <label class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Pool Goal Amount (ZAR) <span class="text-error">*</span></span>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant pointer-events-none">R</span>
            <input data-input="goal" type="number" min="1" step="1" placeholder="e.g. 50000"
              class="w-full bg-surface-container rounded-xl pl-8 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"/>
          </div>
        </label>

        <!-- Max members -->
        <label class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Max Members</span>
          <input data-input="maxMembers" type="number" min="2" max="200" placeholder="e.g. 20"
            class="w-full bg-surface-container rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"/>
        </label>

        <!-- Description (optional) -->
        <label class="flex flex-col gap-1">
          <span class="font-label-sm text-on-surface-variant">Description <span class="text-on-surface-variant font-normal">(optional)</span></span>
          <textarea data-input="desc" rows="2" maxlength="200" placeholder="What is this pool for?"
            class="w-full bg-surface-container rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"></textarea>
        </label>

        <!-- Preview card -->
        <div data-preview class="hidden bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col gap-2">
          <span class="font-label-sm text-primary uppercase tracking-wider">Preview</span>
          <div class="flex justify-between items-start">
            <p data-prev-name class="font-headline-sm text-on-surface"></p>
            <p data-prev-goal class="font-headline-sm text-secondary"></p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span data-prev-cadence class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm"></span>
            <span data-prev-amount class="text-on-surface-variant font-label-sm"></span>
          </div>
        </div>

        <p data-err class="font-label-sm text-error hidden"></p>

        <div class="flex gap-3 pb-2">
          <button data-cancel class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-xl active:scale-95 transition-transform">Cancel</button>
          <button data-submit class="flex-1 bg-primary text-on-primary font-label-md py-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">add</span> Create Pool
          </button>
        </div>
      </div>

      <!-- STEP: success -->
      <div data-step="success" style="display:none" class="flex-col items-center gap-4 p-6 py-12">
        <div class="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
          <span class="material-symbols-outlined text-[48px] text-on-primary-container" style="font-variation-settings:'FILL' 1;">group_add</span>
        </div>
        <div class="flex flex-col items-center gap-1 text-center">
          <h3 class="font-headline-sm text-on-surface">Pool Created!</h3>
          <p data-success-name class="font-body-md text-on-surface-variant"></p>
        </div>
        <div data-success-summary class="w-full bg-surface-container-low rounded-xl p-4 flex flex-col gap-2 text-sm"></div>
        <button data-done class="w-full bg-primary text-on-primary font-label-md py-3 rounded-xl mt-2 active:scale-95 transition-transform">View My Pools</button>
      </div>

    </div>
  `;

  // Close helpers
  const closeModal = () => {
    el.querySelector('[data-sheet]').classList.add('translate-y-full');
    el.classList.add('opacity-0');
    setTimeout(() => el.remove(), 280);
  };
  el.querySelectorAll('[data-close],[data-cancel]').forEach(b => b.addEventListener('click', closeModal));
  el.addEventListener('click', e => { if (e.target === el) closeModal(); });

  // Step switcher
  const showStep = stepId => {
    el.querySelectorAll('[data-step]').forEach(s => {
      s.style.display = s.dataset.step === stepId ? 'flex' : 'none';
    });
  };

  // Cadence chips
  let selectedCadence = 'Monthly';
  el.querySelectorAll('.cadence-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      selectedCadence = chip.dataset.cadence;
      el.querySelectorAll('.cadence-chip').forEach(c => {
        const active = c === chip;
        c.classList.toggle('bg-primary-container',  active);
        c.classList.toggle('text-on-primary-container', active);
        c.classList.toggle('bg-surface-container',  !active);
        c.classList.toggle('text-on-surface-variant', !active);
      });
      updatePreview();
    });
  });

  // Live preview
  const fmt = n => `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
  function updatePreview() {
    const name   = el.querySelector('[data-input="name"]').value.trim();
    const amount = parseFloat(el.querySelector('[data-input="amount"]').value) || 0;
    const goal   = parseFloat(el.querySelector('[data-input="goal"]').value)   || 0;
    const preview = el.querySelector('[data-preview]');
    if (name && amount > 0 && goal > 0) {
      el.querySelector('[data-prev-name]').textContent    = name;
      el.querySelector('[data-prev-goal]').textContent    = fmt(goal);
      el.querySelector('[data-prev-cadence]').innerHTML   = `<span class="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span> ${selectedCadence}`;
      el.querySelector('[data-prev-amount]').textContent  = `${fmt(amount)} / member`;
      preview.classList.remove('hidden');
    } else {
      preview.classList.add('hidden');
    }
  }
  ['name','amount','goal','maxMembers'].forEach(f => {
    el.querySelector(`[data-input="${f}"]`)?.addEventListener('input', updatePreview);
  });

  // Done → close and callback
  el.querySelector('[data-done]').addEventListener('click', () => {
    closeModal();
    onCreated?.();
  });

  // Submit
  el.querySelector('[data-submit]').addEventListener('click', () => {
    const name       = el.querySelector('[data-input="name"]').value.trim();
    const amountRaw  = el.querySelector('[data-input="amount"]').value.trim();
    const goalRaw    = el.querySelector('[data-input="goal"]').value.trim();
    const maxRaw     = el.querySelector('[data-input="maxMembers"]').value.trim();
    const desc       = el.querySelector('[data-input="desc"]').value.trim();
    const errEl      = el.querySelector('[data-err]');
    errEl.classList.add('hidden');

    // Validate required fields
    if (!name)                              { showErr(errEl, 'Pool name is required.'); return; }
    const amount = parseFloat(amountRaw);
    if (isNaN(amount) || amount < 1)        { showErr(errEl, 'Enter a valid contribution amount (min R1).'); return; }
    const goal   = parseFloat(goalRaw);
    if (isNaN(goal)   || goal < amount)     { showErr(errEl, 'Goal must be at least equal to the contribution amount.'); return; }
    const maxMembers = maxRaw ? parseInt(maxRaw) : 50;
    if (maxMembers < 2 || maxMembers > 200) { showErr(errEl, 'Max members must be between 2 and 200.'); return; }

    function showErr(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }

    // Build pool object
    const pool = {
      id:         `pool-${Date.now()}`,
      name,
      cadence:    selectedCadence,
      perMember:  `R${amount.toLocaleString('en-ZA')} / member`,
      goal:       `R${goal.toLocaleString('en-ZA')}`,
      goalRaw:    goal,
      desc:       desc || null,
      members:    1,
      maxMembers,
      pct:        0,
      createdAt:  Date.now(),
    };

    PoolStore.add(pool);

    // Populate success screen
    el.querySelector('[data-success-name]').textContent = `"${name}" is ready for members.`;
    el.querySelector('[data-success-summary]').innerHTML = `
      <div class="flex justify-between py-1 border-b border-border-soft">
        <span class="text-on-surface-variant">Cadence</span>
        <span class="font-label-md text-on-surface">${selectedCadence}</span>
      </div>
      <div class="flex justify-between py-1 border-b border-border-soft">
        <span class="text-on-surface-variant">Contribution</span>
        <span class="font-label-md text-on-surface">R${amount.toLocaleString('en-ZA')} / member</span>
      </div>
      <div class="flex justify-between py-1 border-b border-border-soft">
        <span class="text-on-surface-variant">Goal</span>
        <span class="font-label-md text-on-surface">R${goal.toLocaleString('en-ZA')}</span>
      </div>
      <div class="flex justify-between py-1">
        <span class="text-on-surface-variant">Max Members</span>
        <span class="font-label-md text-on-surface">${maxMembers}</span>
      </div>`;

    showStep('success');
  });

  // Mount
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.remove('opacity-0');
    el.querySelector('[data-sheet]').classList.remove('translate-y-full');
  });
}

// ─── Local Pools page ──────────────────────────────────────────────────────────
Router.register('local-pools', {
  title: 'Local Pools',
  showChrome: true,
  render: () => `
    <div class="flex flex-col w-full relative">
      <!-- Sticky search bar -->
      <div class="px-container-padding pb-stack-sm sticky top-16 z-40 bg-surface-container-low/95 backdrop-blur-md pt-2">
        <div class="relative w-full group">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          <input class="w-full bg-surface py-3 pl-10 pr-4 rounded-full text-body-md text-on-surface placeholder-outline focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" id="pool-search" placeholder="Search pools…" type="text"/>
        </div>
      </div>

      <div class="px-container-padding flex flex-col gap-gutter">
        <!-- Create Pool banner -->
        <div class="relative bg-primary overflow-hidden rounded-xl p-5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer" id="createPoolBtn">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-primary-fixed-dim rounded-full blur-2xl opacity-50 pointer-events-none"></div>
          <div class="absolute -left-6 -bottom-6 w-24 h-24 bg-surface-white rounded-full blur-xl opacity-20 pointer-events-none"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <span class="text-on-primary font-headline-sm">Create a Pool</span>
              <span class="text-on-primary/80 font-body-md text-sm">Start a new Stokvel with your community</span>
            </div>
            <div class="w-12 h-12 rounded-full bg-surface-white/20 backdrop-blur-sm flex items-center justify-center text-on-primary">
              <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">add</span>
            </div>
          </div>
        </div>

        <!-- My Pools (user-created, from session store) -->
        <div id="my-pools-section" class="hidden flex-col gap-stack-sm">
          <div class="flex items-center justify-between pt-1 pb-1">
            <h2 class="font-label-md text-on-surface-variant uppercase tracking-wider">My Pools</h2>
          </div>
          <div class="flex flex-col gap-stack-sm" id="my-pool-list"></div>
        </div>

        <!-- Active Local Pools (static seed) -->
        <div class="flex items-center justify-between pt-2 pb-1">
          <h2 class="font-label-md text-on-surface-variant uppercase tracking-wider">Active Local Pools</h2>
          <button class="text-secondary font-label-md flex items-center gap-1 active:opacity-70 transition-opacity">
            <span class="material-symbols-outlined text-[18px]">filter_list</span> Filter
          </button>
        </div>

        <div class="flex flex-col gap-stack-sm pb-stack-md" id="pool-list">
          ${poolCard({ poolId:'static-1', name:'Khayelitsha Groceries', cadence:'Monthly', perMember:'R500 / member', goal:'R25,000', stripeColor:'bg-growth-green', members:34, maxMembers:50, pct:68, barColor:'bg-growth-green' })}
          ${poolCard({ poolId:'static-2', name:'Soweto Investors Club', cadence:'Weekly',  perMember:'R250 / member', goal:'R60,000', stripeColor:'bg-secondary',    members:48, maxMembers:50, pct:96, barColor:'bg-secondary',    warning:'Almost full!' })}
          ${poolCard({ poolId:'static-3', name:'Mamelodi Education Fund', cadence:'Monthly', perMember:'R1000 / member', goal:'R50,000', stripeColor:'bg-outline-variant', members:12, maxMembers:50, pct:24, barColor:'bg-outline' })}
        </div>
      </div>
    </div>
  `,

  init: () => {
    // ── Create pool button ────────────────────────────────────────────────────
    const createPoolBtn = document.getElementById('createPoolBtn');

    // Ripple animation on the banner
    createPoolBtn.addEventListener('click', function (e) {
      const ripple = document.createElement('div');
      ripple.classList.add('ripple-effect');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);

      // Open the modal; on success refresh the "My Pools" section
      openCreatePoolModal(() => renderMyPools());
    });

    // ── Render user-created pools ─────────────────────────────────────────────
    function renderMyPools() {
      const pools   = PoolStore.all();
      const section = document.getElementById('my-pools-section');
      const list    = document.getElementById('my-pool-list');
      if (!pools.length) { section.classList.add('hidden'); return; }
      section.classList.remove('hidden');
      section.style.display = 'flex';
      list.innerHTML = pools.map(p => poolCard({
        poolId:     p.id,
        name:       p.name,
        cadence:    p.cadence,
        perMember:  p.perMember,
        goal:       p.goal,
        stripeColor:'bg-primary',
        members:    p.members,
        maxMembers: p.maxMembers,
        pct:        p.pct,
        barColor:   'bg-primary',
        badge:      'Your pool',
      })).join('');
    }

    renderMyPools();

    // ── Pool card click → detail page ────────────────────────────────────────
    document.addEventListener('click', function handlePoolClick(e) {
      const card = e.target.closest('.pool-item');
      if (!card) return;
      // Only handle clicks inside the #app-root subtree (not modals)
      if (!document.getElementById('app-root')?.contains(card)) return;
      const id = card.dataset.poolId;
      if (id) Router.navigate(`pool-detail?id=${id}`);
    });

    // ── Search filter ─────────────────────────────────────────────────────────
    document.getElementById('pool-search').addEventListener('input', function () {
      const q = this.value.trim().toLowerCase();
      document.querySelectorAll('.pool-item').forEach(item => {
        item.classList.toggle('hidden', q !== '' && !item.dataset.name.toLowerCase().includes(q));
      });
    });
  }
});

// ─── Pool card template ───────────────────────────────────────────────────────
function poolCard({ poolId, name, cadence, perMember, goal, stripeColor, members, maxMembers, pct, barColor, warning, badge }) {
  return `
    <div class="pool-item bg-surface-white rounded-xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform" data-name="${name}" data-pool-id="${poolId||name}">
      <div class="absolute top-0 right-0 w-2 h-full ${stripeColor}"></div>
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="font-headline-sm text-on-surface">${name}</h3>
            ${badge ? `<span class="text-[10px] font-label-sm bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">${badge}</span>` : ''}
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> ${cadence}
            </span>
            <span class="text-on-surface-variant font-label-sm">${perMember}</span>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="font-headline-md text-secondary">${goal}</div>
          <div class="text-on-surface-variant font-label-sm">Goal</div>
        </div>
      </div>
      <div class="pt-1">
        <div class="flex justify-between items-end mb-2">
          <div class="flex -space-x-2">
            <div class="w-8 h-8 rounded-full border-2 border-surface-white bg-secondary-container"></div>
            <div class="w-8 h-8 rounded-full border-2 border-surface-white bg-tertiary-container"></div>
            ${members > 2 ? `<div class="w-8 h-8 rounded-full border-2 border-surface-white bg-surface-container-highest flex items-center justify-center text-[10px] font-label-sm text-on-surface-variant">+${members - 2}</div>` : ''}
          </div>
          <span class="font-label-md text-on-surface">${members} <span class="text-on-surface-variant font-label-sm font-normal">/ ${maxMembers}</span></span>
        </div>
        <div class="w-full bg-surface-container h-2 rounded-full overflow-hidden">
          <div class="${barColor} h-full rounded-full transition-all duration-700 ease-out" style="width:${pct}%"></div>
        </div>
        ${warning ? `<p class="text-[10px] text-stokvel-red font-label-sm mt-1 text-right">${warning}</p>` : ''}
      </div>
    </div>`;
}