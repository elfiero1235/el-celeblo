// Consiglio Perfumerías: tienda, carrito por WhatsApp y animaciones
const WA = '5493425697912';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = n => '$' + n.toLocaleString('es-AR');

// Precios tomados de las publicaciones de Instagram; price null = "consultar"
// img = foto de producto (img/productos/…), puede ser una lista para combos; desde = precio "desde"
const PRODUCTS = [
  { id: 'tubitos', cat: 'arabes', label: 'Árabes', name: 'Tubitos de perfume árabe', desc: 'Decants de 10 ml para probar o llevar en la cartera.', price: 4000, badge: 'Oferta', art: ['tube', '#d8a35a'], img: 'tubitos.png',    variants: ['La Bomba', 'Eclaire', 'Eclaire Pistacho', 'Club de Nuit', 'Asad', 'Yum Yum', 'Yara', 'Para niñas', 'Para niños'] },
  { id: 'combo-benetton-kos', cat: 'fragancias', label: 'Fragancias', name: 'Benetton Tribe Elixir + King of Seduction Absolute', desc: 'El combo que no vas a encontrar a este precio.', price: 39900, badge: 'Precio único', art: ['square', '#c9a96a'], img: ['benetton-tribe.png', 'king-of-seduction.png'] },
  { id: 'erba-pura', cat: 'arabes', label: 'Xerjoff', name: 'Erba Pura', desc: 'Frutal, almizclado y adictivo.', price: 65000, badge: 'Promo', art: ['square', '#3f7fd0'], img: 'erba-pura.png' },
  { id: 'erba-gold', cat: 'arabes', label: 'Xerjoff', name: 'Erba Gold', desc: 'La versión dorada, cítrica y especiada.', price: 65000, badge: 'Promo', art: ['square', '#e0b030'], img: 'erba-gold.png' },
  { id: 'mini-perfumes', cat: 'arabes', label: 'Árabes', name: 'Mini perfumes', desc: 'Versiones chiquitas de los más pedidos.', price: 6990, badge: 'Súper promo', art: ['round', '#e8a3b8'], img: 'mini-perfumes.png' },
  { id: 'splash-arabe', cat: 'splash', label: 'Body splash', name: 'Body splash árabes', desc: 'Yara y más aromas dulces y frescos.', price: 10900, badge: 'Nuevo', art: ['tall', '#e8a3b8'], img: 'splash-yara.png',
    variants: ['Yara', 'Yara Candy', 'Bharara Rose', 'Eclaire'] },
  { id: 'tubbees', cat: 'splash', label: 'Body splash', name: 'Tubbees', desc: '6 fragancias frutales para mujer.', price: 31900, art: ['tall', '#f0a6c4'], img: 'tubbees.png' },
  { id: 'lucy-anderson', cat: 'fragancias', label: 'Lucy Anderson', name: 'Perfumes Lucy Anderson', desc: 'Perfumes y sets de la línea.', price: 18800, desde: true, art: ['round', '#a7c4d9'], img: 'lucy-anderson.png' },
  { id: 'tintura-cherry', cat: 'tinturas', label: 'Tinturas', name: 'Tintura Cherry 222 Fidelité', desc: 'Con el agua oxigenada incluida.', price: 3700, badge: 'Ingresó', art: ['dye', '#7a1f2e'], img: 'tintura-cherry.jpg' },
  { id: 'yara', cat: 'arabes', label: 'Lattafa', name: 'Yara', desc: 'Dulce, cremoso y frutal. El árabe más pedido.', price: null, art: ['round', '#f0a6c4'], img: 'yara.png' },
  { id: 'yara-candy', cat: 'arabes', label: 'Lattafa', name: 'Yara Candy', desc: 'Dulce y frutal, con coco y durazno.', price: null, art: ['round', '#f0a6c4'], img: 'yara-candy.png' },
  { id: 'asad', cat: 'arabes', label: 'Lattafa', name: 'Asad', desc: 'Especiado y ambarado, para él.', price: null, art: ['square', '#1a1512'], img: 'asad.png' },
  { id: 'eclaire', cat: 'arabes', label: 'Lattafa', name: 'Eclaire', desc: 'Gourmand: caramelo, leche y vainilla.', price: null, art: ['square', '#e8d8b0'], img: 'eclaire.png' },
  { id: 'club-de-nuit', cat: 'arabes', label: 'Armaf', name: 'Club de Nuit Intense Man', desc: 'Cítrico y ahumado, un clásico.', price: null, art: ['square', '#111'], img: 'club-de-nuit.png' },
  { id: 'bharara-rose', cat: 'arabes', label: 'Bharara', name: 'Bharara Rose', desc: 'Rosa intensa con fondo cálido.', price: null, art: ['square', '#d98a8a'], img: 'bharara-rose.png' },
  { id: 'sugar-kiss', cat: 'fragancias', label: 'Shakira', name: 'Sugar Kiss', desc: 'Dulce y divertido.', price: null, art: ['round', '#e86aa0'], img: 'sugar-kiss.jpg' },
  { id: 'cher', cat: 'fragancias', label: 'Cher', name: 'Cher Dieciocho', desc: 'Femenino y floral.', price: null, art: ['box', '#f0b8c8'], img: 'cher.png' },
  { id: 'ciel', cat: 'fragancias', label: 'Ciel', name: 'Fragancias Ciel', desc: 'Clásico, Shine, Magic, Noir, Crystal, Nuit y Sweet Kiss.', price: null, art: ['tall', '#e8a3b8'], img: 'ciel.png' },
  { id: 'love-spell', cat: 'splash', label: "Victoria's Secret", name: 'Love Spell fragrance mist', desc: 'También Coconut Passion y más.', price: null, art: ['tall', '#c9a96a'], img: 'love-spell.png' },
  { id: 'idi', cat: 'makeup', label: 'IDI Make Up', name: 'Maquillaje IDI', desc: 'Labiales, gloss y más. Consultá tonos.', price: null, art: ['lipstick', '#c95a6a'], img: 'idi.png' },
  { id: 'set-ciel-neceser', cat: 'fragancias', label: 'Ciel', name: 'Set Ciel con neceser', desc: 'Perfume, desodorante y neceser de regalo.', price: null, art: ['box', '#9fb8e8'], img: 'set-ciel-neceser.png' },
  // cover = foto con ambiente (no fondo blanco): llena el recuadro en vez de flotar
  { id: 'bolso-shine', cat: 'marroquineria', label: 'Shine', name: 'Carteras Shine', desc: 'Algunas vienen con perfume y desodorante.', price: null, art: ['bag', '#b9b6b0'], img: 'cartera-shine.jpg', cover: true },
  { id: 'bolso-camel', cat: 'marroquineria', label: 'Marroquinería', name: 'Bolso de cuero ecológico', desc: 'Con manijas y correa larga. Varios colores.', price: null, art: ['bag', '#9a6b3e'], img: 'bolso-camel.png' },
  { id: 'bolso-beige', cat: 'marroquineria', label: 'Marroquinería', name: 'Bolso con bandolera', desc: 'Amplio, con muchos bolsillos.', price: null, art: ['bag', '#d8cbb8'], img: 'bolso-beige.png' },
  { id: 'cartera-roja', cat: 'marroquineria', label: 'Marroquinería', name: 'Cartera de mano', desc: 'Elegante, con herrajes dorados.', price: null, art: ['bag', '#9a2b2b'], img: 'cartera-roja.png' },
  { id: 'aros-dorados', cat: 'marroquineria', label: 'Bijou', name: 'Aros argolla dorados', desc: 'El clásico que combina con todo.', price: null, art: ['round', '#d2b77c'], img: 'aros-dorados.png' },
  { id: 'aros-strass', cat: 'marroquineria', label: 'Bijou', name: 'Argollas con strass', desc: 'Para las salidas.', price: null, art: ['round', '#d2b77c'], img: 'aros-strass.png' },
  { id: 'pulsera-strass', cat: 'marroquineria', label: 'Bijou', name: 'Pulseras con strass', desc: 'Doradas, para usar solas o combinadas.', price: null, art: ['round', '#d2b77c'], img: 'pulsera-strass.png' },
  { id: 'valijas', cat: 'marroquineria', label: 'Para los peques', name: 'Valijas infantiles carry-on', desc: 'Con ruedas y diseños divertidos.', price: null, art: ['bag', '#f1c3cf'], img: ['valija-vaca.png', 'valija-rosa.png'] },
];

