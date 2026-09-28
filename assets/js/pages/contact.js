/* ==========================================================================
   Backlog Buddy — contact & feedback page
   ========================================================================== */
(function () {
  'use strict';
  var U = window.BBUI, BB = window.BB;

  U.renderHeader('contact.html');
  U.renderFooter();
  U.qa('[data-icon]').forEach(function (el) { el.innerHTML = U.icon(el.getAttribute('data-icon'), +el.getAttribute('data-size')); });

  BB.ready(function () {
    var p = U.params();
    var branch = U.qs('#c-branch');
    BB.branches().forEach(function (b) {
      var o = document.createElement('option');
      o.value = b.id; o.textContent = b.code + ' - ' + b.name;
      branch.appendChild(o);
    });
    if (p.subject) {
      U.qs('#c-code').value = p.subject;
      U.qs('#c-topic').value = 'Request a question paper';
      U.qs('#c-msg').value = 'Please upload previous question papers for ' + p.subject + '.';
    }
    if (p.branch) branch.value = p.branch;

    U.qs('#contact-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = U.qs('#c-name').value.trim();
      var email = U.qs('#c-email').value.trim();
      var msg = U.qs('#c-msg').value.trim();
      var status = U.qs('#form-status');

      if (!name || !email || !msg) {
        status.textContent = 'Please fill in your name, email and message.';
        status.style.color = 'var(--danger)';
        U.toast('Missing details', 'Name, email and message are required.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        status.textContent = 'That email address does not look right.';
        status.style.color = 'var(--danger)';
        U.toast('Invalid email', 'Check the email address and try again.', 'error');
        return;
      }

      var record = {
        id: 'f' + Date.now(),
        name: name, email: email,
        branch: branch.value, topic: U.qs('#c-topic').value,
        code: U.qs('#c-code').value.trim(), message: msg,
        createdAt: new Date().toISOString()
      };
      try {
        var all = JSON.parse(localStorage.getItem('bb_feedback_v1') || '[]');
        all.push(record);
        localStorage.setItem('bb_feedback_v1', JSON.stringify(all));
      } catch (err) { /* storage unavailable */ }

      status.textContent = 'Thanks ' + name.split(' ')[0] + '! Your message has been recorded.';
      status.style.color = 'var(--success)';
      U.toast('Message sent', 'Reference ' + record.id, 'success');
      U.qs('#contact-form').reset();
    });
  });
})();
