// ─── Static seed data for the three pre-seeded pools ─────────────────────────
// Gives the detail page real numbers to visualise even without a live backend.
const SEED_POOLS = {
  'static-1': {
    id: 'static-1',
    name: 'Khayelitsha Groceries',
    kind: 'local',
    cadence: 'Monthly',
    perMemberRaw: 500,
    perMember: 'R500 / member',
    goal: 'R25,000',
    goalRaw: 25000,
    desc: 'Community grocery pool for the Khayelitsha area. Members pool funds monthly to buy bulk groceries at wholesale prices.',
    members: 34,
    maxMembers: 50,
    pct: 68,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 180, // 6 months ago
  },
  'static-2': {
    id: 'static-2',
    name: 'Soweto Investors Club',
    kind: 'local',
    cadence: 'Weekly',
    perMemberRaw: 250,
    perMember: 'R250 / member',
    goal: 'R60,000',
    goalRaw: 60000,
    desc: 'High-growth investment stokvel focused on JSE equities and ETFs. Weekly contributions, quarterly distributions.',
    members: 48,
    maxMembers: 50,
    pct: 96,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 365,
  },
  'static-3': {
    id: 'static-3',
    name: 'Mamelodi Education Fund',
    kind: 'local',
    cadence: 'Monthly',
    perMemberRaw: 1000,
    perMember: 'R1000 / member',
    goal: 'R50,000',
    goalRaw: 50000,
    desc: 'Supporting tertiary education for members\' children. Funds are disbursed at the start of each academic year.',
    members: 12,
    maxMembers: 50,
    pct: 24,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
  },
};

// Deterministic names / avatars for generated members
const MEMBER_NAMES = [
  'Siyabonga D.','Thabo M.','Lerato N.','Nomsa K.','Bongani Z.',
  'Zanele P.','Sipho L.','Ayanda T.','Lindiwe M.','Thabiso G.',
  'Nokwanda B.','Musa N.','Zanele V.','Kagiso R.','Nandi S.',
  'Lwazi H.','Phiwayinkosi D.','Thandi M.','Buhle Z.','Sbonelo N.',
  'Ntombi P.','Mthokozisi L.','Yolanda T.','Sandile G.','Bongeka B.',
  'Simphiwe N.','Thandeka V.','Luyanda R.','Nokuthula S.','Sanele H.',
  'Nompumelelo D.','Mndeni M.','Zimasa Z.','Sifiso K.','Nhlanhlayethu B.',
];
const AVATAR_COLORS = [
  ['bg-secondary-container','text-on-secondary-container'],
  ['bg-tertiary-container','text-on-tertiary-container'],
  ['bg-primary-container','text-on-primary-container'],
  ['bg-surface-container-high','text-on-surface-variant'],
];

