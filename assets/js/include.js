/**
 * Nav/footer markup is inlined into each page at build time (see
 * scripts/build-html.js) so it's present in the raw HTML for crawlers that
 * don't run JavaScript. This script only wires up interactive behaviour on
 * top of that already-rendered markup: the mobile hamburger menu and the
 * active-page highlight in the nav.
 */
(function () {
  function markActiveLink(root, page) {
    root.querySelectorAll('[data-nav-link]').forEach(function (link) {
      if (link.getAttribute('data-nav-link') === page) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function wireMobileNav(root) {
    var toggle = root.querySelector('#nav-toggle');
    var menu = root.querySelector('#nav-mobile');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('flex');
      menu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page') || '';
    markActiveLink(document, page);
    wireMobileNav(document);
  });
})();
