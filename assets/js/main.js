/* =================================================================
   main.js — HUD tactique partagé
   Curseur réticule · son d'interface · loader · navigation ·
   reveal au scroll · mini-map · achievements · easter egg.
   ================================================================= */
(function () {
  "use strict";

  const BASE = window.SITE_BASE || "";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  /* ---------- Moteur sonore (WebAudio, sans asset) ---------- */
  const SFX = (() => {
    let ctx = null, enabled = store.get("sfx_on", false);
    function ensure() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } return ctx; }
    function beep(freq, dur, type, gain) {
      if (!enabled) return; const c = ensure(); if (!c) return;
      if (c.state === "suspended") c.resume();
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime);
      g.gain.linearRampToValueAtTime(gain || 0.04, c.currentTime + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (dur || 0.06));
      o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + (dur || 0.06));
    }
    return {
      hover: () => beep(880, 0.04, "square", 0.025),
      click: () => beep(420, 0.08, "square", 0.05),
      ok: () => { beep(660, 0.06); setTimeout(() => beep(990, 0.09), 70); },
      get on() { return enabled; },
      set on(v) { enabled = v; store.set("sfx_on", v); if (v) { ensure(); beep(740, 0.06); } },
    };
  })();
  window.SFX = SFX;

  /* ---------- Injection des éléments HUD globaux ---------- */
  function injectHUD() {
    const frag = document.createElement("div");
    frag.innerHTML = `
      <div class="fx-grid" aria-hidden="true"></div>
      <div class="fx-scanlines" aria-hidden="true"></div>
      <div class="fx-vignette" aria-hidden="true"></div>
      <div class="transition-veil" id="veil" aria-hidden="true"><div class="spin"></div></div>
      <div class="ach-stack" id="achStack" aria-live="polite"></div>`;
    while (frag.firstChild) document.body.appendChild(frag.firstChild);

    // curseur réticule (uniquement pointeur fin)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReduced) {
      document.body.classList.add("crosshair-on");
      const ch = document.createElement("div");
      ch.className = "crosshair"; ch.innerHTML = '<span class="dot"></span>';
      document.body.appendChild(ch);
      let x = innerWidth / 2, y = innerHeight / 2;
      addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; ch.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; });
      const hot = 'a,button,input,textarea,select,[role="button"],.gcard,.chip';
      document.addEventListener("mouseover", (e) => { if (e.target.closest(hot)) ch.classList.add("hot"); });
      document.addEventListener("mouseout", (e) => { if (e.target.closest(hot)) ch.classList.remove("hot"); });
    }
  }

  /* ---------- Effets sonores liés aux contrôles ---------- */
  function wireSounds() {
    const hot = 'a,button,.gcard,.chip,[role="button"]';
    document.addEventListener("mouseover", (e) => { if (e.target.closest(hot)) SFX.hover(); });
    document.addEventListener("click", (e) => { if (e.target.closest(hot)) SFX.click(); }, true);
  }

  /* ---------- Boutons HUD : son + effets ---------- */
  function wireToggles() {
    const sfxBtn = $("#sfxToggle");
    if (sfxBtn) {
      const sync = () => { sfxBtn.classList.toggle("on", SFX.on); sfxBtn.setAttribute("aria-pressed", SFX.on); sfxBtn.title = SFX.on ? "Son d'interface : ON" : "Son d'interface : OFF"; };
      sync();
      sfxBtn.addEventListener("click", () => { SFX.on = !SFX.on; sync(); });
    }
    const fxBtn = $("#fxToggle");
    if (fxBtn) {
      const off = store.get("fx_off", false);
      document.body.classList.toggle("no-fx", off);
      const sync = () => { const o = document.body.classList.contains("no-fx"); fxBtn.classList.toggle("on", !o); fxBtn.title = o ? "Ambiance écran : OFF" : "Ambiance écran : ON"; };
      sync();
      fxBtn.addEventListener("click", () => { const o = document.body.classList.toggle("no-fx"); store.set("fx_off", o); sync(); });
    }
  }

  /* ---------- Barre HUD : scroll + menu mobile ---------- */
  function wireNav() {
    const top = $(".hud-top");
    const onScroll = () => { if (top) top.classList.toggle("scrolled", scrollY > 24); };
    onScroll(); addEventListener("scroll", onScroll, { passive: true });

    const burger = $("#burger"), mnav = $("#mnav");
    if (burger && mnav) {
      const toggle = (v) => { mnav.classList.toggle("open", v); burger.classList.toggle("on", v); burger.setAttribute("aria-expanded", v); document.body.style.overflow = v ? "hidden" : ""; };
      burger.addEventListener("click", () => toggle(!mnav.classList.contains("open")));
      mnav.addEventListener("click", (e) => { if (e.target.closest("a")) toggle(false); });
    }
  }

  /* ---------- Reveal au scroll ---------- */
  function wireReveal() {
    const els = $$(".reveal");
    if (!els.length) return;
    if (prefersReduced || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- Mini-map de navigation + lien actif ---------- */
  function wireMiniMap() {
    const sections = $$("section[data-section]");
    if (sections.length < 2) return;
    const mm = document.createElement("nav");
    mm.className = "minimap"; mm.setAttribute("aria-label", "Mini-carte de navigation");
    mm.innerHTML = sections.map((s) => `<a href="#${s.id}" data-to="${s.id}"><span class="lbl">${s.dataset.section}</span><span class="pt"></span></a>`).join("");
    document.body.appendChild(mm);
    const links = $$("a", mm);
    const navLinks = $$(".nav a[href^='#']");
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          const id = en.target.id;
          links.forEach((l) => l.classList.toggle("active", l.dataset.to === id));
          navLinks.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
        }
      });
    }, { threshold: 0.5 });
    sections.forEach((s) => io.observe(s));
    mm.addEventListener("click", (e) => { const a = e.target.closest("a"); if (a) { e.preventDefault(); $("#" + a.dataset.to)?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" }); } });
  }

  /* ---------- Écran de chargement (au démarrage) ---------- */
  const TIPS = [
    'Le <b>chatbot</b> du site est une démo RAG : il récupère ses réponses dans le contenu réel du portfolio (scoring <b>BM25</b>).',
    'Astuce : le projet IA combine recherche <b>lexicale (BM25)</b> et <b>sémantique (Qdrant)</b> — c\'est une recherche hybride.',
    'Le widget météo du Projet 2 affiche des <b>données en direct</b> via une API ouverte.',
    'Pipeline ETL Alcatel : orchestration <b>Apache Airflow</b> + transformations <b>Apache Spark</b>.',
    'Tape le <b>Konami Code</b> (↑↑↓↓←→←→ B A) n\'importe où pour un bonus.',
    'Les compétences sont notées comme des <b>stats de jeu</b> — survole le radar.',
    'Tout le site est utilisable sans connaître Valorant : le thème reste un vernis.',
  ];
  function runLoader() {
    const loader = $("#loader");
    if (!loader) return;
    const bar = $(".loader__bar i", loader), pct = $(".loader__pct", loader), tip = $(".loader__tip", loader);
    if (tip) tip.innerHTML = TIPS[Math.floor(Math.random() * TIPS.length)];
    if (prefersReduced) { loader.classList.add("done"); document.body.classList.remove("locked"); return; }
    let p = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 18 + 6);
      if (bar) bar.style.width = p + "%";
      if (pct) pct.textContent = "CHARGEMENT " + Math.floor(p) + "%";
      if (p >= 100) {
        clearInterval(tick);
        setTimeout(() => { loader.classList.add("done"); document.body.classList.remove("locked"); SFX.ok(); }, 220);
      }
    }, 130);
  }

  /* ---------- Transition entre pages ---------- */
  function wirePageTransitions() {
    const veil = $("#veil");
    if (!veil) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a.js-nav");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return;
      e.preventDefault();
      veil.classList.add("show");
      setTimeout(() => { window.location.href = href; }, prefersReduced ? 0 : 320);
    });
    // si retour navigateur (bfcache), retire le voile
    addEventListener("pageshow", () => veil.classList.remove("show"));
  }

  /* ---------- Achievements / badges ---------- */
  const Ach = (() => {
    const unlocked = new Set(store.get("ach", []));
    const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 5 5.6.8-4 3.9 1 5.6L12 20l-5 2.6 1-5.6-4-3.9 5.6-.8z"/></svg>';
    function toast(label) {
      const stack = $("#achStack"); if (!stack) return;
      const el = document.createElement("div");
      el.className = "ach";
      el.innerHTML = `<span class="ic">${ICON}</span><div><div class="k">Achievement débloqué</div><div class="v">${label}</div></div>`;
      stack.appendChild(el);
      requestAnimationFrame(() => el.classList.add("show"));
      SFX.ok();
      setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 500); }, 4200);
    }
    function unlock(id, label) {
      if (unlocked.has(id)) return;
      unlocked.add(id); store.set("ach", Array.from(unlocked));
      toast(label);
    }
    return { unlock, has: (id) => unlocked.has(id) };
  })();
  window.Ach = Ach;

  function wireAchievements() {
    // 1er pas
    setTimeout(() => Ach.unlock("boot", "Système en ligne — bienvenue, recruteur"), 2600);
    // exploration par section
    const map = {
      missions: "Dossier missions consulté",
      projets: "Sélection de carte ouverte",
      competences: "Loadout inspecté",
      contact: "Canal de contact établi",
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting && map[en.target.id]) { Ach.unlock("sec_" + en.target.id, map[en.target.id]); } });
    }, { threshold: 0.4 });
    Object.keys(map).forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    // bas de page
    addEventListener("scroll", function bottom() {
      if (innerHeight + scrollY >= document.body.offsetHeight - 80) { Ach.unlock("explorer", "Exploration complète — 100%"); removeEventListener("scroll", bottom); }
    }, { passive: true });
  }

  /* ---------- Easter egg : Konami code ---------- */
  function wireKonami() {
    const seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let i = 0;
    addEventListener("keydown", (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = (k === seq[i]) ? i + 1 : (k === seq[0] ? 1 : 0);
      if (i === seq.length) { i = 0; bonus(); }
    });
    function bonus() {
      Ach.unlock("konami", "Code secret — agent vétéran");
      const ov = document.createElement("div");
      ov.style.cssText = "position:fixed;inset:0;z-index:9600;display:grid;place-items:center;background:rgba(8,11,16,.96);backdrop-filter:blur(6px);text-align:center;padding:24px;cursor:pointer";
      ov.innerHTML = `
        <div style="max-width:520px">
          <div style="font-family:var(--font-display);font-weight:900;font-size:clamp(1.6rem,6vw,2.6rem);color:var(--accent);text-transform:uppercase;letter-spacing:.05em">// Bonus débloqué</div>
          <p style="color:var(--text);margin:18px 0;font-size:1.05rem">Hors du code, l'agent se recharge à la <b>F1</b> et à l'<b>endurance</b> 🏎️, au <b>piano</b> 🎹, à la <b>muscu</b> et à un bon <b>polar SF</b>.</p>
          <p style="color:var(--cyan);font-family:var(--font-head);letter-spacing:.18em;text-transform:uppercase;font-size:.8rem">GG — clique pour fermer</p>
        </div>`;
      ov.addEventListener("click", () => ov.remove());
      document.body.appendChild(ov);
      SFX.ok();
    }
  }

  /* ---------- Année dans le footer ---------- */
  function wireYear() { $$("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear())); }

  /* ---------- Filet de sécurité : ne jamais rester bloqué sur le loader ---------- */
  function forceUnlock() {
    const l = document.getElementById("loader");
    if (l && !l.classList.contains("done")) l.classList.add("done");
    document.body.classList.remove("locked");
  }
  addEventListener("load", () => setTimeout(forceUnlock, 4000));

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    const steps = [injectHUD, wireSounds, wireToggles, wireNav, wireReveal, wireMiniMap, wirePageTransitions, wireAchievements, wireKonami, wireYear];
    steps.forEach((fn) => { try { fn(); } catch (e) { console.warn("[HUD]", fn.name, e); } });
    try { runLoader(); } catch (e) { forceUnlock(); }
  });
})();
