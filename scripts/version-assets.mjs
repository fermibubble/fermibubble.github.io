import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// A release-wide content fingerprint keeps HTML, module imports, and search
// data in sync for returning readers with a populated browser/CDN cache.
export async function versionAssets(out) {
  const assets = (await readdir(join(out, 'assets'))).filter(name => /\.(?:css|m?js)$/.test(name)).sort();
  const source = await Promise.all(assets.map(name => readFile(join(out, 'assets', name), 'utf8')));
  const data = await readFile(join(out, 'search-index.json'), 'utf8');
  const version = createHash('sha256').update(JSON.stringify([assets, source, data])).digest('hex').slice(0, 16);
  for (const [i, name] of assets.entries()) {
    if (!/\.m?js$/.test(name)) continue;
    const body = source[i]
      .replace(/(from\s+["']\.\/[^"'?]+\.m?js)(?:\?[^"']*)?(["'])/g, `$1?v=${version}$2`)
      .replace(/(["']\/search-index\.json)(?:\?[^"']*)?(["'])/g, `$1?v=${version}$2`);
    await writeFile(join(out, 'assets', name), body);
  }
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) { await walk(path); continue; }
      if (!entry.name.endsWith('.html')) continue;
      const html = await readFile(path, 'utf8');
      await writeFile(path, html.replace(/((?:src|href)="\/assets\/[^"?]+\.(?:css|m?js))(?:\?[^"']*)?"/g, `$1?v=${version}"`));
    }
  }
  await walk(out);
}
