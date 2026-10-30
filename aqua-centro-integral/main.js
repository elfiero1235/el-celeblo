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

// escalonado de las filas de cada lista de servicios
document.querySelectorAll('.svc-list').forEach(ul =>
  [...ul.children].forEach((li, i) => li.style.setProperty('--i', i % 6)));

// elementos que aparecen al entrar en pantalla
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal-img, .quote, .rv, .rv-line, .cta').forEach(el => io.observe(el));

// estética: el acceso del servicio que estás viendo queda marcado y visible en la barra
const estNav = document.querySelector('.est-nav');
if (estNav) {
  const chips = [...estNav.querySelectorAll('a')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      chips.forEach(c => {
        const on = c.getAttribute('href') === '#' + e.target.id;
        c.setAttribute('aria-current', on);
        if (on) c.parentElement.parentElement.scrollTo({ left: c.offsetLeft - 16, behavior: 'smooth' });
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('.est-item').forEach(s => spy.observe(s));
}

// el título del servicio viaja de la lista a su página (y vuelve con "atrás")
const fileOf = url => new URL(url, location.href).pathname.split('/').pop() || 'index.html';
const rowTitle = file => document.querySelector(`.svc-row a[href="${file}"] :is(h2,h3)`);
const clearNames = () => document.querySelectorAll('.svc-row :is(h2,h3)').forEach(h => h.style.viewTransitionName = '');
document.addEventListener('click', e => {
  const a = e.target.closest('.svc-row a');
  if (!a) return;
  clearNames();
  a.querySelector('h2,h3').style.viewTransitionName = 'svc-title';
});
addEventListener('pagereveal', e => {
  const from = window.navigation?.activation?.from?.url;
  if (!e.viewTransition || !from) return;
  const h = rowTitle(fileOf(from));
  if (h) {
    h.style.viewTransitionName = 'svc-title';
    e.viewTransition.finished.finally(clearNames);
  }
});
addEventListener('pageshow', e => { if (e.persisted) clearNames(); });

// transición entre páginas para navegadores sin View Transitions entre documentos
if (!('onpagereveal' in window)) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) document.documentElement.classList.add('fallback-enter');
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a || reduce || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.documentElement.classList.add('leaving');
    setTimeout(() => { location.href = url.href; }, 260);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('leaving'); });
}
