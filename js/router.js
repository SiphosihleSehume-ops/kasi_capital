/**
 * Tiny hash-based router.
 * Hash format:  #/<path>?key=value&key2=value2
 * Supports Router.params() to read query params from current route.
 */
const Router = (() => {
  const routes = {};

  function register(path, { title, showChrome = true, render, init }) {
    routes[path] = { title, showChrome, render, init };
  }

  function parseHash() {
    const raw  = window.location.hash.replace(/^#\/?/, '');
    const qi   = raw.indexOf('?');
    const path = qi === -1 ? raw : raw.slice(0, qi);
    const qs   = qi === -1 ? '' : raw.slice(qi + 1);
    const p    = {};
    qs.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) p[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return { path: path || 'welcome', params: p };
  }

  /** Returns the current query-string params as a plain object */
  function params() {
    return parseHash().params;
  }

  function setActiveNavLink(path) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      const isActive = link.dataset.path === path;
      link.classList.toggle('text-secondary', isActive);
      link.classList.toggle('font-bold', isActive);
      link.classList.toggle('text-on-surface-variant', !isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else          link.removeAttribute('aria-current');
    });
  }

  function render() {
    const { path, params: qp } = parseHash();
    const route = routes[path] || routes['welcome'];

    const appRoot     = document.getElementById('app-root');
    const header      = document.getElementById('app-header');
    const nav         = document.getElementById('app-nav');
    const headerTitle = document.getElementById('header-page-title');

    header.classList.toggle('hidden', !route.showChrome);
    nav.classList.toggle('hidden',    !route.showChrome);
    appRoot.classList.toggle('pt-16', route.showChrome);
    appRoot.classList.toggle('pb-24', route.showChrome);

    if (route.showChrome) {
      headerTitle.textContent = route.title;
      setActiveNavLink(path);
    }

    appRoot.innerHTML = route.render(qp);
    if (typeof route.init === 'function') route.init(qp);
    window.scrollTo(0, 0);
  }

  function navigate(path) {
    window.location.hash = `/${path}`;
  }

  function back() {
    history.back();
  }

  function start() {
    window.addEventListener('hashchange', render);
    window.addEventListener('DOMContentLoaded', render);
  }

  return { register, navigate, back, params, start };
})();
