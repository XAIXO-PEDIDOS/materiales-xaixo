// Convierte las fotos originales de assets/source/**  a WebP con variantes
// responsive (ancho) dentro de public/img/**, conservando la estructura de carpetas.
//
// Uso:  npm run generate:assets
//
// Coloca aquí las fotos reales (obra, almacén, Xaixo Plack, etc.) cuando estén
// disponibles; hasta entonces el sitio usa bloques ".ph" marcados con TODO.

import { mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const sourceDir = path.join(root, 'assets', 'source');
const outDir = path.join(root, 'public', 'img');

const WIDTHS = [480, 800, 1200, 1600];
const QUALITY = 78;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);

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

async function run() {
  const images = await collectImages(sourceDir);
  if (images.length === 0) {
    console.log(
      `No hay imágenes en ${path.relative(root, sourceDir)}/. Añade las fotos originales ahí y vuelve a ejecutar este script.`
    );
    return;
  }
  await mkdir(outDir, { recursive: true });
  for (const file of images) {
    await processImage(file);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
