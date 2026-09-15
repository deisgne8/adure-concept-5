/* ADURE · Concept 01 · Daylight — motion and interaction */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector("[data-header]");
  var intro = document.querySelector("[data-page-intro]");
  var introFill = document.querySelector("[data-intro-fill]");

  function setHeader(y) { header.classList.toggle("is-scrolled", y > 40); }
  setHeader(window.scrollY);

  /* mobile menu */
  var menuBtn = document.querySelector("[data-menu-btn]");
  var menu = document.querySelector("[data-menu]");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
      header.classList.toggle("is-scrolled", !open || window.scrollY > 40);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) { menuBtn.setAttribute("aria-expanded", "false"); menu.hidden = true; }
    });
  }

  /* buy / rent toggle and favourites */
  document.querySelectorAll("[data-seg]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("[data-seg]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    });
  });
  document.querySelectorAll(".fav").forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "♥" : "♡";
    });
  });

  /* list or map view of available properties */
  var PINS = [
    { name: "Qaryat Al Hidd", area: "Saadiyat Island", lat: 24.5720, lng: 54.4655, note: "Apartments and retail, sea and community views" },
    { name: "Jubail Island", area: "Abu Dhabi", lat: 24.5253, lng: 54.4953, note: "Villas" },
    { name: "Julphar Residence", area: "Al Reem Island", lat: 24.4954, lng: 54.4052, note: "Apartments" },
    { name: "Al Raha", area: "Abu Dhabi", lat: 24.4859, lng: 54.6009, note: "Apartments and retail" }
  ];
  var map = null, markers = [];
  function pinIcon(on) { return window.L ? L.divIcon({ className: "", html: '<span class="pin' + (on ? " is-on" : "") + '"></span>', iconSize: [18, 18], iconAnchor: [9, 9] }) : null; }
  function focusPin(i) {
    if (!map) return;
    markers.forEach(function (m, k) { m.setIcon(pinIcon(k === i)); });
    document.querySelectorAll(".map-item").forEach(function (b) { b.setAttribute("aria-current", String(Number(b.getAttribute("data-pin")) === i)); });
    map.flyTo([PINS[i].lat, PINS[i].lng], 13, { duration: 0.8 });
    markers[i].openPopup();
  }
  function initMap() {
    if (map || !window.L) return;
    map = L.map("map", { scrollWheelZoom: false, zoomControl: false, attributionControl: true }).setView([24.525, 54.49], 11);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    /* Prototype tiles: OpenStreetMap, shown in greyscale. Production: a keyed Google Maps or Mapbox style in ADURE navy. */
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
    PINS.forEach(function (p, i) {
      var m = L.marker([p.lat, p.lng], { icon: pinIcon(false), title: p.name, keyboard: true }).addTo(map);
      m.bindPopup("<b>" + p.name + "</b>" + p.area + "<br>" + p.note);
      m.on("click", function () { focusPin(i); });
      markers.push(m);
    });
  }
  var panel = document.querySelector("[data-map-panel]"), cardsEl = document.querySelector("[data-cards]");
  document.querySelectorAll("[data-view]").forEach(function (b) {
    b.addEventListener("click", function () {
      var toMap = b.getAttribute("data-view") === "map";
      document.querySelectorAll("[data-view]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      panel.hidden = !toMap; cardsEl.hidden = toMap;
      if (toMap) { initMap(); setTimeout(function () { if (map) map.invalidateSize(); }, 60); }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
  document.querySelectorAll(".map-item").forEach(function (b) {
    b.addEventListener("click", function () { focusPin(Number(b.getAttribute("data-pin"))); });
  });

  /* split the statement into words (used by the scroll reveal) */
  var statement = document.querySelector("[data-reveal-words]");
  if (statement) {
    statement.innerHTML = statement.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
  }

  if (reduce || !window.gsap || !window.ScrollTrigger || !window.Lenis) {
    doc.classList.add("no-motion");
    if (intro) intro.remove();
    window.addEventListener("scroll", function () { setHeader(window.scrollY); }, { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  doc.classList.add("motion");

  /* smooth scroll */
  var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  window.__lenis = lenis;
  lenis.on("scroll", function (e) { ScrollTrigger.update(); setHeader(e.scroll); });
  gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: id === "#top" ? 0 : -70, duration: 1.4 });
    });
  });

  /* ---------- 01 HERO: building rises, emblem draws, window opens ---------- */
  var hero = document.querySelector("[data-hero]");
  var copy = hero.querySelector("[data-hero-copy]");
  var subs = hero.querySelectorAll("[data-hero-sub]");
  var building = hero.querySelector("[data-hero-building]");
  var linesWrap = document.querySelector("[data-hero-lines]");
  var lines = linesWrap.querySelectorAll(".ln");
  var win = hero.querySelector("[data-hero-window]");
  var video = hero.querySelector("[data-hero-video]");
  var caption = hero.querySelector("[data-hero-caption]");

  lines.forEach(function (el) {
    var len = el.getTotalLength();
    el.style.strokeDasharray = len + " " + len;
    el.style.strokeDashoffset = len;
  });

  /* The emblem is now a one-time page intro. The hero remains visible beneath
     the sky-blue layer, so the final wipe reveals the page immediately. */
  if (intro && introFill) {
    doc.classList.add("intro-active");
    gsap.set(header, { autoAlpha: 0 });
    gsap.set(intro, { clipPath: "inset(0 0 0% 0)" });
    gsap.set(linesWrap, { display: "block", autoAlpha: 1 });
    gsap.set(introFill, { autoAlpha: 0, scale: 0.9 });

    gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: function () {
        doc.classList.remove("intro-active");
        intro.remove();
        gsap.set(linesWrap, { display: "none" });
        gsap.set(header, { clearProps: "opacity,visibility" });
        ScrollTrigger.refresh();
      }
    })
      .to(lines, { strokeDashoffset: 0, duration: 1.1, stagger: 0.055, ease: "power1.inOut" })
      .to({}, { duration: 0.38 })
      .to(introFill, { autoAlpha: 1, scale: 1, duration: 0.68 }, ">")
      .to(lines, { autoAlpha: 0, duration: 0.4 }, "<0.12")
      .to({}, { duration: 0.58 })
      .to(introFill, { scale: 1.05, duration: 0.55, ease: "power2.inOut" })
      .to(intro, { clipPath: "inset(0 0 100% 0)", duration: 0.82, ease: "power3.inOut" }, "<0.18")
      .to(header, { autoAlpha: 1, duration: 0.55 }, "<0.08");
  } else {
    if (intro) intro.remove();
    gsap.set(linesWrap, { display: "none" });
  }

  /* The scroll transition now moves directly from the hero image into video.
     The emblem does not replay here. */
  var mm = gsap.matchMedia();
  mm.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)" }, function (ctx) {
    var d = ctx.conditions.desktop;
    var rise = function () { return -window.innerHeight * (d ? 0.5 : 0.26); };
    gsap.set(building.querySelector("img"), { filter: "brightness(1) saturate(1)" });
    gsap.set(win, { autoAlpha: 0 });
    gsap.set(caption, { autoAlpha: 0, y: 24 });

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero, start: "top top", end: function () { return "+=" + window.innerHeight * (d ? 1.9 : 1.5); },
        scrub: 0.7, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (self.progress > 0.38 && video.paused) { video.play().catch(function () {}); }
          if (self.progress < 0.32 && !video.paused) { video.pause(); }
        }
      }
    });
    tl.to(subs, { autoAlpha: 0, y: -24, duration: 0.35 }, 0)
      .to(building, { y: rise, duration: 1.1, ease: "power1.inOut" }, 0)
      .to(copy, { scale: 0.9, y: -window.innerHeight * 0.04, duration: 1.1 }, 0)
      .to(copy, { autoAlpha: 0.22, duration: 0.55 }, 0.42)
      .to(building.querySelector("img"), { filter: "brightness(0.68) saturate(0.9)", duration: 0.45 }, 0.65)
      .to(copy, { autoAlpha: 0, duration: 0.3 }, 0.8)
      .to(building, { autoAlpha: 0, duration: 0.55 }, 0.88)
      .to(win, { autoAlpha: 1, duration: 0.72, ease: "power1.inOut" }, 0.78)
      .to(caption, { autoAlpha: 1, y: 0, duration: 0.42 }, 1.28)
      .to(caption, { autoAlpha: 0, y: -16, duration: 0.3 }, 1.92)
      .to({}, { duration: 0.25 });
  });

  /* ---------- 02 statement words darken as they are read ---------- */
  if (statement) {
    var words = statement.querySelectorAll(".w");
    gsap.set(words, { color: "#ADADAD" });
    gsap.to(words, {
      color: "#000000", stagger: 0.08, ease: "none",
      scrollTrigger: { trigger: statement, start: "top 82%", end: "bottom 42%", scrub: true }
    });
  }

  /* ---------- emblem mosaic assembles ---------- */
  var mosaic = document.querySelector("[data-mosaic] svg");
  if (mosaic) {
    var stripes = mosaic.querySelectorAll(".piece.stripe");
    var bars = mosaic.querySelectorAll(".piece.bar");
    var arcs = mosaic.querySelectorAll(".arc, .base");
    var mt = gsap.timeline({ scrollTrigger: { trigger: mosaic, start: "top 85%", end: "center 55%", scrub: 0.8 } });
    mt.from(stripes, { x: -26, y: 14, opacity: 0.15, stagger: 0.08, duration: 1, ease: "power2.out" }, 0)
      .from(bars, { y: 30, opacity: 0.15, duration: 1, ease: "power2.out" }, 0.2)
      .from(arcs, { opacity: 0.2, scale: 0.94, transformOrigin: "50% 50%", svgOrigin: "131 92", duration: 1, stagger: 0.1 }, 0.1);
  }

  /* ---------- services: the row crossing the centre shows its photograph ---------- */
  document.querySelectorAll("[data-svc]").forEach(function (row) {
    ScrollTrigger.create({ trigger: row, start: "top 58%", end: "bottom 58%", toggleClass: { targets: row, className: "is-active" } });
  });

  /* ---------- gentle entrances (transform only; content always visible) ---------- */
  gsap.utils.toArray(".card, .pillar, .handover-steps li, .intent, .stats div").forEach(function (el, i) {
    gsap.from(el, { y: 44, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
  });
  /* handover: the cyan line runs through the four weeks */
  var hsLine = document.querySelector("[data-hs-line]");
  if (hsLine) {
    mm.add({ wide: "(min-width: 901px)", narrow: "(max-width: 900px)" }, function (c) {
      var prop = c.conditions.wide ? "scaleX" : "scaleY";
      var from = {}; from[prop] = 0; var to = { ease: "none", scrollTrigger: { trigger: "[data-handover]", start: "top 88%", end: c.conditions.wide ? "top 40%" : "bottom 70%", scrub: true } }; to[prop] = 1;
      gsap.fromTo(hsLine, from, to);
    });
    gsap.fromTo(".handover-media img", { yPercent: -8 }, { yPercent: 2, ease: "none", scrollTrigger: { trigger: ".handover", start: "top bottom", end: "bottom top", scrub: true } });
  }

  gsap.utils.toArray(".contact-media img").forEach(function (img) {
    gsap.fromTo(img, { yPercent: -6, scale: 1.1 }, { yPercent: 6, scale: 1.1, ease: "none", scrollTrigger: { trigger: img.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
  });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
