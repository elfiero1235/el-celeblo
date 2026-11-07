# Chat de Textil Chiapino: cómo publicarlo gratis

**Costo: $0.** El sitio y el chat corren en **Cloudflare Pages** (plan gratis) y la IA es **Google Gemini** (plan gratis, sin tarjeta). Ninguno de los dos te puede cobrar: si se llega al límite gratis, responden con un error y el bot deriva al cliente a WhatsApp.

```
chiapino-textil/
├─ functions/api/chat.js   función de Cloudflare: POST /api/chat
├─ server/chat-core.js     lógica del chat (instrucciones, límites, catálogo, Gemini, WhatsApp)
├─ js/chat-widget.js       botón flotante + ventana de chat (página pública)
├─ css/chat-widget.css
├─ build.mjs               copia sólo lo público a dist/ (el SQL y el servidor no se publican)
├─ .env.example            plantilla para probar en local (sin valores)
└─ dev-server.mjs          servidor local para probar
```

## 1. Supabase activo

El stock y lo que sabe el bot salen del proyecto de Supabase (tablas `productos`, `bot_info` y `bot_preguntas`; si se arma un proyecto nuevo, correr `supabase/setup.sql` entero). En el plan gratis, el proyecto **se pausa solo después de una semana sin visitas**, y mientras está pausado el catálogo y el bot no ven el stock. Si pasa: supabase.com → el proyecto → **Restore project**.

## 2. Clave gratis de Gemini

1. Entrá a **aistudio.google.com** con una cuenta de Google (mejor una del negocio) → **Get API key** → **Create API key**.
2. **No vincules facturación** (billing). Sin facturación, el proyecto queda en el plan gratis y no se puede cobrar nada.
3. Copiá la clave. No la pegues en ningún archivo del repo.

Tené en cuenta que en el plan gratis Google puede usar las conversaciones para mejorar sus productos. Por eso el chat avisa que no se compartan datos de tarjeta ni contraseñas, y el servidor frena los números de tarjeta antes de mandarlos.

## 3. Publicar en Cloudflare Pages

1. Creá una cuenta gratis en **dash.cloudflare.com**.
2. **Workers & Pages → Create → Pages → Connect to Git** → elegí el repo `elfiero1235/el-celeblo`.
3. Configuración del build:
   - **Root directory:** `chiapino-textil`
   - **Framework preset:** None
   - **Build command:** `node build.mjs`
   - **Build output directory:** `dist`
4. **Save and Deploy**. Cloudflare detecta solo la carpeta `functions/`, así que `/api/chat` queda andando.

## 4. Cargar la clave (el secreto)

En el proyecto de Pages → **Settings → Variables and Secrets → Add**:

| Nombre | Tipo | Valor |
|---|---|---|
| `GEMINI_API_KEY` | **Secret** (encriptada) | la clave del paso 2 |
| `GEMINI_MODELS` | Text (opcional) | por defecto `gemini-3.5-flash-lite,gemini-3.8-flash` |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Secret (opcional) | límite por IP compartido (ver paso 6) |
| `ALLOWED_ORIGINS` | Text (opcional) | sólo si el chat se usa desde otro dominio |

Cargalas en **Production**. Después andá a **Deployments → ⋯ → Retry deployment** para que tomen el valor. **Nunca** cargues `CHAT_MOCK`: es sólo para pruebas locales.

## 5. Probar

1. Abrí el sitio (`<proyecto>.pages.dev`), tocá **Preguntanos** y escribí "¿Qué horarios tienen?".
2. "quiero comprar la overlock de 3 hilos": tiene que aparecer el botón **Seguir por WhatsApp** con el mensaje ya escrito.
3. "mi máquina corta el hilo": tiene que guiarte paso a paso con la planilla del dueño.
4. Algo fuera de tema ("haceme la tarea"): tiene que decir que sólo atiende consultas del local.
5. "¿hacen envíos a Rosario?" (sin nada cargado): deriva a WhatsApp y la pregunta aparece en el panel, pestaña **Lo que sabe el bot**. Respondela ahí, esperá un minuto y preguntá de nuevo: ahora contesta con lo que cargaste.
6. F12 → Network → `chat`: en la respuesta sólo viajan `reply`, `whatsapp` y `productos`. La clave no aparece.

