/**
 * Toroide ASCII rotando — el "loop" de KodLoop renderizado con caracteres.
 * Técnica clásica de donut.c: proyección + z-buffer + luminancia.
 * Corre a ~24 fps solo mientras está en pantalla; con movimiento reducido queda estático.
 */

const CHARS = '.,-~:;=!*#$@';

export function renderTorus(cols: number, rows: number, A: number, B: number): string {
  const out = new Array<string>(cols * rows).fill(' ');
  const zbuf = new Float32Array(cols * rows);
  const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
  const R1 = 1, R2 = 2.1, K2 = 5;
  const K1 = ((cols * K2 * 3) / (8 * (R1 + R2))) * 0.95;

  for (let j = 0; j < 6.283; j += 0.06) {
    const ct = Math.cos(j), st = Math.sin(j);
    for (let i = 0; i < 6.283; i += 0.018) {
      const cp = Math.cos(i), sp = Math.sin(i);
      const cx = R2 + R1 * ct;
      const cy = R1 * st;
      const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB;
      const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB;
      const z = K2 + cA * cx * sp + cy * sA;
      const ooz = 1 / z;
      const xp = Math.floor(cols / 2 + K1 * ooz * x);
      const yp = Math.floor(rows / 2 - K1 * ooz * y * 0.5);
      if (xp < 0 || xp >= cols || yp < 0 || yp >= rows) continue;
      const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp);
      const idx = xp + yp * cols;
      if (L > 0 && ooz > zbuf[idx]) {
        zbuf[idx] = ooz;
        out[idx] = CHARS[Math.min(CHARS.length - 1, Math.floor(L * 8))];
      }
    }
  }

  let s = '';
  for (let r = 0; r < rows; r++) s += out.slice(r * cols, (r + 1) * cols).join('') + (r < rows - 1 ? '\n' : '');
  return s;
}

/** Anima el toroide. `getBoost` permite acelerarlo (por ejemplo, al pasar por los enlaces). */
export function mountTorus(el: HTMLElement, reducedMotion: boolean, getBoost: () => number = () => 0) {
  // en pantallas angostas: menos columnas para que entre con letra legible
  const narrow = window.matchMedia('(max-width: 899px)').matches;
  const cols = narrow ? 44 : Number(el.dataset.cols ?? 64);
  const rows = narrow ? 20 : Number(el.dataset.rows ?? 30);
  let A = 0.9, B = 0.4;
  let raf = 0, last = 0, running = false;

  const frame = (now: number) => {
    if (!running) return;
    if (now - last > 42) {
      last = now;
      const k = 1 + getBoost() * 2.5;
      A += 0.035 * k;
      B += 0.018 * k;
      el.textContent = renderTorus(cols, rows, A, B);
    }
    raf = requestAnimationFrame(frame);
  };

  el.textContent = renderTorus(cols, rows, A, B);
  if (reducedMotion) return;

  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !running) {
      running = true;
      raf = requestAnimationFrame(frame);
    } else if (!entry.isIntersecting) {
      running = false;
      cancelAnimationFrame(raf);
    }
  }).observe(el);
}
