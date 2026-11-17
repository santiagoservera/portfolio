import type { AsciiLogo } from '../data/ascii-logos';

/** Todos los logos se centran en la misma caja, así el cambio de uno a otro no salta. */
export const LOGO_COLS = 32;
export const LOGO_ROWS = 16;

/** Separa un logo en sus dos tintas: cada capa deja solo las celdas de su tono. */
export function logoLayers(logo: AsciiLogo): { lo: string; hi: string } {
  const top = Math.floor((LOGO_ROWS - logo.art.length) / 2);
  const layer = (t: string) =>
    Array.from({ length: LOGO_ROWS }, (_, i) => {
      const r = i - top;
      const row = logo.art[r];
      if (!row) return ' '.repeat(LOGO_COLS);
      const left = Math.floor((LOGO_COLS - row.length) / 2);
      const cells = [...row].map((ch, c) => (logo.tone[r][c] === t ? ch : ' ')).join('');
      return (' '.repeat(left) + cells).padEnd(LOGO_COLS);
    }).join('\n');
  return { lo: layer('l'), hi: layer('h') };
}

const NOISE = '.:-=+*#%@8P$';

/**
 * Una capa a mitad de camino entre dos logos: cada celda ya resuelta muestra el destino y el resto,
 * ruido donde alguno de los dos tiene tinta. `p` va de 0 a 1; `seed` fija el orden en que se resuelven.
 */
export function blendLayer(from: string, to: string, p: number, seed: number[]): string {
  const a = from.split('\n');
  const b = to.split('\n');
  const rows = Math.max(a.length, b.length);
  let k = 0;
  const out: string[] = [];
  for (let r = 0; r < rows; r++) {
    const ra = a[r] ?? '';
    const rb = b[r] ?? '';
    const cols = Math.max(ra.length, rb.length);
    let line = '';
    for (let c = 0; c < cols; c++, k++) {
      const ca = ra[c] ?? ' ';
      const cb = rb[c] ?? ' ';
      if (seed[k % seed.length] < p) line += cb;
      else if (ca === ' ' && cb === ' ') line += ' ';
      else line += NOISE[(Math.random() * NOISE.length) | 0];
    }
    out.push(line);
  }
  return out.join('\n');
}
