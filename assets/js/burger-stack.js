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
 * "Oignons rouges¹", "cheese" pour tous les fromages) : l'illustration
 * n'est dessinée qu'une fois dans le <defs> SVG et seulement référencée
 * ici.
 */
(function () {
  var BURGERS = {
    bronx: {
      name: 'Bronx',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Cheddar', symbol: 'cheese' },
        { label: 'Lard fumé au bois d’hêtre', symbol: 'charcuterie' },
        { label: 'Œuf', symbol: 'egg' },
        { label: 'Oignons rouges¹', symbol: 'onion' },
      ],
    },
    maquis: {
      name: 'Maquis',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Fromage corse', symbol: 'cheese' },
        { label: 'Charcuterie corse', symbol: 'charcuterie' },
        { label: 'Chutney de figues', symbol: 'chutney' },
        { label: 'Oignons rouges¹', symbol: 'onion' },
      ],
    },
    boncheese: {
      name: 'Bon Cheese',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Cheddar', symbol: 'cheese' },
        { label: 'Lard fumé au bois d’hêtre grillé ou charcuterie corse', symbol: 'charcuterie' },
        { label: 'Oignons rouges¹', symbol: 'onion' },
      ],
    },
    coco: {
      name: 'Coco',
      ingredients: [
        { label: 'Poulet pané croustillant³', symbol: 'poulet' },
        { label: 'Cheddar', symbol: 'cheese' },
        { label: 'Lard fumé au bois d’hêtre grillé', symbol: 'charcuterie' },
        { label: 'Oignons rouges¹', symbol: 'onion' },
      ],
    },
    vege: {
      name: 'Végé',
      ingredients: [
        { label: 'Galette de pomme de terre³', symbol: 'galette' },
        { label: 'Fromage au choix', symbol: 'cheese' },
        { label: 'Salade', symbol: 'lettuce' },
        { label: 'Oignons rouges¹', symbol: 'onion' },
      ],
    },
    raclette: {
      name: 'Raclette',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Galette de pomme de terre³', symbol: 'galette' },
        { label: 'Fromage à raclette', symbol: 'cheese' },
        { label: 'Charcuterie corse', symbol: 'charcuterie' },
        { label: 'Oignons rouges¹', symbol: 'onion' },
      ],
    },
    cevenol: {
      name: 'Cévenol',
      ingredients: [
        { label: 'Steak haché frais²', symbol: 'steak' },
        { label: 'Galette de pomme de terre³', symbol: 'galette' },
        { label: 'Fromage de chèvre des Cévennes', symbol: 'cheese' },
        { label: 'Charcuterie corse', symbol: 'charcuterie' },
        { label: 'Oignons rouges¹', symbol: 'onion' },
      ],
    },
  };

  var BUN_TOP = { label: 'Pain du boulanger', symbol: 'bun-top' };
  var BUN_BOTTOM = { label: 'Pain du boulanger', symbol: 'bun-bottom' };
  // Commune à tous les burgers, ajoutée juste au-dessus du pain du bas
  // (donc juste après la viande/protéine) directement dans l'empilement
  // (voir openBurger), plutôt que répétée dans chaque entrée de BURGERS
  // ci-dessus : impossible de l'oublier sur un burger.
  var SAUCE = { label: 'Sauce au choix', symbol: 'sauce' };

  var SYMBOL_VIEWBOX = {
    'bun-top': '0 0 300 50',
    'bun-bottom': '0 0 300 40',
    steak: '0 0 300 54',
    poulet: '0 0 300 50',
    charcuterie: '0 0 300 46',
    cheese: '0 0 300 40',
    egg: '0 0 300 34',
    onion: '0 0 300 30',
    lettuce: '0 0 300 34',
    chutney: '0 0 300 26',
    galette: '0 0 300 40',
    sauce: '0 0 300 20',
  };

  var backdrop = document.getElementById('burger-modal-backdrop');
  var panelEl = document.getElementById('burger-modal-panel');
  var headerEl = document.getElementById('burger-modal-header');
  var closeBtn = document.getElementById('burger-modal-close');
  var titleEl = document.getElementById('burger-modal-title');
  var layersEl = document.getElementById('burger-modal-layers');
  var lastTrigger = null;

  if (!backdrop || !panelEl || !headerEl || !closeBtn || !titleEl || !layersEl) return;

  // Le panneau est nettement plus étroit sur mobile (max-w-[92vw]) que sur
  // desktop (md:max-w-[720px]), mais le budget de hauteur ci-dessous était
  // calculé uniquement à partir de la hauteur de viewport — sans lien avec
  // cette largeur. Résultat : des couches presque aussi hautes que sur
  // desktop, empilées dans un cadre beaucoup plus étroit, donc un
  // empilement démesurément haut et étiré verticalement sur mobile. On
  // utilise donc des réglages plus resserrés en dessous du breakpoint "md"
  // de Tailwind (768px), pour que les proportions largeur/hauteur de la
  // pile se rapprochent de celles du rendu desktop.
  var MEDIA_MD = window.matchMedia('(min-width: 768px)');

  // Doit rester en phase avec la classe Tailwind "max-h-[85vh]" du panneau.
  var PANEL_MAX_VH_RATIO_DESKTOP = 0.85;
  var PANEL_MAX_VH_RATIO_MOBILE = 0.42;
  // Le gap entre couches est une fraction de la hauteur de couche, donc il
  // se réduit lui aussi proportionnellement pour les burgers à plus
  // d'ingrédients (voir computeLayerSizing).
  var GAP_RATIO_DESKTOP = 0.16;
  var GAP_RATIO_MOBILE = 0.1;
  var MIN_LAYER_HEIGHT_DESKTOP = 26;
  var MIN_LAYER_HEIGHT_MOBILE = 18;
  var MAX_LAYER_HEIGHT_DESKTOP = 92;
  // Plafonné pour que le rapport hauteur de couche / largeur totale reste
  // proche de celui du desktop (~0.15-0.17) plutôt que ~0.28 comme avant :
  // le panneau mobile est beaucoup plus étroit, donc des couches aussi
  // hautes que sur desktop y paraissaient disproportionnées.
  var MAX_LAYER_HEIGHT_MOBILE = 24;

  function layerRow(item, delayMs, heightPx) {
    var viewBox = SYMBOL_VIEWBOX[item.symbol] || '0 0 300 40';
    return (
      '<div class="bstack-layer flex items-center gap-3 md:gap-4" style="animation-delay:' + delayMs + 'ms">' +
      /* Largeur fixe (identique pour toutes les couches, quel que soit
         l'ingrédient) via calc(100% - largeur légende - gap), portée par ce
         conteneur, pas par le <svg> lui-même. Le <svg> ne reçoit qu'une
         largeur ("w-full") et une hauteur automatique ("h-auto") : il se
         dessine donc toujours à son échelle naturelle, sans jamais étirer
         NI rogner ses motifs internes sur les côtés (anneaux d'oignons,
         ronds de lard, points de fromage...) — un seul axe est contraint,
         donc aucune ambiguïté de mise à l'échelle possible sur l'autre.
         Le conteneur a la hauteur fixe calculée dynamiquement (voir
         computeLayerSizing, pour que l'empilement tienne sans scroll) et
         "overflow:hidden" : si le dessin est naturellement plus haut que
         cette hauteur (le pain par exemple), seul un rognage vertical,
         centré, peut se produire — jamais horizontal. */
      '<div class="flex-none w-[calc(100%_-_132px)] md:w-[calc(100%_-_166px)] overflow-hidden flex items-center justify-center" style="height:' + heightPx + 'px">' +
      '<svg viewBox="' + viewBox + '" class="w-full h-auto block" role="presentation" focusable="false">' +
      '<use href="#ing-' + item.symbol + '"></use>' +
      '</svg>' +
      '</div>' +
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
    var isDesktop = MEDIA_MD.matches;
    var vhRatio = isDesktop ? PANEL_MAX_VH_RATIO_DESKTOP : PANEL_MAX_VH_RATIO_MOBILE;
    var gapRatio = isDesktop ? GAP_RATIO_DESKTOP : GAP_RATIO_MOBILE;
    var minLayerHeight = isDesktop ? MIN_LAYER_HEIGHT_DESKTOP : MIN_LAYER_HEIGHT_MOBILE;
    var maxLayerHeight = isDesktop ? MAX_LAYER_HEIGHT_DESKTOP : MAX_LAYER_HEIGHT_MOBILE;

    var viewportBudget = window.innerHeight * vhRatio;
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
    available = Math.max(available, minLayerHeight * layerCount);

    // total = n*h + (n-1)*gap, avec gap = gapRatio*h
    var denom = layerCount + (layerCount - 1) * gapRatio;
    var layerHeight = available / denom;
    layerHeight = Math.max(minLayerHeight, Math.min(maxLayerHeight, Math.round(layerHeight)));
    var gap = Math.max(2, Math.round(layerHeight * gapRatio));

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
    var stack = [BUN_TOP].concat(reversedIngredients, [SAUCE], [BUN_BOTTOM]);
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
