/* For My Chinni — vanilla JS, no dependencies.
   Everything here is progressive enhancement: without it the whole story is still readable. */
(function () {
  'use strict';

  var root = document.documentElement;
  window.__storyReady = true; // tells the inline failsafe in <head> that we loaded

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Always begin at the top, behind the opening screen.
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) { /* ignore */ }
  window.scrollTo(0, 0);

  /* ---------- 1. Opening gate ---------- */
  var gate = $('#gate');
  var openBtn = $('#open-story');
  var inertTargets = $$('body > header, body > main, body > nav, body > .to-top');

  function setInert(on) {
    inertTargets.forEach(function (el) {
      if (on) { el.setAttribute('inert', ''); } else { el.removeAttribute('inert'); }
    });
  }

  function finishOpening() {
    root.classList.remove('gate-open');
    root.classList.add('is-open');
    setInert(false);
    if (gate) gate.classList.add('is-gone');
    var h1 = $('.hero__title');
    if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
  }

  if (gate && openBtn && root.classList.contains('js')) {
    setInert(true);
    // Let the entrance animations breathe, then focus the button for keyboard users.
    setTimeout(function () { try { openBtn.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }, reduceMotion ? 0 : 1800);

    openBtn.addEventListener('click', function () {
      if (gate.classList.contains('is-opening')) return;
      gate.classList.add('is-opening');
      root.classList.remove('gate-open');
      root.classList.add('is-open'); // starts the hero entrance
      window.scrollTo(0, 0);
      var wait = reduceMotion ? 50 : 2100;
      setTimeout(finishOpening, wait);
    });
  } else {
    root.classList.add('is-open');
    root.classList.remove('gate-open');
  }

  /* ---------- 2. Scroll reveals ---------- */
  var revealEls = $$('.reveal');
  var promiseLines = $$('.line');
  var finale = $('.finale');
  var milestones = $('.milestones');

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    promiseLines.forEach(function (el) { el.classList.add('is-lit'); });
    [finale, milestones].forEach(function (el) { if (el) el.classList.add('is-in'); });
  }

  if (!hasIO || reduceMotion) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
    [finale, milestones].forEach(function (el) { if (el) io.observe(el); });

    promiseLines.forEach(function (el, i) { el.style.transitionDelay = (i % 2 ? 0.08 : 0) + 's'; });
  }

  /* ---------- 3. 5.5 count-up (fixed milestone, no invented dates) ---------- */
  var num = $('.years__num');
  if (num && hasIO && !reduceMotion) {
    var target = parseFloat(num.getAttribute('data-count')) || 5.5;
    var counted = false;
    num.textContent = '0.0';
    var countIO = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || counted) return;
      counted = true;
      countIO.disconnect();
      var start = null, dur = 2200;
      (function tick(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        num.textContent = (target * eased).toFixed(1);
        if (t < 1) requestAnimationFrame(tick); else num.textContent = target.toFixed(1);
      })(performance.now());
    }, { threshold: 0.4 });
    countIO.observe(num);
  }

  /* ---------- 4. Scroll progress, chapter dots, back-to-top, hero drift ---------- */
  var bar = $('.progress');
  var toTop = $('#to-top');
  var nav = $('.chapters');
  var navLinks = $$('.chapters a');
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('data-target')); });
  var stage = $('.hero__stage');
  var ticking = false;
  var pending = (hasIO && !reduceMotion) ? promiseLines.concat(revealEls) : [];

  function update() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop;
    var vh = window.innerHeight;
    var max = Math.max(root.scrollHeight - vh, 1);
    if (bar) bar.style.setProperty('--p', Math.min(y / max, 1).toFixed(4));
    if (toTop) toTop.classList.toggle('is-visible', y > vh * 1.1);

    // current chapter = last section whose top is above the middle of the viewport
    var current = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i] && sections[i].getBoundingClientRect().top < vh * 0.5) current = i;
    }
    navLinks.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
    if (nav) {
      var dark = sections[current] && (sections[current].id === 'next-chapter' || sections[current].id === 'forever');
      nav.classList.toggle('on-dark', !!dark);
    }

    // Lights each promise line once it reaches the lower-middle of the screen, and sweeps up anything
    // a fast scroll or a chapter-dot jump skipped past (observers only fire on edge crossings).
    if (pending.length) {
      pending = pending.filter(function (el) {
        var top = el.getBoundingClientRect().top;
        var isLine = el.classList.contains('line');
        if (isLine ? top < vh * 0.72 : top < -40) { el.classList.add(isLine ? 'is-lit' : 'is-in'); return false; }
        return true;
      });
    }

    if (stage && !reduceMotion && y < vh) {
      stage.style.transform = 'translate3d(0,' + (y * 0.07).toFixed(1) + 'px,0)';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 5. Lightbox ---------- */
  var box = $('#lightbox');
  var tiles = $$('#gallery .tile');
  if (box && typeof box.showModal === 'function' && tiles.length) {
    var img = $('#lb-img'), cap = $('#lb-cap'), count = $('#lb-count');
    var index = 0, lastTile = null, swapTimer = null;

    var items = tiles.map(function (t) {
      var im = t.querySelector('img');
      return { src: t.getAttribute('href'), alt: im ? im.alt : '', cap: t.getAttribute('data-caption') || '' };
    });

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function show(i, instant) {
      index = (i + items.length) % items.length;
      var it = items[index];
      function apply() {
        img.src = it.src;
        img.alt = it.alt;
        cap.textContent = it.cap;
        count.textContent = pad(index + 1) + ' / ' + pad(items.length);
        img.classList.remove('is-swapping');
        // warm the neighbours so next/prev feel instant
        [index + 1, index - 1].forEach(function (n) {
          var p = new Image(); p.src = items[(n + items.length) % items.length].src;
        });
      }
      clearTimeout(swapTimer);
      if (instant || reduceMotion) { apply(); return; }
      img.classList.add('is-swapping');
      swapTimer = setTimeout(apply, 220);
    }

    function open(i, tile) {
      lastTile = tile;
      show(i, true);
      root.classList.add('lb-open');
      box.showModal();
      $('#lb-close').focus({ preventScroll: true });
    }
    function close() { if (box.open) box.close(); }

    tiles.forEach(function (t, i) {
      t.addEventListener('click', function (e) {
        e.preventDefault();
        open(i, t);
      });
    });

    box.addEventListener('close', function () {
      root.classList.remove('lb-open');
      if (lastTile) { try { lastTile.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    });
    $('#lb-close').addEventListener('click', close);
    $('#lb-prev').addEventListener('click', function () { show(index - 1); });
    $('#lb-next').addEventListener('click', function () { show(index + 1); });

    // click on the dark backdrop (not the photo or buttons) closes
    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox__stage')) close();
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    });

    // swipe on touch screens
    var sx = 0, sy = 0, tracking = false;
    box.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(index + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.6) close();
    }, { passive: true });
  }
})();
