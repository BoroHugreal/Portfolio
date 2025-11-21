/**
 * THEME-TOGGLE.JS
 * Système de thème sombre/clair avec persistance
 */

(function() {
  'use strict';

  // ========================================
  // VARIABLES GLOBALES
  // ========================================
  
  let themeToggle;
  let currentTheme = 'dark';

  // ========================================
  // INITIALISATION
  // ========================================
  
  function init() {
    // Créer le bouton de toggle
    createThemeToggle();

    // Charger le thème sauvegardé
    loadSavedTheme();

    // Event listeners
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // Détecter la préférence système
    detectSystemPreference();

    console.log('🎨 Theme toggle initialized');
  }

  // ========================================
  // CRÉER LE BOUTON DE TOGGLE
  // ========================================
  
  function createThemeToggle() {
    // Trouver la navigation
    const nav = document.getElementById('mainNav');
    const navContainer = nav?.querySelector('.nav-container');
    
    if (!navContainer) {
      console.error('Nav container not found');
      return;
    }

    // Créer le bouton
    themeToggle = document.createElement('button');
    themeToggle.id = 'themeToggle';
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Changer de thème');
    themeToggle.setAttribute('title', 'Changer de thème');

    // Icônes SVG
    themeToggle.innerHTML = `
      <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/>
        <path d="M12 2V4M12 20V22M4 12H2M22 12H20M19.07 19.07L17.66 17.66M19.07 4.93L17.66 6.34M4.93 19.07L6.34 17.66M4.93 4.93L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <svg class="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Ajouter le bouton après le logo
    const logo = navContainer.querySelector('.logo');
    if (logo && logo.nextSibling) {
      navContainer.insertBefore(themeToggle, logo.nextSibling);
    } else {
      navContainer.appendChild(themeToggle);
    }
  }

  // ========================================
  // TOGGLE DU THÈME
  // ========================================
  
  function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    saveTheme(currentTheme);
    animateToggle();
  }

  // ========================================
  // APPLIQUER LE THÈME
  // ========================================
  
  function applyTheme(theme) {
    const body = document.body;
    const root = document.documentElement;

    if (theme === 'light') {
      // Thème clair
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');

      // Variables CSS pour le thème clair
      root.style.setProperty('--color-bg', '#ffffff');
      root.style.setProperty('--color-bg-secondary', '#f8f9fa');
      root.style.setProperty('--color-bg-tertiary', '#f0f1f3');
      
      root.style.setProperty('--color-text', '#0a0a0f');
      root.style.setProperty('--color-text-secondary', '#4a4a5e');
      root.style.setProperty('--color-text-muted', '#6b6b80');
      
      root.style.setProperty('--color-border', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--color-border-hover', 'rgba(0, 200, 200, 0.3)');

      // Ombres pour le thème clair
      root.style.setProperty('--shadow-cyan', '0 0 20px rgba(0, 200, 200, 0.2)');
      root.style.setProperty('--shadow-purple', '0 0 20px rgba(138, 65, 227, 0.2)');
      root.style.setProperty('--shadow-glow', '0 0 40px rgba(0, 200, 200, 0.15)');

    } else {
      // Thème sombre (par défaut)
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');

      // Variables CSS pour le thème sombre (valeurs par défaut)
      root.style.setProperty('--color-bg', '#0a0a0f');
      root.style.setProperty('--color-bg-secondary', '#121218');
      root.style.setProperty('--color-bg-tertiary', '#1a1a24');
      
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#b4b4c8');
      root.style.setProperty('--color-text-muted', '#6b6b80');
      
      root.style.setProperty('--color-border', 'rgba(255, 255, 255, 0.1)');
      root.style.setProperty('--color-border-hover', 'rgba(0, 255, 255, 0.3)');

      root.style.setProperty('--shadow-cyan', '0 0 20px rgba(0, 255, 255, 0.3)');
      root.style.setProperty('--shadow-purple', '0 0 20px rgba(168, 85, 247, 0.3)');
      root.style.setProperty('--shadow-glow', '0 0 40px rgba(0, 255, 255, 0.2)');
    }

    // Mettre à jour l'attribut data-theme
    body.setAttribute('data-theme', theme);

    console.log(`🎨 Theme changed to: ${theme}`);
  }

  // ========================================
  // ANIMER LE TOGGLE
  // ========================================
  
  function animateToggle() {
    if (!themeToggle) return;

    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    if (currentTheme === 'light') {
      // Afficher le soleil (mode clair actif)
      sunIcon.style.transform = 'scale(1) rotate(0deg)';
      sunIcon.style.opacity = '1';
      moonIcon.style.transform = 'scale(0) rotate(90deg)';
      moonIcon.style.opacity = '0';
    } else {
      // Afficher la lune (mode sombre actif)
      sunIcon.style.transform = 'scale(0) rotate(-90deg)';
      sunIcon.style.opacity = '0';
      moonIcon.style.transform = 'scale(1) rotate(0deg)';
      moonIcon.style.opacity = '1';
    }

    // Animation du bouton
    themeToggle.style.transform = 'scale(0.9) rotate(180deg)';
    setTimeout(() => {
      themeToggle.style.transform = 'scale(1) rotate(0deg)';
    }, 200);
  }

  // ========================================
  // SAUVEGARDER LE THÈME
  // ========================================
  
  function saveTheme(theme) {
    try {
      localStorage.setItem('portfolio_theme', theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }

  // ========================================
  // CHARGER LE THÈME SAUVEGARDÉ
  // ========================================
  
  function loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('portfolio_theme');
      
      if (savedTheme) {
        currentTheme = savedTheme;
        applyTheme(currentTheme);
        updateToggleIcon();
      } else {
        // Pas de thème sauvegardé, utiliser le thème par défaut (dark)
        applyTheme('dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      applyTheme('dark');
    }
  }

  // ========================================
  // METTRE À JOUR L'ICÔNE DU TOGGLE
  // ========================================
  
  function updateToggleIcon() {
    if (!themeToggle) return;

    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    if (currentTheme === 'light') {
      sunIcon.style.transform = 'scale(1) rotate(0deg)';
      sunIcon.style.opacity = '1';
      moonIcon.style.transform = 'scale(0) rotate(90deg)';
      moonIcon.style.opacity = '0';
    } else {
      sunIcon.style.transform = 'scale(0) rotate(-90deg)';
      sunIcon.style.opacity = '0';
      moonIcon.style.transform = 'scale(1) rotate(0deg)';
      moonIcon.style.opacity = '1';
    }
  }

  // ========================================
  // DÉTECTER LA PRÉFÉRENCE SYSTÈME
  // ========================================
  
  function detectSystemPreference() {
    // Vérifier s'il y a déjà un thème sauvegardé
    const savedTheme = localStorage.getItem('portfolio_theme');
    if (savedTheme) return; // Ne pas écraser le choix de l'utilisateur

    // Détecter la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      currentTheme = 'light';
      applyTheme('light');
      updateToggleIcon();
    }

    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem('portfolio_theme');
      if (!savedTheme) { // Seulement si l'utilisateur n'a pas de préférence définie
        currentTheme = e.matches ? 'light' : 'dark';
        applyTheme(currentTheme);
        updateToggleIcon();
      }
    });
  }

  // ========================================
  // RACCOURCI CLAVIER (T pour Toggle)
  // ========================================
  
  function initKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Ignorer si on tape dans un champ
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' || 
          activeElement.isContentEditable) {
        return;
      }

      // T pour Toggle
      if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        toggleTheme();
      }
    });

    console.log('⌨️ Press "T" to toggle theme');
  }

  // ========================================
  // NOTIFICATION DE CHANGEMENT
  // ========================================
  
  function showThemeNotification(theme) {
    const notification = document.createElement('div');
    notification.className = 'theme-notification';
    notification.innerHTML = `
      <span>${theme === 'light' ? '☀️' : '🌙'}</span>
      <p>Thème ${theme === 'light' ? 'clair' : 'sombre'} activé</p>
    `;

    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-border);
      border-radius: 1rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 10000;
      animation: slideUp 0.3s ease;
      pointer-events: none;
    `;

    notification.querySelector('span').style.cssText = `
      font-size: 1.5rem;
    `;

    notification.querySelector('p').style.cssText = `
      margin: 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
    `;

    document.body.appendChild(notification);

    // Retirer après 2 secondes
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      notification.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

  // ========================================
  // INITIALISATION COMPLÈTE
  // ========================================
  
  function initAll() {
    init();
    initKeyboardShortcut();
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();