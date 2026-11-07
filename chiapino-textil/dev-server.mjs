// Servidor local para probar el sitio + /api/chat igual que en Cloudflare Pages (no se publica: build.mjs no lo copia).
// Uso: node dev-server.mjs   (lee .env.local si existe; puerto 8127 o PORT)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[2] && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const { handle } = await import('./server/chat-core.js');

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const PRIVADO = /^(server|functions|node_modules|supabase|dist)\/|^\.env|^dev-server|^build\.mjs|^DEPLOY/; // no se sirven como estáticos
const port = +process.env.PORT || 8127;

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/chat') {
    if (req.method !== 'POST') { res.writeHead(405, { Allow: 'POST' }).end(); return; }
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: 'POST', headers: req.headers, body: Buffer.concat(chunks) });
    const r = await handle(request, process.env);
    res.writeHead(r.status, Object.fromEntries(r.headers)).end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (!rel || rel.endsWith('/')) rel += 'index.html';
  const file = path.join(root, rel);
  if (!file.startsWith(root) || PRIVADO.test(rel)) { res.writeHead(404).end(); return; }
  try {
    let f = file;
    if ((await stat(f)).isDirectory()) f = path.join(f, 'index.html');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream' }).end(await readFile(f));
  } catch { res.writeHead(404).end(); }
}).listen(port, () => console.log(`Textil Chiapino + chat en http://localhost:${port}/  (IA: ${process.env.CHAT_MOCK === '1' ? 'MODO PRUEBA' : 'Gemini'}, clave: ${process.env.GEMINI_API_KEY ? 'cargada' : 'falta'})`));
