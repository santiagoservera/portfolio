import type { APIRoute } from 'astro';

// robots.txt generado con el dominio real (SITE_URL), así el sitemap nunca apunta a otro lado.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
