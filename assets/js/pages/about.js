/* ==========================================================================
   Backlog Buddy — about page
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('about.html');
  U.renderFooter();
  U.qa('[data-icon]').forEach(function (el) { el.innerHTML = U.icon(el.getAttribute('data-icon'), +el.getAttribute('data-size')); });
  U.reveal();
})();
