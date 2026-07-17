/**
 * Loads partials/nav.html and partials/footer.html into their placeholder
 * elements, then wires up the mobile hamburger menu and the active-link
 * highlight. Runs on plain static hosting (Netlify, Hostinger) with no
 * build step.
 */
(function () {
  function markActiveLink(root, page) {
    root.querySelectorAll('[data-nav-link]').forEach(function (link) {
      if (link.getAttribute('data-nav-link') === page) {
        link.classList.add('text-accent-700', 'border-accent-500');
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

  function loadInclude(el) {
    var src = el.getAttribute('data-include');
    return fetch(src)
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        el.outerHTML = html;
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page') || '';
    var includes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));

    Promise.all(includes.map(loadInclude)).then(function () {
      markActiveLink(document, page);
      wireMobileNav(document);
    });
  });
})();
