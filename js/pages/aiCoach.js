Router.register('ai-coach', {
  title: 'AI Coach',
  showChrome: true,
  render: () => `
    <div class="flex flex-col w-full h-[calc(100vh-4rem-5rem)] overflow-hidden">
      <div class="flex-1 overflow-y-auto px-container-padding py-stack-md flex flex-col gap-stack-lg relative bg-surface-container-low" id="chat-container">
        <div class="flex flex-col gap-base items-center text-center mt-stack-sm mb-stack-md">
          <div class="relative w-20 h-20 bg-primary-container rounded-full flex items-center justify-center shadow-md animate-pulse shadow-primary-container/20">
            <span class="material-symbols-outlined text-[40px] text-on-primary-container">psychology</span>
            <div class="absolute bottom-0 right-0 w-5 h-5 bg-growth-green rounded-full shadow border-2 border-surface-container-low z-10 flex items-center justify-center">
              <span class="material-symbols-outlined text-[10px] text-surface-white font-bold">check</span>
            </div>
          </div>
          <div class="flex flex-col">
            <h2 class="font-headline-md text-on-surface">Meet Lesedi</h2>
            <p class="font-body-md text-on-surface-variant">Your Kasi Capital AI Wealth Coach</p>
          </div>
        </div>

        <div class="bg-surface-white rounded-xl shadow-sm p-gutter flex flex-col gap-stack-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary-container/20 rounded-full blur-xl pointer-events-none"></div>
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-base">
              <div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                <span class="material-symbols-outlined">lightbulb</span>
              </div>
              <div>
                <span class="font-label-sm text-secondary uppercase tracking-wider">Topic of the Day</span>
                <h3 class="font-headline-sm text-on-surface">What is an ETF?</h3>
              </div>
            </div>
          </div>
          <p class="font-body-md text-on-surface-variant line-clamp-2">
            An Exchange Traded Fund (ETF) is like a basket of different investments (like stocks or bonds) that you can buy and sell easily.
          </p>
          <button class="flex items-center gap-2 text-primary font-label-md mt-2 self-start hover:text-on-primary-container transition-colors" id="etf-topic-btn">
            <span>Learn more about ETFs</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        <div class="flex flex-col gap-stack-sm">
          <div class="flex justify-between items-end mb-1">
            <span class="font-headline-sm text-on-surface">Literacy Journey</span>
            <span class="font-label-md text-secondary">Level 2: Saver</span>
          </div>
          <div class="bg-surface-white p-gutter rounded-xl shadow-sm flex flex-col gap-stack-sm">
            <div class="flex justify-between text-label-sm text-on-surface-variant mb-1">
              <span>Progress to Investor</span>
              <span>450 / 1000 XP</span>
            </div>
            <div class="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-secondary to-primary-container w-[45%] rounded-full relative">
                <div class="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
            <div class="flex gap-2 overflow-x-auto pb-2 mt-2 snap-x hide-scrollbar">
              <div class="min-w-[120px] bg-secondary-fixed-dim/30 rounded-lg p-3 flex flex-col gap-1 items-center justify-center text-center snap-center">
                <span class="material-symbols-outlined text-secondary text-2xl">savings</span>
                <span class="font-label-sm text-on-surface-variant">Budgeting Basics</span>
                <div class="w-5 h-5 rounded-full bg-growth-green flex items-center justify-center text-surface-white mt-1">
                  <span class="material-symbols-outlined text-[12px] font-bold">check</span>
                </div>
              </div>
              <div class="min-w-[120px] bg-primary-container/20 rounded-lg p-3 flex flex-col gap-1 items-center justify-center text-center shadow-sm snap-center relative overflow-hidden">
                <div class="absolute inset-0 bg-primary-container/10 animate-pulse"></div>
                <span class="material-symbols-outlined text-primary text-2xl">trending_up</span>
                <span class="font-label-sm text-on-surface font-semibold">Stokvel Strategy</span>
                <span class="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">In Progress</span>
              </div>
              <div class="min-w-[120px] bg-surface-container rounded-lg p-3 flex flex-col gap-1 items-center justify-center text-center snap-center opacity-70">
                <span class="material-symbols-outlined text-outline text-2xl">account_balance</span>
                <span class="font-label-sm text-on-surface-variant">Interest Rates</span>
                <span class="material-symbols-outlined text-[16px] text-outline mt-1">lock</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-stack-sm pb-10" id="chat-messages">
          <div class="flex items-end gap-2 w-[85%]">
            <div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
              <span class="material-symbols-outlined text-[16px] text-on-secondary-fixed">psychology</span>
            </div>
            <div class="bg-surface-white rounded-2xl rounded-bl-none p-3 shadow-sm flex flex-col gap-1 text-body-md text-on-surface relative">
              Sawubona! Hello! I'm Lesedi. I can help you understand how to grow your Stokvel funds. What would you like to learn today?
            </div>
          </div>
          <div class="flex flex-wrap gap-2 ml-10 mt-2" id="chat-chips">
            <button class="chip-btn bg-primary-container text-on-primary-container font-label-md px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform" data-message="Tell me about ETFs">
              Tell me about ETFs
            </button>
            <button class="chip-btn bg-surface-white text-on-surface-variant font-label-md px-4 py-2 rounded-full shadow-sm active:scale-95 transition-transform border border-border-soft hover:bg-surface-container transition-colors" data-message="How does compound interest work?">
              Compound Interest
            </button>
          </div>
        </div>
      </div>

      <div class="bg-surface-white/90 backdrop-blur-md p-gutter border-t border-border-soft flex gap-2 items-center z-10 shrink-0 pb-safe">
        <div class="relative flex-1">
          <select class="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent text-secondary font-label-md outline-none appearance-none cursor-pointer z-10 pr-4" id="language-select">
            <option value="en">EN</option>
            <option value="zu">ZU</option>
            <option value="xh">XH</option>
            <option value="st">ST</option>
          </select>
          <div class="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none text-secondary">
            <span class="material-symbols-outlined text-[16px]">expand_more</span>
          </div>
          <input class="w-full bg-surface-container-low rounded-full py-3 pl-16 pr-12 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-on-surface-variant/70 shadow-inner" id="chat-input" placeholder="Ask a question..." type="text"/>
        </div>
        <button class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-surface-white shadow-md active:scale-95 transition-transform shrink-0 hover:bg-on-secondary-fixed-variant" id="send-btn">
          <span class="material-symbols-outlined ml-1">send</span>
        </button>
      </div>
    </div>
  `,
  init: () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatContainer = document.getElementById('chat-container');
    const languageSelect = document.getElementById('language-select');

    function scrollToBottom() {
      chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
    }

    function addMessage(text, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `flex items-end gap-2 ${isUser ? 'w-[85%] self-end flex-row-reverse' : 'w-[85%]'} animate-pop-in opacity-0`;

      let avatarHtml = '';
      let bubbleClass = '';

      if (isUser) {
        bubbleClass = 'bg-secondary text-on-secondary rounded-2xl rounded-br-none p-3 shadow-sm flex flex-col gap-1 text-body-md';
      } else {
        avatarHtml = `<div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 shadow-sm"><span class="material-symbols-outlined text-[16px] text-on-secondary-fixed">psychology</span></div>`;
        bubbleClass = 'bg-surface-white text-on-surface rounded-2xl rounded-bl-none p-3 shadow-sm flex flex-col gap-1 text-body-md relative';
      }

      const bubble = document.createElement('div');
      bubble.className = bubbleClass;
      bubble.textContent = text;

      if (avatarHtml) {
        msgDiv.insertAdjacentHTML('beforeend', avatarHtml);
      }
      msgDiv.appendChild(bubble);

      chatMessages.appendChild(msgDiv);

      if (isUser) {
        const chips = document.getElementById('chat-chips');
        if (chips) chips.remove();
        chatInput.value = '';
      }

      setTimeout(scrollToBottom, 50);
    }

    function handleSend(presetText) {
      const text = (presetText !== undefined ? presetText : chatInput.value).trim();
      if (!text) return;

      addMessage(text, true);

      const typingId = 'typing-' + Date.now();
      const typingDiv = document.createElement('div');
      typingDiv.id = typingId;
      typingDiv.className = 'flex items-end gap-2 w-[85%] animate-pop-in opacity-0';
      typingDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0 shadow-sm"><span class="material-symbols-outlined text-[16px] text-on-secondary-fixed">psychology</span></div>
        <div class="bg-surface-white text-on-surface rounded-2xl rounded-bl-none p-3 shadow-sm flex gap-1 items-center h-10">
          <div class="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-on-surface-variant/50 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
      `;
      chatMessages.appendChild(typingDiv);
      setTimeout(scrollToBottom, 50);

      setTimeout(() => {
        document.getElementById(typingId)?.remove();
        const lang = languageSelect.value;
        let response = "That's a great question! Based on your Stokvel goals, growing your money takes time and consistency.";

        if (lang === 'zu') response = "Lowo ngumbuzo omuhle! Ngokusekelwe ezinhlosweni zakho ze-Stokvel, ukukhulisa imali yakho kuthatha isikhathi nokungaguquguquki.";
        if (text.toLowerCase().includes('etf')) {
          response = "An ETF (Exchange Traded Fund) is a basket of securities you buy or sell through a brokerage firm on a stock exchange. It's a great way for Stokvels to diversify!";
          if (lang === 'zu') response = "I-ETF iyinqolobane yezibambiso oyithenga noma oyithengisa ngenkampani edayisayo e-stock exchange. Yindlela enhle yokuthi ama-Stokvel andise amathuba!";
        }

        addMessage(response, false);
      }, 1500);
    }

    document.getElementById('send-btn').addEventListener('click', () => handleSend());
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
    document.getElementById('etf-topic-btn').addEventListener('click', () => handleSend('Tell me more about ETFs'));

    document.querySelectorAll('.chip-btn').forEach((chip) => {
      chip.addEventListener('click', () => handleSend(chip.dataset.message));
    });
  }
});
