Router.register('dashboard', {
  title: 'Dashboard',
  showChrome: true,
  render: () => `
    <div class="flex flex-col w-full gap-stack-md px-container-padding pb-stack-lg">
      <div class="flex flex-col gap-base mt-stack-sm">
        <h1 class="font-headline-md text-on-surface">Welcome back, Siyabonga.</h1>
        <p class="font-body-md text-on-surface-variant">Your stokvel is building wealth, together.</p>
      </div>

      <div class="flex flex-col bg-surface-white rounded-xl shadow-md p-stack-md relative overflow-hidden">
        <div class="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col gap-base">
          <span class="font-label-md text-on-surface-variant uppercase tracking-wider">Collective Pooled Sum</span>
          <div class="flex items-baseline gap-2">
            <span class="font-display-lg text-on-surface">R 142,500.00</span>
            <span class="font-label-md text-growth-green flex items-center bg-growth-green/10 px-2 py-0.5 rounded-full">
              <span class="material-symbols-outlined text-[16px] mr-1">trending_up</span>+12% Proj. Yearly
            </span>
          </div>
          <div class="w-full h-1.5 bg-surface-container mt-4 rounded-full overflow-hidden">
            <div class="h-full bg-secondary w-[65%] rounded-full shadow-[0_0_8px_rgba(31,93,174,0.4)]"></div>
          </div>
          <div class="flex justify-between mt-1">
            <span class="font-label-sm text-on-surface-variant">R 142k</span>
            <span class="font-label-sm text-on-surface-variant">2024 Goal: R 200k</span>
          </div>
        </div>
      </div>

      <div class="flex gap-gutter overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar">
        <button id="deposit-btn" class="snap-start shrink-0 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container font-label-md px-6 py-4 rounded-lg w-[45%] active:scale-95 transition-transform">
          <span class="material-symbols-outlined">add_circle</span> Deposit
        </button>
        <button id="withdraw-btn" class="snap-start shrink-0 flex items-center justify-center gap-2 bg-surface-white border border-border-soft text-on-surface font-label-md px-6 py-4 rounded-lg w-[45%] active:scale-95 transition-transform">
          <span class="material-symbols-outlined">payments</span> Withdraw
        </button>
        <button class="snap-start shrink-0 flex items-center justify-center gap-2 bg-secondary-fixed text-on-secondary-fixed font-label-md px-6 py-4 rounded-lg w-[45%] active:scale-95 transition-transform" id="roundup-btn">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">savings</span> Round-Up
        </button>
      </div>

      <div class="flex flex-col gap-stack-sm">
        <div class="flex items-center justify-between">
          <h2 class="font-headline-sm text-on-surface">Active Goals</h2>
          <a href="#/local-pools" class="font-label-md text-secondary">View all</a>
        </div>
        <div class="grid grid-cols-1 gap-gutter">
          <div class="bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex gap-4 items-center">
            <div class="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden shrink-0 relative">
              <div class="absolute inset-0 bg-gradient-to-br from-tertiary/20 to-transparent"></div>
              <span class="material-symbols-outlined text-tertiary text-[32px]">show_chart</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-label-md text-on-surface truncate">JSE Top 40 Portfolio</h3>
              <p class="font-label-sm text-on-surface-variant truncate">High growth • 8 members</p>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex -space-x-2">
                  <div class="w-6 h-6 rounded-full border-2 border-surface-white bg-secondary-container"></div>
                  <div class="w-6 h-6 rounded-full border-2 border-surface-white bg-tertiary-container"></div>
                  <div class="w-6 h-6 rounded-full border-2 border-surface-white bg-surface-container flex items-center justify-center font-label-sm text-[10px] text-on-surface-variant">+6</div>
                </div>
                <span class="font-label-sm text-secondary ml-auto">R 45,200</span>
              </div>
            </div>
          </div>
          <div class="bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 flex gap-4 items-center">
            <div class="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden shrink-0 relative">
              <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
              <span class="material-symbols-outlined text-primary text-[32px]">foundation</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-label-md text-on-surface truncate">Community Trust Fund</h3>
              <p class="font-label-sm text-on-surface-variant truncate">Stable yield • 12 members</p>
              <div class="flex items-center gap-2 mt-2">
                <div class="flex -space-x-2">
                  <div class="w-6 h-6 rounded-full border-2 border-surface-white bg-secondary-container"></div>
                  <div class="w-6 h-6 rounded-full border-2 border-surface-white bg-primary-container"></div>
                  <div class="w-6 h-6 rounded-full border-2 border-surface-white bg-surface-container flex items-center justify-center font-label-sm text-[10px] text-on-surface-variant">+10</div>
                </div>
                <span class="font-label-sm text-secondary ml-auto">R 97,300</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-stack-sm mt-4">
        <h2 class="font-headline-sm text-on-surface">Recent Contributions</h2>
        <div class="flex flex-col gap-0 bg-surface-white rounded-xl shadow-sm border border-border-soft overflow-hidden">
          <div class="flex items-center gap-4 p-4 border-b border-border-soft last:border-b-0">
            <div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body-md text-on-surface truncate"><span class="font-label-md">Thabo M.</span> contributed to JSE Top 40</p>
              <p class="font-label-sm text-on-surface-variant">Today, 09:42 AM</p>
            </div>
            <div class="font-label-md text-growth-green shrink-0">+R 1,500</div>
          </div>
          <div class="flex items-center gap-4 p-4 border-b border-border-soft last:border-b-0">
            <div class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]">person</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-body-md text-on-surface truncate"><span class="font-label-md">Lerato N.</span> contributed to Community Trust</p>
              <p class="font-label-sm text-on-surface-variant">Yesterday, 14:15 PM</p>
            </div>
            <div class="font-label-md text-growth-green shrink-0">+R 500</div>
          </div>
          <div class="flex items-center gap-4 p-4 border-b border-border-soft last:border-b-0" id="roundup-feed-item">
            <div class="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">savings</span>
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
  init: () => {
    const roundupBtn = document.getElementById('roundup-btn');
    if (roundupBtn) {
      roundupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const icon = roundupBtn.querySelector('.material-symbols-outlined');
        icon.style.transform = 'scale(1.2)';
        icon.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        setTimeout(() => { icon.style.transform = 'scale(1)'; }, 200);
      });
    }

    const depositBtn = document.getElementById('deposit-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');
    [depositBtn, withdrawBtn].forEach((btn) => {
      btn.addEventListener('click', () => {
        alert(`${btn.textContent.trim()} flow coming soon.`);
      });
    });
  }
});
