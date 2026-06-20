/* =================================================================
   weather.js — Widget météo "overlay tactique" (page Projet 2)
   Démo live des fonctionnalités du projet réel : données en direct
   via l'API ouverte Open-Meteo (sans clé), graphique 24h, multi-villes.
   ================================================================= */
(function () {
  "use strict";

  const CITIES = [
    { name: "Paris", lat: 48.8566, lon: 2.3522 },
    { name: "Lyon", lat: 45.7640, lon: 4.8357 },
    { name: "Marseille", lat: 43.2965, lon: 5.3698 },
    { name: "Toulouse", lat: 43.6047, lon: 1.4442 },
    { name: "Brest", lat: 48.3904, lon: -4.4861 },
  ];

  const WMO = {
    0: ["Ciel dégagé", "☀️"], 1: ["Plutôt dégagé", "🌤️"], 2: ["Partiellement nuageux", "⛅"], 3: ["Couvert", "☁️"],
    45: ["Brouillard", "🌫️"], 48: ["Brouillard givrant", "🌫️"],
    51: ["Bruine légère", "🌦️"], 53: ["Bruine", "🌦️"], 55: ["Bruine dense", "🌧️"],
    61: ["Pluie faible", "🌦️"], 63: ["Pluie", "🌧️"], 65: ["Pluie forte", "🌧️"],
    66: ["Pluie verglaçante", "🌧️"], 67: ["Pluie verglaçante forte", "🌧️"],
    71: ["Neige faible", "🌨️"], 73: ["Neige", "🌨️"], 75: ["Neige forte", "❄️"], 77: ["Grains de neige", "🌨️"],
    80: ["Averses", "🌦️"], 81: ["Averses", "🌧️"], 82: ["Averses violentes", "⛈️"],
    85: ["Averses de neige", "🌨️"], 86: ["Averses de neige", "❄️"],
    95: ["Orage", "⛈️"], 96: ["Orage + grêle", "⛈️"], 99: ["Orage + grêle", "⛈️"],
  };
  const cond = (c) => WMO[c] || ["—", "🛰️"];

  function sparkline(temps) {
    const W = 320, H = 120, P = 16;
    const min = Math.min(...temps), max = Math.max(...temps);
    const span = Math.max(1, max - min);
    const x = (i) => P + (i / (temps.length - 1)) * (W - 2 * P);
    const y = (t) => H - P - ((t - min) / span) * (H - 2 * P);
    const pts = temps.map((t, i) => `${x(i).toFixed(1)},${y(t).toFixed(1)}`);
    const line = "M" + pts.join(" L");
    const area = `M${x(0)},${H - P} L` + pts.join(" L") + ` L${x(temps.length - 1)},${H - P} Z`;
    // marqueurs min / max
    const iMax = temps.indexOf(max), iMin = temps.indexOf(min);
    return `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-label="Température sur 24 heures">
        <defs><linearGradient id="wxgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FF4655" stop-opacity=".5"/><stop offset="100%" stop-color="#FF4655" stop-opacity="0"/>
        </linearGradient></defs>
        <path class="wx-area" d="${area}"/>
        <path class="wx-line" d="${line}"/>
        <circle class="wx-dot" cx="${x(iMax)}" cy="${y(max)}" r="3.5"/>
        <text class="wx-axis" x="${x(iMax)}" y="${y(max) - 7}" text-anchor="middle">${Math.round(max)}°</text>
        <circle class="wx-dot" cx="${x(iMin)}" cy="${y(min)}" r="3.5"/>
        <text class="wx-axis" x="${x(iMin)}" y="${y(min) + 14}" text-anchor="middle">${Math.round(min)}°</text>
      </svg>`;
  }

  // Coercition sûre : arrondi si fini, sinon tiret (évite "NaN"/"undefined" à l'écran)
  const r = (v) => (Number.isFinite(+v) ? Math.round(+v) : "—");
  const n = (v) => (Number.isFinite(+v) ? +v : "—");

  // Transition douce : on remplace le contenu en fondu, sans vidage brutal
  function paint(body, html) {
    body.style.opacity = "0";
    setTimeout(() => { body.innerHTML = html; requestAnimationFrame(() => { body.style.opacity = "1"; }); }, 150);
  }

  let reqId = 0;                                                 // R1 : jeton anti-course

  async function load(host, city, firstLoad) {
    const myId = ++reqId;                                        // requête la plus récente
    const body = host.querySelector("#wxBody");
    body.style.transition = "opacity .3s ease";
    if (firstLoad) body.innerHTML = '<div class="weather__err">📡 Acquisition des données…</div>';
    else body.style.opacity = "0.4";                              // on atténue l'ancien contenu pendant le chargement
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,weather_code` +
      `&hourly=temperature_2m&forecast_days=1&timezone=auto`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);          // R1 : pas d'attente infinie
    let out = "";
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      const cur = d && d.current;
      if (!cur) throw new Error("réponse météo incomplète");
      const [label, icon] = cond(cur.weather_code);
      // S4/R4 : on ne garde que des nombres finis pour la courbe
      let temps = (d.hourly && Array.isArray(d.hourly.temperature_2m) ? d.hourly.temperature_2m : [])
        .map(Number).filter(Number.isFinite).slice(0, 24);
      if (!temps.length && Number.isFinite(+cur.temperature_2m)) temps = [+cur.temperature_2m];
      out = `
        <div class="weather__grid">
          <div class="weather__now">
            <div class="city">📍 ${city.name}</div>
            <div class="temp">${r(cur.temperature_2m)}<span class="deg">°C</span></div>
            <div class="cond">${icon} ${label}</div>
            <div class="weather__metrics">
              <div><div class="v">${r(cur.apparent_temperature)}°</div><div class="k">Ressenti</div></div>
              <div><div class="v">${n(cur.relative_humidity_2m)}%</div><div class="k">Humidité</div></div>
              <div><div class="v">${r(cur.wind_speed_10m)}</div><div class="k">Vent km/h</div></div>
            </div>
          </div>
          <div class="weather__chart">
            <div class="lbl">Température · prochaines 24 h</div>
            ${temps.length ? sparkline(temps) : '<div class="muted" style="padding:14px 0">Courbe indisponible</div>'}
          </div>
        </div>`;
      window.Ach && window.Ach.unlock("meteo", "Overlay météo activé");
    } catch (e) {
      const aborted = e && e.name === "AbortError";
      out = `<div class="weather__err">⚠️ ${aborted ? "Délai dépassé" : "Données indisponibles"} (hors-ligne ou API injoignable).<br/><small class="muted">Le projet réel s'appuie sur l'API SYNOP via un backend PHP.</small></div>`;
    } finally {
      clearTimeout(timer);
      if (myId === reqId) paint(body, out);                     // on ignore les réponses dépassées
    }
  }

  function init() {
    const host = document.getElementById("weatherWidget");
    if (!host) return;
    host.classList.add("weather", "panel");
    host.innerHTML = `
      <div class="weather__bar">
        <span class="ttl"><b>//</b> Overlay tactique · Météo live</span>
        <span class="live">Direct</span>
      </div>
      <div id="wxBody"></div>
      <div class="weather__cities" id="wxCities">
        ${CITIES.map((c, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "active" : ""}">${c.name}</button>`).join("")}
      </div>`;
    load(host, CITIES[0], true);
    host.querySelector("#wxCities").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b || b.classList.contains("active")) return;
      host.querySelectorAll("#wxCities button").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      load(host, CITIES[+b.dataset.i], false);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
