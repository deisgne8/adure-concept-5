/* ADURE · Concept 01 · Daylight — motion and interaction */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector("[data-header]");

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
  var linesWrap = hero.querySelector("[data-hero-lines]");
  var lines = hero.querySelectorAll(".ln");
  var win = hero.querySelector("[data-hero-window]");
  var video = hero.querySelector("[data-hero-video]");
  var caption = hero.querySelector("[data-hero-caption]");

  lines.forEach(function (el) {
    var len = el.getTotalLength();
    el.style.strokeDasharray = len + " " + len;
    el.style.strokeDashoffset = len;
  });

  /* emblem mask geometry: official emblem viewBox is 84 × 92 units.
     The window starts exactly under the drawn lines, then grows around the tallest bar,
     while a circle (the logo's ring) opens the film to full screen. */
  var FOCUS_U = (137.0 - 89) / 84, FOCUS_V = (98 - 46) / 92;
  var mask = { s: 0, r: 0 };
  function linesHeightFrac() { return (linesWrap.getBoundingClientRect().height || window.innerHeight * 0.64) / window.innerHeight; }
  function applyMask() {
    var vw = win.clientWidth, vh = win.clientHeight;
    var S = mask.s * vh, W = S * 84 / 92;
    var start = linesHeightFrac() * 92 / 95;
    var k = gsap.utils.clamp(0, 1, (mask.s - start) / (5 - start));
    var u = 0.5 + (FOCUS_U - 0.5) * k, v = 0.5 + (FOCUS_V - 0.5) * k;
    var x = vw / 2 - u * W, y = vh / 2 - v * S;
    var r = mask.r * Math.hypot(vw, vh) / 2;
    var img = 'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%2289%2046%2084%2092%22%3E%3Cg%20fill%3D%22%23000%22%3E%3Cpath%20d%3D%22M171.67%2C88.27c0-.46%2C0-.69%2C0-.69v-.06s-.02-.25-.05-.73c-.04-.48-.06-1.2-.19-2.13-.2-1.86-.63-4.6-1.72-7.94-1.08-3.33-2.83-7.3-5.74-11.28-2.87-3.98-6.89-8-12.14-11.11-2.63-1.53-5.53-2.87-8.68-3.83-3.14-.97-6.52-1.55-10-1.71-6.96-.32-14.41%2C1.25-21.08%2C4.85-6.65%2C3.61-12.48%2C9.24-16.2%2C16.18-3.78%2C6.9-5.45%2C15-4.73%2C22.83.69%2C7.84%2C3.77%2C15.36%2C8.54%2C21.32%2C2.39%2C2.98%2C4.52%2C5.05%2C8.18%2C7.75.84.62%2C1.72%2C1.17%2C2.6%2C1.7-10.4-6.47-17.64-17.69-18.48-30.82-1.37-21.57%2C15.06-40.24%2C36.63-41.61%2C21.57-1.37%2C40.24%2C15.06%2C41.61%2C36.63.94%2C14.83-6.53%2C28.29-18.31%2C35.7%2C1.07-.62%2C2.09-1.28%2C3.06-1.98%2C4.73-3.36%2C8.32-7.47%2C10.85-11.52%2C2.56-4.05%2C3.99-8.07%2C4.81-11.43.23-.84.36-1.65.51-2.41.13-.76.21-1.48.31-2.15.06-.67.12-1.3.17-1.87.05-.57.05-1.12.07-1.59.05-.99%2C0-1.61%2C0-2.08Z%22%2F%3E%3Cpath%20d%3D%22M168.65%2C87.71c-1.32-20.72-19.25-36.51-39.98-35.19-20.72%2C1.32-36.51%2C19.25-35.19%2C39.98.79%2C12.37%2C7.5%2C22.99%2C17.19%2C29.25-3.59-2.4-6.82-5.44-9.39-9.03-2.11-2.93-3.83-6.18-5-9.61-.6-1.72-1.03-3.48-1.37-5.26-.33-1.78-.5-3.59-.59-5.4-.27-7.24%2C1.67-14.45%2C5.36-20.4%2C1.85-2.97%2C4.08-5.66%2C6.59-7.96%2C2.52-2.29%2C5.32-4.2%2C8.26-5.66.72-.39%2C1.49-.69%2C2.22-1.04.76-.29%2C1.5-.62%2C2.27-.86%2C1.52-.54%2C3.07-.92%2C4.61-1.24.78-.13%2C1.55-.29%2C2.32-.37.77-.11%2C1.54-.17%2C2.31-.22l.51-.04.62-.02c.41-.01.82-.03%2C1.24-.04.75.02%2C1.44%2C0%2C2.19.06%2C2.99.19%2C5.87.68%2C8.56%2C1.52%2C2.68.84%2C5.2%2C1.91%2C7.47%2C3.21%2C4.55%2C2.59%2C8.15%2C5.92%2C10.79%2C9.28%2C2.65%2C3.37%2C4.32%2C6.77%2C5.4%2C9.66%2C1.08%2C2.9%2C1.56%2C5.3%2C1.81%2C6.95.15.82.19%2C1.46.25%2C1.89.05.43.07.65.07.65v-.06s.01.24.04.69c.02.44.1%2C1.17.09%2C1.95%2C0%2C.41.03.85%2C0%2C1.36-.02.51-.04%2C1.07-.07%2C1.68-.1%2C1.21-.23%2C2.6-.5%2C4.14-.24%2C1.55-.67%2C3.24-1.24%2C5.05-.56%2C1.81-1.33%2C3.73-2.34%2C5.7-2.01%2C3.93-5.03%2C8.08-9.31%2C11.61-.82.67-1.68%2C1.31-2.58%2C1.92h0c11.18-7.14%2C18.27-20%2C17.36-34.15Z%22%2F%3E%3Cpolygon%20points%3D%22133.29%2068.62%20112.69%2083.85%20112.69%2087.64%20133.29%2072.41%20133.29%2068.62%22%2F%3E%3Cpolygon%20points%3D%22133.29%2075.44%20112.69%2090.67%20112.69%2094.45%20133.29%2079.23%20133.29%2075.44%22%2F%3E%3Cpolygon%20points%3D%22133.29%2082.25%20112.69%2097.48%20112.69%20101.27%20133.29%2086.04%20133.29%2082.25%22%2F%3E%3Cpolygon%20points%3D%22133.29%2089.24%20112.69%20104.46%20112.69%20108.25%20133.29%2093.02%20133.29%2089.24%22%2F%3E%3Cpolygon%20points%3D%22112.69%20115.23%20133.29%20100%20133.29%2096.22%20112.69%20111.44%20112.69%20115.23%22%2F%3E%3Cpolygon%20points%3D%22112.69%20122.21%20133.29%20106.98%20133.29%20103.2%20112.69%20118.42%20112.69%20122.21%22%2F%3E%3Cpath%20d%3D%22M133.29%2C124.14l-4.78%2C3.54c-1.27-.08-2.52-.22-3.75-.42l8.53-6.31v-3.79l-12.48%2C9.23c-1.02-.28-2.02-.61-3.01-.97l15.49-11.45v-3.79l-18.74%2C13.86-.09.07-.61.45c1.05.52%2C2.12.99%2C3.21%2C1.41.97.37%2C1.96.71%2C2.96%2C1%2C1.27.37%2C2.56.68%2C3.88.92%2C1.2.22%2C2.42.38%2C3.66.49%2C1.09.09%2C2.19.14%2C3.3.14.82%2C0%2C1.63-.03%2C2.43-.08v-4.3Z%22%2F%3E%3Cpath%20d%3D%22M145.95%2C73.45v51.14c-.71.31-1.43.6-2.16.87v-54.79l-3.06-3.94v59.71c-.71.19-1.43.37-2.16.52v-63.01l-3.06-3.94v67.46c-.73.09-1.48.16-2.22.21v.77c.75-.05%2C1.49-.11%2C2.22-.2%2C1.03-.12%2C2.05-.29%2C3.06-.49.73-.15%2C1.45-.32%2C2.16-.51%2C1.04-.28%2C2.06-.59%2C3.06-.95.73-.26%2C1.45-.54%2C2.16-.85%2C1.05-.45%2C2.07-.94%2C3.06-1.47v-.89h0v-45.69l-3.06-3.94Z%22%2F%3E%3Crect%20x%3D%2294.02%22%20y%3D%22134.74%22%20width%3D%2274.61%22%20height%3D%221.39%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E"), radial-gradient(circle at 50% 50%, #000 ' + r + 'px, transparent ' + (r + 1) + 'px)';
    win.style.webkitMaskImage = img; win.style.maskImage = img;
    var size = W + "px " + S + "px, 100% 100%", pos = x + "px " + y + "px, 0 0";
    win.style.webkitMaskSize = size; win.style.maskSize = size;
    win.style.webkitMaskPosition = pos; win.style.maskPosition = pos;
  }

  var mm = gsap.matchMedia();
  mm.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)" }, function (ctx) {
    var d = ctx.conditions.desktop;
    var rise = function () { return -window.innerHeight * (d ? 0.5 : 0.26); };
    gsap.set(building.querySelector("img"), { filter: "brightness(1) saturate(1)" });
    gsap.set(win, { autoAlpha: 0 });
    gsap.set(caption, { autoAlpha: 0, y: 24 });
    gsap.set(linesWrap, { autoAlpha: 1 });
    mask.s = linesHeightFrac() * 92 / 95; mask.r = 0; applyMask();

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero, start: "top top", end: function () { return "+=" + window.innerHeight * (d ? 2.4 : 1.8); },
        scrub: 0.7, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          if (self.progress > 0.45 && video.paused) { video.play().catch(function () {}); }
          if (self.progress < 0.4 && !video.paused) { video.pause(); }
        },
        onRefresh: applyMask
      }
    });
    tl.to(subs, { autoAlpha: 0, y: -24, duration: 0.35 }, 0)
      .to(building, { y: rise, duration: 1.1, ease: "power1.inOut" }, 0)
      .to(copy, { scale: 0.9, y: -window.innerHeight * 0.04, duration: 1.1 }, 0)
      .to(copy, { autoAlpha: 0.22, duration: 0.6 }, 0.5)
      .to(building.querySelector("img"), { filter: "brightness(0.62) saturate(0.9)", duration: 0.45 }, 0.95)
      .to(lines, { strokeDashoffset: 0, duration: 1.0, stagger: 0.045, ease: "power1.inOut" }, 1.0)
      .to(copy, { autoAlpha: 0, duration: 0.3 }, 1.6)
      .to(building, { autoAlpha: 0, duration: 0.55 }, 2.2)
      .to(lines, { stroke: "#004789", duration: 0.5 }, 2.1)
      .to(win, { autoAlpha: 1, duration: 0.45 }, 2.35)
      .to(linesWrap, { autoAlpha: 0, duration: 0.45 }, 2.55)
      .to(caption, { autoAlpha: 1, y: 0, duration: 0.45 }, 2.55)
      .to(caption, { autoAlpha: 0, y: -16, duration: 0.3 }, 3.25)
      .to(mask, { s: 6.5, duration: 1.1, ease: "power2.in", onUpdate: applyMask }, 3.2)
      .to(mask, { r: 1.05, duration: 0.7, ease: "power1.in", onUpdate: applyMask }, 3.6)
      .to({}, { duration: 0.25 });
    window.addEventListener("resize", applyMask);
    return function () { window.removeEventListener("resize", applyMask); };
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
