# La Table de Coco — site vitrine

Site statique (HTML/CSS/JS) du restaurant **La Table de Coco** à Saint Christol-lès-Alès. Aucun serveur Node requis en production : le dossier peut être testé sur Netlify puis copié tel quel sur l'hébergement mutualisé Hostinger.

## Structure

```
index.html          Accueil
ardoise.html         Notre ardoise (menu)
concept.html          Notre concept
contact.html          Contact & Accès
partials/
  nav.html            Barre de navigation, injectée dans chaque page via assets/js/include.js
  footer.html          Pied de page, injecté de la même façon
assets/
  css/style.css        CSS compilé (Tailwind), à ne pas éditer à la main
  js/include.js         Charge les partials, gère le menu mobile et le lien actif
  img/                  placeholder.svg (photos à venir), favicon.png, og-image.jpg
src/input.css          Source Tailwind (styles de base + classes .btn/.tag/.card)
tailwind.config.js     Palette et polices du site
sitemap.xml, robots.txt  SEO
```

Nav et footer sont factorisés en partials HTML et injectés en JS (`fetch` + `outerHTML`) pour éviter toute duplication entre les 4 pages, sans dépendre d'un framework serveur.

## Développement

```bash
npm install
npm run watch:css   # recompile assets/css/style.css à chaque changement
npm run serve       # sert le dossier en statique sur http://localhost:3000
```

Avant de livrer une modification de `src/input.css` ou des classes Tailwind utilisées dans les pages, lancer :

```bash
npm run build:css
```

et committer le `assets/css/style.css` généré (c'est ce fichier compilé, pas Tailwind, qui est déployé sur Hostinger).

## À compléter avant mise en ligne définitive

- **`ardoise.html`** : le menu et la liste d'allergènes sont des exemples factices (badges "Exemple — à remplacer"). Voir les commentaires `<!-- TODO -->` dans le fichier.
- **`concept.html`** : section "Le lieu" à compléter avec l'historique récent du restaurant (nouveau local, etc.) — voir le commentaire `<!-- TODO -->`.
- **Photos** : toutes les images sont des placeholders SVG (`assets/img/placeholder.svg`) avec des attributs `alt` déjà rédigés — il suffit de remplacer le `src` par les vraies photos une fois disponibles.
- **Domaine** : les URLs absolues (canonical, Open Graph, sitemap.xml, robots.txt) utilisent `https://www.latabledecoco.fr/` en attendant le nom de domaine définitif sur Hostinger — à corriger partout si besoin.

## Déploiement sur Hostinger

Copier l'intégralité du dossier (sauf `node_modules/`, `src/`, `tailwind.config.js`, `package.json` qui ne sont utiles qu'en développement) à la racine de l'hébergement mutualisé. Le site ne nécessite aucune exécution Node côté serveur.
