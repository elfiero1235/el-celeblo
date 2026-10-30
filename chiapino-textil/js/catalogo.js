// Catálogo público: lista productos con su estado de stock, filtra por categoría y búsqueda.
// Con View Transitions las tarjetas se deslizan a su lugar nuevo al filtrar
// y cada una se abre en una ficha que crece desde la tarjeta.
const S = window.ChiapinoStore;
const list = document.getElementById('list');
const chips = document.getElementById('chips');
const q = document.getElementById('q');
const soloStock = document.getElementById('soloStock');
const ficha = document.getElementById('ficha');
const fichaCard = ficha.querySelector('.ficha-card');

let data = { categorias: S.categorias, productos: [], actualizado: '' };
let loaded = false;
let cat = new URLSearchParams(location.search).get('cat') || 'todas';
let openId = null;

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const waLink = p => 'https://wa.me/5493434533545?text=' + encodeURIComponent(`Hola! Quiero consultar por: ${p.nombre}`);
const brandOf = p => p.marca || data.categorias.find(c => c.id === p.categoria)?.nombre || '';
const card = id => list.querySelector(`[data-id="${CSS.escape(id)}"]`);

// corre fn dentro de una view transition cuando el navegador la soporta
function morph(fn, type) {
  if (!document.startViewTransition || reduce.matches) { fn(); return Promise.resolve(); }
  document.documentElement.dataset.vt = type;
  const t = document.startViewTransition(fn);
  t.finished.finally(() => delete document.documentElement.dataset.vt);
  return t.finished;
}

function renderChips() {
  const all = [{ id: 'todas', nombre: 'Todas' }, ...data.categorias];
  chips.innerHTML = all.map(c => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === cat}">${esc(c.nombre)}</button>`).join('');
}

function render() {
  const term = q.value.trim().toLowerCase();
  const items = data.productos
    .filter(p => p.visible !== false)
    .filter(p => cat === 'todas' || p.categoria === cat)
    .filter(p => !soloStock.checked || p.stock > 0)
    .filter(p => !term || `${p.nombre} ${p.marca}`.toLowerCase().includes(term))
    // primero lo que hay, al final lo que no
    .sort((a, b) => (b.stock > 0) - (a.stock > 0));

  list.innerHTML = items.length ? items.map(p => {
    const e = S.estado(p);
    const thumb = p.img
      ? `<img src="${esc(p.img)}" alt="" loading="lazy">`
      : `<span class="ph-mark">${esc(p.marca || 'Chiapino')}</span>`;
    return `<article class="product is-${e.id}" data-id="${p.id}" style="view-transition-name:p-${p.id}">
      <div class="thumb">${thumb}</div>
      <span class="brand">${esc(brandOf(p))}</span>
      <h3><button class="product-open" type="button">${esc(p.nombre)}</button></h3>
      <p>${esc(p.desc)}</p>
      <span class="price">${S.precio(p)}</span>
      <div class="foot"><span class="badge ${e.id}">${e.label}</span><a class="ask" href="${waLink(p)}" target="_blank" rel="noopener">${e.id === 'sin' ? 'Avisame' : 'Consultar'}</a></div>
    </article>`;
  }).join('') : `<p class="empty">${loaded ? 'No encontramos productos con esos filtros.' : 'Cargando el stock…'}</p>`;

  document.getElementById('count').textContent = `${items.length} ${items.length === 1 ? 'producto' : 'productos'}`;
  const upd = document.getElementById('updated');
  upd.textContent = data.actualizado
    ? 'Stock actualizado el ' + new Date(data.actualizado).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })
    : '';
}

// ---------- ficha ----------
function fillFicha(p) {
  const e = S.estado(p);
  const img = document.getElementById('fichaImg');
  img.innerHTML = p.img ? `<img src="${esc(p.img)}" alt="${esc(p.nombre)}">` : '';
  document.getElementById('fichaBrand').textContent = brandOf(p);
  document.getElementById('fichaTitle').textContent = p.nombre;
  document.getElementById('fichaDesc').textContent = p.desc;
  document.getElementById('fichaPrice').textContent = S.precio(p);
  const badge = document.getElementById('fichaBadge');
  badge.className = `badge ${e.id}`;
  badge.textContent = e.label;
  const ask = document.getElementById('fichaAsk');
  ask.href = waLink(p);
  ask.textContent = e.id === 'sin' ? 'Avisame cuando entre' : 'Consultar por WhatsApp';
}

function openFicha(id) {
  const p = data.productos.find(x => x.id === id);
  const el = card(id);
  if (!p || !el) return;
  openId = id;
  fillFicha(p);
  // la tarjeta y la ficha comparten nombre: la ficha crece desde la tarjeta
  el.style.viewTransitionName = 'ficha';
  morph(() => {
    el.style.viewTransitionName = '';
    fichaCard.style.viewTransitionName = 'ficha';
    ficha.showModal();
  }, 'ficha');
}

function closeFicha() {
  const el = openId && card(openId);
  const done = () => {
    fichaCard.style.viewTransitionName = '';
    if (el) el.style.viewTransitionName = `p-${openId}`;
    el?.querySelector('.product-open').focus();
    openId = null;
  };
  if (!el) { ficha.close(); done(); return; }
  morph(() => {
    ficha.close();
    fichaCard.style.viewTransitionName = '';
    el.style.viewTransitionName = 'ficha';
  }, 'ficha').then(done);
}

// ---------- eventos ----------
const refilter = () => morph(render, 'filtro');

chips.addEventListener('click', e => {
  const b = e.target.closest('[data-cat]');
  if (!b || b.dataset.cat === cat) return;
  cat = b.dataset.cat;
  history.replaceState(null, '', cat === 'todas' ? 'catalogo.html' : `?cat=${cat}`);
  morph(() => { renderChips(); render(); }, 'filtro');
});
soloStock.addEventListener('change', refilter);
q.addEventListener('input', render); // tipear no anima: cada tecla sería una transición

list.addEventListener('click', e => {
  const b = e.target.closest('.product-open');
  if (b) openFicha(b.closest('[data-id]').dataset.id);
});
ficha.querySelector('.ficha-close').addEventListener('click', closeFicha);
ficha.addEventListener('cancel', e => { e.preventDefault(); closeFicha(); });
ficha.addEventListener('click', e => { if (e.target === ficha) closeFicha(); });

// trae el stock de la base; al volver a la pestaña lo refresca y las tarjetas se reacomodan solas
async function refresh(animate) {
  try {
    data = await S.load();
    loaded = true;
    animate ? morph(render, 'filtro') : render();
  } catch {
    if (!loaded) list.innerHTML = '<p class="empty">No pudimos cargar el stock en este momento. Probá de nuevo en un rato o <a class="ask" href="https://wa.me/5493434533545" target="_blank" rel="noopener">consultanos por WhatsApp</a>.</p>';
  }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && loaded) refresh(true); });

renderChips();
render();
refresh(false);
