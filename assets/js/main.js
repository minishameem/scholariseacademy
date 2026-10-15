/* Scholarise Academy – site script */
(function () {
  'use strict';

  /* ---------- Settings you can edit ---------- */
  // Add the WhatsApp number here later, digits only with country code, e.g. '8801XXXXXXXXX'
  var WHATSAPP_NUMBER = '8801338055356';
  var CONTACT_EMAIL = 'contact.scholarise@gmail.com';

  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Clean URLs (/about/) also work when opened from disk ---------- */
  if (location.protocol === 'file:') {
    $$('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
      a.setAttribute('href', h.replace(/^([^#?]*\/)(\?[^#]*)?(#.*)?$/, '$1index.html$2$3'));
    });
  }

  /* ---------- WhatsApp links ---------- */
  $$('.js-whatsapp').forEach(function (a) {
    a.href = WHATSAPP_NUMBER ? 'https://wa.me/' + WHATSAPP_NUMBER : 'https://wa.me/';
  });

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
  var header = $('.site-header');
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = $('.nav-toggle'), nav = $('#main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  $$('[data-stagger]').forEach(function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 90;
    $$('[data-reveal]', group).forEach(function (el, i) { el.style.setProperty('--d', (i * step) + 'ms'); });
  });
  var revealTargets = $$('[data-reveal], .social');
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // hand the element back to its own hover transitions once it has arrived
        setTimeout(function () { el.removeAttribute('data-reveal'); el.style.removeProperty('--d'); }, 2000);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    // Start after every script on the page has run, so content they add (Library cards) is
    // already in place and sections below it are not revealed while still off screen.
    var startReveal = function () { revealTargets.forEach(function (el) { io.observe(el); }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startReveal);
    else startReveal();
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }
  // Content added later by other scripts (e.g. the Library cards) calls this to join the same reveal-on-scroll.
  window.scholariseReveal = function (root) {
    $$('[data-reveal]', root || document).forEach(function (el) {
      if (el.classList.contains('is-in')) return;
      if (io) io.observe(el); else el.classList.add('is-in');
    });
  };

  /* ---------- Home: highlight the nav link of the section on screen ---------- */
  var spyLinks = $$('.main-nav ul a[data-spy]');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    spyLinks.forEach(function (a) { map[a.getAttribute('data-spy')] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var a = map[en.target.id];
        if (!a) return;
        spyLinks.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
        a.classList.add('is-active'); a.setAttribute('aria-current', 'page');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Home: course filter ---------- */
  var tabs = $$('.course-tab');
  function setFilter(track, scroll) {
    if (!tabs.length) return false;
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-filter') === track ? 'true' : 'false'); });
    $$('.course-card').forEach(function (c) {
      var show = track === 'all' || c.getAttribute('data-track') === track;
      c.classList.toggle('is-hidden', !show);
      c.classList.remove('is-entering');
      if (show) { void c.offsetWidth; c.classList.add('is-entering'); }
    });
    if (scroll) { var s = $('#courses'); s && s.scrollIntoView({ behavior: 'smooth' }); }
    return true;
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { setFilter(t.getAttribute('data-filter'), false); }); });
  // footer links such as ?track=grammar#courses
  var params = new URLSearchParams(location.search);
  if (params.get('track')) setFilter(params.get('track'), false);
  $$('a[data-track-link]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (setFilter(a.getAttribute('data-track-link'), true)) e.preventDefault();
    });
  });

  /* ---------- Newsletter ---------- */
  var nl = $('.subscribe');
  if (nl) {
    var nlStatus = $('.nl-status');
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', nl);
      if (!input.value.trim() || !input.checkValidity()) {
        nlStatus.textContent = 'Please enter a valid email address.'; nlStatus.classList.add('error'); input.focus(); return;
      }
      nlStatus.classList.remove('error');
      nlStatus.textContent = 'Thanks! You’re subscribed.';
      nl.reset();
    });
  }

  /* ---------- Contact form: checks fields, then opens an email to the academy ---------- */
  var cf = $('#contact-form');
  if (cf) {
    var st = $('.form-status', cf);
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('.field', cf).forEach(function (f) {
        var el = $('input, textarea', f);
        var bad = el.required && (!el.value.trim() || !el.checkValidity());
        f.classList.toggle('has-error', bad);
        if (bad && ok) { el.focus(); ok = false; }
      });
      if (!ok) { st.textContent = 'Please fill in the highlighted fields.'; st.classList.add('error'); return; }
      st.classList.remove('error');
      var v = function (n) { return (cf.elements[n].value || '').trim(); };
      var body = [
        'Parent / Guardian Name: ' + v('parent'),
        'Learner’s Name: ' + v('learner'),
        'Learner’s Age: ' + v('age'),
        'Email Address: ' + v('email'),
        'Phone / WhatsApp Number: ' + v('phone'),
        '', v('message')
      ].join('\n');
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Enquiry from ' + v('parent')) + '&body=' + encodeURIComponent(body);
      st.textContent = 'Your email app is opening with your message. Please press send there.';
    });
    $$('input, textarea', cf).forEach(function (el) {
      el.addEventListener('input', function () { el.closest('.field').classList.remove('has-error'); });
    });
  }

  /* ---------- Count-up numbers (Teaching Impact) ---------- */
  var counters = $$('[data-count]');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var fmt = function (n) { return n.toLocaleString('en-US'); };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suffix') || '', t0 = null;
        cio.unobserve(el);
        (function step(t) {
          if (t0 === null) t0 = t;
          var p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(end * e)) + suf;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Section menus: arrows jump to the start / end ---------- */
  $$('.pp-jump').forEach(function (bar) {
    var list = $('ul', bar), prev = $('.jump-arrow.prev', bar), next = $('.jump-arrow.next', bar);
    if (!list || !prev || !next) return;
    function update() {
      var max = list.scrollWidth - list.clientWidth;
      bar.classList.toggle('no-overflow', max <= 2);
      prev.disabled = list.scrollLeft <= 2;
      next.disabled = list.scrollLeft >= max - 2;
    }
    prev.addEventListener('click', function () { list.scrollTo({ left: 0, behavior: 'smooth' }); });
    next.addEventListener('click', function () { list.scrollTo({ left: list.scrollWidth, behavior: 'smooth' }); });
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Terms: highlight current section in the contents list ---------- */
  var tocLinks = $$('.toc a, .pp-jump a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tmap = {};
    tocLinks.forEach(function (a) { tmap[a.getAttribute('href').slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
        var a = tmap[en.target.id];
        if (!a) return;
        a.classList.add('is-active');
        var ul = a.closest('.pp-jump ul');
        if (ul) {
          var l = a.offsetLeft - ul.offsetLeft, r = l + a.offsetWidth;
          if (l < ul.scrollLeft + 24 || r > ul.scrollLeft + ul.clientWidth - 24) ul.scrollTo({ left: l - 40, behavior: 'smooth' });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(tmap).forEach(function (id) { var s = document.getElementById(id); s && tio.observe(s); });
  }
  /* ---------- Back to top (sits above the WhatsApp button on every page) ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.className = 'to-top';
  topBtn.setAttribute('aria-label', 'Back to top');
  topBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="M5.5 11.5 12 5l6.5 6.5"/></svg><span class="to-top-tip">Back to top</span>';
  document.body.appendChild(topBtn);
  var topTicking = false;
  var syncTop = function () {
    topTicking = false;
    var show = window.scrollY > 360;
    topBtn.classList.toggle('is-visible', show);
    topBtn.tabIndex = show ? 0 : -1;
  };
  syncTop();
  window.addEventListener('scroll', function () { if (!topTicking) { topTicking = true; requestAnimationFrame(syncTop); } }, { passive: true });
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    var first = $('.site-header a');
    if (first) first.focus({ preventScroll: true });
  });

  /* ---------- FAQ accordion: one open at a time (the height animation is pure CSS) ---------- */
  var faqItems = $$('.faq-item');
  var setFaq = function (item, open) {
    item.classList.toggle('is-open', open);
    var btn = $('.faq-btn', item);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  faqItems.forEach(function (item) {
    var btn = $('.faq-btn', item);
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      if (open) faqItems.forEach(function (o) { if (o !== item) setFaq(o, false); });
      setFaq(item, open);
    });
  });
})();
