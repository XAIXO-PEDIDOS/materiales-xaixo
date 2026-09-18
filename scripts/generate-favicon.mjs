// Genera el favicon a partir del icono (casco de obra) recortado de assets/logo.png,
// centrado sobre fondo blanco: public/favicon.ico (16/32/48), public/favicon-512.png
// y public/apple-touch-icon.png (180x180).
//
// Uso:  node scripts/generate-favicon.mjs
//
// El recuadro de recorte (ICON_BOX) se localizó una vez a mano con sharp .trim()
// sobre la mitad izquierda de assets/logo.png (el símbolo, sin el texto "XAIXO").
// Si se sustituye el logo, hay que recalcularlo.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const logoPath = path.join(root, 'assets', 'logo.png');
const publicDir = path.join(root, 'public');

// Caja del símbolo (casco de obra) dentro de assets/logo.png (3240x1080), sin el texto.
const ICON_BOX = { left: 62, top: 206, width: 1127, height: 680 };
const CANVAS = 1024; // lienzo cuadrado de trabajo, blanco
const ICO_SIZES = [16, 32, 48];

async function buildMaster() {
  const icon = await sharp(logoPath).extract(ICON_BOX).png().toBuffer();
  const resizedIcon = await sharp(icon).resize({ width: CANVAS }).toBuffer();
  const meta = await sharp(resizedIcon).metadata();
  const left = Math.round((CANVAS - meta.width) / 2);
  const top = Math.round((CANVAS - meta.height) / 2);

  return sharp({ create: { width: CANVAS, height: CANVAS, channels: 4, background: '#ffffff' } })
    .composite([{ input: resizedIcon, left, top }])
    .png()
    .toBuffer();
}

function buildIco(pngsBySize) {
  const sizes = ICO_SIZES;
  const pngs = sizes.map((s) => pngsBySize[s]);
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * pngs.length;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  const dirEntries = sizes.map((size, i) => {
    const png = pngs[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...dirEntries, ...pngs]);
}

async function run() {
  await mkdir(publicDir, { recursive: true });
  const master = await buildMaster();

  await sharp(master).resize(512, 512).png().toFile(path.join(publicDir, 'favicon-512.png'));
  console.log('✓ favicon-512.png');

  await sharp(master).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png (180x180)');

  const pngsBySize = {};
  for (const size of ICO_SIZES) {
    pngsBySize[size] = await sharp(master).resize(size, size).png().toBuffer();
  }
  const ico = buildIco(pngsBySize);
  await writeFile(path.join(publicDir, 'favicon.ico'), ico);
  console.log(`✓ favicon.ico (${ICO_SIZES.join('/')})`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
