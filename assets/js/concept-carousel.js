/**
 * Petit carrousel/slideshow pour la section "Un nouveau local" de la page
 * Notre concept (.concept-carousel). Défilement automatique, flèches,
 * points de navigation et swipe tactile — vanilla JS, aucune dépendance.
 */
(function () {
  var root = document.querySelector('.concept-carousel');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.concept-carousel-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.concept-carousel-dot'));
  var prevBtn = root.querySelector('.concept-carousel-prev');
  var nextBtn = root.querySelector('.concept-carousel-next');
  var count = slides.length;
  if (count === 0) return;

  var AUTOPLAY_MS = 4500;
  var SWIPE_THRESHOLD = 40;
  var current = 0;
  var timer = null;

  function show(index) {
    current = ((index % count) + count) % count;
    slides.forEach(function (slide, i) {
      var active = i === current;
      slide.classList.toggle('opacity-100', active);
      slide.classList.toggle('opacity-0', !active);
    });
    dots.forEach(function (dot, i) {
      var active = i === current;
      dot.classList.toggle('bg-white', active);
      dot.classList.toggle('bg-white/50', !active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function next() {
    show(current + 1);
  }

  function prev() {
    show(current - 1);
  }

  function resetAutoplay() {
    if (timer) clearInterval(timer);
    timer = setInterval(next, AUTOPLAY_MS);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      prev();
      resetAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      next();
      resetAutoplay();
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      show(parseInt(dot.getAttribute('data-goto'), 10));
      resetAutoplay();
    });
  });

  // Swipe tactile : compare la position X au début/à la fin du toucher.
  var touchStartX = null;
  root.addEventListener(
    'touchstart',
    function (e) {
      touchStartX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );
  root.addEventListener(
    'touchend',
    function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (dx > SWIPE_THRESHOLD) {
        prev();
        resetAutoplay();
      } else if (dx < -SWIPE_THRESHOLD) {
        next();
        resetAutoplay();
      }
      touchStartX = null;
    },
    { passive: true }
  );

  show(0);
  resetAutoplay();
})();