// ---------- ilustraciones de producto ----------
function art([shape, c]) {
  const cap = '<linearGradient id="g-' + shape + c.slice(1) + '" x1="0" x2="1"><stop offset="0" stop-color="#6f5c39"/><stop offset=".4" stop-color="#f1dca6"/><stop offset="1" stop-color="#7d6a45"/></linearGradient>';
  const gold = `url(#g-${shape}${c.slice(1)})`;
  const glass = `fill="${c}" fill-opacity=".85" stroke="#fff" stroke-opacity=".35" stroke-width="2"`;
  const hi = '<rect x="0" y="0" width="10" height="100%" fill="#fff" opacity=".18"/>';
  const shapes = {
    round: `<rect x="44" y="10" width="32" height="26" rx="5" fill="${gold}"/><circle cx="60" cy="96" r="52" ${glass}/><ellipse cx="40" cy="80" rx="8" ry="22" fill="#fff" opacity=".22"/>`,
    square: `<rect x="40" y="8" width="40" height="30" rx="4" fill="${gold}"/><rect x="14" y="38" width="92" height="112" rx="14" ${glass}/><rect x="24" y="48" width="10" height="90" rx="5" fill="#fff" opacity=".22"/>`,
    tall: `<rect x="44" y="6" width="32" height="22" rx="4" fill="${gold}"/><rect x="30" y="28" width="60" height="124" rx="22" ${glass}/><rect x="38" y="40" width="8" height="98" rx="4" fill="#fff" opacity=".25"/>`,
    tube: `<g transform="rotate(-8 60 80)"><rect x="50" y="6" width="20" height="22" rx="3" fill="${gold}"/><rect x="46" y="28" width="28" height="122" rx="12" ${glass}/><rect x="51" y="36" width="5" height="100" rx="3" fill="#fff" opacity=".25"/></g><g transform="rotate(12 60 80)" opacity=".7"><rect x="78" y="20" width="16" height="18" rx="3" fill="${gold}"/><rect x="75" y="38" width="22" height="104" rx="10" ${glass}/></g>`,
    box: `<rect x="12" y="44" width="96" height="104" rx="8" fill="${c}" fill-opacity=".8" stroke="#f1dca6" stroke-opacity=".6" stroke-width="2"/><rect x="54" y="44" width="12" height="104" fill="${gold}"/><path d="M60 44c-20-26-40-16-26 0M60 44c20-26 40-16 26 0" fill="none" stroke="${gold}" stroke-width="6" stroke-linecap="round"/>`,
    bag: `<path d="M38 52c0-26 44-26 44 0" fill="none" stroke="${gold}" stroke-width="6"/><path d="M16 52h88l-8 98H24Z" ${glass}/><rect x="50" y="78" width="20" height="10" rx="3" fill="${gold}"/>`,
    lipstick: `<path d="M44 20l32-12v40H44Z" fill="${c}"/><rect x="40" y="48" width="40" height="22" fill="${gold}"/><rect x="34" y="70" width="52" height="82" rx="6" fill="#1a1512" stroke="#f1dca6" stroke-opacity=".5" stroke-width="2"/>`,
    dye: `<rect x="22" y="30" width="76" height="120" rx="10" fill="#efe6d3"/><rect x="22" y="70" width="76" height="46" fill="${c}"/><circle cx="60" cy="50" r="12" fill="${c}"/><rect x="34" y="128" width="52" height="6" rx="3" fill="${c}" opacity=".5"/>`,
  };
  return `<svg viewBox="0 0 120 160" aria-hidden="true"><defs>${cap}</defs>${shapes[shape]}</svg>`;
}

