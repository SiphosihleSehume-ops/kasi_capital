const CROSS_BORDER_POOLS = [
  { name: 'Pan-African Agri-Fund', region: 'Zambia & Uganda', price: 'R 1,500', invest: 60, save: 40, tagIcon: 'trending_up', tagText: '12.4% p.a. projected', tagColor: 'text-growth-green' },
  { name: 'West Africa Education Trust', region: 'Ghana & Benin', price: 'R 500', invest: 25, save: 75, tagIcon: 'school', tagText: 'Stable growth', tagColor: 'text-on-surface-variant' },
  { name: 'Pan-African Infrastructure Bond', region: 'Rwanda & Côte d\u2019Ivoire', price: 'R 4,000', invest: 40, save: 60, tagIcon: 'account_balance', tagText: 'Government Backed', tagColor: 'text-on-surface-variant' },
  { name: 'Diaspora Real Estate', region: 'Nigeria & South Africa', price: 'R 10,000', invest: 60, save: 40, tagIcon: 'apartment', tagText: 'Premium Yield', tagColor: 'text-growth-green' },
];

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
        <p class="font-body-md text-body-md text-on-surface-variant max-w-[85%]">Diversify your Stokvel portfolio across MTN MoMo's 14 African markets.</p>
      </div>

      <div class="flex flex-col gap-stack-sm px-container-padding" id="pools-container">
        ${CROSS_BORDER_POOLS.map(crossBorderCard).join('')}
      </div>
    </div>
  `,
  init: () => {
    document.querySelectorAll('.join-pool-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const poolName = btn.closest('.pool-card').dataset.name;
        btn.textContent = 'Joined ✓';
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-default');
        alert(`You've joined ${poolName}.`);
      });
    });

    // Staggered entrance animation for cards
    const cards = document.querySelectorAll('.pool-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.remove('opacity-0', 'translate-y-4');
        card.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
          card.querySelectorAll('[data-width]').forEach((bar) => {
            bar.style.width = bar.getAttribute('data-width');
          });
        }, 300);
      }, index * 150);
    });
  }
});

function crossBorderCard(pool) {
  return `
    <div class="pool-card bg-surface-white rounded-2xl p-container-padding shadow-[0_4px_12px_rgba(15,26,69,0.05)] flex flex-col gap-stack-sm relative overflow-hidden transform transition-transform duration-300 active:scale-[0.98] opacity-0 translate-y-4" data-name="${pool.name}">
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
          <span class="font-label-sm text-label-sm text-on-surface-variant">/ month</span>
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
        <button class="join-pool-btn bg-primary text-on-primary-fixed px-4 py-2 rounded-full font-label-md text-label-md active:bg-primary-container transition-colors">Join Pool</button>
      </div>
    </div>
  `;
}
