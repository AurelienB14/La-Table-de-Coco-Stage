#!/usr/bin/env node
/**
 * Build-time HTML includes.
 *
 * Reads each template in src/pages/*.html, replaces the
 * <!-- INCLUDE:nav --> and <!-- INCLUDE:footer --> markers with the actual
 * markup from partials/nav.html and partials/footer.html, and writes the
 * result to the project root (index.html, ardoise.html, ...).
 *
 * This runs once at build time so nav/footer are present in the HTML
 * source served to the browser and to crawlers that don't execute
 * JavaScript (social share bots, some SEO tools). Client-side JS
 * (assets/js/include.js) only wires up interactive behaviour afterwards
 * (mobile menu, active nav link) — it no longer injects any markup.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const PARTIALS_DIR = path.join(ROOT, 'partials');

const PARTIALS = {
  nav: fs.readFileSync(path.join(PARTIALS_DIR, 'nav.html'), 'utf8').trim(),
  footer: fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8').trim(),
};

const INCLUDE_MARKER = /<!--\s*INCLUDE:(\w+)\s*-->/g;

const pageFiles = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html'));

if (pageFiles.length === 0) {
  console.error(`No .html templates found in ${PAGES_DIR}`);
  process.exit(1);
}

for (const file of pageFiles) {
  const srcPath = path.join(PAGES_DIR, file);
  const template = fs.readFileSync(srcPath, 'utf8');

  const output = template.replace(INCLUDE_MARKER, (match, name) => {
    if (!(name in PARTIALS)) {
      throw new Error(`Unknown include marker "${name}" in ${file}`);
    }
    return PARTIALS[name];
  });

  const destPath = path.join(ROOT, file);
  fs.writeFileSync(destPath, output, 'utf8');
  console.log(`Built ${path.relative(ROOT, destPath)}`);
}