// ---------- render tienda ----------
const grid = $('#grid');
grid.innerHTML = PRODUCTS.map(p => `
  <article class="card" data-cat="${p.cat}" data-id="${p.id}" data-featured="${p.badge ? 1 : ''}" style="--tone:${p.art[1]}">
    <div class="card__art${p.img ? ' card__art--photo' : ''}${p.cover ? ' is-cover' : ''}">${p.badge ? `<span class="card__badge">${p.badge}</span>` : ''}${p.img ? [].concat(p.img).map(f => `<img src="img/productos/${f}" alt="${p.name}" loading="lazy"${p.crop ? ` style="${p.crop}"` : ''}>`).join('') : art(p.art)}</div>
    <div class="card__body">
      <span class="card__cat">${p.label}</span>
      <h3 class="card__name">${p.name}</h3>
      <p class="card__desc">${p.desc}</p>
      ${p.variants ? `<select class="card__variant" aria-label="Elegí la variante de ${p.name}">${p.variants.map(v => `<option>${v}</option>`).join('')}</select>` : ''}
      <div class="card__row">
        ${p.price
          ? `<span class="card__price">${p.desde ? '<small>desde </small>' : ''}${money(p.price)}</span><button class="card__add" aria-label="Agregar ${p.name} al carrito">+</button>`
          : `<span class="card__price"><small>Precio a consultar</small></span><a class="card__ask" target="_blank" rel="noopener" href="https://wa.me/${WA}?text=${encodeURIComponent('Hola! Quería consultar por ' + p.name)}">Consultar</a>`}
      </div>
    </div>
  </article>`).join('');

