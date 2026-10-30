// Panel de stock: ingreso con mail y contraseña; cada cambio se guarda en Supabase y la web lo muestra.
const S = window.ChiapinoStore;
const sb = S.db();
let data = { categorias: S.categorias, productos: [] };
let editing = null;   // id del producto que se edita, null = nuevo
let draftImg = null;  // foto del formulario: ruta/URL guardada o data URL nueva
let draftBlob = null; // la foto nueva lista para subir

const $ = id => document.getElementById(id);
const rows = $('rows'), q = $('q'), fCat = $('fCat'), fEstado = $('fEstado');
const dlg = $('dlg'), form = $('form');

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const catName = id => data.categorias.find(c => c.id === id)?.nombre || id;
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// las fotos del catálogo inicial son rutas del sitio; las subidas son URLs de Supabase
const imgSrc = img => !img ? '' : /^(data:|https?:|blob:)/.test(img) ? img : '../' + img;
const units = n => `${n} ${n === 1 ? 'unidad' : 'unidades'}`;
const FOTOS = '/storage/v1/object/public/fotos/';

let toastT;
function toast(msg, kind = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast show ${kind}`;
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), kind === 'error' ? 5000 : 1800);
}
const netError = () => toast('No se pudo guardar. Revisá la conexión a internet y probá de nuevo.', 'error');

/* ---------- vistas ---------- */
function show(view) {
  for (const v of ['loginView', 'passView', 'deniedView', 'panelView']) $(v).hidden = v !== view;
  $('logout').hidden = view !== 'panelView';
}

async function enter(session) {
  const { data: ok, error } = await sb.rpc('es_admin');
  if (error || !ok) {
    $('deniedEmail').textContent = session.user.email;
    show('deniedView');
    return;
  }
  show('panelView');
  await reload();
}

async function reload() {
  const { data: rowsDb, error } = await sb.from('productos').select('*').order('creado', { ascending: false });
  if (error) { toast('No se pudo cargar el stock. Revisá la conexión y recargá la página.', 'error'); return; }
  data = S.pack(rowsDb);
  render();
}

// el link de invitación o de "me olvidé la contraseña" trae type=invite / type=recovery
const linkType = new URLSearchParams(location.hash.slice(1)).get('type');
let choosingPass = linkType === 'invite' || linkType === 'recovery';

sb.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') choosingPass = true;
  // fuera del callback: supabase-js no permite llamar a la base desde adentro
  setTimeout(() => {
    if (!session) return show('loginView');
    if (choosingPass) return show('passView');
    if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') enter(session);
  });
});

$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target.elements, err = $('loginError');
  err.textContent = '';
  if (!f.email.value || !f.password.value) { err.textContent = 'Completá el mail y la contraseña.'; return; }
  $('loginBtn').disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
  $('loginBtn').disabled = false;
  if (error) err.textContent = /invalid/i.test(error.message)
    ? 'El mail o la contraseña no coinciden.'
    : 'No se pudo ingresar. Revisá la conexión y probá de nuevo.';
});

$('forgot').addEventListener('click', async () => {
  const email = $('loginForm').elements.email.value.trim(), err = $('loginError');
  if (!email) { err.textContent = 'Escribí tu mail arriba y tocá de nuevo «Me olvidé la contraseña».'; return; }
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
  err.textContent = '';
  toast(error ? 'No se pudo mandar el mail. Probá de nuevo en un rato.' : `Te mandamos un mail a ${email} para elegir una contraseña nueva.`, error ? 'error' : '');
});

$('passForm').addEventListener('submit', async e => {
  e.preventDefault();
  const pass = e.target.elements.password.value, err = $('passError');
  if (pass.length < 8) { err.textContent = 'La contraseña tiene que tener al menos 8 caracteres.'; return; }
  const { data: res, error } = await sb.auth.updateUser({ password: pass });
  if (error) { err.textContent = 'No se pudo guardar la contraseña. Probá con otra o pedí un link nuevo.'; return; }
  choosingPass = false;
  history.replaceState(null, '', location.pathname);
  toast('Contraseña guardada');
  enter({ user: res.user });
});

for (const id of ['logout', 'deniedLogout']) $(id).addEventListener('click', () => sb.auth.signOut());

/* ---------- lista ---------- */
function fillCats() {
  const opts = data.categorias.map(c => `<option value="${c.id}">${esc(c.nombre)}</option>`).join('');
  fCat.innerHTML = '<option value="">Todas las categorías</option>' + opts;
  $('formCat').innerHTML = opts;
}

function render() {
  const all = data.productos;
  const count = id => all.filter(p => S.estado(p).id === id).length;
  $('nTotal').textContent = all.length;
  $('nHay').textContent = count('hay');
  $('nPocas').textContent = count('pocas');
  $('nSin').textContent = count('sin');
  document.querySelectorAll('.summary [data-estado]').forEach(b => b.setAttribute('aria-pressed', b.dataset.estado === fEstado.value));

  const term = q.value.trim().toLowerCase();
  const items = all
    .filter(p => !fCat.value || p.categoria === fCat.value)
    .filter(p => !fEstado.value || S.estado(p).id === fEstado.value)
    .filter(p => !term || `${p.nombre} ${p.marca}`.toLowerCase().includes(term));

  rows.innerHTML = items.map(p => {
    const e = S.estado(p);
    const thumb = p.img
      ? `<img src="${esc(imgSrc(p.img))}" alt="" loading="lazy">`
      : `<span aria-hidden="true">${esc((p.marca || p.nombre).slice(0, 1))}</span>`;
    return `<tr data-id="${p.id}" class="is-${e.id}">
      <td class="name"><div class="name-in"><span class="thumb-sm">${thumb}</span><span><b>${esc(p.nombre)}</b><small>${esc(p.marca)}</small></span></div></td>
      <td class="cat-col">${esc(catName(p.categoria))}</td>
      <td class="num">${S.precio(p)}</td>
      <td><div class="stepper"><button type="button" data-step="-1" aria-label="Restar una unidad de ${esc(p.nombre)}">−</button><input type="number" min="0" value="${p.stock}" aria-label="Unidades de ${esc(p.nombre)}"><button type="button" data-step="1" aria-label="Sumar una unidad de ${esc(p.nombre)}">+</button></div></td>
      <td><span class="badge ${e.id}">${e.label}</span></td>
      <td><label class="sw-wrap"><input class="sw" type="checkbox" data-visible ${p.visible === false ? '' : 'checked'} aria-label="Mostrar ${esc(p.nombre)} en la web"><span class="sw-text">En la web</span></label></td>
      <td class="row-cell"><div class="row-actions"><button class="icon-btn" type="button" data-edit>Editar</button><button class="icon-btn danger" type="button" data-del>Borrar</button></div></td>
    </tr>`;
  }).join('') || `<tr><td colspan="7" class="empty">${all.length
    ? 'Ningún producto coincide con la búsqueda. <button class="icon-btn" type="button" data-clear>Ver todos</button>'
    : 'Todavía no hay productos. Tocá «Agregar producto» para cargar el primero.'}</td></tr>`;
}

// cambia un campo al toque en pantalla y lo guarda; si falla, vuelve atrás
async function patch(p, fields, okMsg) {
  const before = { ...p };
  Object.assign(p, fields);
  render();
  const row = { ...fields };
  if ('desc' in row) { row.descripcion = row.desc; delete row.desc; }
  const { error } = await sb.from('productos').update(row).eq('id', p.id);
  if (error) { Object.assign(p, before); render(); netError(); return; }
  toast(okMsg);
}

const byRow = el => data.productos.find(p => p.id === el.closest('tr')?.dataset.id);

// los toques seguidos en − / + se juntan en un solo guardado
const pending = new Map();
function bumpStock(p, delta) {
  p.stock = Math.max(0, p.stock + delta);
  render();
  clearTimeout(pending.get(p.id));
  pending.set(p.id, setTimeout(async () => {
    pending.delete(p.id);
    const { error } = await sb.from('productos').update({ stock: p.stock }).eq('id', p.id);
    if (error) { netError(); reload(); } else toast(`${p.nombre}: ${units(p.stock)}`);
  }, 450));
}

rows.addEventListener('click', async e => {
  if (e.target.closest('[data-clear]')) { q.value = ''; fCat.value = ''; fEstado.value = ''; render(); return; }
  const p = byRow(e.target);
  if (!p) return;
  const step = e.target.closest('[data-step]');
  if (step) return bumpStock(p, Number(step.dataset.step));
  if (e.target.closest('[data-edit]')) return openDialog(p);
  if (e.target.closest('[data-del]')) {
    if (!confirm(`¿Borrar «${p.nombre}»?\n\nSe saca de la web y del panel. No se puede deshacer.`)) return;
    const { error } = await sb.from('productos').delete().eq('id', p.id);
    if (error) return netError();
    removePhoto(p.img);
    data.productos = data.productos.filter(x => x !== p);
    render();
    toast(`«${p.nombre}» borrado`);
  }
});

rows.addEventListener('change', e => {
  const p = byRow(e.target);
  if (!p) return;
  if (e.target.matches('[data-visible]')) {
    const v = e.target.checked;
    patch(p, { visible: v }, v ? `«${p.nombre}» se ve en la web` : `«${p.nombre}» oculto de la web`);
  } else if (e.target.matches('.stepper input')) {
    const n = Math.max(0, parseInt(e.target.value, 10) || 0);
    patch(p, { stock: n }, `${p.nombre}: ${units(n)}`);
  }
});

// las tarjetas del resumen filtran por estado
document.querySelector('.summary').addEventListener('click', e => {
  const b = e.target.closest('[data-estado]');
  if (!b) return;
  fEstado.value = fEstado.value === b.dataset.estado ? '' : b.dataset.estado;
  render();
});

/* ---------- fotos ---------- */
async function uploadPhoto(blob, id) {
  const path = `${id}/${Date.now()}.jpg`;
  const { error } = await sb.storage.from('fotos').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) throw error;
  return sb.storage.from('fotos').getPublicUrl(path).data.publicUrl;
}
// borra del almacenamiento una foto que ya no usa ningún producto (las del sitio no se tocan)
function removePhoto(url) {
  if (!url?.includes(FOTOS) || data.productos.some(p => p.img === url)) return;
  sb.storage.from('fotos').remove([url.split(FOTOS)[1]]);
}

/* ---------- formulario ---------- */
const f = form.elements;

function showPhoto(img, blob = null) {
  draftImg = img || null;
  draftBlob = blob;
  const prev = $('photoPreview');
  prev.hidden = !draftImg;
  if (draftImg) prev.src = imgSrc(draftImg); else prev.removeAttribute('src');
  $('photoEmpty').hidden = !!draftImg;
  $('fotoQuitar').hidden = !draftImg;
  $('photoError').textContent = '';
}

function openDialog(p) {
  editing = p?.id ?? null;
  $('dlgTitle').textContent = p ? 'Editar producto' : 'Nuevo producto';
  $('saveBtn').textContent = p ? 'Guardar cambios' : 'Guardar producto';
  form.reset();
  $('nameError').textContent = '';
  const v = p || { nombre: '', marca: '', categoria: fCat.value || data.categorias[0].id, precio: null, stock: 1, desc: '' };
  f.nombre.value = v.nombre;
  f.marca.value = v.marca || '';
  f.categoria.value = v.categoria;
  f.precio.value = v.precio ? new Intl.NumberFormat('es-AR').format(v.precio) : '';
  f.stock.value = v.stock;
  f.desc.value = v.desc || '';
  showPhoto(v.img);
  dlg.showModal();
  if (!p) f.nombre.focus();
}

// achica la foto antes de subirla: las del celular pesan varios MB
async function prepareImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('tipo');
  const MAX = 1000;
  let bmp;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    bmp = await new Promise((ok, fail) => {
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = fail;
      im.src = URL.createObjectURL(file);
    });
  }
  const w = bmp.width, h = bmp.height, k = Math.min(1, MAX / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .8));
  return { blob, url: URL.createObjectURL(blob) };
}

async function takeFile(file) {
  if (!file) return;
  $('photoBusy').hidden = false;
  $('photoEmpty').hidden = true;
  try {
    const { blob, url } = await prepareImage(file);
    showPhoto(url, blob);
  } catch {
    showPhoto(draftImg, draftBlob);
    $('photoError').textContent = 'No se pudo abrir esa imagen. Probá con una foto JPG o PNG.';
  } finally {
    $('photoBusy').hidden = true;
  }
}

['fotoCamara', 'fotoArchivo'].forEach(id => $(id).addEventListener('change', e => {
  takeFile(e.target.files[0]);
  e.target.value = '';
}));
$('fotoQuitar').addEventListener('click', () => showPhoto(null));

// arrastrar una foto desde la compu
const drop = $('photoDrop');
drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', e => {
  e.preventDefault();
  drop.classList.remove('over');
  takeFile(e.dataTransfer.files[0]);
});

form.addEventListener('click', e => {
  const b = e.target.closest('[data-fstep]');
  if (b) f.stock.value = Math.max(0, (parseInt(f.stock.value, 10) || 0) + Number(b.dataset.fstep));
});

// el precio se escribe con o sin puntos: "812.700" o "812700"
f.precio.addEventListener('blur', () => {
  const n = parseInt(f.precio.value.replace(/\D/g, ''), 10);
  f.precio.value = n ? new Intl.NumberFormat('es-AR').format(n) : '';
});

$('cancel').addEventListener('click', () => dlg.close());

form.addEventListener('submit', async e => {
  e.preventDefault();
  const nombre = f.nombre.value.trim();
  if (!nombre) {
    $('nameError').textContent = 'Poné el nombre, así se ve en la web.';
    f.nombre.focus();
    return;
  }
  const old = editing && data.productos.find(p => p.id === editing);
  let id = editing;
  if (!id) {
    id = slug(nombre) || 'producto';
    for (let n = 2; data.productos.some(p => p.id === id); n++) id = `${slug(nombre)}-${n}`;
  }
  const precio = parseInt(f.precio.value.replace(/\D/g, ''), 10);
  const p = {
    id, nombre,
    marca: f.marca.value.trim(),
    categoria: f.categoria.value,
    precio: precio > 0 ? precio : null,
    stock: Math.max(0, parseInt(f.stock.value, 10) || 0),
    desc: f.desc.value.trim(),
    img: draftImg,
    visible: old ? old.visible : true
  };

  const btn = $('saveBtn'), label = btn.textContent;
  btn.disabled = true;
  btn.textContent = draftBlob ? 'Subiendo la foto…' : 'Guardando…';
  try {
    if (draftBlob) p.img = await uploadPhoto(draftBlob, id);
    const { error } = await sb.from('productos').upsert(S.toRow(p));
    if (error) throw error;
  } catch {
    netError();
    return;
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
  if (old) Object.assign(old, p); else data.productos.unshift(p);
  if (old && old.img !== p.img) removePhoto(old.img);
  dlg.close();
  render();
  toast(old ? 'Cambios guardados' : `«${nombre}» agregado`);
});

$('add').addEventListener('click', () => openDialog(null));
q.addEventListener('input', render);
[fCat, fEstado].forEach(el => el.addEventListener('change', render));

/* ---------- copia de seguridad ---------- */
$('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `stock-chiapino-${new Date().toISOString().slice(0, 10)}.json`
  });
  a.click();
  URL.revokeObjectURL(a.href);
});
// también sirve para pasar a la base una copia bajada de la versión anterior (fotos embebidas incluidas)
$('import').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  let d;
  try {
    d = JSON.parse(await file.text());
    if (!Array.isArray(d.productos)) throw new Error();
  } catch {
    toast('Ese archivo no es una copia del panel. Elegí el que bajaste con «Descargar copia».', 'error');
    return;
  }
  toast(`Cargando ${d.productos.length} productos…`);
  try {
    for (const p of d.productos) {
      if (p.img?.startsWith('data:')) p.img = await uploadPhoto(await (await fetch(p.img)).blob(), p.id);
    }
    const { error } = await sb.from('productos').upsert(d.productos.map(S.toRow));
    if (error) throw error;
  } catch {
    netError();
    return;
  }
  await reload();
  toast('Copia cargada');
});

fillCats();
