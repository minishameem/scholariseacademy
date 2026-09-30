/* Scholarise Academy – site script */
(function () {
  'use strict';

  /* ---------- Settings you can edit ---------- */
  // Add the WhatsApp number here later, digits only with country code, e.g. '8801XXXXXXXXX'
  var WHATSAPP_NUMBER = '';
  var CONTACT_EMAIL = 'contact.scholariseacademy@gmail.com';

  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Clean URLs (/aboutus/) also work when opened from disk ---------- */
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
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // hand the element back to its own hover transitions once it has arrived
        setTimeout(function () { el.removeAttribute('data-reveal'); el.style.removeProperty('--d'); }, 1400);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('is-in'); });
  }

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

  /* ---------- Terms: highlight current section in the contents list ---------- */
  var tocLinks = $$('.toc a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tmap = {};
    tocLinks.forEach(function (a) { tmap[a.getAttribute('href').slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (l) { l.classList.remove('is-active'); });
        var a = tmap[en.target.id]; a && a.classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(tmap).forEach(function (id) { var s = document.getElementById(id); s && tio.observe(s); });
  }
})();
