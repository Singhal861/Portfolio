import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  const root = process.cwd();
  const [html, stylesheet, script] = await Promise.all([
    readFile(path.join(root, 'index.html'), 'utf8'),
    readFile(path.join(root, 'style.css'), 'utf8'),
    readFile(path.join(root, 'script.js'), 'utf8'),
  ]);

  const portfolio = html
    .replace('<link rel="stylesheet" href="style.css">', `<style>${stylesheet}</style>`)
    .replace('<script src="script.js"></script>', `<script>${script}</script>`)
    .replaceAll('src="assets/', 'src="/portfolio-assets/');

  return new Response(portfolio, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}