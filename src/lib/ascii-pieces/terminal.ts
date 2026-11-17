/**
 * Terminal ASCII animada con una sesión propia.
 * Adaptada de la pieza "terminal" de ascii.rest — MIT © bas3line (https://github.com/bas3line/ascii).
 * Cambio: la sesión (comandos y salida) es un parámetro en lugar de un texto fijo.
 */

/** [comando, segundos hasta la salida, líneas de salida | null]. Un número en la salida es una pausa. */
export type Session = [string, number, (string | number)[] | null][];

export interface TerminalOptions {
  prompt?: string;
  title?: string;
  session: Session;
  cols?: number;
  rows?: number;
}

function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function terminal({ prompt = '~ $', title = '~', session, cols = 62, rows = 18 }: TerminalOptions) {
  const inner = cols - 4;
  const view = rows - 2;
  const rand = mulberry32(5);
  const head = prompt + ' ';

  type Step = { cmd: string; shown: number; keys: number[]; lines: [number, string][]; enter: number };
  const steps: Step[] = [];
  let at = 0;
  for (const [cmd, wait, out] of session) {
    const s: Step = { cmd, shown: at, keys: [], lines: [], enter: 0 };
    at += 0.9 + rand() * 0.6;
    for (let i = 0; i < cmd.length; i++) {
      s.keys.push(at);
      at += 0.06 + rand() * 0.07 + (cmd[i] === ' ' ? rand() * 0.12 : 0) + (rand() < 0.04 ? 0.35 : 0);
    }
    s.enter = at + 0.12;
    at = s.enter + wait;
    for (const line of out || []) {
      if (typeof line === 'number') at += line;
      else s.lines.push([(at += 0.035), line]);
    }
    at += 0.05;
    steps.push(s);
  }
  // pausa final con la pantalla llena antes de reiniciar
  const period = steps[steps.length - 1].enter + 0.1;
  // el primer cuadro (el que se ve sin JavaScript) muestra la sesión casi completa
  const start = steps[Math.max(0, steps.length - 2)].enter + 1;
  const cell = (s: string) => (s.length > inner ? s.slice(0, inner) : s.padEnd(inner));

  return (t: number) => {
    const now = (((t + start) % period) + period) % period;
    const lines: string[] = [];
    let cursor: [number, number] | null = null;
    let ref = 0;
    for (const s of steps) {
      if (s.shown > now) break;
      const typed = s.keys.filter((k) => k <= now).length;
      lines.push(head + s.cmd.slice(0, typed));
      ref = typed ? s.keys[typed - 1] : s.shown;
      if (now < s.enter) {
        cursor = [lines.length - 1, head.length + typed];
        break;
      }
      ref = s.enter;
      for (const [k, line] of s.lines) {
        if (k > now) break;
        lines.push(line);
        ref = k;
      }
      cursor = [lines.length, 0];
    }
    const top = Math.max(0, lines.length + (cursor && cursor[0] === lines.length ? 1 : 0) - view);
    const blink = (now - ref) % 1 < 0.55;
    const body: string[] = [];
    for (let r = 0; r < view; r++) {
      const i = top + r;
      let s = cell(lines[i] ?? '');
      if (cursor && cursor[0] === i && blink && cursor[1] < inner) s = s.slice(0, cursor[1]) + '█' + s.slice(cursor[1] + 1);
      body.push('│ ' + s + ' │');
    }
    const name = title ? '─ ' + title.slice(0, cols - 6) + ' ' : '';
    return ['╭' + (name + '─'.repeat(cols)).slice(0, cols - 2) + '╮', ...body, '╰' + '─'.repeat(cols - 2) + '╯'].join('\n');
  };
}
