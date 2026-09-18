// Pipeline de imágenes del sitio:
//  1) Fotos de assets/source/**  → WebP con variantes responsive (ancho) en public/img/**.
//  2) Logos de marca de assets/logos/** → recortados a su contenido real y
//     normalizados a una misma altura, en public/img/marcas/**.
//  3) Recortes "con dirección de arte" (CUSTOM_CROPS): para huecos concretos
//     de la web donde escalar la foto entera queda blando (p. ej. una tarjeta
//     estrecha y vertical recortada de una foto panorámica). Se generan a
//     partir del mismo original de assets/source/, con su propio encuadre.
//
// Uso:  npm run generate:assets
//
// Coloca aquí las fotos reales (obra, almacén, Xaixo Plack, etc.) cuando estén
// disponibles; hasta entonces el sitio usa bloques ".ph" marcados con TODO.
// Los logos de marca que falten se muestran como texto (ver scripts/site.config.mjs).

import { mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const sourceDir = path.join(root, 'assets', 'source');
const outDir = path.join(root, 'public', 'img');
const logosSourceDir = path.join(root, 'assets', 'logos');
const logosOutDir = path.join(root, 'public', 'img', 'marcas');

const WIDTHS = [480, 800, 1200, 1600];
const QUALITY = 78;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);
const LOGO_HEIGHT = 72; // px de salida (2x de los ~36px a los que se muestra en la cinta)

// Recortes manuales para huecos con una proporción muy distinta a la de la
// foto original. "crop" son píxeles del original; "width" es el ancho final
// (se pensó para que fuera al menos el doble del ancho en pantalla del hueco,
// para retina). Calidad 90: aquí sí importa el detalle, la foto no se reduce
// mucho más allá del recorte.
const CUSTOM_CROPS = [
  {
    // Tarjeta "Xaixo Home" de la home (.hero-card): casi cuadrada en
    // escritorio. Recorte centrado en la isla de cocina, a todo el alto del
    // original (2688x1520) para no perder ni techo ni banquetas.
    source: 'xaixohome.webp',
    output: 'xaixohome-card.webp',
    crop: { left: 514, top: 0, width: 1439, height: 1520 },
    width: 900,
  },
];

async function collectImages(dir) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectImages(full)));
    } else if (EXTS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

async function processImage(file) {
  const rel = path.relative(sourceDir, file);
  const { dir, name } = path.parse(rel);
  const targetDir = path.join(outDir, dir);
  await mkdir(targetDir, { recursive: true });

  const image = sharp(file);
  const meta = await image.metadata();

  for (const width of WIDTHS) {
    if (meta.width && meta.width < width) continue; // no ampliar
    const outFile = path.join(targetDir, `${name}-${width}.webp`);
    await sharp(file).resize({ width }).webp({ quality: QUALITY }).toFile(outFile);
  }

  // Variante a tamaño completo, por si se necesita.
  const fullOut = path.join(targetDir, `${name}.webp`);
  await sharp(file).webp({ quality: QUALITY }).toFile(fullOut);

  console.log(`✓ ${rel} → img/${path.join(dir, name)}[-w].webp`);
}

async function processBrandLogo(file) {
  const { name, ext } = path.parse(file);
  const outFile = path.join(logosOutDir, `${name}.png`);
  try {
    await sharp(file)
      .trim() // recorta el margen/fondo sobrante hasta el contenido real del logo
      .resize({ height: LOGO_HEIGHT })
      .png()
      .toFile(outFile);
    console.log(`✓ marca ${name}${ext} → img/marcas/${name}.png`);
  } catch (err) {
    console.warn(`⚠ no se pudo procesar el logo ${name}${ext}: ${err.message}`);
  }
}

async function processCustomCrops() {
  for (const { source, output, crop, width } of CUSTOM_CROPS) {
    const file = path.join(sourceDir, source);
    if (!existsSync(file)) {
      console.warn(`⚠ falta ${path.relative(root, file)}, no se genera el recorte ${output}`);
      continue;
    }
    await sharp(file).extract(crop).resize({ width }).webp({ quality: 90 }).toFile(path.join(outDir, output));
    console.log(`✓ recorte ${source} → img/${output}`);
  }
}

async function run() {
  const images = await collectImages(sourceDir);
  if (images.length === 0) {
    console.log(
      `No hay imágenes en ${path.relative(root, sourceDir)}/. Añade las fotos originales ahí y vuelve a ejecutar este script.`
    );
  } else {
    await mkdir(outDir, { recursive: true });
    for (const file of images) {
      await processImage(file);
    }
  }

  const logos = await collectImages(logosSourceDir);
  if (logos.length === 0) {
    console.log(`No hay logos en ${path.relative(root, logosSourceDir)}/.`);
  } else {
    await mkdir(logosOutDir, { recursive: true });
    for (const file of logos) {
      await processBrandLogo(file);
    }
  }

  await mkdir(outDir, { recursive: true });
  await processCustomCrops();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
