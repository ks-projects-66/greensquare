import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const routes = ['/', '/product/', '/free/', '/research/', '/benchmark/', '/about/'];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
];
const output = 'qa/launch';
const browser = await chromium.launch();
const results = [];
let failed = false;

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  for (const route of routes) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${String(error)}`));
    const response = await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    const status = response?.status() ?? 0;
    const state = await page.evaluate(() => ({
      h1: Boolean(document.querySelector('h1')),
      mains: document.querySelectorAll('main').length,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      body: document.body.innerText,
    }));
    if (status !== 200) errors.push(`HTTP ${status}`);
    if (!state.h1) errors.push('Primary heading missing');
    if (state.mains !== 1) errors.push(`Expected one main landmark, found ${state.mains}`);
    if (state.scrollWidth > state.clientWidth + 2) errors.push(`Horizontal overflow ${state.scrollWidth}/${state.clientWidth}`);
    if (/\b(?:Compass|Lens)\b|Decision Frame|The Decision(?! Brief)|\bGreenSquare\b(?! AI)/.test(state.body)) errors.push('Retired product name visible');

    /* The approved launch system gives every public page one centred opening
       composition before editorial material returns to a reading alignment.
       Centring is measured per rendered line, not on the h1 box: a left aligned
       heading that happens to fill its container has a perfectly centred box, so the
       box test on its own passes exactly the case worth catching. */
    const CENTRED_HERO = new Set(routes);
    const FOREST_CLOSE = new Set(['/', '/product/', '/free/', '/about/']);
    const composition = await page.evaluate((isMarketing) => {
      const parse = (value) => {
        const match = value.match(/rgba?\(([^)]+)\)/);
        if (!match) return null;
        const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
        return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
      };
      const name = (el) => {
        if (el.id) return `#${el.id}`;
        const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean)[0];
        return el.tagName.toLowerCase() + (cls ? `.${cls}` : '');
      };

      const h1 = document.querySelector('h1');
      const box = h1.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(h1);
      const lines = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
      const mid = document.documentElement.clientWidth / 2;
      const offCentre = Math.max(
        Math.abs((box.left + box.right) / 2 - mid),
        ...lines.map((r) => Math.abs((r.left - box.left) - (box.right - r.right)) / 2),
      );
      /* Ground census. White is the canvas; forest is allowed on the single conversion
         block a marketing page closes with. Nav and footer sit outside <main> and are
         never visited. A translucent or image ground counts as its own value, so a tint
         cannot hide behind the contrast sweep's skip rule. */
      const main = document.querySelector('main');
      const ground = (el) => {
        for (let n = el; n && n !== main.parentElement; n = n.parentElement) {
          const st = getComputedStyle(n);
          if (st.backgroundImage !== 'none') return `image@${name(n)}`;
          const bg = parse(st.backgroundColor);
          if (bg && bg.a === 1) return `${bg.r},${bg.g},${bg.b}`;
          if (bg && bg.a > 0) return `translucent@${name(n)}`;
        }
        const body = parse(getComputedStyle(document.body).backgroundColor);
        return body && body.a === 1 ? `${body.r},${body.g},${body.b}` : '255,255,255';
      };
      const grounds = new Map();
      for (const sec of main.querySelectorAll('section')) {
        if (sec.closest('[data-product-demo]')) continue;
        const g = ground(sec);
        if (!grounds.has(g)) grounds.set(g, name(sec));
      }
      return { offCentre: Math.round(offCentre * 100) / 100, isMarketing,
               grounds: [...grounds.entries()] };
    }, CENTRED_HERO.has(route));

    if (composition.isMarketing) {
      if (composition.offCentre > 2) errors.push(`Marketing h1 off centre by ${composition.offCentre}px`);
    }
    const WHITE = '255,255,255';
    const FOREST = '19,63,38';
    const stray = composition.grounds.filter(([g]) => g !== WHITE && g !== FOREST);
    if (stray.length) errors.push(`Ground census: ${stray.map(([g, sec]) => `${sec} ${g}`).join(' | ')}`);
    const forest = composition.grounds.filter(([g]) => g === FOREST);
    if (forest.length && !FOREST_CLOSE.has(route)) errors.push('Forest ground on a page that closes white');
    if (forest.length > 1) errors.push(`${forest.length} forest grounds; the close is the only one`);


    if (route === '/') {
      if (await page.getByRole('link', { name: /Try Frame Free/i }).count() < 1) errors.push('Primary Free CTA missing');
      if (await page.locator('[data-frame-process]').count() !== 1) errors.push('Decision process missing');
      const processDescription = await page.locator('[data-frame-process]').evaluate(root => document.getElementById(root.getAttribute('aria-describedby'))?.textContent || '');
      for (const phrase of ['Should we expand?', 'without overloading the business?', 'Demand durability remains uncertain', 'human decision']) {
        if (!processDescription.toLowerCase().includes(phrase.toLowerCase())) errors.push(`Accessible decision meaning missing: ${phrase}`);
      }
    }
    if (route === '/free/') {
      if (await page.getByLabel('Email address').count() !== 1) errors.push('Email input missing');
      if (await page.getByRole('button', { name: /Email me Frame Free/i }).count() !== 1) errors.push('Free submit action missing');
    }
    if (route === '/product/') {
      const tabs = page.getByRole('tab');
      if (await tabs.count() !== 3) errors.push('Product demo tabs missing');
      else {
        await page.getByRole('tab', { name: /Decision Brief/i }).click();
        if (!await page.getByRole('tabpanel', { name: /Decision Brief/i }).isVisible()) errors.push('Decision Brief panel did not activate');
        if (!/demo=brief/.test(page.url())) errors.push('Product demo state not deep-linked');
        await page.getByRole('tab', { name: /Decision Brief/i }).press('Home');
        if (await page.locator('[data-demo-tab="context"]').getAttribute('aria-selected') !== 'true') errors.push('Product demo keyboard navigation failed');
      }
      if (!/Frame Pro/i.test(state.body) || !/in development/i.test(state.body)) errors.push('Pro boundary missing');
    }
    if (route === '/research/' && !/not a test of the current Frame Free plan or the future Frame Pro plan/i.test(state.body)) errors.push('Research plan boundary missing');

    if (viewport.name === 'mobile') {
      // Use the stable control ID because the accessible name intentionally
      // changes between "Open menu" and "Close menu" as state changes.
      const menu = page.locator('#v-nav-toggle');
      if (await menu.count() !== 1) errors.push('Mobile menu button missing');
      else {
        await menu.click();
        if (await menu.getAttribute('aria-expanded') !== 'true') errors.push('Mobile menu did not open');
        await menu.press('Escape');
        if (await menu.getAttribute('aria-expanded') !== 'false') errors.push('Mobile menu did not close on Escape');
      }
    }

    const axe = await new AxeBuilder({ page }).analyze();
    const serious = axe.violations.filter((item) => ['critical', 'serious'].includes(item.impact ?? ''));
    if (serious.length) errors.push(`Axe: ${serious.map((item) => item.id).join(', ')}`);
    /* Axe cannot always resolve a background it did not paint itself and returns those
       cases as `incomplete` rather than a violation. A white link on a white card scored
       1:1 in production and passed this gate for exactly that reason.
       These are recorded, not failed. Axe reported the homepage hero CTA as "overlapped
       by another element" at tablet and mobile, and it is not: elementsFromPoint at the
       button's centre returns the button, and the hero visual starts 57px below it.
       Failing on that would train the reader to ignore the gate. The sweep below resolves
       backgrounds by ancestor walk and is the authority for contrast. */
    const unresolved = axe.incomplete
      .filter((item) => item.id === 'color-contrast')
      .flatMap((item) => item.nodes.map((node) => node.target.join(' ')));

    const contrastFailures = await page.evaluate(() => {
      const parse = (value) => {
        const match = value.match(/rgba?\(([^)]+)\)/);
        if (!match) return null;
        const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
        return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
      };
      const luminance = ({ r, g, b }) => {
        const channel = (v) => { const n = v / 255; return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      };
      const ratio = (fg, bg) => {
        const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
        return (hi + 0.05) / (lo + 0.05);
      };
      const over = (fg, bg) => ({
        r: fg.a * fg.r + (1 - fg.a) * bg.r,
        g: fg.a * fg.g + (1 - fg.a) * bg.g,
        b: fg.a * fg.b + (1 - fg.a) * bg.b,
      });
      /* The nearest opaque ancestor background is what the text actually sits on.
         An image or a translucent layer in the chain is not worth approximating, so
         those elements are skipped rather than guessed at. */
      const backdrop = (el) => {
        for (let node = el; node instanceof Element; node = node.parentElement) {
          const style = getComputedStyle(node);
          if (style.backgroundImage !== 'none') return null;
          const bg = parse(style.backgroundColor);
          if (bg && bg.a === 1) return bg;
          if (bg && bg.a > 0) return null;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
      };
      const name = (el) => {
        if (el.id) return `#${el.id}`;
        const classes = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
        return el.tagName.toLowerCase() + classes.map((c) => `.${c}`).join('');
      };

      const found = [];
      for (const el of document.querySelectorAll('body *')) {
        if (el.closest('svg')) continue;
        const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
        if (!ownText) continue;
        const style = getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        const colour = parse(style.color);
        const bg = backdrop(el);
        if (!colour || !bg) continue;
        const size = parseFloat(style.fontSize);
        const weight = Number(style.fontWeight) || 400;
        const required = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
        const measured = ratio(colour.a < 1 ? over(colour, bg) : colour, bg);
        if (measured < required) {
          found.push({ selector: name(el), ratio: Math.round(measured * 100) / 100, required, text: el.textContent.trim().slice(0, 40) });
        }
      }
      const seen = new Set();
      return found.filter((item) => (seen.has(item.selector) ? false : seen.add(item.selector)));
    });
    if (contrastFailures.length) {
      errors.push(`Contrast: ${contrastFailures.map((c) => `${c.selector} ${c.ratio}:1 needs ${c.required}:1 ("${c.text}")`).join(' | ')}`);
    }

    const safeRoute = route === '/' ? 'home' : route.replaceAll('/', '-').replace(/^-|-$/g, '');
    const screenshot = path.join(output, `${safeRoute}-${viewport.name}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });
    const passed = errors.length === 0;
    if (!passed) failed = true;
    results.push({ route, viewport: viewport.name, status, errors, warnings: unresolved, screenshot, passed });
    await page.close();
  }
  await context.close();
}

const reduced = await browser.newContext({ viewport: viewports[0], reducedMotion: 'reduce' });
const reducedPage = await reduced.newPage();
await reducedPage.goto(base + '/', { waitUntil: 'domcontentloaded' });
const reducedState = await reducedPage.evaluate(() => {
  const root = document.querySelector('[data-frame-process]');
  return {
    state: root?.getAttribute('data-state'),
    fields: root?.querySelectorAll('[data-field]').length,
    text: root?.textContent,
    runningAnimations: root?.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length,
  };
});
const reducedPassed = reducedState.state === 'decision' && reducedState.fields === 4 && reducedState.runningAnimations === 0 && reducedState.text.includes('You make the call');
if (!reducedPassed) failed = true;
results.push({ route: '/', viewport: 'desktop-reduced-motion', reducedState, passed: reducedPassed });
await reduced.close();

await browser.close();
fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify({ passed: !failed, results }, null, 2));
console.log(JSON.stringify({ passed: !failed, results }, null, 2));
if (failed) process.exit(1);
