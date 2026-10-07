(function () {
  'use strict';

  var isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    document.body.classList.add('touch-device');
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  (function initGalaxy() {
    var canvas = document.getElementById('galaxy-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var width, height;
    var stars = [];
    var particles = [];
    var shootingStars = [];

    function isMobile() {
      return window.innerWidth < 640;
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createStars() {
      stars = [];
      var count = isMobile() ? 70 : 160;
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.3,
          baseAlpha: Math.random() * 0.5 + 0.4,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    }

    function createParticles() {
      particles = [];
      var count = isMobile() ? 18 : 40;
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.8 + 0.6,
          speedX: (Math.random() - 0.5) * 0.15,
          speedY: (Math.random() - 0.5) * 0.15,
          hue: Math.random() > 0.5 ? '34,211,238' : '139,92,246',
          alpha: Math.random() * 0.4 + 0.2
        });
      }
    }

    function maybeSpawnShootingStar() {
      if (Math.random() < 0.0025 && shootingStars.length < 2) {
        var startX = Math.random() * width * 0.6;
        var startY = Math.random() * height * 0.35;
        shootingStars.push({
          x: startX,
          y: startY,
          length: Math.random() * 90 + 60,
          speed: Math.random() * 9 + 8,
          angle: Math.PI / 5,
          life: 1
        });
      }
    }

    var time = 0;

    function draw() {
      ctx.clearRect(0, 0, width, height);

      /* twinkling stars */
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinklePhase) * 0.3;
        alpha = Math.max(0.1, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(2) + ')';
        ctx.fill();
      }

      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.hue + ',' + p.alpha + ')';
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(' + p.hue + ',0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        maybeSpawnShootingStar();
      }
      for (var k = shootingStars.length - 1; k >= 0; k--) {
        var sh = shootingStars[k];
        var dx = Math.cos(sh.angle) * sh.length;
        var dy = Math.sin(sh.angle) * sh.length;
        var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - dx, sh.y - dy);
        grad.addColorStop(0, 'rgba(255,255,255,' + sh.life + ')');
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - dx, sh.y - dy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();

        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;
        sh.life -= 0.015;

        if (sh.life <= 0 ||  sh.x > width + 100 ||  sh.y > height + 100) {
          shootingStars.splice(k, 1);
        }
      }

      time++;
    }

    function loop() {
      draw();
      requestAnimationFrame(loop);
    }

    function setup() {
      resize();
      createStars();
      createParticles();
    }

    var resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setup, 200);
    });

    setup();

    if (prefersReducedMotion) {
      /* Draw a single static frame instead of animating continuously */
      draw();
    } else {
      requestAnimationFrame(loop);
    }
  })();

  (function initCursor() {
    if (isTouchDevice) return;
    var dot = document.getElementById('cursor-dot');
    var glow = document.getElementById('cursor-glow');
    if (!dot || !glow) return;

    var mouseX = 0, mouseY = 0;
    var glowX = 0, glowY = 0;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.15;
      glowY += (mouseY - glowY) * 0.15;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();

    var hoverTargets = document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card, .web3-card');
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        dot.classList.add('cursor-hover');
        glow.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', function () {
        dot.classList.remove('cursor-hover');
        glow.classList.remove('cursor-hover');
      });
    });
  })();

  (function initTyping() {
    var el = document.getElementById('typing-text');
    if (!el) return;

    var phrases = ['Web Developer', 'Web3 Enthusiast', 'JavaScript Learner', 'Blockchain Explorer', 'Digital Builder'];
    var phraseIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var typeSpeed = 90;
    var deleteSpeed = 45;
    var pauseAfterType = 1400;
    var pauseAfterDelete = 400;

    function tick() {
      var current = phrases[phraseIndex];

      if (!deleting) {
        charIndex++;
        el.textContent = current.substring(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          return setTimeout(tick, pauseAfterType);
        }
        return setTimeout(tick, typeSpeed);
      } 
      else {
        charIndex--;
        el.textContent = current.substring(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          return setTimeout(tick, pauseAfterDelete);
        }
        return setTimeout(tick, deleteSpeed);
      }
    }

    if (prefersReducedMotion) {
      el.textContent = phrases[0];
    } else {
      setTimeout(tick, 700);
    }
  })();

  (function initNav() {
    var navbar = document.getElementById('navbar');
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('nav-links');
    var links = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('main section[id]');

    function onScroll() {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          links.forEach(function (link) {
            link.classList.toggle('active-link', link.getAttribute('data-section') === id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  })();

  (function initScrollReveal() {
    var revealEls = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          /* Remove so animation replays on re-entry (scrolling up or down) */
          entry.target.classList.remove('in-view');
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });

    var heroEls = document.querySelectorAll('.hero .reveal-fade');
    setTimeout(function () {
      heroEls.forEach(function (el) { el.classList.add('in-view'); });
    }, 150);
  })();

  (function initProgressBar() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;

    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  })();

  (function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  })();

  (function initScrollDown() {
    var scrollDownBtn = document.getElementById('scroll-down');
    if (!scrollDownBtn) return;
    scrollDownBtn.addEventListener('click', function () {
      var about = document.getElementById('about');
      if (about) about.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  })();

  (function initProjectFilter() {
    var buttons = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.project-card');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        var filter = btn.getAttribute('data-filter');

        cards.forEach(function (card) {
          var categories = card.getAttribute('data-category') || '';
          var show = filter === 'all' || categories.indexOf(filter) !== -1;

          if (show) {
            card.classList.remove('filtered-out');
          } else {
            card.classList.add('filtered-out');
          }
        });
      });
    });
  })();

  (function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('name');
    var emailInput = document.getElementById('email');
    var messageInput = document.getElementById('message');
    var successMsg = document.getElementById('form-success');

    function setError(input, errorEl, message) {
      errorEl.textContent = message;
      input.closest('.form-group').classList.toggle('has-error', !!message);
    }

    function validateEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      successMsg.textContent = '';

      var valid = true;

      if (!nameInput.value.trim()) {
        setError(nameInput, document.getElementById('name-error'), 'Please enter your name.');
        valid = false;
      } else {
        setError(nameInput, document.getElementById('name-error'), '');
      }

      if (!emailInput.value.trim()) {
        setError(emailInput, document.getElementById('email-error'), 'Please enter your email.');
        valid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        setError(emailInput, document.getElementById('email-error'), 'Please enter a valid email address.');
        valid = false;
      } else {
        setError(emailInput, document.getElementById('email-error'), '');
      }

      if (!messageInput.value.trim()) {
        setError(messageInput, document.getElementById('message-error'), 'Please write a short message.');
        valid = false;
      } else {
        setError(messageInput, document.getElementById('message-error'), '');
      }

      if (valid) {
        successMsg.textContent = 'Message prepared successfully. (This site runs fully offline — no data was sent to a server.)';
        form.reset();
      }
    });
  })();

})();