# Portfolio Web Augmenté — Hugo Alves Miranda

Portfolio personnel d'Hugo Alves Miranda — étudiant Data, futur ingénieur **Big Data & Machine Learning** (EFREI Paris), en recherche d'alternance 3 ans à partir de septembre 2026.

Direction artistique **« FPS tactique »** (réf. Valorant) : néon-sur-noir, panneaux à coins coupés, curseur réticule, scanlines, et des fonctionnalités *augmentées* qui démontrent en live les compétences IA/Data du candidat.

> Site statique **sans build ni dépendance** : HTML5 + CSS3 + JavaScript vanilla. Déployable tel quel (GitHub Pages, Netlify, n'importe quel hébergeur de fichiers statiques).

## ✨ Fonctionnalités

| Fonctionnalité | Détail | Statut cahier |
| --- | --- | --- |
| Page vitrine one-page | Hero « agent select », Lore, Parcours, Missions, Cartes, Loadout, Contact | V1 |
| Direction artistique FPS | Palette `#0A0E14`/`#FF4655`, typo Orbitron/Rajdhani/Inter, clip-path, glow, curseur réticule, scanlines | V1 |
| Pages projets dédiées | `/projets/agent-ia-rag/` (RAG hybride) + `/projets/plateforme-meteo/` (météo) avec schémas d'architecture | V1 |
| CV numérique imprimable | `/cv/` — reproduction fidèle, export PDF (impression noir-sur-blanc propre) + lien PDF original | V1 |
| Chatbot RAG flottant | « Com tactique » : retrieval **BM25** maison sur le contenu réel du site (100 % client) | V1 |
| Widget météo live | Page Projet 2 : données en direct via **Open-Meteo** (sans clé), graphique 24 h, multi-villes | V1 |
| Radar de compétences + rangs | Radar SVG animé + rangs façon compétitif (Or → Diamant) | V1 |
| Cartes « mission » | Expériences en Objectif / Briefing / Actions / Résultat | V1 |
| Écran de chargement | Loader avec astuces techniques défilantes + transition entre pages | V1 → V2 |
| Achievements / badges | Débloqués au scroll & à l'exploration (discrets, non intrusifs) | V2 |
| Mini-map de navigation | Indicateur de section façon mini-carte | V2 |
| Easter egg | **Konami Code** (`↑↑↓↓←→←→ B A`) → contenu bonus | V2 |
| Sons d'interface | Bips façon menu de jeu (WebAudio), **activable/désactivable** | V2 |

### Bonus mise en production (au-delà du cahier)

Formulaire de contact (Formspree + repli mailto) · image de partage social `og:`/`twitter:` · `robots.txt` + `sitemap.xml` + URL canoniques · **polices auto-hébergées** (zéro CDN) · page **404** stylisée · contours de focus clavier (a11y) · **déploiement GitHub Pages automatisé** (GitHub Actions).

## 🗂️ Structure

```text
.
├── index.html                      # Vitrine (one-page) + formulaire de contact
├── 404.html                        # Page d'erreur stylisée (autonome)
├── robots.txt · sitemap.xml        # SEO
├── .nojekyll                       # Désactive Jekyll sur GitHub Pages
├── .github/workflows/deploy.yml    # Déploiement auto sur GitHub Pages
├── projets/
│   ├── agent-ia-rag/index.html     # Projet 1 — Assistant IA pédagogique (RAG hybride)
│   └── plateforme-meteo/index.html # Projet 2 — Plateforme météo (+ widget live)
├── cv/index.html                   # CV numérique imprimable
├── assets/
│   ├── css/
│   │   ├── style.css               # Design system tactique complet (+ focus a11y)
│   │   ├── fonts.css               # @font-face des polices auto-hébergées
│   │   └── cv.css                  # Mise en page CV + styles d'impression
│   ├── js/
│   │   ├── main.js                 # HUD : curseur, son, loader, nav, reveal, mini-map, achievements, easter egg
│   │   ├── chatbot.js              # Widget RAG (moteur BM25)
│   │   ├── knowledge-base.js       # Corpus réel indexé par le chatbot
│   │   ├── radar.js                # Radar de compétences + barres de rang
│   │   ├── weather.js              # Widget météo live (Open-Meteo)
│   │   └── contact-form.js         # Formulaire (Formspree + repli mailto)
│   ├── fonts/                      # Polices woff2 auto-hébergées (Orbitron, Rajdhani, Inter)
│   ├── img/                        # Portrait, captures projets, favicon, og-cover.png
│   └── docs/                       # CV / LM au format PDF
└── cahier_des_charges_portfolio_hugo.pdf
```

## 🚀 Lancer en local

Aucune installation. Comme certaines fonctions utilisent `fetch` et des chemins relatifs, servez le dossier via un petit serveur HTTP plutôt qu'en `file://` :

```bash
# Python
python -m http.server 8000
# ou Node
npx serve .
```

Puis ouvrez <http://localhost:8000>.

## 🌐 Déploiement (GitHub Pages)

1. Pousser le dépôt sur GitHub (branche `main`).
2. *Settings → Pages → Build and deployment → Source : **GitHub Actions***. Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publie automatiquement à chaque push.
3. Le site est servi sous `https://borohugreal.github.io/Portfolio/` (chemins relatifs → compatibles avec un sous-dossier).

## 🧠 Comment marche le chatbot « RAG »

C'est une **démonstration vivante du Projet 1**, entièrement côté client :

1. La question est tokenisée (minuscule, accents retirés, mots vides FR filtrés).
2. Chaque document du corpus (`knowledge-base.js`) est scoré avec **BM25** (`k1=1.5`, `b=0.75`).
3. Le passage le plus pertinent est renvoyé, avec sa source et un lien éventuel.

Le projet réel va plus loin : recherche **hybride** (BM25 + vecteurs Qdrant) et génération par **LLM via Ollama**. Ici, pas de backend ni d'appel externe — les réponses proviennent du contenu réel du site.

## ⚙️ Personnalisation rapide

- **Couleurs / typo / coins** : variables CSS en haut de [`assets/css/style.css`](assets/css/style.css) (`--accent`, `--bg`, `--cut`…).
- **Contenu chatbot** : éditer [`assets/js/knowledge-base.js`](assets/js/knowledge-base.js).
- **Villes météo** : tableau `CITIES` dans [`assets/js/weather.js`](assets/js/weather.js).
- **Formulaire de contact** : par défaut, il ouvre le client mail (mailto pré-rempli). Pour un envoi sans quitter le site, créer un formulaire [Formspree](https://formspree.io) et coller l'endpoint dans `data-endpoint="…"` du `<form id="contactForm">` (dans `index.html`). Le repli mailto reste actif en cas d'échec réseau.
- **URL canoniques / SEO** : si le dépôt n'est pas servi sous `borohugreal.github.io/Portfolio/`, mettre à jour les `<link rel="canonical">`, balises `og:`/`twitter:`, ainsi que `robots.txt` et `sitemap.xml`.
- **Image de partage** : régénérable — voir `og-cover.png` (1200×630) dans `assets/img/`.

### Analytics (optionnel, respectueux de la vie privée)

Pour suivre les visites sans cookies ni RGPD lourd, ajouter dans le `<head>` (ex. [Plausible](https://plausible.io), compte requis) :

```html
<script defer data-domain="borohugreal.github.io" src="https://plausible.io/js/script.js"></script>
```

> ⚠️ Une **CSP stricte** est active sur chaque page (`script-src 'self'`). Pour autoriser un script externe (analytics) ou un autre service de formulaire, ajoute son domaine à `script-src`/`connect-src` dans la balise `<meta http-equiv="Content-Security-Policy">`.

## ♿ Accessibilité & perf

- Contours de focus clavier (`:focus-visible`) sur tous les éléments interactifs.
- `prefers-reduced-motion` respecté (animations coupées, curseur réticule désactivé).
- Polices **auto-hébergées** (woff2, `font-display: swap`) → zéro requête externe, rendu hors-ligne.
- Curseur réticule et sons d'interface uniquement sur pointeur fin ; sons **désactivés par défaut**.

## 🛡️ Sécurité & robustesse

- **CSP stricte** par page (`script-src 'self'`, `object-src 'none'`) + `referrer-policy`.
- Aucun script inline, aucune dépendance/CDN tiers, zéro secret.
- `fetch` avec **timeout** (AbortController) et repli propre ; entrées chatbot en `textContent` ; valeurs d'API coercées.
- Boot tolérant aux pannes + filets globaux d'erreurs → la page ne reste jamais bloquée sur le loader.
- Fichiers privés (`LM_*.pdf`, cahier des charges) exclus du dépôt et du déploiement (`.gitignore` + purge CI). *Si le dépôt a déjà été poussé publiquement, purger aussi l'historique Git (`git filter-repo`).*

## 🛠️ Stack

`HTML5` · `CSS3` (clip-path, custom properties, `@media print`) · `JavaScript` (ES6, IntersectionObserver, WebAudio, Fetch) · `SVG` · API ouverte `Open-Meteo`. Aucune dépendance, aucun framework.

---

*Document de référence : `cahier_des_charges_portfolio_hugo.pdf`. Réalisation conforme aux priorités V1 + V2.*
