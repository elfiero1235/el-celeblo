// Chat de atención al cliente. Habla con /api/chat (la clave del modelo está sólo en el servidor).
(() => {
  const MAX = 500;
  const KEY = 'chiapino-chat';
  const SALUDO = '¡Hola! Soy Chapitex, el asistente de Textil Chiapino. Preguntame por máquinas, hilos, stock, precios, horarios o el servicio técnico.';
  const CHIPS = ['¿Qué horarios tienen?', '¿Tienen overlock en stock?', 'Mi máquina corta el hilo', 'Quiero comprar una máquina'];

  let historial = [];
  try { historial = JSON.parse(sessionStorage.getItem(KEY)) || []; } catch { historial = []; }
  const guardar = () => { try { sessionStorage.setItem(KEY, JSON.stringify(historial.slice(-12))); } catch {} };

  const icon = (d, s = 24) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON_X = icon('<path stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>', 20);
  const ICON_SEND = icon('<path fill="currentColor" d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z"/>', 20);
  const ICON_WA = '<svg width="18" height="18" aria-hidden="true"><use href="#wa"/></svg>';

  document.body.insertAdjacentHTML('beforeend', `
    <button class="cw-launch" type="button" aria-expanded="false" aria-controls="cw-panel"><img class="cw-face" src="/img/chapitex.svg" alt="" width="52" height="52"><span>Preguntale a Chapitex</span></button>
    <section class="cw-panel" id="cw-panel" role="dialog" aria-modal="false" aria-labelledby="cw-title">
      <header class="cw-head">
        <img class="cw-avatar" src="/img/chapitex-cara.svg" alt="" width="40" height="40">
        <div><b id="cw-title">Chapitex</b><small>Asistente de Textil Chiapino · para comprar te pasamos a WhatsApp</small></div>
        <button class="cw-close" type="button" aria-label="Cerrar chat">${ICON_X}</button>
      </header>
      <div class="cw-log" role="log" aria-live="polite"></div>
      <div class="cw-chips"></div>
      <p class="cw-note">No compartas datos de tarjeta ni contraseñas por este chat.</p>
      <form class="cw-form">
        <label class="sr" for="cw-input">Escribí tu consulta</label>
        <textarea id="cw-input" rows="1" maxlength="${MAX}" placeholder="Escribí tu consulta…" autocomplete="off"></textarea>
        <button class="cw-send" type="submit" aria-label="Enviar">${ICON_SEND}</button>
      </form>
    </section>`);

  const launch = document.querySelector('.cw-launch');
  const panel = document.getElementById('cw-panel');
  const log = panel.querySelector('.cw-log');
  const chips = panel.querySelector('.cw-chips');
  const form = panel.querySelector('.cw-form');
  const input = panel.querySelector('textarea');
  const send = panel.querySelector('.cw-send');
  let ocupado = false;

  // todo el texto entra con textContent: nada de lo que responde el servidor se interpreta como HTML
  function burbuja(texto, clase) {
    const el = document.createElement('div');
    el.className = `cw-msg ${clase}`;
    el.textContent = texto;
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }
  function botonWhatsapp(url) {
    if (!/^https:\/\/wa\.me\/5493434533545\?text=/.test(url)) return; // sólo el número del local
    const a = document.createElement('a');
    a.className = 'cw-wa';
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `${ICON_WA}<span>Seguir por WhatsApp</span>`;
    log.append(a);
    log.scrollTop = log.scrollHeight;
  }

  // fotos: sólo del propio sitio o del almacenamiento de Supabase
  function fotoSegura(img) {
    if (!img) return null;
    try {
      const u = new URL(img, location.origin + '/');
      if (u.origin === location.origin || (u.protocol === 'https:' && u.hostname.endsWith('.supabase.co'))) return u.href;
    } catch {}
    return null;
  }
  const ICON_MAQ = icon('<path fill="currentColor" d="M4 5h11a4 4 0 0 1 4 4v3h-2V9a2 2 0 0 0-2-2H9v3h2v2H9v4h9v2H3v-2h4v-4H5a1 1 0 0 1-1-1V5zm2 2v3h1V7H6z"/>', 30);

  // tarjetas de máquinas recomendadas: los datos vienen del servidor, que los saca de la base
  function tarjetas(productos) {
    if (!Array.isArray(productos) || !productos.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'cw-cards';
    for (const p of productos.slice(0, 3)) {
      if (!p?.id || !p.nombre) continue;
      const card = document.createElement('article');
      card.className = `cw-card is-${['hay', 'pocas', 'sin'].includes(p.estado?.id) ? p.estado.id : 'hay'}`;

      const thumb = document.createElement('div');
      thumb.className = 'cw-thumb';
      const src = fotoSegura(p.img);
      if (src) {
        const img = new Image();
        img.alt = '';
        // al cargar la foto la tarjeta crece: si el chat estaba abajo de todo, que siga abajo
        img.addEventListener('load', () => { if (log.scrollHeight - log.scrollTop - log.clientHeight < 140) log.scrollTop = log.scrollHeight; });
        img.src = src;
        thumb.append(img);
      }
      else thumb.innerHTML = ICON_MAQ;

      const info = document.createElement('div');
      info.className = 'cw-info';
      const marca = document.createElement('small'); marca.textContent = p.marca || '';
      const nombre = document.createElement('b'); nombre.textContent = p.nombre;
      const fila = document.createElement('div'); fila.className = 'cw-row';
      const precio = document.createElement('span'); precio.className = 'cw-price'; precio.textContent = p.precio || 'Consultar precio';
      const badge = document.createElement('span'); badge.className = `badge ${p.estado?.id || ''}`; badge.textContent = p.estado?.label || '';
      fila.append(precio, badge);

      const acciones = document.createElement('div'); acciones.className = 'cw-actions';
      if (/^https:\/\/wa\.me\/5493434533545\?text=/.test(p.whatsapp || '')) {
        const a = document.createElement('a');
        a.className = 'cw-ask'; a.href = p.whatsapp; a.target = '_blank'; a.rel = 'noopener';
        a.innerHTML = `${ICON_WA}<span></span>`;
        a.lastChild.textContent = p.estado?.id === 'sin' ? 'Avisame' : 'Consultar';
        acciones.append(a);
      }
      const ver = document.createElement('a');
      ver.className = 'cw-see'; ver.href = 'catalogo.html?ver=' + encodeURIComponent(p.id); ver.textContent = 'Ver ficha';
      acciones.append(ver);

      info.append(marca, nombre, fila, acciones);
      card.append(thumb, info);
      wrap.append(card);
    }
    log.append(wrap);
    log.scrollTop = log.scrollHeight;
  }

  function pintar() {
    log.textContent = '';
    burbuja(SALUDO, 'cw-bot');
    for (const m of historial) {
      burbuja(m.content, m.role === 'user' ? 'cw-user' : 'cw-bot');
      tarjetas(m.productos);
      if (m.whatsapp) botonWhatsapp(m.whatsapp);
    }
    chips.textContent = '';
    if (!historial.length) for (const c of CHIPS) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = c;
      b.addEventListener('click', () => enviar(c));
      chips.append(b);
    }
  }

  async function enviar(texto) {
    texto = texto.trim();
    if (!texto || ocupado) return;
    if (texto.length > MAX) { burbuja(`El mensaje puede tener hasta ${MAX} caracteres.`, 'cw-err'); return; }
    ocupado = true; send.disabled = true; chips.textContent = '';
    burbuja(texto, 'cw-user');
    historial.push({ role: 'user', content: texto });
    input.value = ''; ajustar();

    const typing = document.createElement('div');
    typing.className = 'cw-typing'; typing.innerHTML = '<i></i><i></i><i></i>';
    typing.setAttribute('aria-label', 'Escribiendo');
    log.append(typing); log.scrollTop = log.scrollHeight;

    // al servidor van sólo los últimos mensajes, alternando cliente/asistente y empezando por el cliente
    // (a la respuesta del asistente se le suma qué máquinas mostró, para que entienda "quiero la primera")
    let envio = historial.slice(-11).map(({ role, content, productos }) => ({
      role,
      content: productos?.length ? `${content}\n[PRODUCTOS] ${productos.map(p => p.id).join(', ')}`.slice(0, 1500) : content
    }));
    while (envio.length && envio[0].role !== 'user') envio.shift();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: envio })
      });
      const data = await res.json().catch(() => ({}));
      typing.remove();
      if (data.reply) {
        burbuja(data.reply, 'cw-bot');
        tarjetas(data.productos);
        if (data.whatsapp) botonWhatsapp(data.whatsapp);
        historial.push({ role: 'assistant', content: data.reply, whatsapp: data.whatsapp || null, productos: Array.isArray(data.productos) ? data.productos.slice(0, 3) : [] });
      } else {
        historial.pop(); // el mensaje no se respondió: no queda en el historial
        burbuja(data.error || 'No pudimos responder ahora. Probá de nuevo o escribinos por WhatsApp.', 'cw-err');
      }
    } catch {
      typing.remove(); historial.pop();
      burbuja('Sin conexión. Probá de nuevo en un momento.', 'cw-err');
    }
    guardar();
    ocupado = false; send.disabled = false;
    input.focus();
  }

  function ajustar() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    input.style.overflowY = input.scrollHeight > 120 ? 'auto' : 'hidden';
  }
  function abrir(open) {
    document.documentElement.classList.toggle('cw-open', open);
    launch.setAttribute('aria-expanded', open);
    if (open) { setTimeout(() => input.focus(), 50); log.scrollTop = log.scrollHeight; }
    else launch.focus();
  }

  launch.addEventListener('click', () => abrir(true));
  panel.querySelector('.cw-close').addEventListener('click', () => abrir(false));
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });
  form.addEventListener('submit', e => { e.preventDefault(); enviar(input.value); });
  input.addEventListener('input', ajustar);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });

  pintar();
})();
