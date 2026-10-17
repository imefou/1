(function(){
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* hex grid background — build a pointy-top honeycomb once at load
     covering the SVG viewBox. A random ~18% of cells gets the pulse
     class with a random delay, so flashes feel sparse and unsynced.
     The hexes are polygon elements under one <svg>, so the whole thing
     is one draw layer and the browser can offload it to the GPU. */
  var hexSvg = document.querySelector('.bg-hex__svg');
  if (hexSvg) {
    var vbW = 1600, vbH = 1000;
    var size = 46;                         // hex radius (center to vertex)
    var hexW = Math.sqrt(3) * size;        // pointy-top horizontal pitch
    var rowStep = 1.5 * size;              // vertical pitch (overlapping)
    var cols = Math.ceil(vbW / hexW) + 2;
    var rows = Math.ceil(vbH / rowStep) + 2;
    var NS = 'http://www.w3.org/2000/svg';
    var frag = document.createDocumentFragment();
    for (var r = 0; r < rows; r++) {
      var yC = r * rowStep - size;
      var xOff = (r % 2) ? hexW / 2 : 0;
      for (var c = 0; c < cols; c++) {
        var xC = c * hexW + xOff - hexW / 2;
        var pts = '';
        for (var v = 0; v < 6; v++) {
          var a = Math.PI / 3 * v - Math.PI / 2;
          pts += (xC + size * Math.cos(a)).toFixed(1) + ',' +
                 (yC + size * Math.sin(a)).toFixed(1) + ' ';
        }
        var poly = document.createElementNS(NS, 'polygon');
        poly.setAttribute('points', pts.trim());
        poly.setAttribute('class', 'bg-hex__cell');
        if (!reduceMotion && Math.random() < 0.18) {
          poly.classList.add('bg-hex__cell--pulse');
          poly.style.setProperty('--d', (Math.random() * 7.5).toFixed(2) + 's');
        }
        frag.appendChild(poly);
      }
    }
    hexSvg.appendChild(frag);
  }

  /* mobile nav toggle */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* active nav link on scroll — tracks whatever element each
     nav link actually points to (hero, work, or the footer) */
  var navLinks = document.querySelectorAll('.nav-link');
  if (navLinks.length) {
    var navTargets = [];
    navLinks.forEach(function(link){
      var id = link.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) navTargets.push({ id: id, el: el });
    });
    var setActive = function(id){
      navLinks.forEach(function(l){
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    };
    if (navTargets.length) {
      var sectionObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            var match = navTargets.filter(function(t){ return t.el === entry.target; })[0];
            if (match) setActive(match.id);
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      navTargets.forEach(function(t){ sectionObserver.observe(t.el); });
    }
  }

  /* scroll reveal — randomly assign one of a few complementary
     in/out animation styles to each element, then toggle it both
     ways as the element enters and leaves the viewport. */
  var revealVariants = ['reveal--ring', 'reveal--dot', 'reveal--circle', 'reveal--ball', 'reveal--pulse'];
  var revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(function(el){
    var variant = revealVariants[Math.floor(Math.random() * revealVariants.length)];
    el.classList.add(variant);
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        entry.target.classList.toggle('in', entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
    revealEls.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* when a nav link (or any in-page anchor) is used to jump straight
     to a section, reveal its contents immediately instead of relying
     on the scroll-triggered observer, which can miss fast jumps */
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(){
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (!target) return;
      var els = target.matches('.reveal')
        ? [target]
        : Array.prototype.slice.call(target.querySelectorAll('.reveal'));
      els.forEach(function(el){ el.classList.add('in'); });
    });
  });

  /* morph the hero status card into the header once it scrolls
     out of view, and reverse it when it scrolls back into view */
  var heroStatusCard = document.querySelector('.status-card');
  var headerStatus = document.getElementById('header-status');
  var brandEl = document.getElementById('brand');
  if (heroStatusCard && headerStatus && 'IntersectionObserver' in window) {
    var statusObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var morphed = !entry.isIntersecting;
        headerStatus.classList.toggle('in', morphed);
        heroStatusCard.classList.toggle('morphed-out', morphed);
        if (brandEl) brandEl.classList.toggle('brand--hidden', morphed);
      });
    }, { threshold: 0, rootMargin: '-76px 0px 0px 0px' });
    statusObserver.observe(heroStatusCard);
  }

  /* "Work" nav link: land with the Work section peeking in near the
     bottom of the viewport instead of snapping to the top, so the
     About content above it stays mostly visible too */
  var workLink = document.querySelector('.nav-link[href="#work"]');
  var workSection = document.getElementById('work');
  if (workLink && workSection) {
    workLink.addEventListener('click', function(e){
      e.preventDefault();
      var rect = workSection.getBoundingClientRect();
      var targetY = window.pageYOffset + rect.top - (window.innerHeight * 0.62);
      window.scrollTo({ top: Math.max(targetY, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* icon-button scroll actions */
  var scrollHint = document.getElementById('scroll-hint');
  if (scrollHint) {
    scrollHint.addEventListener('click', function(){
      var about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* days editing, counted from March 15, 2026 — counts up from 0 the
     first time the number scrolls into view (one-shot), so the figure
     feels like it's being tallied rather than just appearing */
  var dayCountEl = document.getElementById('edit-day-count');
  if (dayCountEl) {
    var startDate = new Date(2026, 2, 15); // March is month index 2
    var now = new Date();
    var diffDays = Math.max(0, Math.round((now - startDate) / 86400000));

    if (reduceMotion || !('IntersectionObserver' in window)) {
      dayCountEl.textContent = diffDays;
    } else {
      dayCountEl.textContent = '0';
      var countStarted = false;
      var runCount = function(){
        if (countStarted) return;
        countStarted = true;
        var duration = 1200;
        var startTime = performance.now();
        var tick = function(frameTime){
          var p = Math.min(1, (frameTime - startTime) / duration);
          var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
          dayCountEl.textContent = Math.round(diffDays * eased);
          if (p < 1) requestAnimationFrame(tick);
          else dayCountEl.textContent = diffDays;
        };
        requestAnimationFrame(tick);
      };
      var countObs = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            runCount();
            countObs.disconnect();
          }
        });
      }, { threshold: 0.5 });
      countObs.observe(dayCountEl);
    }
  }

  /* hero name "Efou" — split into letter spans so each one fades/slides
     up with a short stagger on load. Done in JS so the HTML stays clean
     and screen readers still read the whole name. */
  var nameEl = document.getElementById('typed-name');
  if (nameEl && !reduceMotion) {
    var nameText = nameEl.textContent;
    nameEl.setAttribute('aria-label', nameText);
    nameEl.textContent = '';
    for (var li = 0; li < nameText.length; li++) {
      var span = document.createElement('span');
      span.className = 'letter';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', li);
      span.textContent = nameText[li];
      nameEl.appendChild(span);
    }
  }

  /* typing effect on hero subtitle */
  var subEl = document.getElementById('hero-sub');
  var fullText = "Editor — game montages & motion graphics.";
  if (subEl) {
    if (reduceMotion) {
      subEl.textContent = fullText;
    } else {
      subEl.classList.add('typing');
      var i = 0;
      var typeNext = function(){
        if (i <= fullText.length) {
          subEl.textContent = fullText.slice(0, i);
          i++;
          setTimeout(typeNext, 32);
        } else {
          setTimeout(function(){ subEl.classList.remove('typing'); }, 600);
        }
      };
      setTimeout(typeNext, 400);
    }
  }

  /* random TikTok embeds flanking the hero — two different videos
     picked each time the page loads, faded/blurred in from below */
  var tiktokIds = [
    '7681032398586285334',
    '7692959078309530902',
    '7691262424946576662',
    '7690341721414192406',
    '7690004517307370774',
    '7689580623039712534',
    '7688618502139202838',
    '7687891015637732630'
  ];
  var tiktokLeft = document.getElementById('tiktok-left');
  var tiktokRight = document.getElementById('tiktok-right');
  if (tiktokLeft && tiktokRight && tiktokIds.length >= 2) {
    var pool = tiktokIds.slice();
    var pick = function(){
      var i = Math.floor(Math.random() * pool.length);
      return pool.splice(i, 1)[0];
    };
    var idLeft = pick();
    var idRight = pick();

    var buildEmbed = function(id){
      return '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@imefou/video/' + id +
        '" data-video-id="' + id + '" style="max-width:325px;min-width:280px;"><section></section></blockquote>';
    };
    tiktokLeft.innerHTML = buildEmbed(idLeft);
    tiktokRight.innerHTML = buildEmbed(idRight);

    /* load TikTok's embed script once, after the blockquotes exist
       so it picks them up and renders the actual video cards */
    var embedScript = document.createElement('script');
    embedScript.src = 'https://www.tiktok.com/embed.js';
    embedScript.async = true;
    document.body.appendChild(embedScript);

    /* fade/blur/slide in shortly after the page opens */
    var revealVideos = function(){
      tiktokLeft.classList.add('in');
      tiktokRight.classList.add('in');
    };
    if (reduceMotion) {
      revealVideos();
    } else {
      window.setTimeout(revealVideos, 350);
    }
  }

  /* background video: pause when tab is hidden to save battery/CPU */
  var bgVideo = document.getElementById('bg-video');
  if (bgVideo) {
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) { bgVideo.pause(); }
      else if (!reduceMotion) { bgVideo.play().catch(function(){}); }
    });
    if (reduceMotion) { bgVideo.pause(); }
  }
})();
