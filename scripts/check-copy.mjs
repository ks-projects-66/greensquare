/**
 * Editorial guards over the built site.
 *
 * The numeric figures are protected by assertInvariants() in src/lib/benchmark.ts,
 * which fails the build rather than shipping a wrong count. The rules below are the
 * same idea applied to the words: constraints that are currently kept by care, and
 * would otherwise rot the first time someone edits a page without knowing why a
 * sentence is phrased the way it is.
 *
 * Each rule names the decision it enforces. See docs/decisions.md.
 *
 * Usage: node scripts/check-copy.mjs   (runs against dist/, after a build)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  });
}

const NAMED_ENTITIES = {
  '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&rarr;': '→', '&larr;': '←', '&rArr;': '⇒',
  '&mdash;': '—', '&ndash;': '–', '&middot;': '·', '&hellip;': '…',
};

/**
 * Visible text only. A rule about what a reader sees must not match markup or script.
 *
 * Entities are decoded, because a glyph written as &#8594; reads to a human exactly
 * like one written literally. An earlier version of this file missed an injected
 * arrow for precisely that reason.
 */
function visibleText(html) {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  for (const [entity, char] of Object.entries(NAMED_ENTITIES)) text = text.replaceAll(entity, char);
  text = text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
  return text.replace(/\s+/g, ' ');
}

/**
 * `test` returns an array of offending strings. An empty array passes.
 * `only` and `except` scope a rule to particular routes.
 */
const RULES = [
  {
    name: 'retired product names',
    decision: 'Frame is the product, Frame Free and Frame Pro the plans (2026-09-05)',
    test: (text) => [
      ...text.matchAll(/\bCompass\b/g),
      ...text.matchAll(/\bLens(?:\s4\.0)?\b/g),
      ...text.matchAll(/The Decision(?! Brief)/g),
      ...text.matchAll(/Decision Frame/g),
      /* GreenSquare is the company, not the product. `GreenSquare AI` is the only
         permitted form; a bare `GreenSquare` is the retired product name. The
         lookahead is what separates them, so do not simplify it away. */
      ...text.matchAll(/\bGreenSquare\b(?! AI)/g),
    ].map((m) => m[0]),
  },
  {
    name: 'unannounced product names',
    decision: 'Only Frame Free and Frame Pro are announced',
    test: (text) =>
      [...text.matchAll(/\b(Scout|Atlas|Spark|Forge|Realm)\b/g)].map((m) => m[0]),
  },
  {
    name: 'model brands on launch product surfaces',
    decision: 'The launch story is model-agnostic',
    only: [/^(home|product|free|about)$/],
    test: (text) => [...text.matchAll(/\b(?:Claude|ChatGPT|Gemini|OpenAI|Anthropic)\b/g)].map((m) => m[0]),
  },
  {
    name: 'a price, which is not published before launch',
    decision: 'No price is surfaced at launch',
    test: (text) => [...text.matchAll(/(?:A?\$|AUD\s?)\d/g)].map((m) => m[0]),
    // The demonstration transcript is a fictional case containing fictional money.
    // It is quoted evidence, not a Frame price.
    exempt: (route) => route.startsWith('benchmark'),
  },
  {
    name: 'an arrow glyph',
    decision: 'House style bans arrow glyphs',
    test: (text) => [...text.matchAll(/[→←⇒⟶]|(?:^|\s)->(?:\s|$)/g)].map((m) => m[0].trim()),
  },
  {
    name: 'an em dash',
    decision: 'House style bans em dashes',
    test: (text) => [...text.matchAll(/—/g)].map(() => 'em dash'),
  },
  {
    name: 'a claim about when the runs took place',
    decision: 'The run window is never claimable (dates.run_window is unverified)',
    test: (text) =>
      [...text.matchAll(/runs? (?:were |was )?(?:conducted|carried out|performed|took place|ran) (?:on|in|between|during|over)\b[^.]{0,40}/gi)].map((m) => m[0]),
  },
];

const failures = [];

for (const file of htmlFiles(DIST)) {
  const route = relative(DIST, file).replace(/\\/g, '/').replace(/index\.html$/, '').replace(/\/$/, '') || 'home';
  const html = readFileSync(file, 'utf8');
  // A redirect stub carries no prose worth checking.
  if (/http-equiv="?refresh"?/i.test(html) && html.length < 2000) continue;
  const text = visibleText(html);

  for (const rule of RULES) {
    if (rule.except?.some((re) => re.test(route))) continue;
    if (rule.only && !rule.only.some((re) => re.test(route))) continue;
    if (rule.exempt?.(route)) continue;
    const hits = rule.test(text);
    if (hits.length) {
      failures.push({ route, rule: rule.name, decision: rule.decision, hits: [...new Set(hits)].slice(0, 6), count: hits.length });
    }
  }
}

/**
 * The composite is the figure most likely to be quoted without its qualification,
 * so it is checked structurally rather than by wording.
 */
const benchmark = join(DIST, 'benchmark', 'index.html');
try {
  const text = visibleText(readFileSync(benchmark, 'utf8'));
  if (/Produced a defensible brief/.test(text) && !/lowest of the five process check counts/.test(text)) {
    failures.push({
      route: 'benchmark',
      rule: 'the composite renders without its provenance line',
      decision: 'The composite never appears without saying what it is (2026-08-30)',
      hits: ['composite label present, provenance absent'],
      count: 1,
    });
  }
  if (!/not a test of Frame Free or Frame Pro/.test(text)) {
    failures.push({
      route: 'benchmark',
      rule: 'the historical naming boundary is missing',
      decision: 'Current plans must not inherit the frozen study claim',
      hits: ['required boundary sentence absent'],
      count: 1,
    });
  }
} catch {
  failures.push({ route: 'benchmark', rule: 'the benchmark page did not build', decision: '', hits: [], count: 1 });
}

if (failures.length === 0) {
  console.log(`check-copy: ${RULES.length + 2} rules, no violations.`);
  process.exit(0);
}

console.error('\ncheck-copy failed. These are deliberate constraints, not style preferences.');
console.error('Each names the decision it enforces. See docs/decisions.md before changing a rule.\n');
for (const f of failures) {
  console.error(`  /${f.route}`);
  console.error(`    ${f.rule} (${f.count})`);
  if (f.decision) console.error(`    enforces: ${f.decision}`);
  if (f.hits.length) console.error(`    found: ${f.hits.join(' | ')}`);
  console.error('');
}
process.exit(1);
