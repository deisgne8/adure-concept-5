/* ADURE · Concept 01 · Daylight — motion and interaction */
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector("[data-header]");
  var intro = document.querySelector("[data-page-intro]");
  var hero = document.querySelector("[data-hero]");
  var copy = hero.querySelector("[data-hero-copy]");
  var building = hero.querySelector("[data-hero-building]");
  var heroHaze = hero.querySelector(".hero-haze");
  var eyebrow = hero.querySelector(".hero-eyebrow");
  var title = hero.querySelector(".hero-title");
  var titleLines = Array.prototype.slice.call(title.querySelectorAll(".line"));
  var titleCurrent = title.querySelector(".hero-title-current");
  var titleNext = title.querySelector(".hero-title-next");
  var heroSub = hero.querySelector(".hero-sub");
  var heroCta = hero.querySelector(".hero-cta");
  var heroCtas = Array.prototype.slice.call(heroCta.querySelectorAll(".btn"));
  var scrollCue = hero.querySelector(".scroll-cue");
  var linesWrap = document.querySelector("[data-hero-lines]");
  var introLogo = document.querySelector("[data-intro-logo]");
  var introLogoEmblem = document.querySelector("[data-intro-logo-emblem]");
  var introLogoWord = document.querySelector("[data-intro-logo-word]");
  var introLogoLetters = introLogoWord ? Array.prototype.slice.call(introLogoWord.querySelectorAll(".intro-logo-letter")) : [];
  var lines = linesWrap ? Array.prototype.slice.call(linesWrap.querySelectorAll(".ln")) : [];
  var portal = document.querySelector("[data-intro-portal]");
  var expansion = document.querySelector("[data-intro-expansion]");
  var introTimeline = null;

  var previousScrollRestoration = "scrollRestoration" in history ? history.scrollRestoration : null;
  if (intro && previousScrollRestoration !== null) history.scrollRestoration = "manual";

  lines.forEach(function (el) {
    var length = el.getTotalLength();
    el.dataset.pathLength = length;
    el.style.strokeDasharray = length + " " + length;
    el.style.strokeDashoffset = length;
  });

  function resetLines() {
    lines.forEach(function (el) { el.style.strokeDashoffset = el.dataset.pathLength; });
  }

  function preloadImage(src) {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = image.onerror = resolve;
      image.src = src;
      if (image.complete) resolve();
    });
  }

  function preloadCriticalAssets() {
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var heroImage = window.innerWidth <= 900 ?
      "assets/img/hero-building-rooftop-1200.webp" :
      "assets/img/hero-building-rooftop-1536.webp";
    return Promise.all([
      fontsReady,
      preloadImage("assets/logo/emblem-mask.svg"),
      preloadImage("assets/logo/adure-logo-acronym.svg?v=20260916g"),
      preloadImage(heroImage)
    ]);
  }

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

  /* expandable facilities and amenities filters */
  var propertySearch = document.querySelector("[data-property-search]");
  var moreFiltersToggle = document.querySelector("[data-more-filters-toggle]");
  var moreFilters = document.querySelector("[data-more-filters]");
  var filterApply = document.querySelector("[data-filter-apply]");
  var filterClear = document.querySelector("[data-filter-clear]");
  function setMoreFilters(open) {
    if (!moreFilters || !moreFiltersToggle) return;
    moreFilters.hidden = !open;
    moreFiltersToggle.setAttribute("aria-expanded", String(open));
  }
  function updateFilterCount() {
    if (!moreFilters || !moreFiltersToggle) return;
    var count = moreFilters.querySelectorAll('input[name="amenity"]:checked').length;
    moreFiltersToggle.querySelector("span").textContent = count ? "+ More Filters (" + count + ")" : "+ More Filters";
  }
  if (moreFiltersToggle && moreFilters) {
    moreFiltersToggle.addEventListener("click", function () {
      setMoreFilters(moreFiltersToggle.getAttribute("aria-expanded") !== "true");
    });
    if (filterApply) filterApply.addEventListener("click", function () {
      updateFilterCount();
      setMoreFilters(false);
      moreFiltersToggle.focus();
    });
    if (filterClear) filterClear.addEventListener("click", function () {
      moreFilters.querySelectorAll('input[name="amenity"]').forEach(function (input) { input.checked = false; });
      updateFilterCount();
    });
    document.addEventListener("click", function (event) {
      if (!moreFilters.hidden && !event.target.closest(".search-shell")) setMoreFilters(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !moreFilters.hidden) {
        setMoreFilters(false);
        moreFiltersToggle.focus();
      }
    });
  }
  if (propertySearch) propertySearch.addEventListener("submit", function (event) {
    event.preventDefault();
    updateFilterCount();
    setMoreFilters(false);
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

  /* portfolio category filter */
  document.querySelectorAll("[data-portfolio-filter]").forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-portfolio-filter");
      document.querySelectorAll("[data-portfolio-filter]").forEach(function (item) {
        var active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      var visibleCount = 0;
      document.querySelectorAll("[data-portfolio-type]").forEach(function (card) {
        card.hidden = filter !== "all" && card.getAttribute("data-portfolio-type") !== filter;
        if (!card.hidden) visibleCount++;
      });
      var emptyState = document.querySelector("[data-portfolio-empty]");
      if (emptyState) emptyState.hidden = visibleCount !== 0;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });

  /* Static-site enquiry: prepare an email without collecting form data on the site. */
  var sellForm = document.querySelector("[data-sell-form]");
  if (sellForm) {
    sellForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!sellForm.reportValidity()) return;
      var details = new FormData(sellForm);
      var subject = "Sell with ADURE — property enquiry";
      var body = [
        "Property location: " + details.get("location"),
        "Property type: " + details.get("type"),
        "Name: " + details.get("name"),
        "Phone: " + details.get("phone"),
        "Email: " + details.get("email")
      ].join("\n");
      window.location.href = "mailto:Inquiries@adu-re.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* split the statement into words (used by the scroll reveal) */
  var statement = document.querySelector("[data-reveal-words]");
  if (statement) {
    statement.innerHTML = statement.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
  }

  if (!window.gsap || !window.ScrollTrigger || !window.Lenis) {
    doc.classList.add("no-motion");
    if (intro) intro.remove();
    if (previousScrollRestoration !== null) history.scrollRestoration = previousScrollRestoration;
    window.addEventListener("scroll", function () { setHeader(window.scrollY); setStaticHeroReveal(); }, { passive: true });
    return;
  }

  function setStaticHeroReveal() {
    hero.classList.toggle("is-revealed", window.scrollY > hero.offsetHeight * 0.18);
  }

  if (reduce) {
    doc.classList.add("no-motion", "intro-active");
    gsap.set(linesWrap, { display: "block", autoAlpha: 1 });
    var reducedMaskSize = linesWrap.getBoundingClientRect().width * (84 / 87);
    gsap.set(portal, {
      autoAlpha: 0,
      webkitMaskSize: reducedMaskSize + "px auto",
      maskSize: reducedMaskSize + "px auto"
    });
    preloadCriticalAssets().then(function () {
      gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: function () {
          doc.classList.remove("intro-active");
          if (intro) intro.remove();
          if (previousScrollRestoration !== null) history.scrollRestoration = previousScrollRestoration;
          window.addEventListener("scroll", function () { setHeader(window.scrollY); setStaticHeroReveal(); }, { passive: true });
        }
      })
        .to(lines, { strokeDashoffset: 0, duration: 0.24, stagger: 0.012 })
        .to(portal, { autoAlpha: 1, duration: 0.16 }, "<0.08")
        .to(intro, { autoAlpha: 0, duration: 0.2 }, ">0.05");
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  doc.classList.add("motion");

  /* smooth scroll */
  var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  window.__lenis = lenis;
  if (intro) lenis.stop();
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

  /* ---------- 01 HERO: emblem portal opens into the page ---------- */
  function finishIntro() {
    doc.classList.remove("intro-active");
    if (previousScrollRestoration !== null) history.scrollRestoration = previousScrollRestoration;
    lenis.start();
    gsap.set(linesWrap, { display: "none", clearProps: "opacity,visibility,transform" });
    gsap.set([header, eyebrow, title, heroSub, heroCta, building, heroHaze, scrollCue].concat(titleLines, heroCtas), {
      clearProps: "opacity,visibility,transform"
    });
    if (intro) intro.remove();
    ScrollTrigger.getAll().forEach(function (trigger) { trigger.enable(false, true); });
    ScrollTrigger.refresh();
  }

  function runIntro() {
    if (!intro || !portal || !expansion || !linesWrap || !introLogo || !introLogoEmblem || introLogoLetters.length !== 5) return;
    if (introTimeline) introTimeline.kill();
    lenis.stop();
    lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    if (previousScrollRestoration !== null) history.scrollRestoration = "manual";
    doc.classList.add("intro-active");
    ScrollTrigger.getAll().forEach(function (trigger) { trigger.disable(false, true); });
    resetLines();

    var endSize = Math.hypot(window.innerWidth, window.innerHeight) * 2.25;
    var outerLines = lines.slice(0, 2);
    var innerLines = lines.slice(2);

    gsap.set(intro, { display: "grid", autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(linesWrap, { display: "block", autoAlpha: 1, scale: 1 });
    gsap.set(introLogo, { autoAlpha: 0, scale: 1 });
    gsap.set(introLogoEmblem, { autoAlpha: 0 });
    gsap.set(introLogoLetters, { autoAlpha: 0, y: 8 });
    var initialSize = linesWrap.getBoundingClientRect().width * (84 / 87);
    var outlineScale = endSize / initialSize;
    gsap.set(lines, { autoAlpha: 1 });
    gsap.set(portal, {
      autoAlpha: 0,
      webkitMaskSize: initialSize + "px auto",
      maskSize: initialSize + "px auto"
    });
    gsap.set(expansion, { autoAlpha: 0, clipPath: "circle(0 at 50% 50%)" });
    gsap.set(header, { autoAlpha: 0, y: -12 });
    gsap.set(eyebrow, { autoAlpha: 0, y: 14 });
    gsap.set(titleLines, { autoAlpha: 0, y: 24 });
    gsap.set(heroSub, { autoAlpha: 0, y: 18 });
    gsap.set(heroCtas, { autoAlpha: 0, y: 16 });
    gsap.set(building, { autoAlpha: 0, y: 30 });
    gsap.set(heroHaze, { autoAlpha: 0 });
    gsap.set(scrollCue, { autoAlpha: 0, y: 12 });

    introTimeline = gsap.timeline({
      paused: true,
      defaults: { ease: "power3.inOut" },
      onComplete: finishIntro
    });
    introTimeline
      .to({}, { duration: 0.2 })
      .addLabel("draw", 0.2)
      .to(outerLines, { strokeDashoffset: 0, duration: 0.92, stagger: 0.11, ease: "power2.inOut" }, "draw")
      .to(innerLines, { strokeDashoffset: 0, duration: 0.84, stagger: 0.05, ease: "power3.inOut" }, "draw+=0.24")
      .addLabel("emblemComplete", 1.82)
      .set(introLogo, { autoAlpha: 1 }, "emblemComplete")
      .to(introLogoEmblem, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, "emblemComplete")
      .to(linesWrap, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, "emblemComplete")
      .to(introLogoLetters, { autoAlpha: 1, y: 0, duration: 0.26, stagger: 0.095, ease: "power3.out" }, "emblemComplete+=0.32")
      .addLabel("open", 3.15)
      .set(linesWrap, { display: "none" }, "open")
      .set(portal, { autoAlpha: 1 }, "open")
      .set(expansion, { autoAlpha: 0.05, clipPath: "circle(0 at 50% 50%)" }, "open+=0.24")
      .to(expansion, { clipPath: "circle(120vmax at 50% 50%)", duration: 1.01, ease: "power4.inOut" }, "open+=0.24")
      .to(expansion, { autoAlpha: 1, duration: 1.01, ease: "power2.in" }, "open+=0.24")
      .to(portal, {
        webkitMaskSize: endSize + "px auto",
        maskSize: endSize + "px auto",
        duration: 1.2,
        ease: "power4.inOut"
      }, "open")
      .to(introLogo, { scale: outlineScale, duration: 1.2, ease: "power4.inOut" }, "open")
      .to(introLogo, { autoAlpha: 0, duration: 0.45, ease: "power2.in" }, "open+=0.35")
      .to(portal, { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, "open+=0.7")
      .to(intro, { autoAlpha: 0, duration: 0.15, ease: "none" }, "open+=1.3")
      .addLabel("heroVisible", 4.4)
      .set(intro, { pointerEvents: "none" }, "heroVisible")
      .to(header, { autoAlpha: 1, y: 0, duration: 0.48, ease: "power3.out" }, "heroVisible")
      .to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" }, "heroVisible+=0.15")
      .to(titleLines, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.07, ease: "power3.out" }, "heroVisible+=0.3")
      .to(heroSub, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }, "heroVisible+=0.5")
      .to(heroCtas, { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.12, ease: "power3.out" }, "heroVisible+=0.65")
      .to(building, { autoAlpha: 1, y: 0, duration: 0.72, ease: "power3.out" }, "heroVisible+=0.8")
      .to(heroHaze, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "heroVisible+=0.9")
      .to(scrollCue, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }, "heroVisible+=1");

    introTimeline.timeScale(0.5).play(0);
  }

  if (intro) {
    doc.classList.add("intro-active");
    preloadCriticalAssets().then(runIntro, runIntro);
  } else {
    gsap.set(linesWrap, { display: "none" });
    lenis.start();
  }

  /* Keep the building as the hero's final scroll moment after the video was removed. */
  var heroMotion = gsap.matchMedia();
  heroMotion.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)" }, function (ctx) {
    var desktop = ctx.conditions.desktop;
    var rise = function () { return -window.innerHeight * (desktop ? 0.5 : 0.48); };
    var supportShift = function () {
      var extraHeight = titleNext.getBoundingClientRect().height - titleCurrent.getBoundingClientRect().height;
      return extraHeight > 1 ? extraHeight + 8 : 0;
    };

    gsap.set(building, { transformOrigin: "50% 38%" });

    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: function () { return "+=" + window.innerHeight * (desktop ? 1.2 : 1); },
        scrub: 0.7,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    })
      .to(scrollCue, { autoAlpha: 0, y: -12, duration: 0.22 }, 0)
      .to(titleCurrent, { autoAlpha: 0, y: -20, filter: "blur(10px)", duration: 0.22, ease: "power2.in" }, 0.06)
      .fromTo(titleNext, { autoAlpha: 0, y: 20, filter: "blur(10px)" }, {
        autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.26, ease: "power2.out"
      }, 0.22)
      .to([heroSub, heroCta], { y: supportShift, duration: 0.3, ease: "power2.out" }, 0.2)
      .to(building, {
        y: rise,
        scale: desktop ? 1.2 : 1.13,
        duration: 0.68,
        ease: "power1.inOut"
      }, 0.52)
      .to(copy, { autoAlpha: 0, duration: 0.18 }, 1.02)
      .to(heroHaze, { scaleY: 1.06, transformOrigin: "50% 100%", duration: 0.68 }, 0.52);
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

  /* ---------- proof: cards reveal in sequence and figures count up ---------- */
  var stats = document.querySelector(".stats");
  if (stats) {
    var statCards = gsap.utils.toArray(".stats > div");
    var statCounters = gsap.utils.toArray(".stats [data-count]");
    var statsTl = gsap.timeline({
      scrollTrigger: { trigger: stats, start: "top 82%", once: true }
    });

    statsTl.fromTo(statCards,
      { autoAlpha: 0, y: 42, scale: 0.965 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.82, stagger: 0.16, ease: "power3.out", clearProps: "transform,opacity,visibility" }
    );

    statCounters.forEach(function (node, index) {
      var target = Number(node.getAttribute("data-count"));
      var counter = { value: 0 };
      node.textContent = "0";
      statsTl.to(counter, {
        value: target,
        duration: 1.35,
        ease: "power2.out",
        onUpdate: function () {
          var value = Math.round(counter.value);
          node.textContent = node.hasAttribute("data-plain") ? String(value) : value.toLocaleString("en-US");
        }
      }, 0.12 + index * 0.16);
    });
  }

  /* ---------- gentle entrances (transform only; content always visible) ---------- */
  gsap.utils.toArray(".card, .pillar, .portfolio-card, .handover-steps li, .intent").forEach(function (el, i) {
    gsap.from(el, { y: 44, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
  });
  /* handover: the cyan line runs through the four weeks */
  var hsLine = document.querySelector("[data-hs-line]");
  if (hsLine) {
    heroMotion.add({ wide: "(min-width: 901px)", narrow: "(max-width: 900px)" }, function (c) {
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
