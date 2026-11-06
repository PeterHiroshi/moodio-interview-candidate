import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const port = Number(process.env.FRONTEND_PORT || 4173);
const files = new Map([
  ['/', ['index.html', 'text/html']], ['/app.js', ['app.js', 'text/javascript']],
  ['/style.css', ['style.css', 'text/css']],
  ...['morning', 'light', 'rain'].map(name => [`/images/${name}.svg`, [`images/${name}.svg`, 'image/svg+xml']]),
]);
createServer(async (req, res) => {
  const entry = files.get(new URL(req.url, 'http://localhost').pathname);
  if (!entry) { res.writeHead(404); res.end('Not found'); return; }
  try {
    const data = await readFile(join(root, entry[0]));
    res.writeHead(200, { 'Content-Type': `${entry[1]}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch { res.writeHead(500); res.end('Unable to load file'); }
}).listen(port, '127.0.0.1', () => console.log(`Open http://localhost:${port}`));
