/* =====================================================================
   HOME: "Our Digital Learning Toolkit" – TOOLS
   ---------------------------------------------------------------------
   This list is the only place you need to edit.

   ADD A TOOL      copy one line, change name / note / logo.
   REMOVE A TOOL   delete its line. The circle re-spaces itself.
   CHANGE A LOGO   put an .svg (or .png/.webp) in assets/images/tools/
                   and write its path in `logo`.
   NO LOGO YET     leave logo: '' and a neat placeholder with the tool's
                   initials (`mark`) is shown instead.

   wide: true  → for long, flat logos (like the Zoom word logo).
   The tools are shown for information only. No links, no partnership.

   Logo sources (all free to use; the brand names belong to their owners):
     zoom.svg, google-meet.svg   gilbarbara/logos (CC0)
     wordwall.webp, baamboozle.webp   supplied by Scholarise
     canva.svg          Devicon (MIT)
     kahoot.svg, google-slides.svg, google-forms.svg
                        Simple Icons (CC0), in each brand's own colour
   ===================================================================== */

window.SCHOLARISE_TOOLKIT = [
  { name: 'Zoom',             note: 'Live classes',               logo: 'assets/images/tools/zoom.svg', wide: true },
  { name: 'Canva',            note: 'Visual learning materials',  logo: 'assets/images/tools/canva.svg' },
  { name: 'Wordwall',         note: 'Interactive practice',       logo: 'assets/images/tools/wordwall.webp' },
  { name: 'Kahoot!',          note: 'Quizzes and review',         logo: 'assets/images/tools/kahoot.svg' },
  { name: 'Google Slides',    note: 'Lesson presentation',        logo: 'assets/images/tools/google-slides.svg' },
  { name: 'Google Forms',     note: 'Assessment and feedback',    logo: 'assets/images/tools/google-forms.svg' },
  { name: 'Google Meet',      note: 'Lessons and parent meetings', logo: 'assets/images/tools/google-meet.svg' },
  { name: 'Baamboozle',       note: 'Classroom games',            logo: 'assets/images/tools/baamboozle.webp' }
];

/* ---- no need to edit below this line ---- */
(function () {
  'use strict';
  var tools = (window.SCHOLARISE_TOOLKIT || []).filter(function (t) { return t && t.name; });
  var orbit = document.getElementById('tk-orbit');
  var nodesEl = document.getElementById('tk-nodes');
  var linesEl = document.getElementById('tk-lines');
  var legendEl = document.getElementById('tk-legend');
  if (!orbit || !nodesEl || !tools.length) return;

  var NS = 'http://www.w3.org/2000/svg';
  var R = 40;            // orbit radius (% of the square)
  var CORE = 17.6;       // where the lines start (edge of the centre circle)
  var NODE = 7.4;        // where the lines stop (edge of a tool circle)

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(t) { return t.mark || t.name.replace(/[^A-Za-z]/g, '').slice(0, 2); }

  var nodeHTML = '', legendHTML = '';
  tools.forEach(function (t, i) {
    var deg = -90 + i * (360 / tools.length); // equal spacing, so every tool keeps the same distance as it turns
    var rad = deg * Math.PI / 180, cos = Math.cos(rad), sin = Math.sin(rad);
    var x = 50 + R * cos, y = 50 + R * sin;
    var badge = t.logo
      ? '<img src="' + esc(t.logo) + '" alt="" draggable="false" width="48" height="48" decoding="async">'
      : '<span class="tk-mark">' + esc(initials(t)) + '</span>';
    nodeHTML += '<li class="tk-node' + (t.logo ? '' : ' is-placeholder') + (t.wide ? ' is-wide' : '') + '" data-tool="' + i + '"' +
      ' style="left:' + x.toFixed(2) + '%;top:' + y.toFixed(2) + '%;--i:' + i + '">' +
      '<span class="tk-pop"><span class="tk-up"><span class="tk-badge">' + badge + '</span><span class="tk-name">' + esc(t.name) + '</span></span></span></li>';
    legendHTML += '<li data-tool="' + i + '" style="--i:' + i + '"><b>' + esc(t.name) + '</b><span>' + esc(t.note || '') + '</span></li>';

    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', (50 + CORE * cos).toFixed(2)); line.setAttribute('y1', (50 + CORE * sin).toFixed(2));
    line.setAttribute('x2', (50 + (R - NODE) * cos).toFixed(2)); line.setAttribute('y2', (50 + (R - NODE) * sin).toFixed(2));
    line.setAttribute('pathLength', '1');
    line.setAttribute('class', 'tk-line');
    line.setAttribute('data-tool', i);
    line.style.setProperty('--i', i);
    linesEl.appendChild(line);
    if (i % 2 === 0) { // small golden connection point on every other line
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', (50 + (CORE + 4.2) * cos).toFixed(2)); dot.setAttribute('cy', (50 + (CORE + 4.2) * sin).toFixed(2));
      dot.setAttribute('r', '0.9'); dot.setAttribute('class', 'tk-point'); dot.style.setProperty('--i', i);
      linesEl.appendChild(dot);
    }
  });
  nodesEl.innerHTML = nodeHTML;
  if (legendEl) legendEl.innerHTML = legendHTML;
  orbit.setAttribute('aria-label', 'Scholarise Academy at the centre, connected to ' +
    tools.map(function (t) { return t.name; }).join(', '));

  // a broken logo file falls back to the initials placeholder
  Array.prototype.forEach.call(nodesEl.querySelectorAll('img'), function (img) {
    img.addEventListener('error', function () {
      var li = img.closest('.tk-node'); var t = tools[+li.getAttribute('data-tool')];
      li.classList.add('is-placeholder'); li.classList.remove('is-wide');
      img.outerHTML = '<span class="tk-mark">' + esc(initials(t)) + '</span>';
    }, { once: true });
  });

  // pointing at a tool (in the circle or in the list) highlights it in both places
  function hot(i, on) {
    Array.prototype.forEach.call(document.querySelectorAll('#learning-toolkit [data-tool="' + i + '"]'), function (el) {
      el.classList.toggle('is-hot', on);
    });
  }
  [nodesEl, legendEl].forEach(function (root) {
    if (!root) return;
    root.addEventListener('mouseover', function (e) { var el = e.target.closest('[data-tool]'); if (el) hot(el.getAttribute('data-tool'), true); });
    root.addEventListener('mouseout', function (e) { var el = e.target.closest('[data-tool]'); if (el) hot(el.getAttribute('data-tool'), false); });
  });
})();
