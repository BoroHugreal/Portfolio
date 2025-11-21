/**
 * KEYBOARD-NAV.JS
 * Navigation rapide au clavier (raccourcis H, A, P, C)
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION DES RACCOURCIS
  // ========================================
  
  const shortcuts = {
    'h': 'index.html',      // H = Home (Accueil)
    'a': 'about.html',      // A = About (À propos)
    'p': 'projects.html',   // P = Projects (Projets)
    'c': 'contact.html'     // C = Contact
  };

  // ========================================
  // DÉTECTION DES TOUCHES
  // ========================================
  
  let isTyping = false;

  function isInputElement(element) {
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ['input', 'textarea', 'select'];
    const isContentEditable = element.isContentEditable;
    
    return inputTypes.includes(tagName) || isContentEditable;
  }

  document.addEventListener('keydown', (e) => {
    // Ne pas déclencher si on tape dans un champ
    if (isInputElement(e.target)) {
      isTyping = true;
      return;
    }

    isTyping = false;

    // Ne pas déclencher si Ctrl, Alt, Meta sont pressés
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return;
    }

    const key = e.key.toLowerCase();

    // Vérifier si la touche correspond à un raccourci
    if (shortcuts[key]) {
      e.preventDefault();
      navigateToPage(shortcuts[key], key.toUpperCase());
    }
  });

  // ========================================
  // NAVIGATION AVEC FEEDBACK VISUEL
  // ========================================
  
  function navigateToPage(page, keyPressed) {
    // Afficher un feedback visuel
    showKeyboardFeedback(keyPressed);

    // Petit délai pour voir l'animation
    setTimeout(() => {
      window.location.href = page;
    }, 200);
  }

  function showKeyboardFeedback(key) {
    // Créer l'élément de feedback
    const feedback = document.createElement('div');
    feedback.className = 'keyboard-feedback';
    feedback.innerHTML = `
      <div class="keyboard-feedback-content">
        <kbd>${key}</kbd>
        <span>Navigation...</span>
      </div>
    `;

    // Styles inline
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      pointer-events: none;
    `;

    const content = feedback.querySelector('.keyboard-feedback-content');
    content.style.cssText = `
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 2rem;
      background: rgba(10, 10, 15, 0.95);
      backdrop-filter: blur(20px);
      border: 2px solid var(--color-primary);
      border-radius: 1rem;
      box-shadow: 0 0 40px rgba(0, 255, 255, 0.3);
      animation: scaleIn 0.2s ease-out;
    `;

    const kbd = content.querySelector('kbd');
    kbd.style.cssText = `
      padding: 0.5rem 1rem;
      background: var(--gradient-primary);
      color: var(--color-bg);
      border-radius: 0.5rem;
      font-size: 1.5rem;
      font-weight: 800;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      animation: pulse 0.5s ease-in-out infinite;
    `;

    const span = content.querySelector('span');
    span.style.cssText = `
      color: var(--color-text);
      font-size: 1rem;
      font-weight: 600;
    `;

    document.body.appendChild(feedback);

    // Retirer après animation
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translate(-50%, -50%) scale(0.9)';
      feedback.style.transition = 'all 0.2s ease';
      
      setTimeout(() => {
        feedback.remove();
      }, 200);
    }, 300);
  }

  // ========================================
  // HIGHLIGHT DES RACCOURCIS AU SURVOL
  // ========================================
  
  function highlightShortcuts() {
    const navLinks = document.querySelectorAll('.nav-link[data-key]');

    navLinks.forEach(link => {
      const key = link.getAttribute('data-key');
      
      if (!key) return;

      // Ajouter un titre au survol
      link.setAttribute('title', `Raccourci: ${key.toUpperCase()}`);

      // Effet au survol
      link.addEventListener('mouseenter', () => {
        const kbdElement = link.querySelector('kbd');
        if (kbdElement) {
          kbdElement.style.transform = 'scale(1.2)';
          kbdElement.style.background = 'var(--gradient-primary)';
          kbdElement.style.color = 'var(--color-bg)';
        }
      });

      link.addEventListener('mouseleave', () => {
        const kbdElement = link.querySelector('kbd');
        if (kbdElement) {
          kbdElement.style.transform = 'scale(1)';
          kbdElement.style.background = '';
          kbdElement.style.color = '';
        }
      });
    });
  }

  // ========================================
  // AIDE RACCOURCIS (? pour afficher)
  // ========================================
  
  let helpVisible = false;

  function toggleKeyboardHelp() {
    if (helpVisible) {
      hideKeyboardHelp();
    } else {
      showKeyboardHelp();
    }
  }

  function showKeyboardHelp() {
    // Créer le panneau d'aide
    const helpPanel = document.createElement('div');
    helpPanel.id = 'keyboardHelp';
    helpPanel.className = 'keyboard-help-panel';
    
    helpPanel.innerHTML = `
      <div class="keyboard-help-content">
        <div class="keyboard-help-header">
          <h3>⌨️ Raccourcis clavier</h3>
          <button class="keyboard-help-close" aria-label="Fermer">&times;</button>
        </div>
        <div class="keyboard-help-body">
          <div class="keyboard-help-item">
            <kbd>H</kbd>
            <span>Accueil</span>
          </div>
          <div class="keyboard-help-item">
            <kbd>A</kbd>
            <span>À propos</span>
          </div>
          <div class="keyboard-help-item">
            <kbd>P</kbd>
            <span>Projets</span>
          </div>
          <div class="keyboard-help-item">
            <kbd>C</kbd>
            <span>Contact</span>
          </div>
          <div class="keyboard-help-item">
            <kbd>?</kbd>
            <span>Afficher cette aide</span>
          </div>
          <div class="keyboard-help-item">
            <kbd>Esc</kbd>
            <span>Fermer cette aide</span>
          </div>
        </div>
        <div class="keyboard-help-footer">
          <p>💡 Les raccourcis fonctionnent partout sauf dans les champs de saisie</p>
        </div>
      </div>
    `;

    // Styles inline (pour éviter dépendance CSS)
    helpPanel.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
      padding: 2rem;
    `;

    const content = helpPanel.querySelector('.keyboard-help-content');
    content.style.cssText = `
      background: var(--color-bg-secondary);
      border: 2px solid var(--color-border);
      border-radius: 1.5rem;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: scaleIn 0.3s ease;
    `;

    const header = helpPanel.querySelector('.keyboard-help-header');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid var(--color-border);
    `;

    const body = helpPanel.querySelector('.keyboard-help-body');
    body.style.cssText = `
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    `;

    const items = helpPanel.querySelectorAll('.keyboard-help-item');
    items.forEach(item => {
      item.style.cssText = `
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 0.5rem;
        transition: all 0.3s ease;
      `;

      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(0, 255, 255, 0.05)';
        item.style.transform = 'translateX(5px)';
      });

      item.addEventListener('mouseleave', () => {
        item.style.background = 'rgba(255, 255, 255, 0.02)';
        item.style.transform = 'translateX(0)';
      });

      const kbd = item.querySelector('kbd');
      kbd.style.cssText = `
        padding: 0.5rem 0.75rem;
        background: var(--gradient-primary);
        color: var(--color-bg);
        border-radius: 0.5rem;
        font-weight: 700;
        min-width: 40px;
        text-align: center;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
      `;
    });

    const footer = helpPanel.querySelector('.keyboard-help-footer');
    footer.style.cssText = `
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--color-border);
      text-align: center;
    `;

    footer.querySelector('p').style.cssText = `
      color: var(--color-text-muted);
      font-size: 0.875rem;
      margin: 0;
    `;

    const closeBtn = helpPanel.querySelector('.keyboard-help-close');
    closeBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--color-border);
      border-radius: 0.5rem;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.3s ease;
    `;

    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 0, 0, 0.2)';
      closeBtn.style.borderColor = '#ff4444';
    });

    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      closeBtn.style.borderColor = 'var(--color-border)';
    });

    document.body.appendChild(helpPanel);
    helpVisible = true;

    // Fermer au clic
    closeBtn.addEventListener('click', hideKeyboardHelp);
    helpPanel.addEventListener('click', (e) => {
      if (e.target === helpPanel) {
        hideKeyboardHelp();
      }
    });
  }

  function hideKeyboardHelp() {
    const helpPanel = document.getElementById('keyboardHelp');
    if (helpPanel) {
      helpPanel.style.opacity = '0';
      setTimeout(() => {
        helpPanel.remove();
        helpVisible = false;
      }, 300);
    }
  }

  // Écouter la touche "?"
  document.addEventListener('keydown', (e) => {
    if (isInputElement(e.target)) return;

    if (e.key === '?' && !e.shiftKey) {
      e.preventDefault();
      toggleKeyboardHelp();
    }

    if (e.key === 'Escape' && helpVisible) {
      hideKeyboardHelp();
    }
  });

  // ========================================
  // INITIALISATION
  // ========================================
  
  function init() {
    highlightShortcuts();
    console.log('⌨️ Keyboard navigation initialized');
    console.log('💡 Appuyez sur "?" pour voir les raccourcis');
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();