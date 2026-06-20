/* =================================================================
   radar.js — "stats du joueur"
   Dessine un radar chart SVG des familles de compétences et anime
   les barres de rang quand elles entrent dans le viewport.
   ================================================================= */
(function () {
  "use strict";
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const AXES = [
    { label: "DATA ENGINEERING", value: 0.86 },
    { label: "DATA ANALYSIS", value: 0.78 },
    { label: "DÉVELOPPEMENT", value: 0.80 },
    { label: "OUTILS / DEVOPS", value: 0.83 },
    { label: "SOFT SKILLS", value: 0.88 },
  ];

  function polar(cx, cy, r, angDeg) {
    const a = (angDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function renderRadar() {
    const host = document.getElementById("radar");
    if (!host) return;
    // viewBox large (540×380) pour que les libellés tiennent en entier autour du pentagone
    const W = 540, H = 380, cx = W / 2, cy = 188, R = 122;
    const n = AXES.length, step = 360 / n;
    const NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Radar des compétences : " + AXES.map((a) => a.label + " " + Math.round(a.value * 100) + "%").join(", "));

    let html = "";
    // anneaux
    [0.25, 0.5, 0.75, 1].forEach((ring) => {
      const pts = AXES.map((_, i) => polar(cx, cy, R * ring, i * step).join(",")).join(" ");
      html += `<polygon class="radar-grid" points="${pts}"/>`;
    });
    // axes + labels
    AXES.forEach((ax, i) => {
      const [x, y] = polar(cx, cy, R, i * step);
      html += `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
      const [lx, ly] = polar(cx, cy, R + 18, i * step);
      const anchor = Math.abs(lx - cx) < 6 ? "middle" : lx > cx ? "start" : "end";
      html += `<text class="radar-label" x="${lx}" y="${ly + 4}" text-anchor="${anchor}">${ax.label}</text>`;
    });
    // polygone des valeurs (animé du centre vers l'extérieur)
    const zero = AXES.map((_, i) => `${cx},${cy}`).join(" ");
    const full = AXES.map((ax, i) => polar(cx, cy, R * ax.value, i * step).join(",")).join(" ");
    html += `<polygon class="radar-poly" id="radarPoly" points="${prefersReduced ? full : zero}"/>`;
    AXES.forEach((ax, i) => {
      const [x, y] = polar(cx, cy, R * ax.value, i * step);
      html += `<circle class="radar-dot" cx="${x}" cy="${y}" r="3.4" data-cx="${x}" data-cy="${y}" ${prefersReduced ? "" : `style="opacity:0"`}/>`;
    });
    svg.innerHTML = html;
    host.appendChild(svg);

    if (prefersReduced) return;
    const poly = svg.querySelector("#radarPoly");
    const dots = svg.querySelectorAll(".radar-dot");
    const showFull = () => { poly.setAttribute("points", full); dots.forEach((d) => (d.style.opacity = "1")); };
    if (!("IntersectionObserver" in window)) { showFull(); return; }   // R2 : pas d'IO → on dessine plein
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) {
          poly.style.transition = "all .9s cubic-bezier(.2,.7,.2,1)";
          poly.setAttribute("points", full);
          dots.forEach((d) => { d.style.transition = "opacity .5s ease .5s"; d.style.opacity = "1"; });
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(host);
  }

  function animateRanks() {
    const bars = Array.from(document.querySelectorAll(".rank__bar i[data-fill]"));
    if (!bars.length) return;
    if (prefersReduced) { bars.forEach((b) => (b.style.width = b.dataset.fill)); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => {
        if (en.isIntersecting) { const b = en.target; b.style.width = b.dataset.fill; io.unobserve(b); }
      });
    }, { threshold: 0.5 });
    bars.forEach((b) => io.observe(b));
  }

  document.addEventListener("DOMContentLoaded", () => {
    try { renderRadar(); } catch (e) { console.warn("[radar]", e); }
    try { animateRanks(); } catch (e) { console.warn("[ranks]", e); }
  });
})();
