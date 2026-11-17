// Version 8: turn postcards over; the case-study link on the back becomes reachable once it shows.
(function () {
  document.querySelectorAll('[data-pc]').forEach(function (pc) {
    var b = pc.querySelector('.pc-in'), go = pc.querySelector('.go'), name = b.getAttribute('aria-label').split(' postcard')[0];
    b.addEventListener('click', function (e) {
      if (e.target.closest('.go') && pc.classList.contains('is-flipped')) return; // let the link work
      var on = pc.classList.toggle('is-flipped');
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', name + ' postcard. ' + (on ? 'Turn back to the picture' : 'Turn it over'));
      go.tabIndex = on ? 0 : -1;
    });
    go.addEventListener('click', function (e) { if (!pc.classList.contains('is-flipped')) e.preventDefault(); e.stopPropagation(); });
  });
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { try { navigator.clipboard.writeText(b.dataset.copy).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy address'; }, 1600); }, function () {}); } catch (e) {} });
  });
})();
