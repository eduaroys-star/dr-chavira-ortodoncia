/* ════════════════════════════════════════════════════════════════════
   SITIO WEB — DR. HERIBERTO E. CHAVIRA SANTOS · ORTODONCIA
   ════════════════════════════════════════════════════════════════════
   CONFIGURACIÓN RÁPIDA:
   • Los DATOS DE CONTACTO (WhatsApp, teléfono, dirección) se editan
     directamente en index.html (busca "EDITABLE: DATOS DE CONTACTO").
   • Los COLORES se editan en styles.css (bloque CONFIGURACIÓN).
   • Este archivo controla: menú móvil, animaciones al hacer scroll,
     contadores, acordeón de preguntas y detalles de accesibilidad.
   No es necesario modificarlo para el mantenimiento habitual.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── 1. HEADER: fondo sólido al hacer scroll ─────────── */
  var header = document.getElementById('header');

  function onHeaderScroll() {
    if (window.scrollY > 24) {
      header.classList.add('header--solid');
    } else {
      header.classList.remove('header--solid');
    }
  }
  onHeaderScroll();
  window.addEventListener('scroll', onHeaderScroll, { passive: true });

  /* ─────────── 2. MENÚ MÓVIL (hamburguesa accesible) ─────────── */
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav-principal');

  function closeMenu() {
    nav.classList.remove('abierto');
    navToggle.classList.remove('activo');
    document.body.classList.remove('nav-abierto');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  }

  function toggleMenu() {
    var isOpen = nav.classList.toggle('abierto');
    navToggle.classList.toggle('activo', isOpen);
    document.body.classList.toggle('nav-abierto', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  }

  navToggle.addEventListener('click', toggleMenu);

  // Cierra el menú al pulsar un enlace, la tecla Escape o al agrandar la pantalla
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('abierto')) {
      closeMenu();
      navToggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 880) closeMenu();
  });

  /* ─────────── 3. ENLACE ACTIVO según la sección visible ─────────── */
  var navLinks = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('main section[id]');

  if ('IntersectionObserver' in window && sections.length) {
    var linkObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('activo', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (section) { linkObserver.observe(section); });
  }

  /* ─────────── 4. ANIMACIÓN FADE-IN al hacer scroll ─────────── */
  var revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });

    // Red de seguridad: si por cualquier motivo el observador no llega a
    // dispararse (p. ej. pestaña oculta al cargar), muestra todo el contenido.
    window.setTimeout(function () {
      if (!document.querySelector('.reveal.visible')) {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
      }
    }, 1600);
  }

  /* ─────────── 5. CONTADORES ANIMADOS (38 años / 2000) ─────────── */
  var counters = document.querySelectorAll('[data-target]');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    if (reduceMotion) { el.textContent = String(target); return; }

    var duration = 1800; // ms
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) window.requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ─────────── 6. ACORDEÓN DE PREGUNTAS FRECUENTES ─────────── */
  var accordionItems = document.querySelectorAll('.accordion__item');

  accordionItems.forEach(function (item) {
    var btn = item.querySelector('.accordion__btn');
    var panel = item.querySelector('.accordion__panel');

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('abierto');

      // Cierra todos los demás (solo uno abierto a la vez)
      accordionItems.forEach(function (other) {
        other.classList.remove('abierto');
        other.querySelector('.accordion__btn').setAttribute('aria-expanded', 'false');
        other.querySelector('.accordion__panel').style.maxHeight = null;
      });

      // Abre el actual (si estaba cerrado)
      if (!isOpen) {
        item.classList.add('abierto');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ─────────── 7. FOTOS: mostrar placeholder elegante si falta el archivo ─────────── */
  document.querySelectorAll('img.js-photo').forEach(function (img) {
    var frame = img.closest('.photo-frame, .about-photo');
    if (!frame) return;
    function markAsMissing() { frame.classList.add('sin-foto'); }

    if (img.complete && img.naturalWidth === 0) markAsMissing();
    img.addEventListener('error', markAsMissing);
  });

  /* ─────────── 8. PARALLAX LIGERO en las formas del hero ─────────── */
  var blobs = document.querySelectorAll('.hero__blob[data-speed]');

  if (!reduceMotion && blobs.length && window.innerWidth > 768) {
    var ticking = false;

    function parallax() {
      var y = window.scrollY;
      blobs.forEach(function (blob) {
        var speed = parseFloat(blob.getAttribute('data-speed')) || 0;
        blob.style.transform = 'translateY(' + (y * speed).toFixed(1) + 'px)';
      });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(parallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ─────────── 9. AÑO AUTOMÁTICO en el footer ─────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
