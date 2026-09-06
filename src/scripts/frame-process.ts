/** Viewport-aware loader. The GSAP bundle is never requested by static storyboards. */
export function observeFrameProcesses() {
  const mounted = new Map<HTMLElement, () => void>();
  const events = new AbortController();
  function scan() {
    for (const [root, dispose] of mounted) if (!root.isConnected) { dispose(); mounted.delete(root); }
    document.querySelectorAll<HTMLElement>('[data-frame-process][data-animated]').forEach(root => {
      if (mounted.has(root)) return;
      let disposed = false;
      let ready = false;
      let loading = false;
      let stopMotion: (() => void) | undefined;
      const local = new AbortController();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
      const read = root.querySelector<HTMLButtonElement>('[data-motion-read]')!;
      const observer = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { ready = true; void load(); }
      }, { rootMargin: '500px 0px' });
      async function load() {
        if (disposed || loading || stopMotion || !ready || reduce.matches || root.hasAttribute('data-show-static')) return;
        loading = true;
        try {
          const { mountFrameMotion } = await import('./frame-process-timeline');
          if (!disposed && !reduce.matches && !root.hasAttribute('data-show-static')) stopMotion = mountFrameMotion(root);
        } catch (error) {
          if (!disposed) {
            root.setAttribute('data-show-static', '');
            read.hidden = true;
            root.dataset.state = 'decision';
            console.error('Frame explanation uses its static fallback.', error);
          }
        } finally { loading = false; }
      }
      read.addEventListener('click', () => {
        const reading = !root.hasAttribute('data-show-static');
        root.toggleAttribute('data-show-static', reading);
        read.setAttribute('aria-expanded', String(reading));
        read.textContent = reading ? 'Return to the animation' : 'Read the full explanation';
        if (reading) { stopMotion?.(); stopMotion = undefined; root.dataset.state = 'decision'; }
        else void load();
      }, { signal: local.signal });
      reduce.addEventListener('change', () => {
        if (reduce.matches) { stopMotion?.(); stopMotion = undefined; root.dataset.state = 'decision'; }
        else void load();
      }, { signal: local.signal });
      observer.observe(root);
      mounted.set(root, () => { disposed = true; observer.disconnect(); local.abort(); stopMotion?.(); });
    });
  }
  function clear() { mounted.forEach(dispose => dispose()); mounted.clear(); }
  document.addEventListener('astro:page-load', scan, { signal: events.signal });
  document.addEventListener('astro:before-swap', clear, { signal: events.signal });
  scan();
  return () => { events.abort(); clear(); };
}
