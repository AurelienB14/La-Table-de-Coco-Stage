# La Table de Coco — site vitrine

Site statique (HTML/CSS/JS) du restaurant **La Table de Coco** à Saint Christol-lès-Alès. Aucun serveur Node requis en production : le dossier peut être testé sur Netlify puis copié tel quel sur l'hébergement mutualisé Hostinger.

## Structure

```
index.html          Accueil            } générés par `npm run build:html`
ardoise.html         Notre ardoise (menu)  — ne pas éditer directement,
concept.html          Notre concept        voir "Développement" ci-dessous
contact.html          Contact & Accès    }
src/
  pages/              Sources des 4 pages (avec les marqueurs <!-- INCLUDE:nav/footer -->)
  input.css           Source Tailwind (styles de base + classes .btn/.tag/.card)
scripts/
  build-html.js       Injecte partials/nav.html et partials/footer.html dans src/pages/*.html
partials/
  nav.html            Barre de navigation, source unique
  footer.html          Pied de page, source unique
assets/
  css/style.css        CSS compilé (Tailwind), généré — ne pas éditer à la main
  js/include.js         JS d'interactivité uniquement (menu mobile, lien actif) — n'injecte plus de HTML
  img/                  placeholder.svg (photos à venir), favicon.png, og-image.jpg
tailwind.config.js     Palette et polices du site
sitemap.xml, robots.txt  SEO
```

Nav et footer sont factorisés dans `partials/nav.html` et `partials/footer.html` pour éviter toute duplication entre les 4 pages. Ils sont injectés **au moment du build** (`npm run build:html`) directement dans le HTML généré à la racine, pas côté navigateur : les crawlers qui n'exécutent pas de JavaScript (réseaux sociaux, outils d'audit SEO, certains bots) voient donc la navigation et le footer dès le premier rendu HTML. `assets/js/include.js` ne sert plus qu'au comportement interactif (menu hamburger mobile, mise en surbrillance du lien actif) sur du HTML déjà présent.

## Développement

```bash
npm install
npm run build       # build:html + build:css, à lancer après tout changement
npm run watch:css   # recompile assets/css/style.css en continu pendant le dev
npm run serve       # sert le dossier en statique sur http://localhost:3000
```

**Important — fichiers générés :** `index.html`, `ardoise.html`, `concept.html`, `contact.html` à la racine sont générés à partir de `src/pages/*.html` + `partials/nav.html` + `partials/footer.html`. Ne les éditez jamais directement, les changements seraient écrasés au prochain build.

- Pour changer le contenu d'une page : éditer le fichier correspondant dans `src/pages/`.
- Pour changer la navigation ou le footer : éditer `partials/nav.html` ou `partials/footer.html`.
- Dans les deux cas, relancer ensuite :

  ```bash
  npm run build:html
  ```

  puis committer les fichiers HTML régénérés à la racine (comme pour `assets/css/style.css`, ce sont des artefacts compilés mais c'est bien eux qui sont déployés sur Hostinger, sans étape de build côté serveur).

- Si le changement touche des classes Tailwind (nouvelles classes utilisées, palette dans `tailwind.config.js`, `src/input.css`), relancer aussi :

  ```bash
  npm run build:css
  ```

## À compléter avant mise en ligne définitive

- **`src/pages/concept.html`** : section "Le lieu" à compléter avec l'historique récent du restaurant (nouveau local, etc.) — voir le commentaire `<!-- TODO -->`.
- **Photos** : toutes les images sont des placeholders SVG (`assets/img/placeholder.svg`) avec des attributs `alt` déjà rédigés — il suffit de remplacer le `src` par les vraies photos une fois disponibles.

Après toute correction dans `src/pages/`, relancer `npm run build:html` (et committer les fichiers HTML régénérés) avant de déployer.

## Déploiement sur Hostinger

Copier à la racine de l'hébergement mutualisé : les 4 fichiers HTML générés, `assets/`, `sitemap.xml`, `robots.txt`. Les dossiers `node_modules/`, `src/`, `scripts/`, `partials/`, ainsi que `tailwind.config.js` et `package.json`, ne sont utiles qu'en développement/build et n'ont pas besoin d'être déployés. Le site ne nécessite aucune exécution Node côté serveur.
