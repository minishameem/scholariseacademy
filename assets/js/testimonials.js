/* =====================================================================
   HOME: "A Note From Our Parents" – TESTIMONIALS
   ---------------------------------------------------------------------
   This list is the only place you need to edit.

   TO ADD A REAL TESTIMONIAL
   1. Paste the parent's words in `text` (keep their meaning; fix only typos).
   2. Change `placeholder: true` to `placeholder: false`.
   Only publish feedback a parent actually gave and agreed to share.

   Optional fields (leave them out unless they are genuine):
     date      e.g. 'October 2026' – shown only if filled in
     verified  true only if you have a real way of checking the review

   While any entry is still a placeholder, the cards show a soft
   "sample" style so nobody mistakes them for real reviews.
   ===================================================================== */

window.SCHOLARISE_TESTIMONIALS = [
  { id: 't1', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't2', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't3', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't4', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't5', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't6', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't7', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't8', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' },
  { id: 't9', placeholder: true, text: 'Parent testimonial will appear here.', attribution: 'Parent of a Scholarise Learner' }
];

/* ---- no need to edit below this line ---- */
(function () {
  'use strict';
  var items = (window.SCHOLARISE_TESTIMONIALS || []).filter(function (t) { return t && t.text; });
  var root = document.getElementById('parent-notes');
  if (!root || !items.length) return;
  var track = document.getElementById('pn-track');
  var prev = root.querySelector('.pn-prev'), next = root.querySelector('.pn-next');
  var path = document.getElementById('pn-path');
  var status = document.getElementById('pn-status');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var USER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.2" r="3.7"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg>';
  var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.87l-5.5 2.88 1.05-6.12L3.1 9.3l6.15-.9z"/></svg>';
  var QUOTE = '<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M0 24V14.4C0 6.6 4.1 1.8 11.4 0l1.4 3.1C8.7 4.6 6.8 7.4 6.6 11H12v13zm19.2 0V14.4C19.2 6.6 23.3 1.8 30.6 0L32 3.1c-4.1 1.5-6 4.3-6.2 7.9h5.4v13z"/></svg>';
  var stars = '<p class="pn-stars" aria-hidden="true">' + STAR + STAR + STAR + STAR + STAR + '</p>';

  var anyPlaceholder = false;
  track.innerHTML = items.map(function (t, i) {
    if (t.placeholder) anyPlaceholder = true;
    var meta = (t.date ? '<span class="pn-date">' + esc(t.date) + '</span>' : '') +
               (t.verified === true ? '<span class="pn-verified">Verified</span>' : '');
    return '<li class="pn-slide" id="pn-slide-' + (i + 1) + '" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + items.length + '">' +
      '<figure class="pn-card' + (t.placeholder ? ' is-placeholder' : '') + '">' +
        '<div class="pn-top"><span class="pn-avatar">' + USER + '</span><span class="pn-quote">' + QUOTE + '</span></div>' +
        stars +
        '<blockquote class="pn-text"><p>' + esc(t.text) + '</p></blockquote>' +
        '<figcaption class="pn-by"><span class="pn-rule" aria-hidden="true"></span>' + esc(t.attribution || 'Parent of a Scholarise Learner') + (meta ? '<span class="pn-meta">' + meta + '</span>' : '') + '</figcaption>' +
      '</figure></li>';
  }).join('');
  if (anyPlaceholder) root.classList.add('has-placeholders');

  // learning-journey path: one stop per testimonial
  path.innerHTML = '<span class="pn-path-line" aria-hidden="true"><span class="pn-path-fill"></span></span>' +
    items.map(function (t, i) {
      return '<button type="button" class="pn-stop" data-i="' + i + '" aria-label="Show testimonial ' + (i + 1) + ' of ' + items.length + '" aria-controls="pn-track"></button>';
    }).join('');
  var stops = path.querySelectorAll('.pn-stop');
  var fill = path.querySelector('.pn-path-fill');
  var slides = track.querySelectorAll('.pn-slide');

  function perView() {
    var w = slides[0].getBoundingClientRect().width;
    return Math.max(1, Math.round(track.clientWidth / (w || track.clientWidth)));
  }
  function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
  function first() { return Math.round(track.scrollLeft / step()); }
  function go(i) {
    var max = Math.max(0, slides.length - perView());
    i = Math.max(0, Math.min(max, i));
    track.scrollTo({ left: i * step(), behavior: reduce.matches ? 'auto' : 'smooth' });
  }
  var lastAnnounced = '';
  function sync() {
    var n = perView(), f = Math.min(first(), slides.length - n), l = f + n - 1;
    prev.disabled = f <= 0;
    next.disabled = l >= slides.length - 1;
    Array.prototype.forEach.call(stops, function (s, i) {
      s.classList.toggle('is-seen', i <= l);
      s.classList.toggle('is-here', i >= f && i <= l);
      s.setAttribute('aria-current', i >= f && i <= l ? 'true' : 'false');
    });
    Array.prototype.forEach.call(slides, function (s, i) {
      var vis = i >= f && i <= l;
      s.classList.toggle('is-visible', vis);
      s.setAttribute('aria-hidden', vis ? 'false' : 'true');
    });
    var pct = slides.length > 1 ? (l / (slides.length - 1)) * 100 : 100;
    fill.style.transform = 'scaleX(' + (pct / 100).toFixed(4) + ')';
    var msg = n === 1 ? 'Testimonial ' + (f + 1) + ' of ' + slides.length : 'Testimonials ' + (f + 1) + ' to ' + (l + 1) + ' of ' + slides.length;
    if (msg !== lastAnnounced) { lastAnnounced = msg; status.textContent = msg; }
  }

  prev.addEventListener('click', function () { go(first() - perView()); });
  next.addEventListener('click', function () { go(first() + perView()); });
  path.addEventListener('click', function (e) {
    var b = e.target.closest('.pn-stop'); if (!b) return;
    go(+b.getAttribute('data-i'));
  });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(first() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(first() - 1); }
  });
  var t;
  track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(sync, 60); }, { passive: true });
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { go(first()); sync(); }, 120); });
  sync();
})();