function filter(cat) {
  $$('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.filter === cat));
  let i = 0;
  $$('.card').forEach(card => {
    // 'destacados' = las promos con etiqueta; así la tienda no muestra los 29 productos de una
    const show = cat === 'destacados' ? !!card.dataset.featured : card.dataset.cat === cat;
    card.classList.toggle('is-hidden', !show);
    card.classList.remove('is-entering');
    if (show) { void card.offsetWidth; card.style.setProperty('--d', (i++ * 0.07) + 's'); card.classList.add('is-entering'); }
  });
}
$$('.chip').forEach(c => c.addEventListener('click', () => filter(c.dataset.filter)));
// arranca mostrando solo los destacados
$$('.card').forEach(card => card.classList.toggle('is-hidden', !card.dataset.featured));
// cuántos productos tiene cada categoría
$$('.cat').forEach(c => {
  const n = PRODUCTS.filter(p => p.cat === c.dataset.filter).length;
  $('.cat__count', c).textContent = `${n} ${n === 1 ? 'producto' : 'productos'}`;
});
$$('.cat').forEach(c => c.addEventListener('click', () => {
  filter(c.dataset.filter);
  $('#tienda').scrollIntoView({ behavior: 'smooth' });
}));

// ---------- carrito ----------
let cart = [];
try { cart = JSON.parse(localStorage.getItem('consiglio:cart')) || []; } catch {}
const save = () => { try { localStorage.setItem('consiglio:cart', JSON.stringify(cart)); } catch {} };

function addItem(item, fromEl, n = 1) {
  const found = cart.find(x => x.key === item.key);
  found ? found.qty += n : cart.push({ ...item, qty: n });
  save(); renderCart();
  if (fromEl) fly(fromEl);
  toast(`${n > 1 ? n + ' x ' : ''}${item.name}${item.variant ? ' · ' + item.variant : ''} agregado`);
}

function renderCart() {
  const count = cart.reduce((a, x) => a + x.qty, 0);
  const total = cart.reduce((a, x) => a + x.qty * x.price, 0);
  $('.cart-btn__count').textContent = count;
  $('.cart').classList.toggle('has-items', count > 0);
  $('.cart__total strong').textContent = money(total);
  $('.cart__items').innerHTML = cart.map((x, i) => `
    <li class="cart__item">
      <span class="cart__item-name">${x.name}</span>
      <span class="cart__item-price">${money(x.price * x.qty)}</span>
      <span class="cart__item-sub">${x.variant || ''}</span>
      <span class="cart__qty"><button data-i="${i}" data-d="-1" aria-label="Quitar uno">−</button>${x.qty}<button data-i="${i}" data-d="1" aria-label="Agregar uno">+</button></span>
    </li>`).join('');
}

$('.cart__items').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const x = cart[b.dataset.i]; x.qty += +b.dataset.d;
  if (x.qty <= 0) cart.splice(b.dataset.i, 1);
  save(); renderCart();
});

grid.addEventListener('click', e => {
  const card = e.target.closest('.card'); if (!card) return;
  const b = e.target.closest('.card__add');
  // el resto de la tarjeta abre la ficha
  if (!b) {
    if (!e.target.closest('select, a')) location.hash = 'producto/' + card.dataset.id;
    return;
  }
  const p = PRODUCTS.find(x => x.id === card.dataset.id);
  const variant = $('.card__variant', card)?.value || '';
  addItem({ key: p.id + '|' + variant, name: p.name, variant, price: p.price }, b);
});

