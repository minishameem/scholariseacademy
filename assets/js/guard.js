/* Scholarise Academy – "Inspect" deterrent
   Blocks the usual keyboard shortcuts that open the browser's developer
   tools / page source, and shows a warning instead. Right-click stays normal.
   NOTE: this only discourages casual visitors. Browsers always allow developer
   tools from their own menu, so this is not real security.
   To turn it off: delete this file and its <script> line on each page. */
(function () {
  'use strict';

  var overlay = null, lastFocus = null;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'sg-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'sg-title');
    overlay.setAttribute('aria-describedby', 'sg-text');
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="sg-card">' +
        '<span class="sg-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M12 8v5"/><path d="M12 16.5h.01"/></svg></span>' +
        '<h2 class="sg-title" id="sg-title">Do not open Inspect</h2>' +
        '<p class="sg-text" id="sg-text">Inspect is turned off on this website for security purposes.</p>' +
        '<button type="button" class="btn btn-primary sg-btn">Go to Website</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('.sg-btn').addEventListener('click', hide);
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); hide(); }
      if (e.key === 'Tab') { e.preventDefault(); overlay.querySelector('.sg-btn').focus(); } // keep focus inside
    });
  }

  function show() {
    if (!overlay) build();
    if (!overlay.hidden) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add('sg-open');
    overlay.querySelector('.sg-btn').focus();
  }

  function hide() {
    overlay.hidden = true;
    document.documentElement.classList.remove('sg-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var blocked =
      e.key === 'F12' ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c', 'k'].indexOf(k) > -1) || // Ctrl+Shift+I/J/C/K
      (e.metaKey && e.altKey && ['i', 'j', 'c', 'u'].indexOf(k) > -1) ||                 // Mac: Cmd+Option+I/J/C/U
      ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && k === 'u');               // view page source
    if (blocked) { e.preventDefault(); e.stopPropagation(); show(); }
  }, true);

  // Right-click keeps the normal browser menu.
})();
