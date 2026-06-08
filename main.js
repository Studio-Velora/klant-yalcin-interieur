/* Yalcin — shared interactions: nav, reveal, parallax, cookie, before/after */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  function initNav() {
    var nav = document.querySelector("[data-nav]");
    if (!nav) return;
    var toggle = nav.querySelector("[data-nav-toggle]");
    var menu = nav.querySelector("[data-nav-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("nav-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          nav.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        }
      });
    }

    // shrink / shadow on scroll
    var onScroll = function () {
      nav.classList.toggle("nav-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Parallax (subtle) ---------- */
  function initParallax() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var center = r.top + r.height / 2;
        var pct = (center - vh / 2) / vh; // -1..1
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.12;
        el.style.transform = "translate3d(0," + (-pct * speed * 100).toFixed(2) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Count-up stats ---------- */
  function initCounters() {
    var els = document.querySelectorAll("[data-count]");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var dur = 1400, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = Math.round(target * eased);
          el.textContent = val.toLocaleString("nl-NL") + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Before / After slider ---------- */
  function initBeforeAfter() {
    document.querySelectorAll("[data-ba]").forEach(function (ba) {
      var after = ba.querySelector(".ba-after");
      var handle = ba.querySelector(".ba-handle");
      var dragging = false;
      function setPos(clientX) {
        var r = ba.getBoundingClientRect();
        var x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
        var pct = (x * 100).toFixed(2);
        after.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
      }
      function start(e) { dragging = true; setPos((e.touches ? e.touches[0] : e).clientX); }
      function move(e) { if (dragging) setPos((e.touches ? e.touches[0] : e).clientX); }
      function end() { dragging = false; }
      ba.addEventListener("mousedown", start);
      ba.addEventListener("touchstart", start, { passive: true });
      window.addEventListener("mousemove", move);
      window.addEventListener("touchmove", move, { passive: true });
      window.addEventListener("mouseup", end);
      window.addEventListener("touchend", end);
      // init at 55%
      after.style.clipPath = "inset(0 0 0 55%)";
      handle.style.left = "55%";
    });
  }

  /* ---------- Testimonials slider (optional autoplay) ---------- */
  function initTestimonials() {
    var track = document.querySelector("[data-testi-track]");
    if (!track) return;
    var slides = track.children;
    var dots = document.querySelectorAll("[data-testi-dot]");
    var i = 0, n = slides.length, timer;
    function go(k) {
      i = (k + n) % n;
      track.style.transform = "translateX(" + (-i * 100) + "%)";
      dots.forEach(function (d, idx) { d.classList.toggle("on", idx === i); });
    }
    dots.forEach(function (d, idx) { d.addEventListener("click", function () { go(idx); reset(); }); });
    document.querySelectorAll("[data-testi-prev]").forEach(function (b) { b.addEventListener("click", function () { go(i - 1); reset(); }); });
    document.querySelectorAll("[data-testi-next]").forEach(function (b) { b.addEventListener("click", function () { go(i + 1); reset(); }); });
    function reset() { clearInterval(timer); timer = setInterval(function () { go(i + 1); }, 6500); }
    reset();
  }

  /* ---------- Cookie consent ---------- */
  function initCookies() {
    var KEY = "yalcin_cookie_consent";
    var bar = document.querySelector("[data-cookie]");
    if (!bar) return;
    try {
      if (localStorage.getItem(KEY)) { bar.remove(); return; }
    } catch (e) {}
    setTimeout(function () { bar.classList.add("show"); }, 900);
    bar.querySelectorAll("[data-cookie-choice]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem(KEY, btn.getAttribute("data-cookie-choice")); } catch (e) {}
        bar.classList.remove("show");
        setTimeout(function () { bar.remove(); }, 500);
      });
    });
  }

  /* ---------- Auto-upgrade placeholders to real media ---------- */
  function initMediaSlots() {
    document.querySelectorAll(".ph[data-src]").forEach(function (el) {
      var src = el.getAttribute("data-src");
      if (!src) return;
      var img = new Image();
      img.onload = function () {
        el.style.background = 'url("' + src + '") center/cover no-repeat';
        el.classList.add("has-img");
      };
      img.src = src;
    });
    // video slot: <div class="video-slot" data-src="assets/video/hero.mp4">
    document.querySelectorAll("[data-video-src]").forEach(function (el) {
      var src = el.getAttribute("data-video-src");
      var poster = el.getAttribute("data-poster") || "";
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
      v.setAttribute("playsinline", "");
      if (poster) v.poster = poster;
      v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .8s";
      v.addEventListener("loadeddata", function () {
        v.style.opacity = "1";
        el.classList.add("has-img");
        v.play().catch(function () {});
      });
      v.addEventListener("error", function () { v.remove(); });
      var s = document.createElement("source");
      s.src = src; s.type = "video/mp4";
      v.appendChild(s);
      el.appendChild(v);
    });
  }

  /* ---------- init ---------- */
  function init() {
    initNav();
    initReveal();
    initParallax();
    initCounters();
    initBeforeAfter();
    initTestimonials();
    initCookies();
    initMediaSlots();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
