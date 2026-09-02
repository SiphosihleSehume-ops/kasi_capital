/**
 * Tiny hash-based router. Each route maps to a render() function that
 * returns HTML for #app-root, plus an optional init() that wires up
 * event listeners (DOM manipulation) after the HTML has been inserted.
 */
const Router = (() => {
  const routes = {};

  function register(path, { title, showChrome = true, render, init }) {
    routes[path] = { title, showChrome, render, init };
  }

  function currentPath() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'welcome';
  }

  function setActiveNavLink(path) {
    document.querySelectorAll('.nav-link').forEach((link) => {
      const isActive = link.dataset.path === path;
      link.classList.toggle('text-secondary', isActive);
      link.classList.toggle('font-bold', isActive);
      link.classList.toggle('text-on-surface-variant', !isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function render() {
    const path = currentPath();
    const route = routes[path] || routes['welcome'];
    const appRoot = document.getElementById('app-root');
    const header = document.getElementById('app-header');
    const nav = document.getElementById('app-nav');
    const headerTitle = document.getElementById('header-page-title');

    header.classList.toggle('hidden', !route.showChrome);
    nav.classList.toggle('hidden', !route.showChrome);
    appRoot.classList.toggle('pt-16', route.showChrome);
    appRoot.classList.toggle('pb-24', route.showChrome);

    if (route.showChrome) {
      headerTitle.textContent = route.title;
      setActiveNavLink(path);
    }

    appRoot.innerHTML = route.render();
    if (typeof route.init === 'function') {
      route.init();
    }

    window.scrollTo(0, 0);
  }

  function navigate(path) {
    window.location.hash = `/${path}`;
  }

  function start() {
    window.addEventListener('hashchange', render);
    window.addEventListener('DOMContentLoaded', render);
  }

  return { register, navigate, start };
})();
