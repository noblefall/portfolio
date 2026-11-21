(function () {
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  var links = menu.querySelectorAll('a');

  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  links.forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); burger.focus(); }
  });

  // Highlight the nav link for the section currently in view
  if ('IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove('active'); a.removeAttribute('aria-current'); });
          map[en.target.id].classList.add('active');
          map[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });

    // Subtle reveal-on-scroll for content blocks
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var blocks = document.querySelectorAll('.job, .card, .project, .facts-in > div, .skills > div, .gallery li');
      var seen = new WeakSet();
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !seen.has(en.target)) {
            seen.add(en.target);
            en.target.classList.add('in');
            ro.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      blocks.forEach(function (el, i) {
        el.classList.add('reveal');
        el.style.transitionDelay = (i % 4) * 60 + 'ms';
        ro.observe(el);
      });
    }
  }

  // Photo lightbox
  var lb = document.getElementById('lightbox');
  if (lb && lb.showModal) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p'), last;
    document.querySelectorAll('button[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        last = b;
        lbImg.src = b.dataset.full;
        lbImg.alt = b.querySelector('img').alt;
        lbCap.textContent = b.dataset.cap;
        lb.showModal();
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { lbImg.removeAttribute('src'); if (last) last.focus(); });
  }

  // Scroll progress bar
  var progress = document.getElementById('progress');
  var ticking = false;
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  // Back-to-top button
  var toTop = document.getElementById('totop');
  window.addEventListener('scroll', function () {
    toTop.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Hide the hero scroll cue once the visitor scrolls
  var cue = document.querySelector('.scroll-cue');
  if (cue) window.addEventListener('scroll', function () {
    cue.classList.toggle('hide', window.scrollY > 80);
  }, { passive: true });

  // Count-up animation for highlight numbers
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.facts strong').forEach(function (el) {
      var target = parseFloat(el.textContent);
      if (isNaN(target)) return;
      var decimals = (el.textContent.split('.')[1] || '').length;
      el.textContent = (0).toFixed(decimals);
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          co.unobserve(el);
          var start = null, dur = 1200;
          function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = (target * eased).toFixed(decimals);
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      }, { threshold: 0.4 });
      co.observe(el);
    });
  }
})();