Router.register('welcome', {
  title: 'Welcome',
  showChrome: false,
  render: () => `
    <div class="flex flex-col w-full h-full pb-stack-lg min-h-screen">
      <div class="w-full flex justify-end px-container-padding pt-stack-md">
        <div class="relative inline-block text-left" id="language-selector">
          <button aria-expanded="false" aria-haspopup="true" class="inline-flex justify-center w-full rounded-full bg-surface-container px-4 py-2 text-label-sm font-label-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary items-center gap-1 shadow-sm transition-transform active:scale-95" id="menu-button" type="button">
            <span id="selected-language">English</span>
            <span class="material-symbols-outlined text-[16px]">expand_more</span>
          </button>
          <div aria-labelledby="menu-button" class="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-lg bg-surface-container-highest shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none hidden transition-opacity duration-200 opacity-0" id="dropdown-menu" role="menu">
            <div class="py-1" role="none">
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">English</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Afrikaans</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">isiZulu</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">isiXhosa</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Sesotho</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Swahili</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Kinyarwanda</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Lingala</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Bemba</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Nyanja</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Luganda</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Fon</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Yoruba</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Igbo</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Hausa</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Malagasy</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Dioula</a>
              <a class="lang-option text-on-surface block px-4 py-2 text-label-sm font-label-sm hover:bg-surface-container-highest" href="#" role="menuitem">Creole</a>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-grow flex flex-col items-center justify-center px-container-padding text-center pt-stack-md pb-stack-lg relative">
        <div class="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
          <svg class="absolute -top-10 -right-10 animate-[spin_60s_linear_infinite]" fill="none" height="400" viewBox="0 0 400 400" width="400" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="150" stroke="#ffcc00" stroke-dasharray="10 30" stroke-linecap="round" stroke-width="40"></circle>
          </svg>
          <svg class="absolute bottom-10 -left-20 animate-[spin_40s_linear_infinite_reverse]" fill="none" height="300" viewBox="0 0 300 300" width="300" xmlns="http://www.w3.org/2000/svg">
            <circle cx="150" cy="150" r="100" stroke="#f1c100" stroke-dasharray="20 40" stroke-linecap="round" stroke-width="20"></circle>
          </svg>
        </div>

        <div class="relative z-10 bg-surface-white p-6 rounded-2xl shadow-lg w-full max-w-sm flex flex-col items-center">
          <!-- Logo: text-based, "Kasi Capital" -->
          <div class="flex items-center gap-2 mb-6">
            <span class="flex items-center justify-center w-14 h-14 rounded-full bg-primary-container text-on-primary-container font-headline-md text-headline-md shadow-sm">K</span>
          </div>
          <h1 class="text-display-lg-mobile font-display-lg-mobile text-on-surface mb-1">
            <span class="text-primary">Kasi Capital</span>
          </h1>
          <h2 class="text-headline-sm font-headline-sm text-on-surface mb-2">Grow Your Wealth, <span class="text-primary">Together.</span></h2>
          <p class="text-body-md font-body-md text-on-surface-variant mb-stack-md max-w-[280px]">Modernize your Stokvel. Secure, transparent, and built for communal prosperity.</p>

          <div class="w-full flex flex-col gap-stack-sm mb-stack-md text-left">
            <div class="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg">
              <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px] text-on-secondary-container">group_add</span>
              </div>
              <div>
                <h3 class="text-label-md font-label-md text-on-surface">1. Join a Group</h3>
                <p class="text-label-sm font-label-sm text-on-surface-variant">Create or find your trusted circle.</p>
              </div>
            </div>
            <div class="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg">
              <div class="w-8 h-8 rounded-full bg-growth-green/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px] text-growth-green" style="font-variation-settings: 'FILL' 1;">payments</span>
              </div>
              <div>
                <h3 class="text-label-md font-label-md text-on-surface">2. Contribute Safely</h3>
                <p class="text-label-sm font-label-sm text-on-surface-variant">Automated tracking, zero hassle.</p>
              </div>
            </div>
            <div class="flex items-center gap-3 bg-surface-container-low p-3 rounded-lg">
              <div class="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-[18px] text-on-tertiary-container" style="font-variation-settings: 'FILL' 1;">trending_up</span>
              </div>
              <div>
                <h3 class="text-label-md font-label-md text-on-surface">3. Invest &amp; Grow</h3>
                <p class="text-label-sm font-label-sm text-on-surface-variant">Access high-yield opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-container-padding w-full flex flex-col gap-3 mt-auto">
        <button id="verify-btn" class="w-full bg-primary-container text-on-primary-container text-label-md font-label-md py-4 rounded-xl shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          Verify &amp; Continue
          <span class="material-symbols-outlined text-[18px]">verified_user</span>
        </button>
        <button id="create-account-btn" class="w-full bg-transparent text-secondary text-label-md font-label-md py-4 rounded-xl shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
          Create Account
        </button>
        <div class="flex items-center justify-center gap-1 mt-2">
          <span class="material-symbols-outlined text-[14px] text-on-surface-variant">lock</span>
          <span class="text-label-sm font-label-sm text-on-surface-variant">Bank-Grade Security</span>
        </div>
      </div>
    </div>
  `,
  init: () => {
    const menuButton = document.getElementById('menu-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const selectedLanguage = document.getElementById('selected-language');
    let isMenuOpen = false;

    menuButton.addEventListener('click', () => {
      isMenuOpen = !isMenuOpen;
      if (isMenuOpen) {
        dropdownMenu.classList.remove('hidden');
        setTimeout(() => dropdownMenu.classList.remove('opacity-0'), 10);
      } else {
        dropdownMenu.classList.add('opacity-0');
        setTimeout(() => dropdownMenu.classList.add('hidden'), 200);
      }
    });

    document.querySelectorAll('.lang-option').forEach((option) => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        selectedLanguage.textContent = option.textContent;
        isMenuOpen = false;
        dropdownMenu.classList.add('opacity-0');
        setTimeout(() => dropdownMenu.classList.add('hidden'), 200);
      });
    });

    document.addEventListener('click', (event) => {
      if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target) && isMenuOpen) {
        isMenuOpen = false;
        dropdownMenu.classList.add('opacity-0');
        setTimeout(() => dropdownMenu.classList.add('hidden'), 200);
      }
    });

    document.getElementById('verify-btn').addEventListener('click', () => Router.navigate('dashboard'));
    document.getElementById('create-account-btn').addEventListener('click', () => Router.navigate('dashboard'));
  }
});
