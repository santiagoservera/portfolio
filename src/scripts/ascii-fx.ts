/**
 * Animaciones ASCII sutiles: señales que ondulan en los encabezados y el pie.
 * Cada una corre (a pocos cuadros por segundo) solo mientras está en pantalla.
 * Con movimiento reducido quedan en un cuadro estático.
 */
import { asciiSignal } from '../lib/ascii';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Corre `frame` a ~fps mientras `el` está visible. */
function whileVisible(el: HTMLElement, fps: number, frame: (t: number) => void) {
  const interval = 1000 / fps;
  let raf = 0;
  let last = 0;
  let running = false;
  const start = performance.now();

  const tick = (now: number) => {
    if (!running) return;
    if (now - last >= interval) {
      last = now;
      frame((now - start) / 1000);
    }
    raf = requestAnimationFrame(tick);
  };

  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running && !document.hidden) {
      running = true;
      raf = requestAnimationFrame(tick);
    } else if (!e.isIntersecting) {
      running = false;
      cancelAnimationFrame(raf);
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
