/**
 * Genera la imagen Open Graph y los íconos del sitio con la paleta KodLoop.
 * Uso: node scripts/generate-assets.mjs   (escribe en /public)
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const pub = (f) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));

// Anillos del agujero de gusano, en perspectiva (más juntos hacia el centro)
const rings = (cx, cy, max, n) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 1) / n;
    const rx = max * t ** 1.8;
    const op = (0.12 + 0.55 * t).toFixed(2);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${(rx * 0.92).toFixed(1)}" fill="none" stroke="#8B2E4A" stroke-opacity="${op}" stroke-width="${(0.8 + t * 1.2).toFixed(2)}"/>`;
  }).join('');

const spokes = (cx, cy, r, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return `<line x1="${cx + Math.cos(a) * r * 0.06}" y1="${cy + Math.sin(a) * r * 0.06}" x2="${cx + Math.cos(a) * r}" y2="${cy + Math.sin(a) * r * 0.92}" stroke="#6D213C" stroke-opacity="0.35" stroke-width="1"/>`;
  }).join('');

const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="78%" cy="50%" r="55%">
      <stop offset="0" stop-color="#8B2E4A" stop-opacity="0.45"/>
      <stop offset="0.5" stop-color="#6D213C" stop-opacity="0.15"/>
      <stop offset="1" stop-color="#09090B" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#09090B"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g>${spokes(930, 315, 420, 28)}${rings(930, 315, 430, 22)}</g>
  <circle cx="930" cy="315" r="34" fill="#09090B"/>
  <text x="80" y="118" font-family="Consolas, 'Courier New', monospace" font-size="22" fill="#D68AA0" letter-spacing="3">◇ FULL STACK DEVELOPER</text>
  <text x="76" y="300" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="112" fill="#F4F4F5" letter-spacing="-4">Santiago</text>
  <text x="140" y="410" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="112" fill="#F4F4F5">Servera</text>
  <text x="80" y="500" font-family="'Segoe UI', Arial, sans-serif" font-size="28" fill="#F4F4F5" fill-opacity="0.7">Aplicaciones web y sistemas de gestión, del backend a la interfaz.</text>
  <line x1="80" y1="550" x2="1120" y2="550" stroke="#F4F4F5" stroke-opacity="0.12"/>
  <text x="80" y="590" font-family="Consolas, 'Courier New', monospace" font-size="20" fill="#F4F4F5" fill-opacity="0.6" letter-spacing="2">SAN JUAN, ARGENTINA · VUE.JS · NODE.JS · TYPESCRIPT</text>
</svg>`;

const icon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#09090B"/>
  <g fill="none" stroke-width="3.2">
    <ellipse cx="32" cy="32" rx="21" ry="9" stroke="#8B2E4A"/>
    <ellipse cx="32" cy="32" rx="13" ry="5.5" stroke="#6D213C"/>
    <ellipse cx="32" cy="32" rx="6" ry="2.6" stroke="#F4F4F5"/>
  </g>
</svg>`;

await sharp(Buffer.from(og)).png({ compressionLevel: 9 }).toFile(pub('og.png'));
await sharp(Buffer.from(icon(180))).png().toFile(pub('apple-touch-icon.png'));
await sharp(Buffer.from(icon(192))).png().toFile(pub('icon-192.png'));
await sharp(Buffer.from(icon(512))).png().toFile(pub('icon-512.png'));
console.log('og.png, apple-touch-icon.png, icon-192.png, icon-512.png generados en /public');
