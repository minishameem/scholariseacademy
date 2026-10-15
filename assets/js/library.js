/* Scholarise Learning Library – rendering and discovery.
   Reads window.SCHOLARISE_LIBRARY (assets/js/library-data.js).
   You should not need to edit this file to add resources or categories. */
(function () {
  'use strict';

  var DATA = window.SCHOLARISE_LIBRARY || { categories: [], resources: [] };
  var ACCESS = {
    free:          { badge: 'FREE',                       label: 'Free',             cta: 'Download PDF ↓' },
    enrolled_only: { badge: 'ONLY FOR ENROLLED LEARNERS', label: 'Enrolled learners', cta: null },
    external:      { badge: 'EXTERNAL RESOURCE',          label: 'External',         cta: 'Visit Website ↗' }
  };
  var PRICING = { free: 'Free to use', paid: 'Paid', subscription: 'Subscription' };
  var SECTION_LIMIT = 8;               // cards per category section before "View all"
  var SECTION_LIMIT_PHONE = 4;         // phones stack cards in one column, so show fewer per section
  function sectionLimit() { return window.matchMedia('(max-width: 640px)').matches ? SECTION_LIMIT_PHONE : SECTION_LIMIT; }

  /* ---------- icons ---------- */
  function svg(d, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      d.split('|').map(function (p) { return '<path d="' + p + '"/>'; }).join('') + (extra || '') + '</svg>';
  }
  var ICONS = {
    phonics:  '<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="15.5" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="11" fill="currentColor">Aa</text><path d="M6 19.5h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    grammar:  svg('M4 6h10|M4 10h16|M4 14h12|M4 18h7|M17 16.5l2 2 3.5-4'),
    reading:  svg('M12 7c-2-1.6-5-2.2-8-1.8v13c3-.4 6 .2 8 1.8 2-1.6 5-2.2 8-1.8v-13c-3-.4-6 .2-8 1.8z|M12 7v13'),
    writing:  svg('M4 20h4l11-11-4-4L4 16z|M13.5 6.5l4 4'),
    speaking: svg('M4 5h16v11H9l-5 4z|M8 9.5h8|M8 12.5h5'),
    activity: svg('M8 4h8v5a4 4 0 0 1-8 0z|M8 6H5a3 3 0 0 0 3 4|M16 6h3a3 3 0 0 1-3 4|M12 13v4|M8.5 20h7|M10 17h4'),
    parents:  svg('M8.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M3 20a5.5 5.5 0 0 1 11 0|M17 11a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z|M14.5 14.5A4.2 4.2 0 0 1 21 18v2'),
    insights: svg('M9 18h6|M10 21h4|M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.3 1.1 2.2h5c0-.9.3-1.6 1.1-2.2A6 6 0 0 0 12 3z'),
    external: svg('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z|M3 12h18|M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z'),
    all:      svg('M4 4h7v7H4z|M13 4h7v7h-7z|M4 13h7v7H4z|M13 13h7v7h-7z'),
    lock:     svg('M6 11h12v9H6z|M8.5 11V8a3.5 3.5 0 0 1 7 0v3'),
    free:     svg('M12 4v11|M7 10l5 5 5-5|M5 20h14'),
    link:     svg('M10 14L20 4|M14 4h6v6|M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5'),
    search:   svg('M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z|M20 20l-4-4')
  };
  function icon(name) { return ICONS[name] || ICONS.reading; }

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function isHttps(u) { return typeof u === 'string' && /^https:\/\/[^\s]+$/i.test(u.trim()); }
  function isImage(u) { return typeof u === 'string' && u.trim() !== '' && (/^https:\/\//i.test(u) || /^(\.\.\/|\/|assets\/)/.test(u)); }
  function list(v) { return Array.isArray(v) ? v.filter(Boolean).map(String) : (v ? [String(v)] : []); }
  function warn(msg) { if (window.console && console.info) console.info('[Library] ' + msg); }

  /* ---------- data: categories ---------- */
  var categories = (DATA.categories || [])
    .filter(function (c) { return c && c.id && c.title && c.visible !== false; })
    .sort(function (a, b) { return (a.order || 999) - (b.order || 999); });
  var catById = {};
  categories.forEach(function (c) { catById[c.id] = c; });

  /* ---------- data: resources (validated) ---------- */
  var seen = {};
  var resources = (DATA.resources || []).map(function (r, index) {
    if (!r || r.published !== true) return null;
    var where = '"' + (r.id || r.title || 'resource #' + (index + 1)) + '"';
    if (!r.id || !r.title || !r.description) { warn(where + ' skipped: id, title and description are required.'); return null; }
    if (seen[r.id]) { warn(where + ' skipped: the id is already used.'); return null; }
    if (!ACCESS[r.accessType]) { warn(where + ' skipped: accessType must be free, enrolled_only or external.'); return null; }
    if (!catById[r.category]) { warn(where + ' skipped: unknown category "' + r.category + '".'); return null; }
    var url = null;
    if (r.accessType === 'enrolled_only') {
      if (r.resourceUrl) warn(where + ': resourceUrl ignored. Never store private links in the public data file.');
    } else if (isHttps(r.resourceUrl)) {
      url = r.resourceUrl.trim();
    } else if (r.accessType === 'external') {
      warn(where + ' skipped: external resources need a full https:// resourceUrl.'); return null;
    } else if (r.resourceUrl) {
      warn(where + ': resourceUrl is not a valid https:// link, so no download button is shown.');
    }
    seen[r.id] = true;
    var item = {
      id: String(r.id), title: String(r.title), description: String(r.description),
      category: r.category, accessType: r.accessType, url: url,
      image: isImage(r.image) ? r.image.trim() : null,
      format: r.format ? String(r.format) : '', level: r.level ? String(r.level) : '',
      gradeRange: r.gradeRange ? String(r.gradeRange) : '', ageRange: r.ageRange ? String(r.ageRange) : '',
      skills: list(r.skills), tags: list(r.tags),
      ctaLabel: r.ctaLabel ? String(r.ctaLabel) : '',
      publisher: r.accessType === 'external' && r.publisher ? String(r.publisher) : '',
      pricingType: r.accessType === 'external' && PRICING[r.pricingType] ? r.pricingType : '',
      featured: r.featured === true,
      dateAdded: /^\d{4}-\d{2}-\d{2}$/.test(r.dateAdded || '') ? r.dateAdded : '',
      sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : 9999,
      index: index
    };
    item.haystack = [item.title, item.description, catById[item.category].title, item.format, item.level,
      item.gradeRange, item.ageRange, item.publisher, ACCESS[item.accessType].label]
      .concat(item.skills, item.tags).join(' ').toLowerCase();
    return item;
  }).filter(Boolean);

  /* ---------- filtering & sorting (no DOM here) ---------- */
  function applyFilters(items, s) {
    var words = s.q.toLowerCase().split(/\s+/).filter(Boolean);
    return items.filter(function (r) {
      if (s.category && r.category !== s.category) return false;
      if (s.access && r.accessType !== s.access) return false;
      if (s.level && r.level !== s.level) return false;
      if (s.format && r.format !== s.format) return false;
      for (var i = 0; i < words.length; i++) if (r.haystack.indexOf(words[i]) < 0) return false;
      return true;
    });
  }
  function applySort(items, sort) {
    var out = items.slice();
    if (sort === 'az') out.sort(function (a, b) { return a.title.localeCompare(b.title); });
    else if (sort === 'newest') out.sort(function (a, b) { return (b.dateAdded || '').localeCompare(a.dateAdded || '') || a.index - b.index; });
    else out.sort(function (a, b) { return (b.featured - a.featured) || (a.sortOrder - b.sortOrder) || (a.index - b.index); });
    return out;
  }
  function distinct(key) {
    var seenV = {}, out = [];
    resources.forEach(function (r) { if (r[key] && !seenV[r[key]]) { seenV[r[key]] = 1; out.push(r[key]); } });
    return out;
  }

  /* ---------- rendering ---------- */
  function cardHTML(r, hTag) {
    hTag = hTag || 'h3';
    var cat = catById[r.category], a = ACCESS[r.accessType];
    var badgeIcon = r.accessType === 'free' ? ICONS.free : r.accessType === 'external' ? ICONS.link : ICONS.lock;
    var meta = [r.level, r.gradeRange, r.ageRange, r.format].filter(Boolean)
      .map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('');
    var extra = '';
    if (r.skills.length) extra += '<p class="lib-skills"><span>Skills:</span> ' + esc(r.skills.join(', ')) + '</p>';
    if (r.publisher || r.pricingType) {
      extra += '<p class="lib-provider">' + (r.publisher ? 'From <b>' + esc(r.publisher) + '</b>' : '') +
        (r.publisher && r.pricingType ? ' · ' : '') + (r.pricingType ? esc(PRICING[r.pricingType]) : '') + '</p>';
    }
    var action;
    if (r.url) {
      var label = r.ctaLabel || a.cta;
      action = '<a class="lib-cta" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' +
        esc(label.replace(/[↓↗]/g, '').trim() + ': ' + r.title + ' (opens in a new tab)') + '">' + esc(label) + '</a>';
    } else if (r.accessType === 'enrolled_only') {
      action = '<p class="lib-note">' + ICONS.lock + 'Shared directly with enrolled learners</p>';
    } else {
      action = '<p class="lib-note">Download link coming soon</p>';
    }
    return '<article class="lib-card is-' + r.accessType + '" data-id="' + esc(r.id) + '">' +
      '<div class="lib-media' + (r.image ? '' : ' is-empty') + '">' +
        '<span class="lib-ph" aria-hidden="true">' + icon(cat.icon) + '</span>' +
        (r.image ? '<img src="' + esc(r.image) + '" alt="" loading="lazy" decoding="async">' : '') +
        '<span class="lib-badge">' + badgeIcon + esc(a.badge) + '</span>' +
      '</div>' +
      '<div class="lib-body">' +
        '<p class="lib-cat">' + esc(cat.title) + '</p>' +
        '<' + hTag + ' class="lib-title">' + esc(r.title) + '</' + hTag + '>' +
        '<p class="lib-desc">' + esc(r.description) + '</p>' +
        (meta ? '<ul class="lib-meta" aria-label="Details">' + meta + '</ul>' : '') + extra +
        '<div class="lib-action">' + action + '</div>' +
      '</div></article>';
  }
  function gridHTML(items, hTag) {
    return '<div class="lib-grid">' + items.map(function (r) { return cardHTML(r, hTag); }).join('') + '</div>';
  }

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    search: $('lib-search'), clear: $('lib-search-clear'), cats: $('lib-categories'),
    toolbar: $('lib-toolbar'), access: $('lib-access'), level: $('lib-level'), format: $('lib-format'),
    sort: $('lib-sort'), reset: $('lib-reset'), status: $('lib-status'), results: $('lib-results'),
    title: $('lib-results-title'), total: $('lib-total')
  };
  if (!els.results) return;

  var state = { q: '', category: '', access: '', level: '', format: '', sort: 'recommended' };
  var params = new URLSearchParams(location.search);
  if (catById[params.get('category')]) state.category = params.get('category');
  if (params.get('q')) state.q = params.get('q').slice(0, 80);
  if (els.search) els.search.value = state.q;


  /* ---------- reveal on scroll for rendered content (uses main.js) ---------- */
  function revealIn(root, selector, step, perRow) {
    if (typeof window.scholariseReveal !== 'function' || !root) return;
    Array.prototype.forEach.call(root.querySelectorAll(selector), function (el, i) {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', ((i % perRow) * step) + 'ms');
    });
    window.scholariseReveal(root);
  }
  function revealResults() {
    if (typeof window.scholariseReveal !== 'function') return;
    Array.prototype.forEach.call(els.results.querySelectorAll('.lib-section-head, .lib-empty'), function (el) { el.setAttribute('data-reveal', ''); });
    Array.prototype.forEach.call(els.results.querySelectorAll('.lib-grid'), function (g) { revealIn(g, '.lib-card', 80, 4); });
    window.scholariseReveal(els.results);
  }

  function countFor(id) { return resources.filter(function (r) { return r.category === id; }).length; }

  function renderCategories() {
    var html = '<button type="button" class="lib-catcard is-all" data-cat="" aria-pressed="' + (!state.category) + '">' +
      '<span class="lib-catic">' + ICONS.all + '</span><span class="lib-cattxt"><b>All Resources</b>' +
      '<small>Everything in the library</small></span><span class="lib-count">' + countLabel(resources.length) + '</span></button>';
    categories.forEach(function (c) {
      html += '<button type="button" class="lib-catcard" data-cat="' + esc(c.id) + '" aria-pressed="' + (state.category === c.id) + '">' +
        '<span class="lib-catic">' + icon(c.icon) + '</span><span class="lib-cattxt"><b>' + esc(c.title) + '</b>' +
        (c.description ? '<small>' + esc(c.description) + '</small>' : '') + '</span>' +
        '<span class="lib-count">' + countLabel(countFor(c.id)) + '</span></button>';
    });
    els.cats.innerHTML = html;
    revealIn(els.cats, '.lib-catcard', 70, 5);
  }
  function countLabel(n) { return n ? n + (n === 1 ? ' resource' : ' resources') : 'Coming soon'; }

  function fillSelect(sel, values, allLabel) {
    var wrap = sel.closest('.lib-field');
    if (values.length < 2) { wrap.hidden = true; return; }
    wrap.hidden = false;
    sel.innerHTML = '<option value="">' + allLabel + '</option>' + values.map(function (v) {
      return '<option value="' + esc(v) + '">' + esc(v) + '</option>';
    }).join('');
  }
  function buildToolbar() {
    if (!resources.length) { els.toolbar.hidden = true; return; }
    els.toolbar.hidden = false;
    var types = Object.keys(ACCESS).filter(function (t) { return resources.some(function (r) { return r.accessType === t; }); });
    var accessWrap = els.access.closest('.lib-field');
    if (types.length < 2) accessWrap.hidden = true;
    else {
      accessWrap.hidden = false;
      els.access.innerHTML = ['<button type="button" data-access="" aria-pressed="true">All</button>'].concat(types.map(function (t) {
        return '<button type="button" data-access="' + t + '" aria-pressed="false">' + esc(ACCESS[t].label) + '</button>';
      })).join('');
    }
    var LEVELS = ['Beginner', 'Basic', 'Intermediate', 'Advanced'];
    var rank = function (v) { var i = LEVELS.indexOf(v); return i < 0 ? 99 : i; };
    fillSelect(els.level, distinct('level').sort(function (a, b) { return rank(a) - rank(b) || a.localeCompare(b); }), 'All levels');
    fillSelect(els.format, distinct('format').sort(function (a, b) { return a.localeCompare(b); }), 'All formats');
    var newest = els.sort.querySelector('option[value="newest"]');
    if (newest && !resources.some(function (r) { return r.dateAdded; })) newest.remove();
  }

  function isFiltering() { return !!(state.q || state.category || state.access || state.level || state.format); }

  function emptyLibraryHTML() {
    return '<div class="lib-empty is-library">' +
      '<svg class="lib-empty-art" viewBox="0 0 220 150" aria-hidden="true">' +
        '<rect x="20" y="118" width="180" height="8" rx="4" fill="#035643"/>' +
        '<rect x="38" y="58" width="18" height="60" rx="3" fill="#349C5C"/><rect x="58" y="44" width="22" height="74" rx="3" fill="#035643"/>' +
        '<rect x="82" y="66" width="16" height="52" rx="3" fill="#F8BD25"/><rect x="100" y="50" width="20" height="68" rx="3" fill="#a9dcbc"/>' +
        '<rect x="132" y="76" width="44" height="12" rx="3" fill="#349C5C" transform="rotate(-18 154 82)"/>' +
        '<rect x="128" y="96" width="52" height="22" rx="3" fill="#fff" stroke="#035643" stroke-width="3"/>' +
        '<path d="M140 104h28M140 111h18" stroke="#349C5C" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="182" cy="34" r="6" fill="#F8BD25"/><circle cx="30" cy="34" r="4" fill="#349C5C" opacity=".5"/>' +
      '</svg>' +
      '<h3>The shelves are being stocked.</h3>' +
      '<p>We are carefully preparing worksheets, reading materials, activities and trusted links for every stage. New resources will appear here as soon as they are ready.</p>' +
      '<a class="btn btn-primary" href="../contact/">Ask us about learning materials</a></div>';
  }
  function noMatchHTML() {
    var what = state.q ? 'for “' + esc(state.q) + '”' : 'with these filters';
    return '<div class="lib-empty"><h3>No resources found ' + what + '.</h3>' +
      '<p>Try a different word, choose another category, or clear the filters to see everything.</p>' +
      '<button type="button" class="btn btn-outline" data-reset>Clear search and filters</button></div>';
  }
  function emptyCategoryHTML(cat) {
    return '<div class="lib-empty"><h3>' + esc(cat.title) + ' resources are coming soon.</h3>' +
      '<p>We are preparing materials for this part of the library. Explore another category in the meantime.</p>' +
      '<button type="button" class="btn btn-outline" data-reset>Browse all resources</button></div>';
  }

  function sectionHTML(id, title, items, totalCount, catId) {
    var more = catId && totalCount > items.length
      ? '<button type="button" class="lib-viewall" data-cat="' + esc(catId) + '">View all ' + totalCount + '</button>' : '';
    return '<section class="lib-section" aria-labelledby="' + id + '"><div class="lib-section-head">' +
      '<h3 id="' + id + '">' + esc(title) + '</h3><span class="lib-section-count">' + totalCount + '</span>' + more +
      '</div>' + gridHTML(items, 'h4') + '</section>';
  }

  function render(announce) {
    // keep the URL shareable: ?category=…&q=…
    var p = new URLSearchParams();
    if (state.category) p.set('category', state.category);
    if (state.q) p.set('q', state.q);
    var qs = p.toString();
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) {}

    Array.prototype.forEach.call(els.cats.querySelectorAll('[data-cat]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === state.category));
    });
    Array.prototype.forEach.call(els.access.querySelectorAll('[data-access]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-access') === state.access));
    });
    if (els.clear) els.clear.hidden = !state.q;
    if (els.reset) els.reset.hidden = !isFiltering();

    var html, shown;
    var cat = catById[state.category];
    els.title.textContent = cat ? cat.title : (state.q || state.access || state.level || state.format ? 'Search Results' : 'Explore All Resources');

    if (!resources.length) {
      html = cat ? emptyCategoryHTML(cat) : emptyLibraryHTML();
      shown = 0;
    } else if (!isFiltering()) {
      var all = applySort(resources, state.sort);
      var parts = [];
      var featured = all.filter(function (r) { return r.featured; });
      if (featured.length) parts.push(sectionHTML('lib-sec-featured', 'Featured Materials', featured.slice(0, SECTION_LIMIT), featured.length));
      categories.forEach(function (c) {
        var items = all.filter(function (r) { return r.category === c.id; });
        if (items.length) parts.push(sectionHTML('lib-sec-' + c.id, c.title, items.slice(0, sectionLimit()), items.length, c.id));
      });
      html = parts.join('');
      shown = resources.length;
    } else {
      var found = applySort(applyFilters(resources, state), state.sort);
      shown = found.length;
      html = found.length ? gridHTML(found) : (cat && !countFor(cat.id) && !state.q ? emptyCategoryHTML(cat) : noMatchHTML());
    }
    els.results.innerHTML = html;
    revealResults();
    els.total.textContent = shown ? shown + (shown === 1 ? ' resource' : ' resources') : '';
    if (announce) els.status.textContent = shown ? shown + (shown === 1 ? ' resource found.' : ' resources found.') : 'No resources found.';

    // images that fail to load fall back to the designed empty image area
    Array.prototype.forEach.call(els.results.querySelectorAll('.lib-media img'), function (img) {
      img.addEventListener('error', function () { img.parentNode.classList.add('is-empty'); img.remove(); }, { once: true });
    });
  }

  function goToResults() {
    var head = $('lib-results-head');
    if (head) head.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  function reset() {
    state.q = ''; state.category = ''; state.access = ''; state.level = ''; state.format = '';
    if (els.search) els.search.value = '';
    if (els.level) els.level.value = '';
    if (els.format) els.format.value = '';
    render(true);
  }

  /* ---------- events ---------- */
  var timer;
  if (els.search) {
    els.search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = els.search.value.trim().slice(0, 80); render(true); }, 160);
    });
    els.search.form.addEventListener('submit', function (e) {
      e.preventDefault(); state.q = els.search.value.trim().slice(0, 80); render(true); goToResults();
    });
  }
  if (els.clear) els.clear.addEventListener('click', function () { els.search.value = ''; state.q = ''; render(true); els.search.focus(); });
  els.cats.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cat]'); if (!b) return;
    var id = b.getAttribute('data-cat');
    state.category = state.category === id ? '' : id;
    render(true); goToResults();
  });
  els.access.addEventListener('click', function (e) {
    var b = e.target.closest('[data-access]'); if (!b) return;
    state.access = b.getAttribute('data-access'); render(true);
  });
  els.level.addEventListener('change', function () { state.level = els.level.value; render(true); });
  els.format.addEventListener('change', function () { state.format = els.format.value; render(true); });
  els.sort.addEventListener('change', function () { state.sort = els.sort.value; render(true); });
  els.reset.addEventListener('click', reset);
  els.results.addEventListener('click', function (e) {
    if (e.target.closest('[data-reset]')) { reset(); goToResults(); return; }
    var v = e.target.closest('.lib-viewall');
    if (v) { state.category = v.getAttribute('data-cat'); render(true); goToResults(); }
  });

  // demo content (assets/js/library-demo-data.js) is always labelled as such on the page
  if (DATA.demo === true && resources.length && els.toolbar) {
    var note = document.createElement('p');
    note.className = 'lib-demo-note';
    note.setAttribute('data-reveal', '');
    note.innerHTML = '<b>Preview</b> These are sample resources to show how the library will look. Real materials are coming soon.';
    els.toolbar.parentNode.insertBefore(note, els.toolbar);
    if (typeof window.scholariseReveal === 'function') window.scholariseReveal(note.parentNode);
  }

  renderCategories();
  buildToolbar();
  render(false);
  document.documentElement.classList.add('lib-ready');
})();
