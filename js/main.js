/* ORGANIC WAVE — interações premium (GSAP + ScrollTrigger) */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  if (!hasGSAP || reduced) {
    document.documentElement.classList.add("gsap-off");
  }

  /* ---- barra de progresso do scroll ---- */
  var bar = document.querySelector(".scroll-progress span");
  var nav = document.getElementById("nav");
  var scrollMax = 0, scrollTick = false, wasScrolled = null;

  function measureScroll() {
    var h = document.documentElement;
    scrollMax = h.scrollHeight - h.clientHeight;
  }
  function paintScroll() {
    scrollTick = false;
    var h = document.documentElement;
    var top = h.scrollTop || document.body.scrollTop || 0;
    var p = scrollMax > 0 ? top / scrollMax : 0;
    // scaleX em vez de width: fica no compositor, sem layout a cada frame
    if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    var isScrolled = top > 40;
    if (nav && isScrolled !== wasScrolled) {
      nav.classList.toggle("scrolled", isScrolled);
      wasScrolled = isScrolled;
    }
  }
  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(paintScroll);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { measureScroll(); onScroll(); }, { passive: true });
  measureScroll();
  paintScroll();

  /* ---- checkout da Kiwify ---- */
  var CHECKOUT_URL = "https://pay.kiwify.com.br/TJgtQmK";
  document.querySelectorAll("[data-checkout]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      if (CHECKOUT_URL) {
        window.location.href = CHECKOUT_URL;
      } else {
        e.preventDefault();
        var oferta = document.getElementById("oferta");
        if (oferta) oferta.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
      }
    });
  });

  initCoverflow();

  /* ---- vídeo do hero: sai do caminho crítico ----
     O poster (webp) segura o visual desde o primeiro paint; o mp4 só começa a
     baixar depois do load, então não disputa banda com a LCP, a CSS e as fontes.
     Visualmente idêntico: quando o vídeo chega, ele entra no lugar do poster. */
  (function () {
    var vid = document.querySelector(".hero-vid");
    if (!vid) return;
    function activate() {
      var src = vid.querySelector("source[data-src]");
      if (src && !src.getAttribute("src")) {
        src.setAttribute("src", src.getAttribute("data-src"));
        vid.load();
      }
      var p = vid.play();
      if (p && p.catch) p.catch(function () {});
    }
    function schedule() {
      if (window.requestIdleCallback) requestIdleCallback(activate, { timeout: 1500 });
      else setTimeout(activate, 200);
    }
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
  })();

  /* ---- lazy-load do vídeo de fundo da oferta (só baixa perto da seção) ---- */
  (function () {
    var vid = document.querySelector(".oferta-vid");
    var oferta = document.getElementById("oferta");
    if (!vid || !oferta || reduced) return;
    function activate() {
      var src = vid.querySelector("source[data-src]");
      if (src && !src.getAttribute("src")) {
        src.setAttribute("src", src.getAttribute("data-src"));
        vid.load();
      }
      var p = vid.play();
      if (p && p.catch) p.catch(function () {});
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { activate(); }
          else { vid.pause(); }
        });
      }, { rootMargin: "500px 0px" });
      io.observe(oferta);
    } else {
      activate();
    }
  })();

  /* ---- risca o "valor real" quando o total entra em cena ---- */
  var ledgerTotal = document.querySelector(".ledger-total");
  if (ledgerTotal) {
    if (!hasGSAP || reduced) {
      ledgerTotal.classList.add("is-struck");
    } else {
      ScrollTrigger.create({
        trigger: ledgerTotal, start: "top 82%", once: true,
        onEnter: function () { ledgerTotal.classList.add("is-struck"); }
      });
    }
  }

  if (!hasGSAP || reduced) {
    // sem GSAP: ainda anima os contadores de forma simples
    animateAllCounters(false);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---- HERO: estados iniciais (GSAP dono das props) ---- */
  gsap.set(".hero-title .line", { opacity: 0, y: 34 });
  gsap.set([".hero .kicker", ".hero-sub", ".hero-actions", ".hero-marks"], { opacity: 0, y: 24 });

  /* ---- HERO: entrada em cascata ---- */
  var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to(".hero-title .line", { opacity: 1, y: 0, duration: 1.1, stagger: 0.13 }, 0.15)
    .to(".hero .kicker", { opacity: 1, y: 0, duration: 0.8 }, 0.1)
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.9 }, 0.5)
    .to(".hero-actions", { opacity: 1, y: 0, duration: 0.9 }, 0.65)
    .to(".hero-marks", { opacity: 1, y: 0, duration: 0.9 }, 0.8)
    .fromTo(".hero-people img", { opacity: 0, y: 60, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: "power3.out" }, 0.35);

  /* ---- parallax sutil do vídeo e do wordmark ---- */
  gsap.to(".hero-video video", {
    yPercent: 12, scale: 1.14, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero-wordmark", {
    yPercent: -30, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ---- REVEAL genérico ao entrar em cena ---- */
  gsap.utils.toArray(".reveal").forEach(function (el) {
    if (el.closest(".hero")) return; // hero tem timeline própria
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.0, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  /* stagger em grupos (stats, cards, flow, community-list) */
  [".stats", ".cards", ".flow", ".community-list", ".cols", ".ledger", ".stub-perks"].forEach(function (sel) {
    var group = document.querySelector(sel);
    if (!group) return;
    var kids = group.children;
    gsap.set(kids, { opacity: 0, y: 30 });
    gsap.to(kids, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09,
      scrollTrigger: { trigger: group, start: "top 82%" }
    });
  });

  /* ---- CONTADORES ---- */
  document.querySelectorAll(".stat-num, .market-num, .prova-big, .pnum, .price-now").forEach(function (el) {
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: function () { countUp(el); }
    });
  });

  ScrollTrigger.refresh();

  /* =================== helpers =================== */
  function fmt(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 2.0, ease: "power2.out",
      onUpdate: function () { el.textContent = prefix + fmt(obj.v) + suffix; },
      onComplete: function () { el.textContent = prefix + fmt(target) + suffix; }
    });
  }
  function animateAllCounters(useGsap) {
    document.querySelectorAll(".stat-num, .market-num, .prova-big, .pnum, .price-now").forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      el.textContent = prefix + fmt(target) + suffix;
    });
  }

  /* =================== COVERFLOW (rAF + spring, estilo FocusRail) ============ */
  function initCoverflow() {
    var stage = document.getElementById("cfStage");
    if (!stage) return;
    var cards = Array.prototype.slice.call(stage.querySelectorAll(".cf-card"));
    var n = cards.length;
    if (!n) return;
    var caption = document.getElementById("cfCaption");
    var count = document.getElementById("cfCount");
    var prevBtn = document.getElementById("cfPrev");
    var nextBtn = document.getElementById("cfNext");
    var active = 0, auto = null, dragOffset = 0;

    // estado de mola por card (posição + velocidade por propriedade)
    var st = cards.map(function () {
      return { x: { p: 0, v: 0 }, z: { p: 0, v: 0 }, r: { p: 0, v: 0 }, o: { p: 0, v: 0 }, b: { p: 0, v: 0 }, s: { p: 1, v: 0 } };
    });

    function norm(o) { while (o > n / 2) o -= n; while (o < -n / 2) o += n; return o; }
    function xMult() { return Math.min(stage.clientWidth * 0.34, 320); }
    function off(i) { return norm(i - active) - dragOffset; }
    function targets(i) {
      var o = off(i), a = Math.abs(o);
      return {
        x: o * xMult(), z: -a * 180, r: o * -20,
        o: a > 2.4 ? 0 : Math.max(0.12, 1 - a * 0.42),
        b: Math.min(a * 5, 12), s: a < 0.5 ? 1 : 0.85
      };
    }
    // integrador de mola semi-implícito: F = -k*(pos-alvo) - c*vel, massa 1
    function spring(s, t, k, c, dt) { s.v += (-k * (s.p - t) - c * s.v) * dt; s.p += s.v * dt; }

    function render() {
      cards.forEach(function (card, i) {
        var s = st[i], a = Math.abs(off(i));
        card.style.transform = "translateX(" + s.x.p.toFixed(2) + "px) translateZ(" + s.z.p.toFixed(1) + "px) rotateY(" + s.r.p.toFixed(2) + "deg) scale(" + s.s.p.toFixed(4) + ")";
        card.style.opacity = s.o.p.toFixed(3);
        card.style.filter = "blur(" + s.b.p.toFixed(2) + "px) brightness(" + (a < 0.5 ? 1 : 0.55) + ")";
        card.style.zIndex = String(100 - Math.round(a * 10));
        card.style.pointerEvents = a > 2.4 ? "none" : "auto";
      });
    }
    function settle() { // snap instantâneo (reduced-motion / init / fora de cena)
      cards.forEach(function (card, i) {
        var t = targets(i), s = st[i];
        s.x.p = t.x; s.z.p = t.z; s.r.p = t.r; s.o.p = t.o; s.b.p = t.b; s.s.p = t.s;
        s.x.v = s.z.v = s.r.v = s.o.v = s.b.v = s.s.v = 0;
      });
      render();
    }

    var last = 0, running = false, visible = false;

    // molas paradas? então não há nada pra desenhar até a próxima interação.
    function isSettled() {
      for (var i = 0; i < n; i++) {
        var t = targets(i), s = st[i];
        if (Math.abs(s.x.p - t.x) > 0.1 || Math.abs(s.x.v) > 0.1) return false;
        if (Math.abs(s.z.p - t.z) > 0.1 || Math.abs(s.z.v) > 0.1) return false;
        if (Math.abs(s.r.p - t.r) > 0.01 || Math.abs(s.r.v) > 0.01) return false;
        if (Math.abs(s.o.p - t.o) > 0.002 || Math.abs(s.o.v) > 0.002) return false;
        if (Math.abs(s.b.p - t.b) > 0.01 || Math.abs(s.b.v) > 0.01) return false;
        if (Math.abs(s.s.p - t.s) > 0.001 || Math.abs(s.s.v) > 0.001) return false;
      }
      return true;
    }

    function frame(now) {
      if (!running) return;
      var dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      cards.forEach(function (card, i) {
        var t = targets(i), s = st[i];
        if (Math.abs(off(i)) > 2.6) { // fora de cena: snap, não deixa varrer a tela
          s.x.p = t.x; s.x.v = 0; s.z.p = t.z; s.r.p = t.r; s.o.p = t.o; s.b.p = t.b; s.s.p = t.s;
        } else {
          spring(s.x, t.x, 300, 30, dt); spring(s.z, t.z, 300, 30, dt); spring(s.r, t.r, 300, 30, dt);
          spring(s.o, t.o, 300, 30, dt); spring(s.b, t.b, 300, 30, dt);
          spring(s.s, t.s, 450, 18, dt); // scale com overshoot = "pop" ao virar central
        }
      });
      render();
      // dorme quando assentou; qualquer interação chama wake() de volta
      if (!dragging && isSettled()) { running = false; return; }
      requestAnimationFrame(frame);
    }

    function wake() {
      if (running || reduced || !visible) return;
      running = true; last = 0;
      requestAnimationFrame(frame);
    }

    function meta() {
      cards.forEach(function (card, i) { card.classList.toggle("is-center", norm(i - active) === 0); });
      if (caption) {
        caption.style.opacity = "0";
        setTimeout(function () { caption.textContent = cards[active].getAttribute("data-caption") || ""; caption.style.opacity = "1"; }, 160);
      }
      if (count) count.textContent = (active + 1) + " / " + n;
    }
    function go(dir) { active = (active + dir + n) % n; meta(); if (reduced) settle(); else wake(); }
    function setActive(i) { active = ((i % n) + n) % n; meta(); if (reduced) settle(); else wake(); }
    function start() { if (!reduced && visible && !auto) auto = setInterval(function () { go(1); }, 5000); }
    function stop() { if (auto) { clearInterval(auto); auto = null; } }
    function restart() { stop(); start(); }

    if (prevBtn) prevBtn.addEventListener("click", function () { go(-1); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { go(1); restart(); });

    // drag: rail segue o dedo (elástico) e decide o passo por velocidade
    var startX = 0, lastX = 0, lastT = 0, vel = 0, dragging = false, downCard = null;
    stage.addEventListener("pointerdown", function (e) {
      dragging = true; startX = lastX = e.clientX; lastT = performance.now(); vel = 0;
      downCard = e.target.closest ? e.target.closest(".cf-card") : null;
      stage.classList.add("dragging"); stop();
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var now = performance.now(), dtv = (now - lastT) / 1000;
      if (dtv > 0) vel = (e.clientX - lastX) / dtv;
      lastX = e.clientX; lastT = now;
      if (reduced) return;
      var dx = e.clientX - startX;
      dragOffset = Math.max(-1.4, Math.min(1.4, (dx / xMult()) * 0.9));
      wake();
    });
    window.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false; stage.classList.remove("dragging");
      var dx = e.clientX - startX;
      if (Math.abs(dx) < 6) {
        if (downCard) { var idx = cards.indexOf(downCard); if (idx >= 0 && norm(idx - active) !== 0) setActive(idx); }
      } else {
        var power = Math.abs(dx) * vel; // |offset| * velocidade (px * px/s), limiar do FocusRail
        if (Math.abs(power) > 9000 || Math.abs(dx) > xMult() * 0.55) go(dx < 0 ? 1 : -1);
      }
      dragOffset = 0;
      wake();
      restart();
    });
    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);
    window.addEventListener("resize", function () { if (reduced) settle(); else wake(); }, { passive: true });

    settle(); // posiciona instantâneo no estado inicial
    meta();

    // fora da tela não anima e não roda o autoplay: o rAF só existe enquanto a
    // seção está visível, e ainda dorme sozinho quando as molas assentam.
    var cf = document.getElementById("coverflow") || stage;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visible = en.isIntersecting;
          if (visible) { wake(); start(); }
          else { running = false; stop(); }
        });
      }, { rootMargin: "200px 0px" }).observe(cf);
    } else {
      visible = true; wake(); start();
    }
  }

})();
