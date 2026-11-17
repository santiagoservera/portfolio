/**
 * Animaciones ASCII sutiles: señales que ondulan en los encabezados y el pie.
 * Cada una corre (a pocos cuadros por segundo) solo mientras está en pantalla.
 * Con movimiento reducido quedan en un cuadro estático.
 */
import { asciiSignal } from '../lib/ascii';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Un solo temporizador compartido: cada elemento visible se dibuja a ~fps, sin un bucle rAF propio. */
const jobs = new Set<{ frame: (t: number) => void }>();
const t0 = performance.now();
let timer = 0;
function schedule() {
  if (timer || !jobs.size) return;
  timer = window.setInterval(() => {
    if (document.hidden) return;
    const t = (performance.now() - t0) / 1000;
    jobs.forEach((j) => j.frame(t));
  }, 1000 / 12);
}
function unschedule() {
  if (!jobs.size) {
    window.clearInterval(timer);
    timer = 0;
  }
}
function whileVisible(el: HTMLElement, _fps: number, frame: (t: number) => void) {
  const job = { frame };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) {
      jobs.add(job);
      schedule();
    } else {
      jobs.delete(job);
      unschedule();
    }
  }).observe(el);
}


/* ---------- Señales: líneas que ondulan ---------- */
function charWidth(el: HTMLElement): number {
  const probe = document.createElement('span');
  probe.textContent = '0'.repeat(20);
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  el.appendChild(probe);
  const w = probe.getBoundingClientRect().width / 20;
  probe.remove();
  return w || 7;
}

function mountSignals() {
  document.querySelectorAll<HTMLElement>('[data-signal]').forEach((el, i) => {
    let cw = charWidth(el);
    let length = 0;
    const measure = () => {
      length = Math.max(0, Math.floor(el.clientWidth / cw));
    };
    measure();
    // Desfase por línea para que no ondulen todas sincronizadas.
    const offset = i * 1.7;
    const render = (t: number) => {
      const base = asciiSignal(length, t + offset);
      el.dataset.sig = base;
    };
    el.classList.add('is-live');
    render(0);

    new ResizeObserver(() => {
      cw = charWidth(el);
      measure();
      render(0);
    }).observe(el);

    if (!reduced) whileVisible(el, 12, render);
  });
}

mountSignals();
