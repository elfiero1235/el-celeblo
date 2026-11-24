// Build de Cloudflare Pages: copia sólo lo público a dist/ (el SQL, el servidor y las herramientas no se publican).
// Pages toma las funciones de functions/ aparte, así que /api/chat sigue andando.
import { cpSync, rmSync, mkdirSync } from 'node:fs';

const PUBLICO = ['index.html', 'catalogo.html', 'contacto.html', 'servicio-tecnico.html', '404.html', 'robots.txt', 'sitemap.xml', '_redirects', 'favicon.ico', 'css', 'js', 'img', 'admin'];
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const p of PUBLICO) cpSync(p, `dist/${p}`, { recursive: true });
console.log('dist/ listo:', PUBLICO.join(', '));
