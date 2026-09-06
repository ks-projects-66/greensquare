import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameProcess as story } from '../data/frame-process';

gsap.registerPlugin(ScrollTrigger);
const DURATION = 12;
const marks = [0, 1.1, 2.2, 4.15, 5, 6.25, 9.7];

/** One narrative, recomposed geometry. No element is replaced during playback. */
export function mountFrameMotion(root: HTMLElement) {
  const mm = gsap.matchMedia();
  let progress = 0;
  let manualPause = false;
  let disposed = false;
  const abort = new AbortController();
  const scene = root.querySelector<HTMLElement>('[data-motion-scene]')!;
  const stage = root.querySelector<HTMLElement>('[data-motion-stage]')!;
  const travel = root.querySelector<HTMLElement>('[data-motion-travel]')!;
  const play = root.querySelector<HTMLButtonElement>('[data-motion-play]')!;
  const caption = root.querySelector<HTMLElement>('[data-motion-caption]')!;
  let current: gsap.core.Timeline | undefined;
  let trigger: ScrollTrigger | undefined;
  let compactMode = false;
  let inView = false;

  function playIfVisible() {
    if (!current || !compactMode || manualPause || document.hidden || !inView) return;
    if (current.progress() < 1) current.play();
  }
  play.addEventListener('click', () => {
    if (!current) return;
    if (current.progress() >= 1) { manualPause = false; current.restart(); }
    else if (current.paused()) { manualPause = false; current.play(); }
    else { manualPause = true; current.pause(); }
    play.textContent = current.paused() ? 'Play explanation' : 'Pause explanation';
  }, { signal: abort.signal });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && compactMode) current?.pause();
    else playIfVisible();
  }, { signal: abort.signal });

  mm.add({ all: '(min-width: 0px)', desktop: '(min-width: 1000px) and (min-height: 720px)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
    if (context.conditions!.reduced) return;
    const desktop = Boolean(context.conditions!.desktop);
    compactMode = !desktop;
    let width = 0;
    let rebuildTimer: ReturnType<typeof setTimeout>;
    let animationContext: gsap.Context | undefined;
    const visibility = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= .65;
      if (!inView && !desktop) current?.pause();
      else playIfVisible();
    }, { threshold: .65 });

    function build() {
      progress = current?.progress() ?? progress;
      animationContext?.revert();
      animationContext = gsap.context(() => {
        const W = scene.clientWidth;
        width = W;
        const compact = !desktop;
        const small = W < 560;
        const q = <T extends Element = HTMLElement>(s: string) => scene.querySelector<T>(s)!;
        const all = (s: string) => gsap.utils.toArray<HTMLElement>(scene.querySelectorAll(s));
        const ink = getComputedStyle(root).getPropertyValue('--v-ink-soft').trim();
        const green = getComputedStyle(root).getPropertyValue('--v-green').trim();
        const line = getComputedStyle(root).getPropertyValue('--v-line').trim();
        const paper = getComputedStyle(root).getPropertyValue('--v-paper').trim();
        const inputs = all('[data-motion-input]');
        const options = all('[data-motion-option]');
        const question = q('[data-motion-question]');
        const boundary = q<SVGPathElement>('[data-question-boundary]');
        const pressure = q('[data-motion-pressure]');
        const criteria = q('[data-motion-criteria]');
        const loop = q('[data-motion-loop]');
        const outcome = q('[data-motion-outcome]');
        const routes = q('[data-motion-routes]');
        const gap = compact ? 16 : 24;
        const cols = compact ? 2 : 4;
        const nodeW = (W - gap * (cols - 1)) / cols;
        const inputH = small ? 158 : 138;
        const inputY = (i: number) => compact ? Math.floor(i / 2) * (inputH + gap) : 40 + [0, 36, 12, 60][i];
        const inputX = (i: number) => (i % cols) * (nodeW + gap);
        const initialW = compact ? W : Math.min(520, W * .5);
        const initialY = compact ? inputH * 2 + gap + 62 : 300;
        const finalQW = compact ? W : Math.min(720, W);
        const finalQH = compact ? 118 : 128;
        const criteriaY = finalQH + 18;
        const criteriaH = compact ? 82 : 52;
        const optionsY = criteriaY + criteriaH + 46;
        const optionH = compact ? 216 : 194;
        const comparisonY = compact ? 110 : optionsY;
        const finalOptionY = compact ? 140 : 206;
        const loopY = compact ? comparisonY + optionH * 2 + gap + 30 : 464;
        const loopW = compact ? W - 32 : Math.min(440, W * .42);
        const loopX = compact ? 16 : W * .48;
        const largeQY = compact ? 276 : 186;
        const largeQH = compact ? 200 : 200;
        const pressureW = compact ? W : W * .34;
        const oldX = compact ? 0 : W * .46;
        const oldY = compact ? 144 : 0;
        const oldW = compact ? W : W * .54;
        const rect = (w: number, h: number, open = false) => `M0 0 H${w} V${h} H0 V${open ? h * .5 : 0}`;
        const box = (el: gsap.TweenTarget, x: number, y: number, w: number, h?: number) => gsap.set(el, { position: 'absolute', top: 0, left: 0, x, y, width: w, ...(h ? { height: h } : {}) });
        const route = (name: string, d: string) => { const el = q<SVGPathElement>(`[data-route="${name}"]`); el.setAttribute('d', d); const length = el.getTotalLength(); gsap.set(el, { strokeDasharray: `${length} ${length}`, strokeDashoffset: length, autoAlpha: 0 }); return el; };
        const draw = (el: SVGPathElement, at: number, duration = .45) => { tl.set(el, { autoAlpha: 1 }, at); tl.to(el, { strokeDashoffset: 0, duration, ease: 'power1.inOut' }, at); };

        inputs.forEach((el, i) => box(el, inputX(i), inputY(i), nodeW, inputH));
        box(question, (W - initialW) / 2, initialY, initialW, 128);
        boundary.setAttribute('d', rect(initialW, 128));
        box(pressure, 0, 0, pressureW, compact ? 128 : 148);
        box(criteria, 0, criteriaY, W, criteriaH);
        options.forEach((el, i) => box(el, inputX(i), optionsY + (compact ? Math.floor(i / 2) * (optionH + gap) : 0), nodeW, 88));
        box(loop, loopX, loopY, loopW, 104);
        box(outcome, 0, compact ? 336 : 365, W);
        const inputCollector = compact
          ? `M${nodeW / 2} ${inputH} V${inputH + 8} H${W / 2 - 4} V${initialY - 28} M${W - nodeW / 2} ${inputH} V${inputH + 8} H${W / 2 + 4} V${initialY - 28} M${nodeW / 2} ${inputH * 2 + gap} V${initialY - 28} H${W - nodeW / 2} V${inputH * 2 + gap} M${W / 2} ${initialY - 28} V${initialY}`
          : inputs.map((_, i) => `M${inputX(i) + nodeW / 2} ${inputY(i) + inputH} V266 H${W / 2} V${initialY}`).join(' ');
        const rInputs = route('inputs', inputCollector);
        const rPressure = route('pressure', compact ? `M${W / 2} 128 V${largeQY}` : `M${pressureW / 2} 148 V165 H${W / 2} V${largeQY}`);
        const branch = options.map((_, i) => {
          const x = inputX(i) + nodeW / 2;
          const y = optionsY + (compact ? Math.floor(i / 2) * (optionH + gap) : 0);
          // The central gutter connects both rows directly to the question.
          return compact && i >= 2 ? `M${W / 2} ${finalQH} V${y - 8} H${x} V${y}` : `M${W / 2} ${finalQH} V${optionsY - 20} H${x} V${y}`;
        }).join(' ');
        const rOptions = route('options', branch);
        const criterionBottom = compact ? criteriaH : criteriaY + criteriaH;
        const rCriteria = route('criteria', `M${W * .5} ${criterionBottom} V${comparisonY - 16} H${nodeW / 2} M${W * .5} ${comparisonY - 16} H${W - nodeW / 2}`);
        const rOut = route('outbound', compact
          ? `M${nodeW / 2} ${comparisonY + optionH} V${comparisonY + optionH + 8} H${W / 2 - 4} V${loopY - 12} H${loopX + 24} V${loopY}`
          : `M${nodeW / 2} ${comparisonY + optionH} V${comparisonY + optionH + 8} H4 V${loopY + 52} H${loopX}`);
        const rIn = route('inbound', compact
          ? `M${loopX + loopW - 24} ${loopY} V${loopY - 20} H${W / 2 + 4} V${criterionBottom + 8} H${W / 2} V${criterionBottom}`
          : `M${loopX + loopW} ${loopY + 52} H${W - 4} V${criterionBottom - 8} H${W / 2}`);
        const selectedX = nodeW + gap + nodeW / 2;
        const rResolve = route('resolution', compact
          ? `M${selectedX} ${finalOptionY + 80} V${finalOptionY + 86} H${W / 2} V320 H${nodeW / 2} V336`
          : `M${selectedX} ${finalOptionY + 80} V340 H${nodeW / 2} V365`);
        gsap.set(routes, { autoAlpha: 1 });
        gsap.set([question, pressure, criteria, loop, outcome, ...options, q('[data-question-new]'), q('[data-loop-test]'), q('[data-loop-finding]'), ...all('[data-option-evidence]'), ...all('[data-evidence-after]')], { autoAlpha: 0 });
        gsap.set(q('[data-question-old]'), { autoAlpha: 1 });
        gsap.set(inputs, { autoAlpha: 1 });
        gsap.set(boundary, { stroke: ink, strokeWidth: 1 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' }, onUpdate() {
          progress = tl.progress();
          const time = tl.time();
          const index = marks.reduce((last, mark, i) => time >= mark ? i : last, 0);
          root.dataset.state = story.states[index].id;
          root.dataset.motionProgress = progress.toFixed(4);
          root.dataset.supported = String(time >= 8.1);
          caption.textContent = story.states[index].caption;
          if (compact) play.textContent = progress >= 1 ? 'Replay explanation' : tl.paused() ? 'Play explanation' : 'Pause explanation';
        } });
        current = tl;
        tl.to({}, { duration: DURATION }, 0);
        story.states.forEach((s, i) => tl.addLabel(s.id, marks[i]));
        tl.fromTo(inputs, { y: i => inputY(i) + 12 }, { y: i => inputY(i), duration: .4, stagger: .12 }, 0);
        draw(rInputs, .72);
        tl.to(question, { autoAlpha: 1, duration: .3 }, .95);
        tl.to(inputs, { autoAlpha: 0, duration: .28, stagger: .035 }, 1.65);
        tl.to(rInputs, { autoAlpha: 0, duration: .25 }, 1.65);
        tl.to(question, { x: oldX, y: oldY, width: oldW, height: compact ? 108 : 148, duration: .55 }, 1.8);
        tl.to(boundary, { attr: { d: rect(oldW, compact ? 108 : 148) }, duration: .55 }, 1.8);
        tl.fromTo(pressure, { x: -12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .45 }, 1.85);
        draw(rPressure, 2.1);
        tl.to(boundary, { attr: { d: rect(oldW, compact ? 108 : 148, true) }, stroke: green, strokeWidth: 2, duration: .35 }, 2.2);
        tl.to(q('[data-question-old]'), { autoAlpha: 0, y: -8, duration: .3 }, 2.55);
        tl.to(question, { x: 0, y: largeQY, width: W, height: largeQH, duration: .65 }, 2.6);
        tl.to(boundary, { attr: { d: rect(W, largeQH) }, duration: .65 }, 2.6);
        tl.fromTo(q('[data-question-new]'), { autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: .65 }, 2.75);
        tl.to(q('[data-question-new] p'), { fontSize: compact ? '28px' : '42px', duration: .4 }, 2.75);
        tl.to([pressure, rPressure], { autoAlpha: 0, duration: .35 }, 3.65);
        tl.to(question, { x: (W - finalQW) / 2, y: 0, width: finalQW, height: finalQH, duration: .6 }, 3.8);
        tl.to(boundary, { attr: { d: rect(finalQW, finalQH) }, duration: .6 }, 3.8);
        tl.to(q('[data-question-new] p'), { fontSize: compact ? '22px' : '28px', duration: .6 }, 3.8);
        tl.to(q('[data-question-new] span'), { autoAlpha: 0, height: 0, duration: .25 }, 3.8);
        tl.to(q('[data-question-new] p'), { marginTop: 0, duration: .3 }, 3.8);
        tl.to(q('[data-question-new] em'), { backgroundColor: paper, duration: .3 }, 4.2);
        draw(rOptions, 4.15, .55);
        tl.to(options, { autoAlpha: 1, duration: .3, stagger: .07 }, 4.3);
        tl.fromTo(criteria, { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: .4 }, 4.9);
        if (compact) {
          tl.to(question, { autoAlpha: 0, duration: .3 }, 4.9);
          tl.to(criteria, { y: 0, duration: .4 }, 4.9);
          tl.to(rOptions, { autoAlpha: 0, duration: .25 }, 4.9);
          options.forEach((el, i) => tl.to(el, { y: comparisonY + Math.floor(i / 2) * (optionH + gap), duration: .4 }, 4.9));
          tl.to(question, { autoAlpha: 1, duration: .35 }, 9.7);
        }
        tl.to(options, { height: optionH, duration: .35 }, 5.1);
        tl.to(all('[data-option-evidence]'), { autoAlpha: 1, duration: .35, stagger: .07 }, 5.25);
        draw(rCriteria, 5.35, .5);
        tl.to(q('[data-criterion="Capacity"]'), { borderBottomColor: green, color: green, fontWeight: 600, duration: .25 }, 5.35);
        draw(rOut, 6.1, .55);
        tl.fromTo(loop, { autoAlpha: 0, y: loopY - 16 }, { autoAlpha: 1, y: loopY, duration: .45 }, 6.4);
        tl.to(q('[data-loop-test]'), { autoAlpha: 1, duration: .25 }, 6.9);
        tl.to(q('[data-loop-finding]'), { autoAlpha: 1, duration: .35 }, 7.35);
        tl.to(loop, { borderStyle: 'solid', borderColor: green, duration: .01 }, 7.65);
        draw(rIn, 7.6, .6);
        tl.to(all('[data-evidence-before]'), { autoAlpha: 0, duration: .2 }, 8);
        tl.to(all('[data-evidence-after]'), { autoAlpha: 1, duration: .3 }, 8.05);
        tl.to(q('[data-motion-option="stages"]'), { borderColor: green, borderWidth: 2, duration: .3 }, 8.1);
        tl.to(q('[data-motion-option="stages"] [data-evidence-after]'), { color: green, fontWeight: 600, duration: .3 }, 8.1);
        tl.to([rOut, rIn, rOptions, rCriteria, loop, criteria, ...all('[data-option-evidence]')], { autoAlpha: 0, duration: .35 }, 9.4);
        options.forEach((el, i) => tl.to(el, { y: finalOptionY + (compact ? Math.floor(i / 2) * 92 : 0), height: 80, borderColor: i === 1 ? green : line, duration: .5 }, 9.45));
        tl.to(outcome, { autoAlpha: 1, duration: .35 }, 9.85);
        tl.fromTo(all('[data-motion-field]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .35, stagger: .1 }, 9.85);
        draw(rResolve, 9.7, .45);
        tl.fromTo(q('[data-motion-human]'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: .4 }, 10.7);

        tl.progress(progress);
        if (desktop) {
          trigger = ScrollTrigger.create({ id: `${root.id}-process`, trigger: travel, start: 'top 80px', end: '+=1100', scrub: .3, animation: tl, invalidateOnRefresh: true });
        } else {
          playIfVisible();
        }
        root.dataset.motionReady = 'true';
        root.dataset.motionMode = desktop ? 'scroll' : 'play';
      }, scene);
    }
    build();
    visibility.observe(stage);
    const resize = new ResizeObserver(() => {
      if (Math.abs(scene.clientWidth - width) < 1) return;
      clearTimeout(rebuildTimer);
      rebuildTimer = setTimeout(build, 120);
    });
    resize.observe(scene);
    return () => {
      visibility.disconnect(); resize.disconnect(); clearTimeout(rebuildTimer);
      progress = current?.progress() ?? progress;
      animationContext?.revert(); current = undefined; trigger = undefined;
    };
  });

  return () => {
    if (disposed) return;
    disposed = true;
    abort.abort(); mm.revert(); trigger?.kill();
    delete root.dataset.motionReady; delete root.dataset.motionMode; delete root.dataset.motionProgress; delete root.dataset.supported;
  };
}
