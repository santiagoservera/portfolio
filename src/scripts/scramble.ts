/**
 * Decodificación de texto: los caracteres pasan por glifos monoespaciados
 * hasta resolverse en el texto final. El texto real está siempre en el HTML;
 * esto solo lo anima. Lectores de pantalla reciben el texto vía aria-label.
 */

const GLYPHS = '01<>/{}[]=+*#%&$@';

export function scramble(el: HTMLElement, duration = 900): Promise<void> {
  const target = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = target;
  if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', target);

  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      let out = '';
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        const settle = i / target.length;
        if (ch === ' ' || t > settle * 0.7 + 0.3) out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(step);
      else {
        el.textContent = target;
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

export function mountScramble(reducedMotion: boolean) {
  if (reducedMotion) return;
  const els = document.querySelectorAll<HTMLElement>('[data-scramble]');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        scramble(entry.target as HTMLElement, Number((entry.target as HTMLElement).dataset.duration ?? 900));
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  els.forEach((el) => io.observe(el));
}
