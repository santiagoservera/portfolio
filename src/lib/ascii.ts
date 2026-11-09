/**
 * Generadores ASCII deterministas. Se ejecutan en build (frontmatter de Astro),
 * así el arte existe en el HTML aunque no haya JavaScript ni WebGL.
 */

const RAMP = ' .·:-=+*#%@';

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Túnel visto de frente: anillos concéntricos con espaciado en perspectiva.
 * Fallback estático del agujero de gusano del hero.
 */
export function asciiTunnel(cols = 120, rows = 44): string {
  const lines: string[] = [];
  const cx = cols / 2;
  const cy = rows / 2;
  const aspect = 2.1; // las celdas monoespaciadas son más altas que anchas
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      const dx = (x - cx) / aspect;
      const dy = y - cy;
      const r = Math.hypot(dx, dy) + 0.0001;
      const angle = Math.atan2(dy, dx);
      // profundidad aparente: 1/r → anillos cada vez más juntos hacia el centro
      const depth = 26 / r;
      const ring = Math.abs(Math.sin(depth * Math.PI));
      const spoke = Math.abs(Math.sin(angle * 12 + depth * 0.6));
      const v = Math.max(ring > 0.93 ? 1 - (1 - ring) * 6 : 0, spoke > 0.985 ? 0.55 : 0);
      const fade = Math.min(1, r / 4) * Math.max(0, 1 - r / (cols / aspect / 1.6));
      const idx = Math.round(v * fade * (RAMP.length - 1));
      line += RAMP[Math.max(0, Math.min(RAMP.length - 1, idx))];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/**
 * Campo de interferencia determinista por semilla, usado como placeholder
 * de las capturas de proyectos que todavía no están disponibles.
 */
export function asciiField(seed: string, cols = 96, rows = 30, phase = 0): string {
  const rand = mulberry32(hash(seed));
  const sources = Array.from({ length: 3 }, () => ({
    x: rand() * cols,
    y: rand() * rows,
    f: 0.18 + rand() * 0.22,
  }));
  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) {
      let v = 0;
      for (const s of sources) {
        const d = Math.hypot((x - s.x) / 2, y - s.y);
        v += Math.sin(d * s.f * Math.PI - phase);
      }
      v = (v / sources.length + 1) / 2;
      const idx = Math.floor(Math.pow(v, 2.4) * (RAMP.length - 1));
      line += RAMP[idx];
    }
    lines.push(line);
  }
  return lines.join('\n');
}

/** Regla ASCII con marcas, para separar secciones. */
export function asciiRule(length = 140, every = 10): string {
  let s = '';
  for (let i = 0; i < length; i++) s += i % every === 0 ? '┼' : '─';
  return s;
}

const SIGNAL = ' ·-~=≈';

/**
 * Señal: una línea de caracteres que ondula como una transmisión.
 * `t` en segundos; con t fijo devuelve un cuadro estático.
 */
export function asciiSignal(length: number, t = 0): string {
  let s = '';
  for (let i = 0; i < length; i++) {
    const v = 0.5 + 0.5 * Math.sin(i * 0.19 - t * 1.6) * Math.cos(i * 0.041 + t * 0.45);
    s += SIGNAL[Math.min(SIGNAL.length - 1, Math.floor(v * v * SIGNAL.length))];
  }
  return s;
}

/** Bloque de glifos aleatorio (determinista por semilla), para el escaneo de las capturas. */
export function asciiNoise(seed: string, cols = 90, rows = 30): string {
  const rand = mulberry32(hash(seed));
  const glyphs = '01<>/{}[]=+*#%&$@·:';
  const lines: string[] = [];
  for (let y = 0; y < rows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) line += rand() < 0.55 ? glyphs[(rand() * glyphs.length) | 0] : ' ';
    lines.push(line);
  }
  return lines.join('\n');
}
