/**
 * Modale "composition du burger" : une seule instance (#burger-modal-backdrop
 * dans ardoise.html), réutilisée pour les 7 burgers et remplie au clic à
 * partir des données ci-dessous et des symboles SVG <symbol id="ing-...">.
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
  // Ajoutée dans l'empilement (voir openBurger), pas dans BURGERS : commune
  // à tous les burgers, impossible de l'oublier sur l'un d'eux.
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

  var MEDIA_MD = window.matchMedia('(min-width: 768px)');

  // Doit rester en phase avec la classe Tailwind "max-h-[85vh]" du panneau.
  var PANEL_MAX_VH_RATIO_DESKTOP = 0.85;
  var PANEL_MAX_VH_RATIO_MOBILE = 0.42;
  var GAP_RATIO_DESKTOP = 0.16;
  var GAP_RATIO_MOBILE = 0.1;
  var MIN_LAYER_HEIGHT_DESKTOP = 26;
  var MIN_LAYER_HEIGHT_MOBILE = 18;
  var MAX_LAYER_HEIGHT_DESKTOP = 92;
  var MAX_LAYER_HEIGHT_MOBILE = 24;

  function layerRow(item, delayMs, heightPx) {
    var viewBox = SYMBOL_VIEWBOX[item.symbol] || '0 0 300 40';
    return (
      '<div class="bstack-layer flex items-center gap-3 md:gap-4" style="animation-delay:' + delayMs + 'ms">' +
      /* Le <svg> n'est contraint qu'en largeur (h-auto) : jamais étiré ni
         rogné sur les côtés. Le conteneur porte la hauteur fixe +
         overflow:hidden, donc un rognage éventuel reste vertical. */
      '<div class="flex-none w-[calc(100%_-_132px)] md:w-[calc(100%_-_166px)] overflow-hidden flex items-center justify-center" style="height:' + heightPx + 'px">' +
      '<svg viewBox="' + viewBox + '" class="w-full h-auto block" role="presentation" focusable="false">' +
      '<use href="#ing-' + item.symbol + '"></use>' +
      '</svg>' +
      '</div>' +
      '<span class="flex-none w-[120px] md:w-[150px] text-[11px] md:text-[13px] font-semibold text-ink/80 leading-tight">' + item.label + '</span>' +
      '</div>'
    );
  }

  // Hauteur de couche + espacement communs, calculés à partir de la place
  // réellement disponible et du nombre de couches (donc plus hauts pour un
  // burger à peu d'ingrédients).
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
    // Absorbe les écarts d'arrondi (pixel, sous-pixel) qui pourraient sinon
    // déclencher un scroll malgré un calcul "exact".
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
    // La protéine (premier ingrédient du texte) doit finir contre le pain
    // du dessous, pas juste sous le pain du dessus : on inverse l'ordre.
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

    // Doit être affichée avant ce calcul, qui mesure la place réelle.
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
