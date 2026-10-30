// Datos compartidos entre la web y el panel. El stock vive en Supabase (tabla "productos").
// La web pública lee con un fetch simple; el panel usa supabase-js para el login y las fotos.
(() => {
  const SUPABASE_URL = 'https://jsigyajnakxlgiwdbpxq.supabase.co';
  // clave publicable: es pública a propósito; lo que protege los datos son los permisos de la base (supabase/setup.sql)
  const SUPABASE_KEY = 'sb_publishable_Ea2JlVYaT6NbTPBiKJ-74A_EZ3Etr4H';
  const POCAS = 2; // hasta cuántas unidades se muestra "Últimas unidades"

  const categorias = [
    { id: 'industriales', nombre: 'Máquinas industriales' },
    { id: 'familiares', nombre: 'Máquinas familiares' },
    { id: 'hilos', nombre: 'Hilos' },
    { id: 'cortadoras', nombre: 'Cortadoras' }
  ];

  // fila de la base ⇄ producto del sitio ("desc" es palabra reservada en SQL, en la base se llama descripcion)
  const fromRow = r => ({
    id: r.id, nombre: r.nombre, marca: r.marca, categoria: r.categoria, precio: r.precio,
    stock: r.stock, desc: r.descripcion, img: r.img, visible: r.visible, actualizado: r.actualizado
  });
  const toRow = p => ({
    id: p.id, nombre: p.nombre, marca: p.marca || '', categoria: p.categoria, precio: p.precio || null,
    stock: p.stock, descripcion: p.desc || '', img: p.img || null, visible: p.visible !== false
  });

  const pack = rows => {
    const productos = rows.map(fromRow);
    const actualizado = productos.reduce((m, p) => p.actualizado > m ? p.actualizado : m, '');
    return { categorias, productos, actualizado };
  };

  // lectura pública: sólo los productos visibles (lo filtra la base)
  async function load() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*&order=creado.desc`, {
      headers: { apikey: SUPABASE_KEY }
    });
    if (!res.ok) throw new Error(`No se pudo leer el stock (${res.status})`);
    return pack(await res.json());
  }

  let client;
  function db() {
    client ??= window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    return client;
  }

  function estado(p) {
    if (p.stock <= 0) return { id: 'sin', label: 'Sin stock' };
    if (p.stock <= POCAS) return { id: 'pocas', label: 'Últimas unidades' };
    return { id: 'hay', label: 'En stock' };
  }

  const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
  const precio = p => p.precio ? fmt.format(p.precio) : 'Consultar precio';

  window.ChiapinoStore = { load, db, pack, toRow, categorias, estado, precio };
})();