const cartEl = $('.cart');
const openCart = open => {
  cartEl.classList.toggle('is-open', open);
  cartEl.setAttribute('aria-hidden', !open);
  document.body.classList.toggle('is-locked', open);
};
$('.cart-btn').addEventListener('click', () => openCart(true));
$('.cart__close').addEventListener('click', () => openCart(false));
$('.cart__backdrop').addEventListener('click', () => openCart(false));
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (cartEl.classList.contains('is-open')) openCart(false);
  else if (pdp.classList.contains('is-open')) closeProduct();
});

// ---------- ficha de producto (#producto/<id>) ----------
const pdp = $('.pdp'), pdpPanel = $('.pdp__panel');
const NOTE_ROWS = [['Salida', 'top', 'Lo primero que sentís'], ['Corazón', 'heart', 'Aparece a los pocos minutos'], ['Fondo', 'base', 'Lo que queda en la piel']];
let pdpQty = 1;

function productHTML(p) {
  const i = window.INFO?.[p.id] || {};
  const imgs = p.img ? [].concat(p.img).map(f => `<img src="img/productos/${f}" alt="${p.name}">`).join('') : art(p.art);
  const wa = `https://wa.me/${WA}?text=${encodeURIComponent('Hola! Quería consultar por ' + p.name)}`;
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
  return `
    <button class="pdp__close" type="button" aria-label="Cerrar">✕</button>
    <div class="pdp__stage${p.cover ? ' is-cover' : ''}" style="--tone:${p.art[1]}">
      ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ''}
      <div class="pdp__imgs">${imgs}</div>
    </div>
    <div class="pdp__info">
      <p class="pdp__brand pdp__in" style="--n:0">${i.brand || p.label}</p>
      <h2 class="pdp__name pdp__in" style="--n:1">${p.name}</h2>
      <div class="pdp__meta pdp__in" style="--n:2">${[i.family, i.size, i.gender].filter(Boolean).map(m => `<span>${m}</span>`).join('')}</div>
      <p class="pdp__price pdp__in" style="--n:3">${p.price ? (p.desde ? '<small>desde </small>' : '') + money(p.price) : '<small>Precio a consultar</small>'}</p>
      <p class="pdp__desc pdp__in" style="--n:4">${i.desc || p.desc}</p>
      ${i.notes ? `<div class="pdp__notes pdp__in" style="--n:5"><h3>Pirámide olfativa</h3>${NOTE_ROWS.filter(([, k]) => i.notes[k]).map(([t, k, s], n) => `
        <div class="note" style="--k:${n}">
          <span class="note__dot"></span>
          <div><strong>${t}</strong> <small>${s}</small>
          <ul>${i.notes[k].map(x => `<li>${x}</li>`).join('')}</ul></div>
        </div>`).join('')}</div>` : ''}
      ${i.ideal ? `<div class="pdp__ideal pdp__in" style="--n:6">${i.ideal.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
      ${p.variants ? `<label class="pdp__label pdp__in" style="--n:7">Elegí el aroma<select class="card__variant pdp__variant">${p.variants.map(v => `<option>${v}</option>`).join('')}</select></label>` : ''}
      <div class="pdp__actions pdp__in" style="--n:8">
        ${p.price ? `<div class="qty"><button type="button" data-q="-1" aria-label="Uno menos">−</button><span>1</span><button type="button" data-q="1" aria-label="Uno más">+</button></div>
        <button class="btn btn--gold pdp__add" type="button">Agregar al carrito</button>` : ''}
        <a class="btn btn--ghost" target="_blank" rel="noopener" href="${wa}">Consultar por WhatsApp</a>
      </div>
      ${related.length ? `<div class="pdp__related pdp__in" style="--n:9"><h3>También te puede gustar</h3><div class="pdp__rel">${related.map(r => `
        <a href="#producto/${r.id}" class="rel">${r.img ? `<span class="rel__img"><img src="img/productos/${[].concat(r.img)[0]}" alt=""></span>` : `<span class="rel__img">${art(r.art)}</span>`}<span class="rel__name">${r.name}</span><span class="rel__price">${r.price ? money(r.price) : 'Consultar'}</span></a>`).join('')}</div></div>` : ''}
    </div>`;
}

// transición: la foto de la tarjeta "vuela" hasta la ficha (View Transitions si el navegador la tiene)
const vt = fn => document.startViewTransition ? document.startViewTransition(fn) : (fn(), null);
let fromArt = null;

function showProduct(id) {
  const p = PRODUCTS.find(x => x.id === id); if (!p) return;
  const card = $(`.card[data-id="${id}"]`);
  const wasOpen = pdp.classList.contains('is-open');
  if (!wasOpen && card) { fromArt = $('.card__art', card); fromArt.style.viewTransitionName = 'pimg'; }
  vt(() => {
    if (fromArt) fromArt.style.viewTransitionName = '';
    pdpPanel.innerHTML = productHTML(p);
    $('.pdp__stage', pdpPanel).style.viewTransitionName = 'pimg';
    pdpQty = 1;
    pdp.classList.add('is-open'); pdp.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    pdpPanel.scrollTop = 0;
  });
  document.title = `${p.name} · Consiglio Perfumerías`;
}

function hideProduct() {
  if (!pdp.classList.contains('is-open')) return;
  const stage = $('.pdp__stage', pdpPanel);
  const back = fromArt && fromArt.getBoundingClientRect().bottom > 0 && fromArt.getBoundingClientRect().top < innerHeight ? fromArt : null;
  const t = vt(() => {
    if (stage) stage.style.viewTransitionName = '';
    if (back) back.style.viewTransitionName = 'pimg';
    pdp.classList.remove('is-open'); pdp.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  });
  const clear = () => { if (back) back.style.viewTransitionName = ''; fromArt = null; };
  t ? t.finished.then(clear) : clear();
  document.title = 'Consiglio Perfumerías · Santa Fe';
}

function closeProduct() {
  history.pushState('', '', location.pathname + location.search);
  hideProduct();
}

function route() {
  const m = location.hash.match(/^#producto\/([\w-]+)$/);
  m ? showProduct(m[1]) : hideProduct();
}
addEventListener('hashchange', route);

pdp.addEventListener('click', e => {
  if (e.target.closest('.pdp__close') || e.target.classList.contains('pdp__backdrop')) return closeProduct();
  const q = e.target.closest('[data-q]');
  if (q) { pdpQty = Math.max(1, pdpQty + +q.dataset.q); $('.qty span', pdpPanel).textContent = pdpQty; return; }
  const add = e.target.closest('.pdp__add');
  if (add) {
    const p = PRODUCTS.find(x => x.id === location.hash.split('/')[1]);
    const variant = $('.pdp__variant', pdpPanel)?.value || '';
    addItem({ key: p.id + '|' + variant, name: p.name, variant, price: p.price }, add, pdpQty);
  }
});

// la foto de la ficha se inclina con el mouse
pdp.addEventListener('pointermove', e => {
  const s = e.target.closest('.pdp__stage'); if (!s) return;
  const r = s.getBoundingClientRect();
  s.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
  s.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
});

$('#checkout').addEventListener('click', () => {
  if (!cart.length) return toast('Agregá algo al carrito primero');
  const lines = cart.map(x => `• ${x.qty} x ${x.name}${x.variant ? ' (' + x.variant + ')' : ''}: ${money(x.price * x.qty)}`);
  const total = cart.reduce((a, x) => a + x.qty * x.price, 0);
  const msg = `Hola Consiglio! Quiero hacer este pedido:\n\n${lines.join('\n')}\n\nTotal: ${money(total)}\n\n¿Tienen stock? ¿Cómo coordinamos el pago y el envío?`;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
});

function fly(fromEl) {
  const a = fromEl.getBoundingClientRect(), b = $('.cart-btn').getBoundingClientRect();
  const dot = document.createElement('span'); dot.className = 'fly'; document.body.append(dot);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  dot.style.left = a.left + a.width / 2 - 8 + 'px'; dot.style.top = a.top + a.height / 2 - 8 + 'px';
  dot.animate([
    { transform: 'translate(0,0) scale(1)' },
    { transform: `translate(${dx * .5}px, ${dy - 120}px) scale(1.4)`, offset: .5 },
    { transform: `translate(${dx}px, ${dy}px) scale(.4)`, opacity: .4 },
  ], { duration: 800, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => {
    dot.remove();
    const btn = $('.cart-btn'); btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');
  };
}

let toastT;
function toast(text) {
  const t = $('.toast'); t.textContent = text; t.classList.add('is-on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2200);
}


// ---------- animaciones ----------
// entrada: el título sube cuando termina la cortina
setTimeout(() => document.body.classList.add('is-ready'), 2300);

// títulos de sección y marca del pie: se parten en letras para que entren una por una
function splitLetters(el) {
  let i = 0;
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      // se agrupan por palabra para que no se corten al final del renglón
      n.textContent.split(/(\s+)/).forEach(w => {
        if (!w) return;
        if (/^\s+$/.test(w)) return frag.append(w);
        const word = document.createElement('span'); word.style.whiteSpace = 'nowrap';
        [...w].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.style.setProperty('--i', i++); s.textContent = ch; word.append(s); });
        frag.append(word);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) walk(n);
  });
  walk(el);
}
$$('.section h2').forEach(splitLetters);
$$('.footer .brand__word').forEach(splitLetters);

// revelado al hacer scroll, con escalonado por grupo
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('is-in'); io.unobserve(en.target);
}), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => {
  const sibs = $$(':scope > .reveal', el.parentElement);
  el.style.setProperty('--d', (sibs.indexOf(el) * 0.09) + 's');
  io.observe(el);
});
// los del hero esperan a la cortina
// (si se vuelve al inicio más tarde, ya no hay que esperar)
$$('.hero .reveal').forEach((el, i) => el.style.setProperty('--d', `calc(${i * 0.15}s + var(--wait, 2.3s))`));
setTimeout(() => document.documentElement.style.setProperty('--wait', '0s'), 4000);

io.observe($('.footer'));

// la cinta de rubros se inclina según qué tan rápido se scrollea
const marquee = $('.marquee');
let lastY = scrollY, skew = 0;
(function tilt() {
  const v = scrollY - lastY; lastY = scrollY;
  skew += (Math.max(-8, Math.min(8, v * -0.25)) - skew) * 0.12;
  marquee.style.setProperty('--skew', skew.toFixed(2) + 'deg');
  requestAnimationFrame(tilt);
})();

// cartas que entran a la grilla
const cardIO = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.style.setProperty('--d', ($$('.card').indexOf(en.target) % 4 * 0.08) + 's');
  en.target.classList.add('is-entering'); cardIO.unobserve(en.target);
}), { threshold: .1 });
$$('.card').forEach(c => { c.style.opacity = 0; cardIO.observe(c); c.addEventListener('animationstart', () => c.style.opacity = ''); });

// nav
const nav = $('.nav');
addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 30), { passive: true });

// brillo que sigue al mouse + frasco que se inclina
const glow = $('.cursor-glow'), bottle = $('.bottle-wrap');
addEventListener('pointermove', e => {
  glow.style.setProperty('--x', e.clientX + 'px'); glow.style.setProperty('--y', e.clientY + 'px');
  const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
  bottle.style.setProperty('--ry', nx * 24 + 'deg'); bottle.style.setProperty('--rx', -ny * 14 + 'deg');
}, { passive: true });

// el frasco baja y se achica al hacer scroll
addEventListener('scroll', () => {
  const p = Math.min(scrollY / innerHeight, 1);
  bottle.style.setProperty('--sy', p * 120 + 'px'); bottle.style.setProperty('--ss', 1 - p * .25);
}, { passive: true });

// inclinación 3D de las tarjetas
$$('.card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--ty', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg');
    card.style.setProperty('--tx', -((e.clientY - r.top) / r.height - .5) * 10 + 'deg');
  });
  card.addEventListener('pointerleave', () => { card.style.setProperty('--tx', '0deg'); card.style.setProperty('--ty', '0deg'); });
});


// la frase se ilumina palabra por palabra al scrollear
const quote = $('.story__quote');
quote.innerHTML = quote.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span> `).join('');
const words = $$('.w', quote);
addEventListener('scroll', () => {
  const r = quote.getBoundingClientRect();
  const p = Math.min(Math.max((innerHeight * .85 - r.top) / (r.height + innerHeight * .4), 0), 1);
  words.forEach((w, i) => w.classList.toggle('on', i < p * words.length));
}, { passive: true });

// fotos del local: se abren al entrar y tienen parallax
const local = $('.local'), localImg = $('.local__img');
// se observa la sección y no la foto: el clip-path achica el área que mide el observer
const photoIO = new IntersectionObserver(entries => entries.forEach(en => en.isIntersecting && local.classList.add('is-in')), { threshold: .25 });
photoIO.observe(local);
addEventListener('scroll', () => {
  const r = local.getBoundingClientRect();
  const p = Math.min(Math.max(1 - (r.top + r.height) / (innerHeight + r.height), 0), 1); // 0 entra, 1 sale
  localImg.style.setProperty('--py', (p - 0.5) * -120 + 'px');
  localImg.style.setProperty('--zs', 1.18 - p * 0.14);
}, { passive: true });

// contadores
const countIO = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix ?? '+', t0 = performance.now();
  const step = t => {
    const k = Math.min((t - t0) / 1800, 1), e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(end * e).toLocaleString('es-AR') + (k === 1 ? suf : '');
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step); countIO.unobserve(el);
}), { threshold: .6 });
$$('[data-count]').forEach(el => countIO.observe(el));

