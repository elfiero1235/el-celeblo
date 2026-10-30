document.documentElement.classList.add('js');

// año del footer
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

// nav: sombra al scrollear + menú móvil
const nav = document.querySelector('.site-nav');
const menuBtn = document.querySelector('.menu-btn');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });
menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// abierto / cerrado según el horario del local (lun-vie 9-18, sáb 9-12)
const openEl = document.querySelector('[data-open]');
if (openEl) {
  const now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
  const open = (d >= 1 && d <= 5 && h >= 9 && h < 18) || (d === 6 && h >= 9 && h < 12);
  openEl.classList.toggle('closed', !open);
  openEl.lastElementChild.textContent = open ? 'Abierto ahora' : 'Cerrado ahora';
}

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// cantidad con stock por categoría en el inicio (home.js carga los valores): cuenta de 0 al valor real
function countUp(el) {
  const to = +el.dataset.to, of = el.dataset.of, t0 = performance.now(), dur = 900;
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
    el.textContent = `${Math.round(to * e)} de ${of} con stock`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// aparición al scrollear
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    const c = e.target.querySelector('[data-cat-count]');
    if (c?.dataset.to && !reduceMotion) countUp(c);
    io.unobserve(e.target);
  });
}, { threshold: .18, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.rise').forEach(el => io.observe(el));
