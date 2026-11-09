/** Interacciones globales del sitio. Todo es mejora progresiva. */
import { mountScramble, scramble } from './scramble';
import './ascii-fx';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Reveal on scroll ---------- */
function mountReveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Seguimiento del puntero para brillos ---------- */
function mountPointerGlow() {
  document.addEventListener(
    'pointermove',
    (e) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>('[data-glow], .btn');
      if (!target) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      target.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    },
    { passive: true },
  );
}

/* ---------- Sección activa: header + medidor de profundidad ---------- */
function mountActiveSection() {
  const sections = [...document.querySelectorAll<HTMLElement>('main section[id]')];
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const depthLabel = document.querySelector<HTMLElement>('[data-depth-label]');
  const depthValue = document.querySelector<HTMLElement>('[data-depth-value]');
  const depthBar = document.querySelector<HTMLElement>('[data-depth-bar]');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = e.target.id;
        links.forEach((a) => {
          if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
        if (depthLabel) depthLabel.textContent = (e.target as HTMLElement).dataset.label ?? '';
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => io.observe(s));

  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (depthValue) depthValue.textContent = `-${(p * 100).toFixed(1).padStart(4, '0')}`;
    if (depthBar) depthBar.style.transform = `scaleY(${p})`;
    document.documentElement.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/* ---------- Menú móvil ---------- */
function mountMenu() {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.documentElement.classList.toggle('menu-open', open);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', () => setOpen(false));
}

/* ---------- Copiar email ---------- */
function mountCopy() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const label = btn.querySelector<HTMLElement>('[data-copy-label]');
    const status = document.querySelector<HTMLElement>('[data-copy-status]');
    const original = label?.textContent ?? '';
    // El bloque del email también responde: se resalta y el texto se "decodifica".
    const group = btn.closest<HTMLElement>('.mail');
    const text = group?.querySelector<HTMLElement>('[data-copy-text]');
    let timer = 0;
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy ?? '';
      try {
        await navigator.clipboard.writeText(value);
        if (label) label.textContent = 'Copiado';
        if (status) status.textContent = 'Email copiado al portapapeles';
        group?.classList.add('is-copied');
        if (text && !reduced) scramble(text, 600);
      } catch {
        if (label) label.textContent = 'No se pudo copiar';
        if (status) status.textContent = `No se pudo copiar. El email es ${value}`;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (label) label.textContent = original;
        group?.classList.remove('is-copied');
      }, 2200);
    });
  });
}

mountReveal();
mountPointerGlow();
mountActiveSection();
mountMenu();
mountCopy();
mountScramble(reduced);
