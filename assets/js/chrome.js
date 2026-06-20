/* =================================================================
   chrome.js — entête (HUD) + menu mobile partagés
   Source unique de vérité : la barre de navigation et le menu mobile
   sont générés ici à partir de data-base + data-page (lus sur <html>),
   au lieu d'être dupliqués dans chaque page.
   Les fonctions de construction sont pures (testables hors navigateur).
   ================================================================= */
(function () {
  "use strict";

  const ICON_SFX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14"/></svg>';
  const ICON_FX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M3 13h18M8 21h8"/></svg>';
  const ICON_BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';

  // Liens par type de page. Cibles relatives à la RACINE du site
  // ("#x" = ancre in-page, réservée à l'accueil). Préfixées par data-base.
  const NAV = {
    home:  [["Lore", "#lore"], ["Parcours", "#parcours"], ["Missions", "#missions"], ["Cartes", "#projets"], ["Loadout", "#competences"], ["BUT3", "bilan/"], ["Contact", "#contact"]],
    rag:   [["Missions", "index.html#missions"], ["Cartes", "index.html#projets"], ["Projet météo", "projets/plateforme-meteo/"], ["BUT3", "bilan/"], ["Contact", "index.html#contact"]],
    meteo: [["Missions", "index.html#missions"], ["Cartes", "index.html#projets"], ["Projet IA", "projets/agent-ia-rag/"], ["BUT3", "bilan/"], ["Contact", "index.html#contact"]],
    cv:    [["Missions", "index.html#missions"], ["Cartes", "index.html#projets"], ["Loadout", "index.html#competences"], ["BUT3", "bilan/"], ["Contact", "index.html#contact"]],
    bilan: [["Missions", "index.html#missions"], ["Cartes", "index.html#projets"], ["Loadout", "index.html#competences"], ["Contact", "index.html#contact"]],
  };

  const isAnchor = (t) => t.charAt(0) === "#";
  const href = (base, t) => (isAnchor(t) ? t : base + t);

  function headerHTML(base, page) {
    const items = NAV[page] || NAV.cv;
    const navLinks = items
      .map(([l, t]) => (isAnchor(t) ? `<a href="${t}">${l}</a>` : `<a class="js-nav" href="${base + t}">${l}</a>`))
      .join("\n      ");
    const brand = page === "home"
      ? '<a class="brand" href="#accueil" aria-label="Accueil">'
      : `<a class="brand js-nav" href="${base}index.html" aria-label="Accueil">`;
    const action = page === "cv"
      ? '<button class="btn btn--sm btn--primary" type="button" data-print>Imprimer / PDF</button>'
      : `<a class="btn btn--sm btn--primary js-nav" href="${base}cv/">Dossier&nbsp;CV</a>`;
    return `
    ${brand}
      <span class="tag">AM</span>
      <span class="who">HUGO ALVES MIRANDA<small>DATA / MACHINE LEARNING</small></span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      ${navLinks}
    </nav>
    <div class="hud-actions">
      ${action}
      <button class="icon-btn" id="sfxToggle" aria-pressed="false" title="Son d'interface" aria-label="Activer le son d'interface">${ICON_SFX}</button>
      <button class="icon-btn on" id="fxToggle" title="Ambiance écran" aria-label="Activer l'ambiance écran">${ICON_FX}</button>
      <button class="icon-btn burger" id="burger" aria-label="Menu" aria-expanded="false">${ICON_BURGER}</button>
    </div>`;
  }

  function mnavHTML(base, page) {
    const items = NAV[page] || NAV.cv;
    const accueil = page === "home" ? '<a href="#accueil">' : `<a class="js-nav" href="${base}index.html">`;
    const lines = [`${accueil}<span class="n">00</span> Accueil</a>`];
    items.forEach(([l, t], i) => {
      const n = String(i + 1).padStart(2, "0");
      lines.push(isAnchor(t)
        ? `<a href="${t}"><span class="n">${n}</span> ${l}</a>`
        : `<a class="js-nav" href="${base + t}"><span class="n">${n}</span> ${l}</a>`);
    });
    if (page !== "cv") lines.push(`<a class="js-nav" href="${base}cv/"><span class="n">→</span> Dossier CV</a>`);
    return lines.join("\n    ");
  }

  function inject() {
    const root = document.documentElement;
    const base = root.getAttribute("data-base") || "";
    const page = root.getAttribute("data-page") || "home";
    const header = document.getElementById("siteHeader");
    const mnav = document.getElementById("mnav");
    if (header) header.innerHTML = headerHTML(base, page);
    if (mnav) mnav.innerHTML = mnavHTML(base, page);
  }

  // En navigateur : injection synchrone (les placeholders existent déjà à ce point).
  if (typeof document !== "undefined") {
    try { inject(); } catch (e) { console.warn("[chrome]", e); }
  }
  // En Node : export des constructeurs purs pour les tests.
  if (typeof module !== "undefined" && module.exports) module.exports = { headerHTML, mnavHTML, NAV, href };
})();