// ─── Data generation helpers ──────────────────────────────────────────────────
// seeded pseudo-random so numbers are stable per pool
function seededRng(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function generatePoolData(pool) {
  const rng          = seededRng(pool.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const memberCount  = pool.members || 10;
  const contribution = pool.perMemberRaw || parseFloat((pool.perMember || '').replace(/[^0-9.]/g,'')) || 500;
  const goalRaw      = pool.goalRaw || 50000;

  // ── Members with individual contribution histories ─────────────────────────
  const members = Array.from({ length: memberCount }, (_, i) => {
    const name    = MEMBER_NAMES[i % MEMBER_NAMES.length];
    const color   = AVATAR_COLORS[i % AVATAR_COLORS.length];
    const streak  = Math.floor(rng() * 8) + 1;          // 1–8 month streak
    const missedM = Math.floor(rng() * 3);               // 0–2 missed months
    const total   = contribution * (streak - missedM);
    const lastPaid= new Date(Date.now() - Math.floor(rng() * 30) * 86400000);
    return { name, color, streak, missedM, total, lastPaid, contribution };
  });

  // ── 12-month deposit histogram ─────────────────────────────────────────────
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now    = new Date();
  const histogram = Array.from({ length: 12 }, (_, i) => {
    const mIdx   = (now.getMonth() - 11 + i + 12) % 12;
    const label  = MONTHS[mIdx];
    // How many members paid that month (varies a bit for realism)
    const paid   = Math.max(1, Math.round(memberCount * (0.75 + rng() * 0.25)));
    const amount = paid * contribution * (0.9 + rng() * 0.2);
    return { label, paid, amount: Math.round(amount) };
  });

  // ── Growth projection — compound growth over 24 months ────────────────────
  const monthlyContrib = memberCount * contribution;
  const annualRate     = 0.08 + rng() * 0.06; // 8–14% p.a.
  const monthlyRate    = annualRate / 12;
  let balance          = histogram.reduce((s, m) => s + m.amount, 0);

  const projection = Array.from({ length: 25 }, (_, i) => {
    const label  = i === 0 ? 'Now' : `M${i}`;
    const value  = Math.round(balance);
    balance      = balance * (1 + monthlyRate) + monthlyContrib;
    return { label, value };
  });

  // ── Key stats ──────────────────────────────────────────────────────────────
  const totalCollected = histogram.reduce((s, m) => s + m.amount, 0);
  const avgMonthly     = Math.round(totalCollected / 12);
  const bestMonth      = histogram.reduce((a, b) => b.amount > a.amount ? b : a);
  const monthsToGoal   = Math.ceil((goalRaw - totalCollected) / monthlyContrib);

  return { members, histogram, projection, totalCollected, avgMonthly, bestMonth, monthsToGoal, monthlyContrib, annualRate };
}

// ─── SVG chart helpers ────────────────────────────────────────────────────────
const C = {
  primary:   '#745b00',
  pCont:     '#ffcc00',
  secondary: '#1f5dae',
  sCont:     '#76a9ff',
  green:     '#22C55E',
  surface:   '#eceef0',
  onSurface: '#191c1e',
  onSurfV:   '#4e4632',
  border:    '#E2E8F0',
  white:     '#FFFFFF',
};

function svgProjectionChart(projection) {
  const W = 320, H = 160, PAD = { t:16, r:12, b:28, l:52 };
  const IW = W - PAD.l - PAD.r;
  const IH = H - PAD.t - PAD.b;

  const vals   = projection.map(p => p.value);
  const minV   = 0;
  const maxV   = Math.max(...vals) * 1.08;

  const xScale = i => PAD.l + (i / (projection.length - 1)) * IW;
  const yScale = v => PAD.t + IH - ((v - minV) / (maxV - minV)) * IH;

  // Area path
  const pts    = projection.map((p, i) => `${xScale(i)},${yScale(p.value)}`).join(' ');
  const first  = `${xScale(0)},${yScale(projection[0].value)}`;
  const last   = `${xScale(projection.length - 1)},${yScale(projection[projection.length - 1].value)}`;
  const area   = `M ${first} L ${pts} L ${last} L ${last.split(',')[0]},${PAD.t + IH} L ${PAD.l},${PAD.t + IH} Z`;
  const line   = `M ${pts}`;

  // Y-axis ticks — 4 evenly spaced
  const yTicks = [0, 0.33, 0.66, 1].map(f => {
    const v = Math.round(minV + f * (maxV - minV));
    const y = yScale(v);
    const label = v >= 1000 ? `R${(v/1000).toFixed(0)}k` : `R${v}`;
    return { y, label };
  });

  // X-axis — show every 4th label
  const xLabels = projection
    .filter((_, i) => i % 4 === 0 || i === projection.length - 1)
    .map((p, _, arr) => {
      const origI = projection.indexOf(p);
      return { x: xScale(origI), label: p.label };
    });

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="w-full">
      <defs>
        <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${C.secondary}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${C.secondary}" stop-opacity="0.02"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      ${yTicks.map(t => `
        <line x1="${PAD.l}" y1="${t.y}" x2="${W - PAD.r}" y2="${t.y}"
          stroke="${C.border}" stroke-width="1" stroke-dasharray="3,4"/>
        <text x="${PAD.l - 4}" y="${t.y + 4}" text-anchor="end"
          font-size="9" fill="${C.onSurfV}" font-family="Outfit,sans-serif">${t.label}</text>
      `).join('')}

      <!-- Goal line -->
      ${(() => {
        const goalY = yScale(projection[0].value > 0 ? Math.max(...vals) * 0.78 : maxV * 0.78);
        return '';  // optional — omit to keep chart clean
      })()}

      <!-- Area fill -->
      <path d="${area}" fill="url(#projGrad)"/>

      <!-- Line -->
      <polyline points="${projection.map((p, i) => `${xScale(i)},${yScale(p.value)}`).join(' ')}"
        fill="none" stroke="${C.secondary}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>

      <!-- Last point dot -->
      <circle cx="${xScale(projection.length - 1)}" cy="${yScale(vals[vals.length - 1])}"
        r="4" fill="${C.secondary}" stroke="${C.white}" stroke-width="2"/>

      <!-- X labels -->
      ${xLabels.map(l => `
        <text x="${l.x}" y="${H - 6}" text-anchor="middle"
          font-size="9" fill="${C.onSurfV}" font-family="Outfit,sans-serif">${l.label}</text>
      `).join('')}
    </svg>`;
}

function svgHistogramChart(histogram) {
  const W = 320, H = 140, PAD = { t:12, r:12, b:28, l:52 };
  const IW = W - PAD.l - PAD.r;
  const IH = H - PAD.t - PAD.b;
  const n  = histogram.length;

  const amounts = histogram.map(m => m.amount);
  const maxA    = Math.max(...amounts) * 1.1;

  const barW    = IW / n * 0.6;
  const gap     = IW / n;

  const yTicks  = [0, 0.5, 1].map(f => {
    const v = Math.round(f * maxA);
    const y = PAD.t + IH - f * IH;
    const label = v >= 1000 ? `R${(v/1000).toFixed(0)}k` : `R${v}`;
    return { y, label };
  });

  return `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="w-full">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${C.pCont}"/>
          <stop offset="100%" stop-color="${C.primary}" stop-opacity="0.7"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      ${yTicks.map(t => `
        <line x1="${PAD.l}" y1="${t.y}" x2="${W - PAD.r}" y2="${t.y}"
          stroke="${C.border}" stroke-width="1" stroke-dasharray="3,4"/>
        <text x="${PAD.l - 4}" y="${t.y + 4}" text-anchor="end"
          font-size="9" fill="${C.onSurfV}" font-family="Outfit,sans-serif">${t.label}</text>
      `).join('')}

      <!-- Bars -->
      ${histogram.map((m, i) => {
        const barH  = (m.amount / maxA) * IH;
        const x     = PAD.l + i * gap + (gap - barW) / 2;
        const y     = PAD.t + IH - barH;
        const isCur = i === n - 1;
        return `
          <rect x="${x}" y="${y}" width="${barW}" height="${Math.max(barH, 1)}" rx="3"
            fill="${isCur ? C.secondary : 'url(#barGrad)'}"/>
          <text x="${x + barW / 2}" y="${H - 6}" text-anchor="middle"
            font-size="8" fill="${C.onSurfV}" font-family="Outfit,sans-serif">${m.label}</text>`;
      }).join('')}
    </svg>`;
}

// ─── Pool Detail page ──────────────────────────────────────────────────────────
Router.register('pool-detail', {
  title: 'Pool Details',
  showChrome: true,
  render: (qp) => {
    const id   = qp?.id || '';
    // Look up in seed data first, then user-created store
    const pool = SEED_POOLS[id] || PoolStore.all().find(p => p.id === id);

    if (!pool) {
      return `
        <div class="flex flex-col items-center justify-center gap-4 p-8 min-h-[60vh]">
          <span class="material-symbols-outlined text-[64px] text-on-surface-variant">search_off</span>
          <p class="font-body-md text-on-surface-variant text-center">Pool not found.</p>
          <button onclick="Router.back()"
            class="bg-primary-container text-on-primary-container font-label-md px-6 py-3 rounded-xl">
            Back to Pools
          </button>
        </div>`;
    }

    const data          = generatePoolData(pool);
    const fmtR          = n => `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 0 })}`;
    const fmtRDec       = n => `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
    const progPct       = pool.goalRaw ? Math.min(100, Math.round((data.totalCollected / pool.goalRaw) * 100)) : pool.pct;
    const isCrossBorder = pool.kind === 'cross-border';

    return `
      <div class="flex flex-col w-full pb-stack-lg">

        <!-- Hero / header card -->
        <div class="bg-secondary mx-container-padding mt-stack-sm rounded-2xl p-5 relative overflow-hidden shadow-md">
          <div class="absolute -right-8 -top-8 w-40 h-40 bg-surface-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -left-4 -bottom-6 w-28 h-28 bg-primary-container/20 rounded-full blur-xl pointer-events-none"></div>
          <button onclick="Router.back()"
            class="relative z-10 flex items-center gap-1 text-on-secondary/70 font-label-sm mb-3 active:opacity-70">
            <span class="material-symbols-outlined text-[16px]">arrow_back_ios</span> ${isCrossBorder ? 'Cross-Border Pools' : 'All Pools'}
          </button>
          <div class="relative z-10 flex flex-col gap-1">
            <h1 class="font-headline-md text-on-secondary">${pool.name}</h1>
            ${pool.desc ? `<p class="font-body-md text-on-secondary/75 text-sm leading-snug mt-1">${pool.desc}</p>` : ''}
            <div class="flex items-center gap-2 mt-3 flex-wrap">
              ${isCrossBorder ? `
              <span class="inline-flex items-center gap-1 bg-surface-white/20 text-on-secondary font-label-sm px-3 py-1 rounded-full">
                <span class="material-symbols-outlined text-[14px]">public</span> ${pool.region}
              </span>` : ''}
              <span class="inline-flex items-center gap-1 bg-surface-white/20 text-on-secondary font-label-sm px-3 py-1 rounded-full">
                <span class="material-symbols-outlined text-[14px]">calendar_month</span> ${pool.cadence}
              </span>
              <span class="inline-flex items-center gap-1 bg-surface-white/20 text-on-secondary font-label-sm px-3 py-1 rounded-full">
                <span class="material-symbols-outlined text-[14px]">group</span> ${pool.members} / ${pool.maxMembers} members
              </span>
            </div>
          </div>
        </div>

        <!-- Goal progress -->
        <div class="mx-container-padding mt-stack-sm bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex flex-col gap-3">
          <div class="flex justify-between items-end">
            <div class="flex flex-col gap-0.5">
              <span class="font-label-sm text-on-surface-variant uppercase tracking-wider">Total Collected</span>
              <span class="font-display-lg text-on-surface">${fmtR(data.totalCollected)}</span>
            </div>
            <div class="flex flex-col items-end gap-0.5">
              <span class="font-label-sm text-on-surface-variant">Goal</span>
              <span class="font-headline-sm text-secondary">${pool.goal}</span>
            </div>
          </div>
          <div class="w-full bg-surface-container h-3 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full transition-all duration-700"
              style="width:${progPct}%"></div>
          </div>
          <div class="flex justify-between items-center">
            <span class="font-label-md text-secondary">${progPct}% of goal</span>
            <span class="font-label-sm text-on-surface-variant">~${Math.max(0, data.monthsToGoal)} months to goal</span>
          </div>
        </div>

        <!-- KPI row -->
        <div class="mx-container-padding mt-stack-sm grid grid-cols-3 gap-gutter">
          ${[
            { icon:'payments', label:'Monthly Avg', value: fmtR(data.avgMonthly) },
            { icon:'trending_up', label:'Proj. Rate', value: `${(data.annualRate * 100).toFixed(1)}% p.a.` },
            { icon:'workspace_premium', label:'Best Month', value: data.bestMonth.label },
          ].map(k => `
            <div class="bg-surface-white rounded-xl border border-border-soft p-3 flex flex-col gap-1 items-center text-center shadow-sm">
              <span class="material-symbols-outlined text-secondary text-[20px]">${k.icon}</span>
              <span class="font-label-sm text-on-surface-variant leading-tight">${k.label}</span>
              <span class="font-label-md text-on-surface">${k.value}</span>
            </div>`).join('')}
        </div>

        <!-- ── Growth Projection chart ────────────────────────────────────── -->
        <div class="mx-container-padding mt-stack-sm bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-0.5">
              <h2 class="font-headline-sm text-on-surface">Growth Projection</h2>
              <p class="font-label-sm text-on-surface-variant">24-month forecast at ${(data.annualRate * 100).toFixed(1)}% p.a.</p>
            </div>
            <span class="material-symbols-outlined text-secondary">show_chart</span>
          </div>
          <div class="w-full overflow-hidden">
            ${svgProjectionChart(data.projection)}
          </div>
          <div class="flex items-center gap-3 pt-1">
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-full bg-secondary"></div>
              <span class="font-label-sm text-on-surface-variant">Pool balance</span>
            </div>
            <div class="flex items-center gap-1.5 ml-auto">
              <span class="font-label-sm text-secondary font-semibold">
                ${fmtR(data.projection[data.projection.length - 1].value)} in 24 mo.
              </span>
            </div>
          </div>
        </div>

        <!-- ── Monthly Deposits histogram ────────────────────────────────── -->
        <div class="mx-container-padding mt-stack-sm bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-0.5">
              <h2 class="font-headline-sm text-on-surface">Monthly Deposits</h2>
              <p class="font-label-sm text-on-surface-variant">Last 12 months · current month in blue</p>
            </div>
            <span class="material-symbols-outlined text-primary">bar_chart</span>
          </div>
          <div class="w-full overflow-hidden">
            ${svgHistogramChart(data.histogram)}
          </div>
          <div class="flex items-center gap-4 pt-1">
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-sm bg-gradient-to-b from-primary-container to-primary opacity-80"></div>
              <span class="font-label-sm text-on-surface-variant">Past months</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-3 h-3 rounded-sm bg-secondary"></div>
              <span class="font-label-sm text-on-surface-variant">This month</span>
            </div>
          </div>
        </div>

        <!-- ── Member deposits ───────────────────────────────────────────── -->
        <div class="mx-container-padding mt-stack-sm bg-surface-white rounded-xl shadow-sm border border-border-soft overflow-hidden flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-border-soft">
            <h2 class="font-headline-sm text-on-surface">Member Contributions</h2>
            <span class="font-label-sm text-on-surface-variant">${pool.members} members</span>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-border-soft">
            <button data-tab="all"
              class="tab-btn flex-1 py-3 font-label-md text-secondary border-b-2 border-secondary text-sm">All</button>
            <button data-tab="paid"
              class="tab-btn flex-1 py-3 font-label-md text-on-surface-variant border-b-2 border-transparent text-sm">Paid This Month</button>
            <button data-tab="missed"
              class="tab-btn flex-1 py-3 font-label-md text-on-surface-variant border-b-2 border-transparent text-sm">Missed</button>
          </div>

          <!-- Member rows -->
          <div id="member-list" class="flex flex-col divide-y divide-border-soft">
            ${data.members.map((m, i) => memberRow(m, i)).join('')}
          </div>
        </div>

        <!-- Join / Donate CTA -->
        <div class="mx-container-padding mt-stack-md flex gap-3">
          <button id="join-pool-btn"
            class="flex-1 bg-primary text-on-primary font-label-md py-4 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
            ${isCrossBorder
              ? `<span class="material-symbols-outlined text-[20px]">volunteer_activism</span> Donate`
              : `<span class="material-symbols-outlined text-[20px]">group_add</span> Join Pool`}
          </button>
          <button id="share-pool-btn"
            class="w-14 h-14 bg-surface-white border border-border-soft text-on-surface-variant rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-sm">
            <span class="material-symbols-outlined">share</span>
          </button>
        </div>

      </div>

      ${isCrossBorder ? `
      <!-- Donate Modal — voluntary, user-chosen amount (no fixed contribution) -->
      <div id="pd-donate-modal" class="hidden fixed inset-0 z-[100] flex items-end justify-center bg-black/40">
        <div class="bg-surface-white w-full max-w-md rounded-t-2xl p-6 flex flex-col gap-4 shadow-xl">
          <h3 class="font-headline-sm text-on-surface">Donate to ${pool.name}</h3>
          <p class="font-body-md text-on-surface-variant">Choose whatever amount you'd like to contribute.</p>
          <label class="flex flex-col gap-1">
            <span class="font-label-sm text-on-surface-variant">Donation Amount (ZAR)</span>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant pointer-events-none">R</span>
              <input id="pd-donate-amount" type="number" min="1" step="1" value="${pool.perMemberRaw || ''}"
                class="w-full bg-surface-container rounded-lg pl-8 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"/>
            </div>
            <span class="font-label-sm text-on-surface-variant">Suggested: ${pool.perMember || ''}</span>
          </label>
          <p id="pd-donate-error" class="font-label-sm text-error hidden"></p>
          <div class="flex gap-3">
            <button id="pd-donate-cancel" class="flex-1 bg-surface-container text-on-surface font-label-md py-3 rounded-lg active:scale-95 transition-transform">Cancel</button>
            <button id="pd-donate-confirm" class="flex-1 bg-primary text-on-primary font-label-md py-3 rounded-lg active:scale-95 transition-transform">Confirm Donation</button>
          </div>
        </div>
      </div>` : ''}`;
  },

  init: (qp) => {
    const id   = qp?.id || '';
    const pool = SEED_POOLS[id] || PoolStore.all().find(p => p.id === id);
    if (!pool) return;

    const data = generatePoolData(pool);

    // ── Tab filtering for member list ────────────────────────────────────────
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.toggle('text-secondary',  b === btn);
          b.classList.toggle('border-secondary', b === btn);
          b.classList.toggle('text-on-surface-variant', b !== btn);
          b.classList.toggle('border-transparent',       b !== btn);
        });

        const tab   = btn.dataset.tab;
        const list  = document.getElementById('member-list');
        let filtered;
        if      (tab === 'paid')   filtered = data.members.filter(m => m.missedM === 0);
        else if (tab === 'missed') filtered = data.members.filter(m => m.missedM > 0);
        else                       filtered = data.members;

        list.innerHTML = filtered.length
          ? filtered.map((m, i) => memberRow(m, i)).join('')
          : `<div class="p-6 text-center font-body-md text-on-surface-variant">No members in this category.</div>`;
      });
    });

    // ── Join Pool / Donate button ────────────────────────────────────────────
    const isCrossBorder = pool.kind === 'cross-border';
    const ctaBtn = document.getElementById('join-pool-btn');

    if (isCrossBorder) {
      // Cross-border pools: open the "choose your amount" donate modal.
      const modal   = document.getElementById('pd-donate-modal');
      const amount  = document.getElementById('pd-donate-amount');
      const error   = document.getElementById('pd-donate-error');
      const cancel  = document.getElementById('pd-donate-cancel');
      const confirm = document.getElementById('pd-donate-confirm');

      ctaBtn?.addEventListener('click', () => {
        error.classList.add('hidden');
        modal.classList.remove('hidden');
      });
      cancel?.addEventListener('click', () => modal.classList.add('hidden'));
      modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

      confirm?.addEventListener('click', () => {
        const val = parseFloat(amount.value);
        if (!val || val < 1) {
          error.textContent = 'Please enter a donation amount.';
          error.classList.remove('hidden');
          return;
        }
        modal.classList.add('hidden');
        showToast(`Thank you! R${Math.round(val).toLocaleString('en-ZA')} donated to "${pool.name}".`);
        if (ctaBtn) {
          ctaBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check</span> Donated ✓';
          ctaBtn.disabled  = true;
          ctaBtn.classList.replace('bg-primary','bg-surface-container');
          ctaBtn.classList.replace('text-on-primary','text-on-surface-variant');
        }
      });
    } else {
      // Local pools: unchanged "request to join" behaviour.
      ctaBtn?.addEventListener('click', () => {
        showToast(`Join request sent for "${pool.name}"!`);
        if (ctaBtn) {
          ctaBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check</span> Request Sent';
          ctaBtn.disabled  = true;
          ctaBtn.classList.replace('bg-primary','bg-surface-container');
          ctaBtn.classList.replace('text-on-primary','text-on-surface-variant');
        }
      });
    }

    // ── Share button ─────────────────────────────────────────────────────────
    document.getElementById('share-pool-btn')?.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}#/pool-detail?id=${id}`;
      if (navigator.share) {
        navigator.share({ title: pool.name, url }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(url).then(() => showToast('Link copied!'));
      }
    });
  }
});

// ─── Member row template ──────────────────────────────────────────────────────
function memberRow(m, i) {
  const [bg, fg]  = m.color;
  const initials  = m.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const paidBadge = m.missedM === 0
    ? `<span class="font-label-sm text-growth-green flex items-center gap-0.5"><span class="material-symbols-outlined text-[13px]">check_circle</span> Paid</span>`
    : `<span class="font-label-sm text-error flex items-center gap-0.5"><span class="material-symbols-outlined text-[13px]">warning</span> ${m.missedM} missed</span>`;

  const streakBar = Array.from({ length: Math.min(m.streak, 8) }, (_, j) =>
    `<div class="h-1.5 flex-1 rounded-full ${j < m.streak - m.missedM ? 'bg-secondary' : 'bg-surface-container'}"></div>`
  ).join('');

  return `
    <div class="flex items-center gap-3 p-4">
      <div class="w-10 h-10 rounded-full ${bg} ${fg} flex items-center justify-center font-label-md shrink-0 text-sm">
        ${initials}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <p class="font-label-md text-on-surface truncate">${m.name}</p>
          ${paidBadge}
        </div>
        <div class="flex items-center gap-1 mt-1.5" title="${m.streak - m.missedM} of ${m.streak} months paid">
          ${streakBar}
        </div>
        <p class="font-label-sm text-on-surface-variant mt-1">
          Total: <span class="text-on-surface">R ${m.total.toLocaleString('en-ZA')}</span> ·
          Last: ${m.lastPaid.toLocaleDateString('en-ZA', { month:'short', day:'numeric' })}
        </p>
      </div>
      <div class="flex flex-col items-end shrink-0">
        <span class="font-label-md text-secondary">R ${m.contribution.toLocaleString('en-ZA')}</span>
        <span class="font-label-sm text-on-surface-variant">/ ${(m.contribution > 500 ? 'month' : 'contribution')}</span>
      </div>
    </div>`;
}

// ─── Toast helper (global) ────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-28 left-1/2 -translate-x-1/2 bg-on-surface text-surface-white font-label-md px-5 py-3 rounded-full shadow-lg z-[200] animate-pop-in whitespace-nowrap';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}