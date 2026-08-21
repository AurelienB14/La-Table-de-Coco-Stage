/**
 * Modale "composition du burger" pour la page Notre ardoise.
 *
 * Une seule modale (voir #burger-modal-backdrop dans ardoise.html) est
 * réutilisée pour les 7 burgers : au clic sur un emplacement photo vide
 * (.burger-photo-slot, data-burger="..."), ce script construit la pile
 * d'illustrations à partir des données ci-dessous et de la bibliothèque de
 * symboles SVG définie dans ardoise.html (<symbol id="ing-...">), puis
 * l'affiche dans la modale.
 *
 * Les libellés d'ingrédients sont recopiés tels quels depuis le texte
 * existant de chaque burger sur la page (avec les exposants d'allergènes).
 * Plusieurs burgers partagent le même symbole (ex: "onion" pour tous les
 * "Oignons¹", "cheese" pour tous les fromages) : l'illustration n'est
 * dessinée qu'une fois dans le <defs> SVG et seulement référencée ici.
 */
(function () {
  var BURGERS = {
    bronx: {
      name: 'Bronx',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Cheddar', symbol: 'cheese' },
        { label: 'Lard fumé', symbol: 'charcuterie' },
        { label: 'Œuf', symbol: 'egg' },
        { label: 'Oignons¹', symbol: 'onion' },
      ],
    },
    maquis: {
      name: 'Maquis',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Fromage corse', symbol: 'cheese' },
        { label: 'Charcuterie corse', symbol: 'charcuterie' },
        { label: 'Chutney de figues', symbol: 'chutney' },
        { label: 'Oignons¹', symbol: 'onion' },
      ],
    },
    boncheese: {
      name: 'Bon Cheese',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Cheddar', symbol: 'cheese' },
        { label: 'Lard fumé grillé ou charcuterie corse', symbol: 'charcuterie' },
        { label: 'Oignons¹', symbol: 'onion' },
      ],
    },
    coco: {
      name: 'Coco',
      ingredients: [
        { label: 'Poulet pané croustillant³', symbol: 'poulet' },
        { label: 'Cheddar', symbol: 'cheese' },
        { label: 'Lard fumé grillé', symbol: 'charcuterie' },
        { label: 'Oignons¹', symbol: 'onion' },
      ],
    },
    vege: {
      name: 'Végé',
      ingredients: [
        { label: 'Galette de pomme de terre³', symbol: 'galette' },
        { label: 'Fromage au choix', symbol: 'cheese' },
        { label: 'Salade', symbol: 'lettuce' },
        { label: 'Oignons¹', symbol: 'onion' },
      ],
    },
    raclette: {
      name: 'Raclette',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Galette de pomme de terre³', symbol: 'galette' },
        { label: 'Fromage à raclette', symbol: 'cheese' },
        { label: 'Charcuterie corse', symbol: 'charcuterie' },
        { label: 'Oignons¹', symbol: 'onion' },
      ],
    },
    cevenol: {
      name: 'Cévenol',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Galette de pomme de terre³', symbol: 'galette' },
        { label: 'Fromage de chèvre des Cévennes', symbol: 'cheese' },
        { label: 'Charcuterie corse', symbol: 'charcuterie' },
        { label: 'Oignons¹', symbol: 'onion' },
      ],
    },
  };

  var BUN_TOP = { label: 'Pain du dessus', symbol: 'bun-top' };
  var BUN_BOTTOM = { label: 'Pain du dessous', symbol: 'bun-bottom' };

  var SYMBOL_VIEWBOX = {
    'bun-top': '0 0 300 50',
    'bun-bottom': '0 0 300 40',
    steak: '0 0 300 54',
    poulet: '0 0 300 50',
    charcuterie: '0 0 300 46',
    cheese: '0 0 300 40',
    egg: '0 0 300 44',
    onion: '0 0 300 30',
    lettuce: '0 0 300 34',
    chutney: '0 0 300 26',
    galette: '0 0 300 40',
  };

  var backdrop = document.getElementById('burger-modal-backdrop');
  var panelEl = document.getElementById('burger-modal-panel');
  var headerEl = document.getElementById('burger-modal-header');
  var closeBtn = document.getElementById('burger-modal-close');
  var titleEl = document.getElementById('burger-modal-title');
  var layersEl = document.getElementById('burger-modal-layers');
  var lastTrigger = null;

  if (!backdrop || !panelEl || !headerEl || !closeBtn || !titleEl || !layersEl) return;

  // Doit rester en phase avec la classe Tailwind "max-h-[85vh]" du panneau.
  var PANEL_MAX_VH_RATIO = 0.85;
  // Le gap entre couches est une fraction de la hauteur de couche, donc il
  // se réduit lui aussi proportionnellement pour les burgers à plus
  // d'ingrédients (voir computeLayerSizing).
  var GAP_RATIO = 0.16;
  var MIN_LAYER_HEIGHT = 26;
  var MAX_LAYER_HEIGHT = 92;

  function layerRow(item, delayMs, heightPx) {
    var viewBox = SYMBOL_VIEWBOX[item.symbol] || '0 0 300 40';
    return (
      '<div class="bstack-layer flex items-center gap-3 md:gap-4" style="animation-delay:' + delayMs + 'ms">' +
      /* Largeur fixe (identique pour toutes les couches, quel que soit
         l'ingrédient) via calc(100% - largeur légende - gap). Hauteur fixe
         elle aussi, calculée dynamiquement (voir computeLayerSizing) pour
         que l'empilement complet tienne sans scroll. Avec un cadre
         width x height fixé sur les deux axes, preserveAspectRatio="meet"
         (le comportement précédent) rétrécit l'illustration jusqu'à ce
         qu'elle tienne aussi en hauteur, ce qui la rendait plus étroite
         que le cadre pour les ingrédients au dessin plus haut (le pain
         notamment) : largeur du cadre uniforme, mais dessin visible plus
         petit. "slice" scale au contraire l'illustration pour qu'elle
         remplisse tout le cadre (quitte à rogner un peu le haut/bas), donc
         la largeur RÉELLEMENT VISIBLE est toujours exactement celle du
         cadre commun, sans jamais étirer le dessin de façon non uniforme
         (le rapport largeur/hauteur interne du dessin reste inchangé, seul
         le cadrage change). */
      '<svg viewBox="' + viewBox + '" preserveAspectRatio="xMidYMid slice" style="height:' + heightPx + 'px" class="flex-none w-[calc(100%_-_132px)] md:w-[calc(100%_-_166px)]" role="presentation" focusable="false">' +
      '<use href="#ing-' + item.symbol + '"></use>' +
      '</svg>' +
      '<span class="flex-none w-[120px] md:w-[150px] text-[11px] md:text-[13px] font-semibold text-ink/80 leading-tight">' + item.label + '</span>' +
      '</div>'
    );
  }

  /**
   * Calcule une hauteur de couche et un espacement communs à tout
   * l'empilement, à partir de la place réellement disponible dans la
   * modale (mesurée en direct) et du nombre de couches à afficher. Un
   * burger à peu d'ingrédients obtient donc des couches plus hautes qu'un
   * burger à 7 ingrédients, puisque les deux se partagent le même budget
   * de hauteur total.
   */
  function computeLayerSizing(layerCount) {
    var viewportBudget = window.innerHeight * PANEL_MAX_VH_RATIO;
    var panelStyles = getComputedStyle(panelEl);
    var padTop = parseFloat(panelStyles.paddingTop) || 0;
    var padBottom = parseFloat(panelStyles.paddingBottom) || 0;
    var headerStyles = getComputedStyle(headerEl);
    var headerMarginBottom = parseFloat(headerStyles.marginBottom) || 0;
    var headerHeight = headerEl.getBoundingClientRect().height + headerMarginBottom;
    // Marge de sécurité pour absorber les arrondis (hauteur/gap arrondis au
    // pixel près, écarts de sous-pixel entre navigateurs) : sans elle,
    // l'empilement peut dépasser le budget de 2-4px et déclencher un
    // scroll malgré un calcul "exact".
    var SAFETY_MARGIN = 14;

    var available = viewportBudget - padTop - padBottom - headerHeight - SAFETY_MARGIN;
    available = Math.max(available, MIN_LAYER_HEIGHT * layerCount);

    // total = n*h + (n-1)*gap, avec gap = GAP_RATIO*h
    var denom = layerCount + (layerCount - 1) * GAP_RATIO;
    var layerHeight = available / denom;
    layerHeight = Math.max(MIN_LAYER_HEIGHT, Math.min(MAX_LAYER_HEIGHT, Math.round(layerHeight)));
    var gap = Math.max(2, Math.round(layerHeight * GAP_RATIO));

    return { layerHeight: layerHeight, gap: gap };
  }

  function openBurger(key, trigger) {
    var burger = BURGERS[key];
    if (!burger) return;
    // Dans un vrai burger la protéine (premier ingrédient du texte) est au
    // fond, contre le pain du dessous — pas juste sous le pain du dessus.
    // On inverse donc l'ordre des ingrédients entre les deux pains, qui
    // restent fixes en haut et en bas.
    var reversedIngredients = burger.ingredients.slice().reverse();
    var stack = [BUN_TOP].concat(reversedIngredients, [BUN_BOTTOM]);
    var step = 70;
    var n = stack.length;

    titleEl.textContent = 'Composition du burger : ' + burger.name;
    layersEl.innerHTML = '';

    lastTrigger = trigger || null;
    backdrop.classList.remove('hidden');
    backdrop.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    // La modale doit être affichée (donc mise en page) avant de mesurer la
    // place réellement disponible.
    var sizing = computeLayerSizing(n);
    layersEl.style.gap = sizing.gap + 'px';
    layersEl.innerHTML = stack
      .map(function (item, i) {
        var delayMs = (n - 1 - i) * step;
        return layerRow(item, delayMs, sizing.layerHeight);
      })
      .join('');

    closeBtn.focus();
  }

  function closeModal() {
    if (backdrop.classList.contains('hidden')) return;
    backdrop.classList.add('hidden');
    backdrop.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    if (lastTrigger) lastTrigger.focus();
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest && e.target.closest('.burger-photo-slot');
    if (trigger) openBurger(trigger.getAttribute('data-burger'), trigger);
  });

  closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();
