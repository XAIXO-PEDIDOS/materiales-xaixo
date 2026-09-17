import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './scripts/site.config.mjs';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root,
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((p) => [p.slug, resolve(root, `${p.slug}.html`)])
      ),
    },
  },
  server: {
    port: 5173,
  },
});
