import { request } from 'node:http';

const base = new URL(process.env.QA_BASE_URL || 'http://127.0.0.1:4321/');
const seeds = ['/', '/product/', '/free/', '/research/', '/benchmark/', '/about/', '/methodology/'];

const get = (pathname) => new Promise((resolve, reject) => {
  const req = request(new URL(pathname, base), (response) => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve({ status: response.statusCode ?? 0, body }));
  });
  req.on('error', reject);
  req.end();
});

const targets = new Set(seeds);
for (const seed of seeds) {
  const { status, body } = await get(seed);
  if (status >= 400) throw new Error(`${seed} returned ${status}`);
  for (const match of body.matchAll(/href="([^"]+)"/g)) {
    const url = new URL(match[1], new URL(seed, base));
    if (url.origin === base.origin) targets.add(url.pathname);
  }
}

const failures = [];
for (const target of targets) {
  const { status } = await get(target);
  if (status >= 400) failures.push(`${target}: ${status}`);
}
if (failures.length) throw new Error(`Broken internal links: ${failures.join(', ')}`);
console.log(`PASS internal_links=${targets.size}`);
