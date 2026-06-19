/* GreenSquare — shared site script. Written defensively: content can never
   get stuck invisible, and nothing here is required for the page to be usable. */
(function () {
  'use strict';

  /* ---- Scroll reveal ---- */
  var els = document.querySelectorAll('.reveal');
  function showAll() { els.forEach(function (el) { el.classList.add('in'); }); }
  if (!('IntersectionObserver' in window)) {
    showAll();
  } else {
    try {
      var fired = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { fired = true; entry.target.classList.add('in'); io.unobserve(entry.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el) { io.observe(el); });
      window.addEventListener('load', function () {
        setTimeout(function () { if (!fired) showAll(); }, 1200);
      });
    } catch (e) { showAll(); }
  }

  /* ---- Mobile nav toggle ---- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    header.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Respect reduced motion for autoplaying video ---- */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach(function (v) {
      v.removeAttribute('autoplay');
      v.setAttribute('controls', '');
      try { v.pause(); } catch (e) {}
    });
  }
})();
