// "Lo que sabe el bot": el dueño carga info para el chat y responde las preguntas que el bot no supo.
// Usa sb, $, esc y toast de admin.js.
(() => {
  let infos = [], preguntas = [];
  let editInfo = null;   // id del dato que se edita, null = nuevo
  let desdePregunta = null; // pregunta que se está respondiendo (se borra al guardar)

  const dlg = $('dlgInfo'), form = $('infoForm'), f = form.elements;
  const SUGERIDOS = ['Envíos', 'Medios de pago', 'Cuotas', 'Cambios y devoluciones', 'Garantía', 'Retiro en el local'];

  /* ---------- pestañas ---------- */
  function tab(cual) {
    const bot = cual === 'bot';
    $('tabStock').hidden = bot;
    $('tabBot').hidden = !bot;
    $('tabStockBtn').setAttribute('aria-selected', !bot);
    $('tabBotBtn').setAttribute('aria-selected', bot);
    try { sessionStorage.setItem('chiapino-tab', cual); } catch {}
  }
  $('tabStockBtn').addEventListener('click', () => tab('stock'));
  $('tabBotBtn').addEventListener('click', () => { tab('bot'); cargar(); });

  /* ---------- datos ---------- */
  async function cargar() {
    const [a, b] = await Promise.all([
      sb.from('bot_info').select('*').order('tema'),
      sb.from('bot_preguntas').select('*').order('veces', { ascending: false }).order('ultima', { ascending: false })
    ]);
    if (a.error || b.error) { toast('No se pudo cargar lo del bot. Revisá la conexión y recargá la página.', 'error'); return; }
    infos = a.data; preguntas = b.data;
    render();
  }
  window.cargarBot = () => {
    let t = 'stock';
    try { t = sessionStorage.getItem('chiapino-tab') || 'stock'; } catch {}
    tab(t);
    cargar();
  };

  const hace = iso => {
    const min = Math.round((Date.now() - new Date(iso)) / 60000);
    if (min < 60) return min <= 1 ? 'recién' : `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.round(h / 24);
    return d === 1 ? 'ayer' : `hace ${d} días`;
  };

  function render() {
    const n = $('nPreg');
    n.hidden = !preguntas.length;
    n.textContent = preguntas.length;

    $('qList').innerHTML = preguntas.length
      ? preguntas.map(p => `<li data-q="${p.id}">
          <div class="q-text"><b>${esc(p.pregunta)}</b><small>${p.veces === 1 ? '1 vez' : `${p.veces} veces`} · ${hace(p.ultima)}</small></div>
          <div class="row-actions"><button class="btn sm" type="button" data-responder>Responder</button><button class="icon-btn" type="button" data-descartar>Descartar</button></div>
        </li>`).join('')
      : '<li class="q-empty">Por ahora el bot respondió todo. Cuando no sepa algo, la pregunta aparece acá.</li>';

    const usados = new Set(infos.map(i => i.tema.toLowerCase()));
    const faltan = SUGERIDOS.filter(s => !usados.has(s.toLowerCase()));
    $('infoList').innerHTML = infos.map(i => `<article class="info-card" data-info="${i.id}">
        <h3>${esc(i.tema)}</h3>
        <p>${esc(i.texto)}</p>
        <div class="row-actions"><button class="icon-btn" type="button" data-editar>Editar</button><button class="icon-btn danger" type="button" data-borrar>Borrar</button></div>
      </article>`).join('')
      + (faltan.length ? `<div class="info-sug"><p>${infos.length ? 'Otros temas que suelen preguntar:' : 'Todavía no cargaste nada. Empezá por lo que más te preguntan:'}</p>
          <div>${faltan.map(s => `<button class="chip" type="button" data-sug="${esc(s)}">+ ${esc(s)}</button>`).join('')}</div></div>` : '');
  }

  /* ---------- formulario ---------- */
  function abrir({ info = null, tema = '', pregunta = null } = {}) {
    editInfo = info?.id ?? null;
    desdePregunta = pregunta;
    form.reset();
    $('infoError').textContent = '';
    $('infoTitle').textContent = info ? 'Editar dato' : pregunta ? 'Responder pregunta' : 'Nuevo dato para el bot';
    const from = $('infoFrom');
    from.hidden = !pregunta;
    from.textContent = pregunta ? `Un cliente preguntó: «${pregunta.pregunta}»` : '';
    f.tema.value = info?.tema || tema || (pregunta ? pregunta.pregunta.slice(0, 120) : '');
    f.texto.value = info?.texto || '';
    dlg.showModal();
    (f.tema.value ? f.texto : f.tema).focus();
  }

  $('addInfo').addEventListener('click', () => abrir());
  $('infoCancel').addEventListener('click', () => dlg.close());

  $('infoList').addEventListener('click', async e => {
    const sug = e.target.closest('[data-sug]');
    if (sug) return abrir({ tema: sug.dataset.sug });
    const card = e.target.closest('[data-info]');
    const info = card && infos.find(i => String(i.id) === card.dataset.info);
    if (!info) return;
    if (e.target.closest('[data-editar]')) return abrir({ info });
    if (e.target.closest('[data-borrar]')) {
      if (!confirm(`¿Borrar «${info.tema}»?\n\nEl bot deja de saberlo. No se puede deshacer.`)) return;
      const { error } = await sb.from('bot_info').delete().eq('id', info.id);
      if (error) return netError();
      infos = infos.filter(i => i !== info);
      render();
      toast(`«${info.tema}» borrado`);
    }
  });

  $('qList').addEventListener('click', async e => {
    const li = e.target.closest('[data-q]');
    const p = li && preguntas.find(x => String(x.id) === li.dataset.q);
    if (!p) return;
    if (e.target.closest('[data-responder]')) return abrir({ pregunta: p });
    if (e.target.closest('[data-descartar]')) {
      const { error } = await sb.from('bot_preguntas').delete().eq('id', p.id);
      if (error) return netError();
      preguntas = preguntas.filter(x => x !== p);
      render();
      toast('Pregunta descartada');
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const tema = f.tema.value.trim(), texto = f.texto.value.trim();
    if (!tema || !texto) { $('infoError').textContent = 'Completá el tema y lo que tiene que saber el bot.'; return; }
    const btn = $('infoSave');
    btn.disabled = true;
    const q = editInfo
      ? sb.from('bot_info').update({ tema, texto }).eq('id', editInfo).select().single()
      : sb.from('bot_info').insert({ tema, texto }).select().single();
    const { data: fila, error } = await q;
    btn.disabled = false;
    if (error) return netError();
    if (editInfo) infos = infos.map(i => i.id === editInfo ? fila : i);
    else infos.push(fila);
    infos.sort((a, b) => a.tema.localeCompare(b.tema, 'es'));
    if (desdePregunta) {
      await sb.from('bot_preguntas').delete().eq('id', desdePregunta.id);
      preguntas = preguntas.filter(x => x.id !== desdePregunta.id);
    }
    dlg.close();
    render();
    toast('Guardado. El bot lo usa en un minuto.');
  });
})();
