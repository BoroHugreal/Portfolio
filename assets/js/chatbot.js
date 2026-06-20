/* =================================================================
   chatbot.js — "Com tactique" : widget RAG flottant
   RAG complet : retrieval BM25 sur le contenu réel du site (window.KB)
   → puis, si un endpoint Ollama est configuré, génération par LLM
   ancrée sur les passages récupérés ; sinon réponse extractive (BM25).
   ================================================================= */
(function () {
  "use strict";
  const BASE = document.documentElement.getAttribute("data-base") || window.SITE_BASE || "";
  const KB = window.KB || [];

  /* =================================================================
     CONFIG LLM (Ollama) — OPTIONNELLE
     - Laisser LLM_ENDPOINT vide  => mode 100% BM25 extractif (déployé tel quel).
     - Pour activer la génération LLM, renseigne l'URL d'un serveur Ollama
       joignable DEPUIS LE NAVIGATEUR du visiteur :
         • en local  : "http://localhost:11434"
             1) lance Ollama avec CORS :  OLLAMA_ORIGINS=*  ollama serve
             2) ajoute cette URL au  connect-src  de la CSP des pages
             3) sers le site en http (sinon le https bloque l'appel http local)
         • en prod   : un endpoint HTTPS public, CORS activé (ex. GPU cloud)
             → ajoute l'origine au connect-src de la CSP.
     ================================================================= */
  const LLM_ENDPOINT = "";              // ex: "http://localhost:11434"
  const LLM_MODEL = "llama3.2";
  const OLLAMA_URL = (LLM_ENDPOINT || window.OLLAMA_URL || "").replace(/\/+$/, "");
  const OLLAMA_MODEL = window.OLLAMA_MODEL || LLM_MODEL;
  const LLM_ON = !!OLLAMA_URL;

  /* ---------- NLP minimal (FR) ---------- */
  const STOP = new Set("le la les un une des de du d a au aux et ou ce cet cette ces que qui quoi est es es-tu sont son sa ses pour par sur dans en il elle on nous vous ils elles je tu me te se ne pas plus avec sans tes ton ta mes mon ma comme quel quelle quels quelles ou est-ce qu quel-est c-est cest tres bien aussi y l".split(/\s+/));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const tokenize = (s) => norm(s).split(/[^a-z0-9]+/).filter((t) => t.length > 1 && !STOP.has(t));

  /* ---------- Index BM25 ---------- */
  const docs = KB.map((d) => ({ ref: d, tokens: tokenize(d.text + " " + d.title + " " + d.answer) }));
  const N = docs.length;
  const avgdl = docs.reduce((s, d) => s + d.tokens.length, 0) / Math.max(1, N);
  const df = new Map();
  docs.forEach((d) => { new Set(d.tokens).forEach((t) => df.set(t, (df.get(t) || 0) + 1)); });
  const idf = (t) => { const n = df.get(t) || 0; return Math.log(1 + (N - n + 0.5) / (n + 0.5)); };
  const K1 = 1.5, B = 0.75;

  function search(query) {
    const q = tokenize(query);
    if (!q.length) return [];
    return docs.map((d) => {
      const tf = {}; d.tokens.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
      let score = 0;
      const matched = new Set();
      q.forEach((t) => {
        const f = tf[t]; if (!f) return;
        matched.add(t);
        const denom = f + K1 * (1 - B + B * (d.tokens.length / avgdl));
        score += idf(t) * (f * (K1 + 1)) / denom;
      });
      return { ref: d.ref, score, cover: matched.size / q.length };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  }

  /* ---------- Réponses conversationnelles (sans LLM) ---------- */
  const GREET = /\b(bonjour|salut|hello|coucou|hey|yo|bonsoir)\b/i;
  const THANKS = /\b(merci|thanks|nickel|parfait|top|cool)\b/i;
  const BYE = /\b(au revoir|bye|ciao|a\+|aurevoir)\b/i;
  const WHATAREYOU = /(qui es[- ]?tu|t'?es qui|c'?est quoi ce chat(bot)?|comment.*(marche|fonctionne)|t'?es un bot|c'?est quoi le rag|explique.*\brag\b)/i;

  function shortcut(query) {
    if (GREET.test(query) && tokenize(query).length <= 3)
      return { html: "Bien reçu, agent. Je suis l'assistant tactique d'Hugo — pose-moi une question sur son <b>parcours</b>, ses <b>missions</b>, ses <b>projets</b> ou ses <b>compétences</b>.", src: null };
    if (THANKS.test(query) && tokenize(query).length <= 3)
      return { html: "Avec plaisir. Autre cible à analyser&nbsp;? 🎯", src: null };
    if (BYE.test(query) && tokenize(query).length <= 3)
      return { html: "Mission terminée. Reviens quand tu veux — et pense à <a class=\"js-nav\" href=\"" + BASE + "cv/\">récupérer le dossier complet</a>.", src: null };
    if (WHATAREYOU.test(query))
      return { html: "Je suis l'assistant RAG du <b>Projet 1</b> : je transforme ta question en mots-clés, je récupère le contenu réel du site avec <b>BM25</b>" + (LLM_ON ? ", puis un <b>LLM (Ollama)</b> rédige une réponse ancrée sur ces passages." : ", et je renvoie le passage le plus pertinent (le vrai projet ajoute une recherche vectorielle Qdrant + un LLM Ollama)."), src: "Projet 1" };
    return null;
  }

  // Réponse extractive (repli, ou mode sans LLM)
  function answerFor(query) {
    const sc = shortcut(query);
    if (sc) return sc;

    const hits = search(query);
    if (!hits.length || hits[0].score < 0.6)
      return {
        html: "Je n'ai pas de donnée fiable là-dessus dans mon brief. Essaie plutôt : <i>les compétences en data engineering</i>, <i>le stage Alcatel</i>, <i>le projet RAG</i> ou <i>comment le contacter</i>.",
        src: null,
      };

    const top = hits[0].ref;
    let html = top.answer;
    if (top.link) {
      const cls = top.link.startsWith("#") ? "" : "js-nav ";
      const href = top.link.startsWith("#") ? top.link : BASE + top.link;
      html += ` <a class="${cls}" href="${href}">→ en savoir plus</a>`;
    }
    const extras = hits.slice(1, 3).filter((h) => h.score > hits[0].score * 0.55 && h.ref.source !== top.source);
    const srcLabel = [top.source, ...extras.map((e) => e.ref.source)].filter(Boolean);
    return { html, src: srcLabel.length ? "Source : " + [...new Set(srcLabel)].join(" · ") : null };
  }

  /* ---------- Génération LLM (Ollama) ancrée sur le retrieval ---------- */
  async function callLLM(query, hits) {
    const context = hits.slice(0, 3).map((h, i) => `[${i + 1}] (${h.ref.source}) ${h.ref.answer}`).join("\n");
    const messages = [
      { role: "system", content: "Tu es l'assistant du portfolio d'Hugo Alves Miranda. Réponds en français, en 1 à 3 phrases, de façon concise et professionnelle (tu peux reprendre sobrement un ton « gaming tactique »). Utilise UNIQUEMENT le CONTEXTE fourni ; si l'information n'y figure pas, dis-le honnêtement et invite à reformuler. N'invente jamais de fait." },
      { role: "user", content: `CONTEXTE :\n${context}\n\nQUESTION : ${query}` },
    ];
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false, options: { temperature: 0.3 } }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const text = data && data.message && data.message.content ? data.message.content.trim() : "";
      if (!text) throw new Error("réponse LLM vide");
      return text;
    } finally {
      clearTimeout(timer);
    }
  }

  /* ---------- UI ---------- */
  const ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.6A8.4 8.4 0 1 1 21 11.5z"/><circle cx="8.5" cy="11.5" r="1" fill="currentColor"/><circle cx="12" cy="11.5" r="1" fill="currentColor"/><circle cx="15.5" cy="11.5" r="1" fill="currentColor"/></svg>';
  const ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l16-8-6 8 6 8z"/></svg>';
  const ICON_BOT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="9" cy="13" r="1.2" fill="currentColor"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/></svg>';
  const SUGG = ["Qui est Hugo ?", "Le stage Alcatel", "Le projet RAG", "Ses compétences data", "Comment le contacter ?"];
  const STATUS = LLM_ON ? "En ligne · RAG + Ollama" : "En ligne · démo BM25";
  const DISCLAIMER = LLM_ON
    ? `Réponses générées par un LLM (Ollama · ${OLLAMA_MODEL}) ancrées sur le contenu récupéré (RAG).`
    : "Réponses générées par récupération (RAG) sur le contenu réel du site.";
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  function build() {
    const fab = document.createElement("button");
    fab.className = "chat-fab"; fab.id = "chatFab"; fab.setAttribute("aria-label", "Ouvrir la com tactique (chatbot)");
    fab.innerHTML = `${ICON_CHAT}<span class="label-hide">Com&nbsp;tactique</span><span class="pulse"></span>`;

    const panel = document.createElement("div");
    panel.className = "chat-panel"; panel.id = "chatPanel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "Assistant RAG");
    panel.innerHTML = `
      <div class="chat-panel__in">
        <div class="chat-head">
          <span class="av">${ICON_BOT}</span>
          <div class="meta"><b>Assistant RAG</b><span>${STATUS}</span></div>
          <button class="x" id="chatClose" aria-label="Fermer">✕</button>
        </div>
        <div class="chat-log" id="chatLog"></div>
        <div class="chat-sugg" id="chatSugg">${SUGG.map((s) => `<button type="button">${s}</button>`).join("")}</div>
        <form class="chat-form" id="chatForm">
          <input id="chatInput" type="text" autocomplete="off" placeholder="Pose ta question à l'agent…" aria-label="Votre message" />
          <button class="send" type="submit" aria-label="Envoyer">${ICON_SEND}</button>
        </form>
        <div class="chat-disclaimer">${DISCLAIMER}</div>
      </div>`;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const log = panel.querySelector("#chatLog");
    const form = panel.querySelector("#chatForm");
    const input = panel.querySelector("#chatInput");
    const sugg = panel.querySelector("#chatSugg");
    let greeted = false;

    function scroll() { log.scrollTop = log.scrollHeight; }
    function add(html, who, src) {
      const m = document.createElement("div");
      m.className = "msg " + who;
      m.innerHTML = html + (src ? `<span class="src">${src}</span>` : "");
      log.appendChild(m); scroll(); return m;
    }
    function botThinking() {
      const m = document.createElement("div");
      m.className = "msg bot";
      m.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      log.appendChild(m); scroll(); return m;
    }
    // rendu d'une réponse "de confiance" (KB) : HTML
    function render(bubble, ans) {
      bubble.innerHTML = ans.html + (ans.src ? `<span class="src">${ans.src}</span>` : "");
      scroll();
    }
    // rendu d'une réponse LLM : texte brut (anti-injection) + source/lien construits en DOM
    function renderLLM(bubble, text, top) {
      bubble.textContent = text;
      if (top && top.link) {
        const internal = !top.link.startsWith("#");
        const a = document.createElement("a");
        a.href = internal ? BASE + top.link : top.link;
        if (internal) a.className = "js-nav";
        a.textContent = "→ en savoir plus";
        bubble.appendChild(document.createElement("br"));
        bubble.appendChild(a);
      }
      const s = document.createElement("span");
      s.className = "src";
      s.textContent = "Source : " + (top ? top.source : "—") + " · LLM " + OLLAMA_MODEL;
      bubble.appendChild(s);
      scroll();
    }
    async function respond(q) {
      const t = botThinking();
      const sc = shortcut(q);
      if (sc) { await wait(360); render(t, sc); return; }

      const hits = search(q);
      if (LLM_ON && hits.length && hits[0].score >= 0.6) {
        try {
          const text = await callLLM(q, hits);
          renderLLM(t, text, hits[0].ref);
          return;
        } catch (e) {
          // repli silencieux sur la réponse extractive
        }
      }
      await wait(340);
      render(t, answerFor(q));
    }
    function addUser(text) {
      const m = document.createElement("div");
      m.className = "msg user";
      m.textContent = text;                 // message utilisateur jamais interprété comme HTML
      log.appendChild(m); scroll(); return m;
    }
    function ask(q) {
      addUser(q);
      respond(q);
      sugg.classList.add("hide");
    }

    function open() {
      panel.classList.add("open");
      fab.style.display = "none";
      if (!greeted) { greeted = true; add("Bienvenue dans la <b>com tactique</b> 🎧 Je réponds sur le profil, les missions et les projets d'Hugo. Choisis un sujet ou écris-moi.", "bot"); }
      setTimeout(() => input.focus(), 250);
      window.Ach && window.Ach.unlock("chat", "Com tactique établie");
    }
    function close() { panel.classList.remove("open"); fab.style.display = ""; }

    fab.addEventListener("click", open);
    panel.querySelector("#chatClose").addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) close(); });
    form.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ""; ask(v); });
    sugg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
  }

  document.addEventListener("DOMContentLoaded", build);
})();