## 6. Límites contra el abuso (ya incluidos)

- Mensaje: hasta 500 caracteres. Historial: hasta 12 mensajes. Pedido: hasta 16 KB.
- Por IP: 8 mensajes por minuto y 60 por día. Sin Upstash, el contador vive en la memoria de cada instancia de Cloudflare (se reinicia y no se comparte). Para un límite firme, creá una base Redis gratis en upstash.com y cargá sus dos variables.
- Sólo acepta pedidos del mismo dominio (chequeo de `Origin`).
- Los números de tarjeta se frenan antes de llegar a la IA.
- Las instrucciones limitan el bot a Textil Chiapino, le prohíben inventar precios, stock, políticas o arreglos, y no le dejan pedir datos sensibles.
- Si los dos modelos de Gemini llegan a su tope gratis, el bot no se cae: le ofrece al cliente seguir por WhatsApp.

## Cómo vende el bot

- Si alguien quiere comprar sin decir qué, el bot hace una o dos preguntas (para qué la usa, qué va a coser) y recomienda de 1 a 3 máquinas del catálogo.
- Las recomendaciones se muestran como **tarjetas** dentro del chat, con foto, precio, stock, un botón **Consultar** (WhatsApp con el nombre de la máquina) y **Ver ficha** (abre `catalogo.html?ver=<id>`).
- La IA sólo elige *qué* máquinas mostrar, por su id. Nombre, precio, stock y foto los pone el servidor desde Supabase, así que la IA no puede inventar ninguno de esos datos.
- Las recomendaciones mejoran cuanto mejores sean las descripciones y las fotos que el dueño cargue en el panel (para qué sirve cada máquina, qué telas cose, si es para casa o producción).

## De dónde saca los datos el bot

- **Stock y precios:** tabla `productos` de Supabase, la que edita el dueño desde `admin/`, con un caché de 60 segundos. Muestra el estado ("En stock", "Últimas unidades", "Sin stock"), no la cantidad exacta.
- **Lo que carga el dueño:** panel → pestaña **Lo que sabe el bot** (tabla `bot_info`). Envíos, medios de pago, cambios, garantías, más fallas de máquinas: lo que escriba ahí el bot lo usa tal cual, en un minuto (caché de 60 s). Si algo de ahí contradice las instrucciones fijas, vale lo del panel.
- **Horarios, dirección, contacto, servicio técnico:** copiados del sitio en `INSTRUCCIONES` (`server/chat-core.js`). Si cambian, lo más rápido es cargarlo en el panel (pisa lo de las instrucciones).
- **Guía de fallas** (corta el hilo / enreda abajo): de la planilla `BOOT.xlsx` del dueño, en `INSTRUCCIONES`. Las fallas nuevas se cargan desde el panel.
- Si el dato no está en ningún lado, el bot dice que no sabe y deriva a WhatsApp.

## El bot no aprende solo: el dueño le enseña

La IA no guarda nada entre una charla y otra. Lo que hace es avisar:

1. Cuando no sabe algo del local, el bot agrega una etiqueta interna `[NOSE]` con la pregunta resumida, sin datos del cliente. El servidor la saca de la respuesta (el cliente no la ve) y la anota en la tabla `bot_preguntas` con la función `anotar_pregunta` (si se repite, suma "veces").
2. En el panel, pestaña **Lo que sabe el bot**, aparecen esas preguntas ordenadas por cuántas veces las hicieron. El dueño toca **Responder**, escribe la respuesta y se guarda como un dato nuevo. La pregunta sale de la lista.
3. Siempre pasa por el dueño: el bot nunca aprende algo de lo que dice un cliente.

Protecciones: `bot_preguntas` sólo la leen y borran los admins; desde la web sólo se puede anotar con `anotar_pregunta`, que corta en 200 caracteres, junta repetidas y tiene tope de 200 preguntas en la lista y 30 nuevas por hora. El servidor tapa mails y números largos antes de anotar.

## Probar en local

```bash
cd chiapino-textil
cp .env.example .env.local     # completá GEMINI_API_KEY (o poné CHAT_MOCK=1 para probar sin clave)
node dev-server.mjs            # http://localhost:8127
```