// ---------- motion graphic: nube de perfume que sale del atomizador ----------
const canvas = $('.hero__mist'), ctx = canvas.getContext('2d');
const svgBottle = $('.bottle');
let parts = [], W, H, dpr;
function size() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = canvas.width = canvas.offsetWidth * dpr; H = canvas.height = canvas.offsetHeight * dpr;
}
size(); addEventListener('resize', size);

function nozzle() {
  const c = canvas.getBoundingClientRect();
  if (window.perfume3d) {
    const p = window.perfume3d.nozzle();
    return { x: (p.x - c.left) * dpr, y: (p.y - c.top) * dpr, s: p.s };
  }
  const r = svgBottle.getBoundingClientRect();
  // la boquilla está en (136, 52) del viewBox 240x360
  return { x: (r.left - c.left + r.width * (136 / 240)) * dpr, y: (r.top - c.top + r.height * (52 / 360)) * dpr, s: r.width / 240 };
}

function spray() {
  if (window.perfume3d && !window.perfume3d.ready()) return;
  window.perfume3d?.press();
  svgBottle.classList.remove('is-spraying'); void svgBottle.getBoundingClientRect(); svgBottle.classList.add('is-spraying');
  const n = nozzle();
  if (![n.x, n.y, n.s].every(Number.isFinite)) return;
  for (let i = 0; i < 70; i++) {
    const a = -0.35 + (Math.random() - .5) * .7, v = (2 + Math.random() * 5) * dpr * n.s;
    parts.push({
      x: n.x, y: n.y, vx: Math.cos(a) * v * 1.4, vy: Math.sin(a) * v - Math.random(),
      r: (2 + Math.random() * 7) * dpr, life: 0, max: 90 + Math.random() * 90,
      gold: Math.random() < .35,
    });
  }
}

