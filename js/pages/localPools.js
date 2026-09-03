Router.register('local-pools', {
  title: 'Local Pools',
  showChrome: true,
  render: () => `
    <div class="flex flex-col w-full relative">
      <div class="px-container-padding pb-stack-sm sticky top-16 z-40 bg-surface-container-low/95 backdrop-blur-md pt-2">
        <div class="relative w-full group">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
          <input class="w-full bg-surface py-3 pl-10 pr-4 rounded-full text-body-md text-on-surface placeholder-outline focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-shadow group-focus-within:shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]" id="pool-search" placeholder="Search available users or pools..." type="text"/>
        </div>
      </div>

      <div class="px-container-padding flex flex-col gap-gutter">
        <div class="relative bg-primary overflow-hidden rounded-xl p-5 shadow-sm active:scale-[0.98] transition-transform cursor-pointer" id="createPoolBtn">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-primary-fixed-dim rounded-full blur-2xl opacity-50 pointer-events-none"></div>
          <div class="absolute -left-6 -bottom-6 w-24 h-24 bg-surface-white rounded-full blur-xl opacity-20 pointer-events-none"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <span class="text-on-primary font-headline-sm">Create a Pool</span>
              <span class="text-on-primary/80 font-body-md text-sm">Start a new Stokvel with your community</span>
            </div>
            <div class="w-12 h-12 rounded-full bg-surface-white/20 backdrop-blur-sm flex items-center justify-center text-on-primary">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">add</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 pb-1">
          <h2 class="font-label-md text-on-surface-variant uppercase tracking-wider">Active Local Pools</h2>
          <button class="text-secondary font-label-md flex items-center gap-1 active:opacity-70 transition-opacity">
            <span class="material-symbols-outlined text-[18px]">filter_list</span> Filter
          </button>
        </div>

        <div class="flex flex-col gap-stack-sm pb-stack-md" id="pool-list">
          ${poolCard('Khayelitsha Groceries', 'Monthly', 'R500 / member', 'R25,000', 'bg-growth-green', 34, 50, 68, 'bg-growth-green')}
          ${poolCard('Soweto Investors Club', 'Weekly', 'R250 / member', 'R60,000', 'bg-secondary', 48, 50, 96, 'bg-secondary', 'Almost full!')}
          ${poolCard('Mamelodi Education Fund', 'Monthly', 'R1000 / member', 'R50,000', 'bg-outline-variant', 12, 50, 24, 'bg-outline')}
        </div>
      </div>
    </div>
  `,
  init: () => {
    const createPoolBtn = document.getElementById('createPoolBtn');
    createPoolBtn.addEventListener('click', function (e) {
      const ripple = document.createElement('div');
      ripple.classList.add('ripple-effect');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });

    const search = document.getElementById('pool-search');
    search.addEventListener('input', () => {
      const query = search.value.trim().toLowerCase();
      document.querySelectorAll('#pool-list .pool-item').forEach((item) => {
        const name = item.dataset.name.toLowerCase();
        item.classList.toggle('hidden', query !== '' && !name.includes(query));
      });
    });
  }
});

function poolCard(name, cadence, perMember, goal, stripeColor, members, maxMembers, pct, barColor, warningLabel) {
  return `
    <div class="pool-item bg-surface-white rounded-xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden group" data-name="${name}">
      <div class="absolute top-0 right-0 w-2 h-full ${stripeColor}"></div>
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1">
          <h3 class="font-headline-sm text-on-surface">${name}</h3>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm">
              <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span> ${cadence}
            </span>
            <span class="text-on-surface-variant font-label-sm">${perMember}</span>
          </div>
        </div>
        <div class="text-right">
          <div class="font-headline-md text-secondary">${goal}</div>
          <div class="text-on-surface-variant font-label-sm">Goal Amount</div>
        </div>
      </div>
      <div class="pt-2">
        <div class="flex justify-between items-end mb-2">
          <div class="flex -space-x-2">
            <div class="w-8 h-8 rounded-full border-2 border-surface-white bg-secondary-container"></div>
            <div class="w-8 h-8 rounded-full border-2 border-surface-white bg-tertiary-container"></div>
            <div class="w-8 h-8 rounded-full border-2 border-surface-white bg-surface-container-highest flex items-center justify-center text-[10px] font-label-sm text-on-surface-variant">+${members - 2}</div>
          </div>
          <div class="text-right flex flex-col items-end">
            <span class="font-label-md text-on-surface">${members} <span class="text-on-surface-variant font-label-sm font-normal">/ ${maxMembers} members</span></span>
          </div>
        </div>
        <div class="w-full bg-surface-container h-2 rounded-full overflow-hidden">
          <div class="${barColor} h-full rounded-full transition-all duration-1000 ease-out" style="width:${pct}%"></div>
        </div>
        ${warningLabel ? `<p class="text-[10px] text-stokvel-red font-label-sm mt-1 text-right">${warningLabel}</p>` : ''}
      </div>
    </div>
  `;
}
