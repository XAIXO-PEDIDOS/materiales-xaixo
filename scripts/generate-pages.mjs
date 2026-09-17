// Genera las páginas HTML finales (raíz del proyecto) a partir de:
//  - scripts/site.config.mjs      → datos de empresa + listado de páginas
//  - src/pages/<slug>.html        → contenido propio de cada página
//  - header/footer compartidos    → definidos en este mismo archivo
//
// Vite (multipágina) sirve/compila directamente los .html generados en la raíz.

import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, pages } from './site.config.mjs';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const pagesDir = path.join(root, 'src', 'pages');
const publicDir = path.join(root, 'public');
const assetsDir = path.join(root, 'assets');

// Logos de marca: se copian tal cual (sin recomprimir) de assets/ a public/,
// a diferencia de las fotos, que pasan por generate-assets.mjs.
const LOGO_FILES = ['logo.png', 'logo-blanco.png'];

const navPages = [...pages].filter((p) => p.showInNav).sort((a, b) => a.navOrder - b.navOrder);

function absoluteUrl(p) {
  return `${site.domain}${p}`;
}

function renderHeader(activePath) {
  const links = navPages
    .map((p) => {
      const active = p.path === activePath ? ' aria-current="page"' : '';
      return `<a href="${p.path}"${active}>${p.nav}</a>`;
    })
    .join('');

  // TODO: cuando haya teléfono fijo, sustituir este CTA por <a class="tel" href="tel:+34...">.
  return `<header>
  <div class="head">
    <a class="brand" href="/"><img class="logo" src="/logo.png" alt="XAIXO Materiales de Construcción"></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu-movil" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
    <nav id="menu-principal">${links}</nav>
    <a class="tel" href="/contacto.html">Pide presupuesto</a>
  </div>
  <nav id="menu-movil" class="movil">${links}<a href="/contacto.html">Pide presupuesto</a></nav>
</header>`;
}

function renderFooter() {
  const waLink = `https://wa.me/${site.whatsappIntl}`;
  return `<footer><div class="foot">
  <div>
    <div class="brand"><img class="logo" src="/logo-blanco.png" alt="XAIXO Materiales de Construcción"></div>
    <p style="margin-top:16px;max-width:32ch"><!-- TODO: confirmar antigüedad de la empresa -->Empresa familiar en Gandia dedicada a la distribución de materiales de construcción en toda la Comunidad Valenciana.</p>
  </div>
  <div><h4>CONTACTO</h4><div class="co">
    <span><!-- TODO: teléfono fijo pendiente de alta --></span>
    <a href="${waLink}" target="_blank" rel="noopener">WhatsApp ${site.whatsappDisplay}</a>
    <a href="mailto:${site.email}">${site.email}</a>
    <span>${site.address.street}<br>${site.address.postalCode} ${site.address.locality}, ${site.address.region}</span>
  </div></div>
  <div><h4>PRODUCTOS</h4><div class="co">
    <a href="/productos.html#obra">Obra y cemento</a><a href="/productos.html#tabiqueria">Tabiquería</a><a href="/productos.html#cubiertas">Cubiertas</a><a href="/productos.html#pavimentos">Pavimentos</a><a href="/productos.html#ferreteria">Ferretería</a><a href="/productos.html#pinturas">Pinturas</a>
  </div></div>
  <div><h4>EMPRESA</h4><div class="co">
    <a href="/xaixo-plack.html">Xaixo Plack</a><a href="/servicios.html">Servicios</a><a href="/almacen.html">El almacén</a><a href="${site.xaixoHomeUrl}" target="_blank" rel="noopener">Xaixo Home ↗</a>
  </div></div>
</div>
<div class="legal"><div class="in">
  <span>© ${new Date().getFullYear()} ${site.legalName} · CIF ${site.cif}</span>
  <span><a href="/aviso-legal.html">Aviso legal</a> · <a href="/politica-privacidad.html">Privacidad</a> · <a href="/cookies.html">Cookies</a></span>
</div></div>
</footer>`;
}

function renderJsonLd(page) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HardwareStore',
    '@id': `${site.domain}/#negocio`,
    name: site.name,
    legalName: site.legalName,
    url: site.domain,
    image: `${site.domain}/img/hero-nave-1600.webp`,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '19:00',
      },
    ],
    areaServed: 'Comunidad Valenciana',
    // TODO: añadir "telephone" en cuanto se dé de alta la línea fija.
  };
  if (page.slug === 'index') {
    data.sameAs = []; // TODO: enlazar perfiles sociales cuando existan
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function shell(page, { header, footer, content }) {
  const canonical = absoluteUrl(page.path);
  const ogImage = `${site.domain}/img/hero-nave-1600.webp`;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<link rel="canonical" href="${canonical}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${page.title}">
<meta name="twitter:description" content="${page.description}">
<meta name="twitter:image" content="${ogImage}">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="mask-icon" href="/favicon.svg" color="#F92C20">

<link rel="stylesheet" href="/src/styles.css">
${renderJsonLd(page)}
</head>
<body>
${header}
${content}
${footer}
<a class="wa" href="https://wa.me/${site.whatsappIntl}?text=${encodeURIComponent('Hola, quería pedir presupuesto de materiales.')}" target="_blank" rel="noopener">Pide por WhatsApp</a>

<div class="cookie-bar" role="dialog" aria-label="Aviso de cookies">
  <p>Usamos cookies técnicas necesarias para el funcionamiento del sitio y para recordar tu elección. Más información en nuestra <a href="/cookies.html">política de cookies</a>.</p>
  <div class="acts">
    <button type="button" class="btn p" data-cookie-choice="aceptadas">Aceptar</button>
    <button type="button" class="btn" data-cookie-choice="rechazadas">Rechazar no esenciales</button>
  </div>
</div>

<script type="module" src="/src/app.js"></script>
</body>
</html>
`;
}

async function copyLogos() {
  for (const file of LOGO_FILES) {
    const src = path.join(assetsDir, file);
    if (!existsSync(src)) {
      console.warn(`⚠ falta ${path.relative(root, src)}, el logo no se mostrará`);
      continue;
    }
    await copyFile(src, path.join(publicDir, file));
    console.log(`✓ ${file}`);
  }
}

async function build() {
  if (!existsSync(publicDir)) await mkdir(publicDir, { recursive: true });
  await copyLogos();

  for (const page of pages) {
    const contentPath = path.join(pagesDir, page.contentFile);
    const content = await readFile(contentPath, 'utf8');
    const html = shell(page, {
      header: renderHeader(page.path),
      footer: renderFooter(),
      content,
    });
    const outFile = path.join(root, `${page.slug}.html`);
    await writeFile(outFile, html, 'utf8');
    console.log(`✓ ${page.slug}.html`);
  }

  await buildSitemap();
  await buildRobots();
}

async function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .map((p) => `  <url>\n    <loc>${absoluteUrl(p.path)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  await writeFile(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  console.log('✓ sitemap.xml');
}

async function buildRobots() {
  const txt = `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`;
  await writeFile(path.join(publicDir, 'robots.txt'), txt, 'utf8');
  console.log('✓ robots.txt');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
