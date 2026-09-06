import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:4332';
const output = process.env.QA_OUTPUT || '_qa/frame-motion';
await fs.mkdir(output, { recursive: true });
const results = [];
const engines = process.env.QA_BROWSER ? { [process.env.QA_BROWSER]: { chromium, firefox, webkit }[process.env.QA_BROWSER] } : { chromium, firefox, webkit };
const check = (value, message, errors) => { if (!value) errors.push(message); };
const progress = page => page.locator('[data-frame-process]').getAttribute('data-motion-progress').then(Number);
async function enter(page) {
  await page.goto(base); await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-motion-stage]').evaluate(el => scrollTo(0, el.getBoundingClientRect().top + scrollY - 80));
  await page.waitForSelector('[data-motion-ready="true"]');
}
async function seek(page, seconds) {
  await page.locator('[data-motion-travel]').evaluate((el, t) => scrollTo(0, el.getBoundingClientRect().top + scrollY - 80 + 1100 * t / 12), seconds);
  await page.waitForTimeout(450);
}
async function composition(page, errors) {
 const state = await page.locator('[data-motion-scene]').evaluate(scene => {
   const visible = el => { for (let n = el; n && n !== scene.parentElement; n = n.parentElement) { const s = getComputedStyle(n); if (s.visibility === 'hidden' || s.display === 'none' || Number(s.opacity) < .9) return false; } return true; };
   const text = [...scene.querySelectorAll('span,strong,p,h3,small,li')].filter(visible);
   const sr = scene.getBoundingClientRect();
   const outside = text.filter(el => { const r = el.getBoundingClientRect(); return r.left < sr.left - 1 || r.right > sr.right + 1 || r.bottom > sr.bottom + 1; }).map(el => el.textContent);
   return { overflow: document.documentElement.scrollWidth > innerWidth + 1, minType: Math.min(...text.map(el => parseFloat(getComputedStyle(el).fontSize))), outside };
 });
 check(!state.overflow, 'Horizontal overflow', errors); check(state.minType >= 15, 'Functional type below 15px', errors); check(!state.outside.length, `Text outside canvas: ${state.outside}`, errors);
 return state;
}
for (const [name, engine] of Object.entries(engines)) {
 const browser = await engine.launch();
 for (const width of [1440, 390]) {
  const errors = [];
  const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 } });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  await enter(page);
  if (width === 1440) {
   await seek(page, 4.75);
   const borders = await page.locator('[data-motion-option]').evaluateAll(els => els.map(el => getComputedStyle(el).borderColor + getComputedStyle(el).borderWidth));
   check(new Set(borders).size === 1, 'Option preferred before comparison', errors);
   await seek(page, 8.8);
  } else {
   await page.waitForFunction(() => Number(document.querySelector('[data-frame-process]').dataset.motionProgress) >= 8.6 / 12);
   await page.locator('[data-motion-play]').press('Enter');
   const paused = await progress(page); await page.waitForTimeout(220);
   check(Math.abs(await progress(page) - paused) < .002, 'Keyboard pause failed', errors);
  }
  check(await page.locator('[data-motion-option="stages"] [data-evidence-after]').isVisible(), 'Conditional support missing', errors);
  await composition(page, errors);
  await page.locator('[data-motion-stage]').screenshot({ path: `${output}/${name}-supported-${width}.png` });
  if (width === 1440) await seek(page, 12);
  else { await page.locator('[data-motion-play]').press('Enter'); await page.waitForFunction(() => Number(document.querySelector('[data-frame-process]').dataset.motionProgress) >= .999); }
  check(await page.locator('[data-motion-human]').isVisible(), 'Human decision missing', errors);
  const geometry = await composition(page, errors);
  await page.locator('[data-motion-stage]').screenshot({ path: `${output}/${name}-decision-${width}.png` });
  const axe = await new AxeBuilder({ page }).include('[data-frame-process]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  errors.push(...axe.violations.map(v => `axe: ${v.id}`));
  if (width === 1440) {
   await seek(page, 1.5);
   check(await page.locator('[data-question-old]').isVisible(), 'Scroll reversal did not restore initial question', errors);
   check(!await page.locator('[data-evidence-after]').first().isVisible(), 'Stale evidence after reversing', errors);
   await seek(page, 12); await seek(page, 0); await seek(page, 8.8);
   check(await page.locator('[data-frame-process]').getAttribute('data-supported') === 'true', 'Fast scrolling lost final support', errors);
   for (const w of [820,390,1440,820,1440]) { await page.setViewportSize({width:w,height:1000}); await page.waitForTimeout(200); }
   await seek(page, 12);
   check(await page.locator('[data-motion-human]').isVisible(), 'Resize lost the final state', errors);
  } else {
   await page.locator('[data-motion-play]').press('Enter'); await page.waitForTimeout(200);
   check(await progress(page) < .1, 'Replay did not restart', errors);
   await page.evaluate(() => scrollTo(0,0)); await page.waitForTimeout(180);
   const offscreen = await progress(page); await page.waitForTimeout(220);
   check(Math.abs(await progress(page) - offscreen) < .002, 'Autoplay continues offscreen', errors);
  }
  await page.locator('[data-motion-read]').press('Enter');
  const text = await page.locator('.fp-static').innerText();
  check(['Should we expand?', 'without overloading', 'Demand durability remains uncertain', 'You make the call'].every(t => text.includes(t)), 'Readable fallback incomplete', errors);
  check(await page.locator('[data-frame-process]').getAttribute('data-motion-ready') === null, 'Read mode did not dispose timeline', errors);
  await page.locator('[data-motion-read]').press('Enter');
  await page.waitForSelector('[data-motion-ready="true"]');
  await page.evaluate(() => document.dispatchEvent(new Event('astro:before-swap')));
  check(await page.locator('[data-frame-process]').getAttribute('data-motion-ready') === null, 'Route teardown did not dispose', errors);
  await page.waitForTimeout(200);
  check(await page.locator('[data-frame-process]').getAttribute('data-motion-progress') === null, 'Timeline still updating after teardown', errors);
  await page.evaluate(() => { document.dispatchEvent(new Event('astro:page-load')); document.dispatchEvent(new Event('astro:page-load')); });
  await page.waitForSelector('[data-motion-ready="true"]');
  check(await page.locator('[data-motion-option]').count() === 4, 'Duplicate option nodes after repeated mount', errors);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(120);
  check(await page.locator('.fp-static').isVisible(), 'Live reduced-motion change failed', errors);
  check(await page.locator('[data-frame-process]').getAttribute('data-motion-ready') === null, 'Reduced motion retained timeline', errors);
  results.push({ browser:name,width,geometry,errors }); await context.close();
 }
 // Static/reduced mode must not request the animation engine.
 for (const mode of ['reduced','no-js','import-failure']) {
  const errors=[];const requested=[];
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'});
  page.on('request',r=>{if(/frame-process-timeline/.test(r.url())) requested.push(r.url());});
  if(mode==='import-failure') await page.route('**/*frame-process-timeline*',route=>route.abort());
  await page.goto(base); await page.waitForTimeout(400);
  if(mode==='import-failure') await page.waitForSelector('[data-show-static]');
  check(await page.locator('.fp-static').isVisible(),`${mode} static fallback missing`,errors);
  check((await page.locator('.fp-static').innerText()).includes('You make the call'),`${mode} meaning missing`,errors);
  if(mode!=='import-failure') check(requested.length===0,`${mode} requested GSAP`,errors);
  results.push({browser:name,mode,errors});await page.close();
 }
 await browser.close();
}
const report={passed:results.every(r=>!r.errors.length),base,results};
await fs.writeFile(`${output}/report.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed) process.exitCode=1;
