/* Kleine statische server voor de tests (geen dependency). Gebruik: node tests/serve.mjs [poort] */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const poort = Number(process.argv[2] ?? 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json' };

createServer(async (req, res) => {
  try {
    const pad = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    const bestand = join(root, pad === '/' ? 'index.html' : pad);
    if (!bestand.startsWith(root) || bestand.includes('node_modules')) throw new Error('buiten de map');
    res.writeHead(200, { 'content-type': types[extname(bestand)] ?? 'application/octet-stream' });
    res.end(await readFile(bestand));
  } catch {
    res.writeHead(404).end('niet gevonden');
  }
}).listen(poort, '127.0.0.1', () => console.log(`http://127.0.0.1:${poort}`));
