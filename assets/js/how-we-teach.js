/* How We Teach – interactive diagrams.
   Every interactive diagram on the page is one reusable pattern:
   a [data-tabs] container holding role="tab" buttons and role="tabpanel" panels.
   Without JavaScript, all panels stay visible, so no content is lost. */
(function () {
  'use strict';

  function initTabs(root) {
    var tabs = Array.prototype.filter.call(root.querySelectorAll('[role="tab"]'), function (t) {
      return t.closest('[data-tabs]') === root;
    });
    if (!tabs.length) return;
    var prev = root.querySelector('[data-tab-prev]');
    var next = root.querySelector('[data-tab-next]');
    var current = 0;

    function panelOf(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }

    function select(index, focus) {
      current = Math.max(0, Math.min(tabs.length - 1, index));
      tabs.forEach(function (tab, i) {
        var on = i === current;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.tabIndex = on ? 0 : -1;
        tab.classList.toggle('is-done', i < current);
        var panel = panelOf(tab);
        if (panel) { panel.hidden = !on; panel.tabIndex = 0; }
      });
      root.setAttribute('data-active', String(current));
      root.style.setProperty('--i', current);
      if (prev) prev.disabled = current === 0;
      if (next) {
        next.disabled = current === tabs.length - 1;
        next.textContent = current === tabs.length - 1 ? 'Lesson complete' : 'Next step';
      }
      if (focus) tabs[current].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); select((i + 1) % tabs.length, true); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
        else if (k === 'Home') { e.preventDefault(); select(0, true); }
        else if (k === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
    if (prev) prev.addEventListener('click', function () { select(current - 1, false); });
    if (next) next.addEventListener('click', function () { select(current + 1, false); });

    var start = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    select(start < 0 ? 0 : start, false);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-tabs]'), initTabs);
})();
