import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4321';
const output = process.env.QA_OUTPUT || '_qa/frame-process';
const states = ['situation', 'question', 'reframe', 'options', 'comparison', 'uncertainty', 'decision'];
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
for (const width of [1440, 820, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  const page = await context.newPage();
  for (const [index, state] of states.entries()) {
    const errors = [];
    await page.goto(`${base}/frame-storyboard/${state}/`);
    await page.evaluate(() => document.fonts.ready);
    const figure = page.locator('[data-frame-process]');
    const geometry = await figure.evaluate(root => {
      const text = [...root.querySelectorAll('p, span, strong, small, h2, h3, li')].filter(el => el.getBoundingClientRect().width > 1);
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        minType: Math.min(...text.map(el => parseFloat(getComputedStyle(el).fontSize))),
        font: getComputedStyle(root.querySelector('.fp-intro p')).fontFamily,
        options: root.querySelectorAll('[data-option]').length,
        supported: root.querySelectorAll('.is-supported').length,
        fields: root.querySelectorAll('[data-field]').length,
      };
    });
    if (geometry.overflow) errors.push('Horizontal overflow');
    if (geometry.minType < 14) errors.push(`Text too small: ${geometry.minType}`);
    if (index >= 3 && geometry.options !== 4) errors.push('Four alternatives required');
    if (index < 5 && geometry.supported) errors.push('Premature option preference');
    if (index === 6 && geometry.fields !== 4) errors.push('Incomplete decision structure');
    const axe = await new AxeBuilder({ page }).include('[data-frame-process]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    errors.push(...axe.violations.map(v => `${v.id}: ${v.help}`));
    await figure.screenshot({ path: `${output}/${state}-${width}.png` });
    results.push({ state, width, ...geometry, errors, axeIncomplete: axe.incomplete.map(v => v.id) });
  }
  await context.close();
}
const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', javaScriptEnabled: false });
await reduced.goto(base);
const staticText = await reduced.locator('[data-frame-process]').innerText();
const completeStatic = ['Should we expand?', 'without overloading', 'Capacity', 'Conditions', 'You make the call'].every(t => staticText.includes(t));
results.push({ state: 'no-js-reduced-motion', width: 390, errors: completeStatic ? [] : ['Static meaning incomplete'] });
await browser.close();
const report = { passed: results.every(r => !r.errors.length), base, results };
await fs.writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