function frame() {
  ctx.clearRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; // fondo claro: sin brillo aditivo
  parts = parts.filter(p => p.life < p.max && Number.isFinite(p.x + p.y + p.r));
  for (const p of parts) {
    p.life++; p.x += p.vx; p.y += p.vy;
    p.vx *= .965; p.vy = p.vy * .965 - .015 * dpr; p.r += .18 * dpr;
    p.x += Math.sin((p.life + p.y) * .03) * .4 * dpr;
    const a = (1 - p.life / p.max) * (p.gold ? .45 : .2);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, p.gold ? `rgba(196,160,95,${a})` : `rgba(190,180,165,${a})`);
    g.addColorStop(1, 'rgba(190,180,165,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  // polvo dorado flotando de fondo
  ambient.forEach(d => {
    d.y -= d.v; d.x += Math.sin(d.y * .01 + d.o) * .3;
    if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
    ctx.fillStyle = `rgba(190,155,95,${.3 + Math.sin(performance.now() * .002 + d.o) * .2})`;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
  });
  requestAnimationFrame(frame);
}
const ambient = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 1.6 + .4) * dpr, v: (Math.random() * .4 + .1) * dpr, o: Math.random() * 6 }));
requestAnimationFrame(frame);

setTimeout(spray, 4800);
setInterval(spray, 4200);
$('.hero__stage').addEventListener('click', spray);

renderCart();
route();
