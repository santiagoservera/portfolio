// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cambiar SITE_URL por el dominio definitivo antes de desplegar.
const site = process.env.SITE_URL ?? 'https://santiagoservera.com';

export default defineConfig({
  site,
  integrations: [sitemap()],
  // CSS en línea: elimina las hojas de estilo que bloquean el primer render.
  build: { inlineStylesheets: 'always' },
  prefetch: false,
  // Los SVG de logos se sirven como archivos (no como data URI dentro del HTML).
  vite: { build: { assetsInlineLimit: 0 } },
});
