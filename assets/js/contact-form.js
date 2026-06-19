/* =================================================================
   contact-form.js — formulaire "Établir le contact"
   - Si le <form> a un data-endpoint (ex. Formspree), envoi AJAX.
   - Sinon (ou en cas d'échec réseau), repli sur le client mail
     (mailto: pré-rempli) → le formulaire fonctionne toujours.
   ================================================================= */
(function () {
  "use strict";
  const MAILTO = "fr.hugoalves@gmail.com";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const statusEl = document.getElementById("cformStatus");
    const btn = document.getElementById("cformSend");
    const get = (k) => (new FormData(form).get(k) || "").toString().trim();

    function setStatus(msg, kind) { statusEl.textContent = msg; statusEl.className = "cform__status " + (kind || ""); }

    function mailtoFallback(name, email, message) {
      const subject = encodeURIComponent(`Contact portfolio — ${name || "recruteur"}`);
      const body = encodeURIComponent(`Nom / Entreprise : ${name}\nEmail : ${email}\n\n${message}`);
      window.location.href = `mailto:${MAILTO}?subject=${subject}&body=${body}`;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (get("_gotcha")) return;                                  // piège anti-spam
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const name = get("name"), email = get("email"), message = get("message");
      const endpoint = (form.dataset.endpoint || "").trim();

      window.Ach && window.Ach.unlock("recruit", "Communication transmise");

      if (!endpoint) {
        setStatus("Ouverture de votre messagerie…", "busy");
        mailtoFallback(name, email, message);
        setTimeout(() => setStatus("Pas de client mail ? Écrivez à " + MAILTO, "ok"), 1400);
        return;
      }

      btn.disabled = true; setStatus("Transmission en cours…", "busy");
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);       // R1 : timeout réseau
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset(); form.classList.add("sent");
        setStatus("Message transmis ✓ Réponse sous 48 h.", "ok");
      } catch (err) {
        const aborted = err && err.name === "AbortError";
        setStatus((aborted ? "Délai dépassé" : "Échec réseau") + " — bascule sur l'email…", "err");
        mailtoFallback(name, email, message);
      } finally {
        clearTimeout(timer);
        btn.disabled = false;
      }
    });
  });
})();
