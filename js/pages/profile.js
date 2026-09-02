Router.register('profile', {
  title: 'Profile',
  showChrome: true,
  render: () => `
    <div class="flex flex-col w-full gap-stack-md px-container-padding pb-stack-lg">
      <div class="flex flex-col items-center gap-3 mt-stack-md">
        <div class="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
          <span class="material-symbols-outlined text-[36px]">account_circle</span>
        </div>
        <div class="flex flex-col items-center">
          <h1 class="font-headline-md text-on-surface">Siyabonga Dlamini</h1>
          <p class="font-body-md text-on-surface-variant">Kasi Capital member since 2024</p>
        </div>
      </div>

      <!-- Availability status bar: lets other members searching for you (e.g. in Local Pools) see at a glance whether you're open to pool invites -->
      <button id="availability-bar" data-available="true" class="w-full flex items-center justify-between gap-3 bg-surface-white rounded-xl shadow-sm border border-border-soft p-4 mt-stack-md active:scale-[0.99] transition-transform">
        <div class="flex items-center gap-3">
          <span id="availability-dot" class="w-3 h-3 rounded-full bg-growth-green shadow-[0_0_6px_rgba(34,197,94,0.6)]"></span>
          <div class="flex flex-col items-start">
            <span id="availability-label" class="font-label-md text-on-surface">Available</span>
            <span class="font-label-sm text-on-surface-variant">Visible to others searching for pools to join or lead</span>
          </div>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant text-[18px]">unfold_more</span>
      </button>

      <div class="bg-surface-white rounded-xl shadow-sm border border-border-soft overflow-hidden mt-stack-md">
        ${profileRow('groups', 'My Pools', '2 active pools')}
        ${profileRow('notifications', 'Notifications', 'Manage alerts')}
        ${profileRow('language', 'Language', 'English')}
        ${profileRow('shield', 'Security', 'PIN & biometrics')}
        ${profileRow('help', 'Help & Support', 'FAQs and contact')}
      </div>

      <button id="sign-out-btn" class="w-full bg-transparent text-stokvel-red text-label-md font-label-md py-4 rounded-xl border border-stokvel-red/30 mt-stack-md active:scale-[0.98] transition-transform">
        Sign Out
      </button>
    </div>
  `,
  init: () => {
    document.getElementById('sign-out-btn').addEventListener('click', () => {
      Router.navigate('welcome');
    });

    const availabilityBar = document.getElementById('availability-bar');
    const availabilityDot = document.getElementById('availability-dot');
    const availabilityLabel = document.getElementById('availability-label');

    availabilityBar.addEventListener('click', () => {
      const isAvailable = availabilityBar.dataset.available === 'true';
      const nowAvailable = !isAvailable;

      availabilityBar.dataset.available = String(nowAvailable);
      availabilityLabel.textContent = nowAvailable ? 'Available' : 'Not Available';

      availabilityDot.classList.toggle('bg-growth-green', nowAvailable);
      availabilityDot.classList.toggle('shadow-[0_0_6px_rgba(34,197,94,0.6)]', nowAvailable);
      availabilityDot.classList.toggle('bg-outline', !nowAvailable);
      availabilityDot.classList.toggle('shadow-none', !nowAvailable);
    });
  }
});

function profileRow(icon, label, sublabel) {
  return `
    <div class="flex items-center gap-4 p-4 border-b border-border-soft last:border-b-0">
      <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-[20px] text-on-surface-variant">${icon}</span>
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-label-md text-on-surface">${label}</p>
        <p class="font-label-sm text-on-surface-variant">${sublabel}</p>
      </div>
      <span class="material-symbols-outlined text-on-surface-variant text-[18px]">chevron_right</span>
    </div>
  `;
}
