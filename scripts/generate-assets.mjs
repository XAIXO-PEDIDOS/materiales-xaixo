// Pipeline de imágenes del sitio:
//  1) Fotos de assets/source/**  → WebP con variantes responsive (ancho) en public/img/**.
//  2) Logos de marca de assets/logos/** → recortados a su contenido real y
//     normalizados a una misma altura, en public/img/marcas/**.
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
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
