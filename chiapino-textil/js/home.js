// Inicio: el mazo de fotos del hero y la vidriera que avanza de costado con el scroll.
(() => {
  const S = window.ChiapinoStore;
  let data = { productos: [] };
  const byId = id => data.productos.find(p => p.id === id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const introDelay = document.documentElement.classList.contains('intro-on') ? 1000 : 0;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const onData = []; // lo que se completa cuando llega el stock

  /* ---------- mazo de fotos ---------- */
  const deck = document.querySelector('[data-deck]');
  if (deck) {
    const tilt = deck.querySelector('.deck-tilt');
    const cards = [...deck.querySelectorAll('.deck-card')];
    const dots = deck.querySelector('.deck-dots');
    const CYCLE = 3600;
    // posición de cada lugar del mazo: adelante, y las de atrás abiertas en abanico
    const SLOTS = [
      'translate3d(0,0,0) rotate(-2deg)',
      'translate3d(13%,-5%,-60px) rotate(7deg) scale(.96)',
      'translate3d(-13%,-7%,-120px) rotate(-9deg) scale(.92)',
      'translate3d(17%,-11%,-180px) rotate(13deg) scale(.88)',
      'translate3d(-10%,-14%,-240px) rotate(-15deg) scale(.84)'
    ];
    const OUT = 'translate3d(-125%,10%,0) rotate(-24deg) scale(.9)';
    const DEALT_FROM = 'translate3d(45%,80%,0) rotate(26deg) scale(.9)';
    let order = cards.map((_, i) => i);
    let timer = 0, busy = false, visible = true, hovering = false;

    cards.forEach(c => dots.insertAdjacentHTML('beforeend', `<button type="button" aria-label="Ver ${esc(c.querySelector('img').alt)}"></button>`));
    // leyenda con nombre y stock real de cada foto, cuando llega el stock de la base
    onData.push(() => cards.forEach(c => {
      const p = byId(c.dataset.id);
      if (!p) return;
      const e = S.estado(p);
      c.insertAdjacentHTML('beforeend', `<figcaption><span><small>${esc(p.marca)}</small><b>${esc(p.nombre)}</b></span><span class="badge ${e.id}">${e.label}</span></figcaption>`);
    }));
    deck.style.setProperty('--cycle', CYCLE + 'ms');

    function layout() {
      order.forEach((ci, slot) => {
        const c = cards[ci];
        c.style.transform = SLOTS[slot];
        c.style.zIndex = cards.length - slot;
        c.style.opacity = 1;
        c.classList.toggle('front', slot === 0);
      });
      [...dots.children].forEach((d, i) => d.removeAttribute('aria-current'));
      void dots.offsetWidth; // reinicia la barrita de progreso
      dots.children[order[0]].setAttribute('aria-current', 'true');
    }

    // la de adelante sale volando hacia la izquierda y vuelve por atrás
    function next() {
      if (busy) return;
      busy = true;
      const out = cards[order[0]];
      order.push(order.shift());
      out.classList.remove('front');
      out.style.transform = reduce ? out.style.transform : OUT;
      out.style.opacity = 0;
      order.slice(0, -1).forEach((ci, slot) => {
        const c = cards[ci];
        c.style.transform = SLOTS[slot];
        c.style.zIndex = cards.length - slot;
        c.classList.toggle('front', slot === 0);
      });
      [...dots.children].forEach(d => d.removeAttribute('aria-current'));
      void dots.offsetWidth;
      dots.children[order[0]].setAttribute('aria-current', 'true');
      setTimeout(() => {
        // ya invisible, pasa al fondo del mazo y aparece ahí
        out.style.transition = 'none';
        out.style.zIndex = 1;
        out.style.transform = SLOTS[SLOTS.length - 1];
        void out.offsetWidth;
        out.style.transition = '';
        out.style.opacity = 1;
        busy = false;
      }, reduce ? 450 : 620);
      schedule();
    }

    function goTo(i) {
      if (order[0] === i) return;
      while (order[0] !== i) order.push(order.shift());
      layout();
      schedule();
    }

    function schedule() {
      clearTimeout(timer);
      const paused = hovering || !visible || document.hidden;
      deck.classList.toggle('paused', paused);
      if (!paused) timer = setTimeout(next, CYCLE);
    }

    // reparto inicial: las cartas llegan desde abajo a la derecha, primero las de atrás
    cards.forEach(c => {
      c.style.transition = 'none';
      c.style.opacity = 0;
      c.style.transform = reduce ? '' : DEALT_FROM;
    });
    void deck.offsetWidth;
    const dealStart = introDelay + 350;
    order.slice().reverse().forEach((ci, k) => {
      setTimeout(() => {
        const c = cards[ci], slot = order.indexOf(ci);
        c.style.transition = '';
        c.style.transform = SLOTS[slot];
        c.style.zIndex = cards.length - slot;
        c.style.opacity = 1;
        c.classList.toggle('front', slot === 0);
      }, dealStart + k * 130);
    });
    setTimeout(() => { layout(); schedule(); }, dealStart + cards.length * 130 + 500);

    // click en una de atrás la trae adelante; en la de adelante, va al catálogo
    cards.forEach((c, i) => c.addEventListener('click', () => {
      if (order[0] !== i) return goTo(i);
      const p = byId(c.dataset.id);
      location.href = p ? `catalogo.html?cat=${p.categoria}` : 'catalogo.html';
    }));
    dots.addEventListener('click', e => {
      const i = [...dots.children].indexOf(e.target.closest('button'));
      if (i >= 0) goTo(i);
    });

    deck.addEventListener('pointerenter', () => { hovering = true; schedule(); });
    deck.addEventListener('pointerleave', () => {
      hovering = false;
      tilt.style.transform = '';
      schedule();
    });
    deck.addEventListener('focusin', () => { hovering = true; schedule(); });
    deck.addEventListener('focusout', () => { hovering = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; schedule(); }).observe(deck);

    // el mazo se inclina siguiendo el mouse
    if (!reduce && matchMedia('(pointer: fine)').matches) {
      deck.addEventListener('pointermove', e => {
        const r = deck.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        tilt.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
      });
    }
  }

  /* ---------- vidriera ---------- */
  const vit = document.querySelector('[data-vitrina]');
  if (vit) {
    const track = vit.querySelector('[data-track]');
    const sticky = vit.querySelector('.vitrina-sticky');
    const bar = vit.querySelector('.vitrina-progress');
    let shots = [];
    // la tira se arma con los productos que tienen foto, cuando llega el stock
    onData.push(() => {
      const items = data.productos.filter(p => p.img).sort((a, b) => (b.stock > 0) - (a.stock > 0));
      track.innerHTML = items.map(p => {
        const e = S.estado(p);
        return `<figure class="shot"><a href="catalogo.html?cat=${p.categoria}">
          <div class="ph"><img src="${esc(p.img)}" alt="${esc(p.nombre)}" loading="lazy"><span class="badge ${e.id}">${e.label}</span></div>
          <figcaption><small>${esc(p.marca)}</small><b>${esc(p.nombre)}</b></figcaption></a></figure>`;
      }).join('') + `<figure class="shot more"><a href="catalogo.html"><div class="ph"><div><b>Ver todo el catálogo</b><svg width="40" height="40" aria-hidden="true"><use href="#arrow"/></svg></div></div></a></figure>`;
      shots = [...track.children];
      setup();
    });

    let dist = 0, cur = 0, goal = 0, raf = 0, last = 0, dynamic = false;
    let centers = []; // centro de cada foto en la tira, medido una vez (no en cada cuadro)

    function setup() {
      dynamic = !reduce && innerWidth > 760;
      vit.classList.toggle('is-static', !dynamic);
      if (!dynamic) { vit.style.height = ''; return; }
      dist = Math.max(0, track.scrollWidth - innerWidth);
      centers = shots.map(s => s.offsetLeft + s.offsetWidth / 2);
      vit.style.height = sticky.offsetHeight + dist + 'px';
      update();
    }

    function update() {
      if (!dynamic) return;
      const top = vit.getBoundingClientRect().top - 72;
      goal = Math.min(dist, Math.max(0, -top));
      if (!raf) raf = requestAnimationFrame(tick);
    }

    // la tira persigue al scroll con inercia; las fotos se inclinan apenas según la velocidad
    function tick(now) {
      const dt = last ? Math.min(now - last, 100) : 16;
      last = now;
      const diff = goal - cur;
      cur = Math.abs(diff) < .3 ? goal : cur + diff * (1 - Math.exp(-dt / 90));
      track.style.transform = `translate3d(${-cur}px,0,0)`;
      track.style.setProperty('--r', `${Math.max(-4, Math.min(4, diff * .02))}deg`);
      bar.style.setProperty('--p', dist ? cur / dist : 0);
      const mid = innerWidth / 2;
      shots.forEach((s, i) => s.style.setProperty('--px', `${(centers[i] - cur - mid) * -.04}px`));
      if (cur === goal) { raf = 0; last = 0; track.style.setProperty('--r', '0deg'); }
      else raf = requestAnimationFrame(tick);
    }

    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', setup);
    document.fonts?.ready.then(setup);
  }

  // cuántos productos con stock hay en cada categoría
  onData.push(() => document.querySelectorAll('[data-cat-count]').forEach(el => {
    const items = data.productos.filter(p => p.categoria === el.dataset.catCount);
    el.dataset.to = items.filter(p => p.stock > 0).length;
    el.dataset.of = items.length;
    el.textContent = `${el.dataset.to} de ${el.dataset.of} con stock`;
  }));

  S.load()
    .then(d => { data = d; onData.forEach(fn => fn()); })
    .catch(() => vit && (vit.hidden = true)); // sin stock no hay vidriera; el resto del inicio sigue igual
})();
