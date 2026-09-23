import { readFile } from 'node:fs/promises';
import path from 'node:path';

const contentTypes: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

export async function GET(
  _request: Request,
  { params }: { params: { path: string[] } },
) {
  const root = path.join(process.cwd(), 'assets');
  const filePath = path.resolve(root, ...params.path);

  if (!filePath.startsWith(`${root}${path.sep}`)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return new Response(file, {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
        'content-type': contentTypes[extension] ?? 'application/octet-stream',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}