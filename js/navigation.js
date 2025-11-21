/**
 * NAVIGATION.JS
 * Gestion de la navigation principale, burger menu et scroll
 */

(function() {
  'use strict';

  // ========================================
  // VARIABLES GLOBALES
  // ========================================
  
  const nav = document.getElementById('mainNav');
  const burgerMenu = document.getElementById('burgerMenu');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let lastScrollY = window.scrollY;
  let ticking = false;

  // ========================================
  // BURGER MENU - TOGGLE MOBILE
  // ========================================
  
  if (burgerMenu && navMenu) {
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('active');
      navMenu.classList.toggle('active');
      
      // Empêcher le scroll quand le menu est ouvert
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Fermer le menu au clic sur un lien
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Fermer le menu au clic en dehors
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && navMenu.classList.contains('active')) {
        burgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // ========================================
  // NAVIGATION AU SCROLL
  // ========================================
  
  function updateNavOnScroll() {
    const scrollY = window.scrollY;

    // Ajouter classe "scrolled" après 50px
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(updateNavOnScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });

  // ========================================
  // ACTIVE LINK - Mise en évidence du lien actif
  // ========================================
  
  function setActiveLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      link.classList.remove('active');
      
      const linkHref = link.getAttribute('href');
      
      // Gestion spéciale pour la page d'accueil
      if ((currentPage === '' || currentPage === 'index.html') && linkHref === 'index.html') {
        link.classList.add('active');
      } else if (linkHref === currentPage) {
        link.classList.add('active');
      }
    });
  }

  // ========================================
  // SMOOTH SCROLL POUR ANCRES
  // ========================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Ignorer les href vides ou juste "#"
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        // Calculer la position avec offset pour la navbar
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Fermer le menu mobile si ouvert
        if (navMenu.classList.contains('active')) {
          burgerMenu.classList.remove('active');
          navMenu.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // ========================================
  // DÉTECTION DE LA SECTION VISIBLE
  // ========================================
  
  function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY;
    const navHeight = nav.offsetHeight;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - navHeight - 100;
      const sectionId = section.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        // Mettre à jour le lien actif correspondant à la section
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Throttle pour la détection de section
  let sectionTicking = false;
  function requestSectionUpdate() {
    if (!sectionTicking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        sectionTicking = false;
      });
      sectionTicking = true;
    }
  }

  window.addEventListener('scroll', requestSectionUpdate, { passive: true });

  // ========================================
  // GESTION DU RESIZE
  // ========================================
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Fermer le menu mobile si on passe en desktop
      if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        burgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    }, 250);
  });

  // ========================================
  // NAVIGATION AVEC FLÈCHES (OPTIONNEL)
  // ========================================
  
  let currentLinkIndex = 0;
  
  function focusNextLink(direction) {
    const visibleLinks = Array.from(navLinks).filter(link => {
      return link.offsetParent !== null; // Visible
    });

    if (visibleLinks.length === 0) return;

    if (direction === 'next') {
      currentLinkIndex = (currentLinkIndex + 1) % visibleLinks.length;
    } else {
      currentLinkIndex = (currentLinkIndex - 1 + visibleLinks.length) % visibleLinks.length;
    }

    visibleLinks[currentLinkIndex].focus();
  }

  // Navigation avec Tab (déjà native) mais on peut améliorer
  document.addEventListener('keydown', (e) => {
    // Alt + Flèche droite = lien suivant
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      focusNextLink('next');
    }
    
    // Alt + Flèche gauche = lien précédent
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      focusNextLink('prev');
    }

    // Echap pour fermer le menu mobile
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      burgerMenu.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ========================================
  // INDICATEUR DE PROGRESSION DE LECTURE
  // ========================================
  
  function createReadingProgress() {
    // Vérifier si on est sur une page avec du contenu long
    const main = document.querySelector('main') || document.body;
    
    if (!main) return;

    // Créer la barre de progression
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
    
    // Styles inline pour la barre
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(255, 255, 255, 0.05);
      z-index: 9999;
      pointer-events: none;
    `;

    const bar = progressBar.querySelector('.reading-progress-bar');
    bar.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #00ffff, #a855f7);
      width: 0%;
      transition: width 0.1s ease;
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    `;

    document.body.appendChild(progressBar);

    // Mettre à jour la progression
    function updateReadingProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      bar.style.width = `${Math.min(scrollPercent, 100)}%`;
    }

    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress(); // Init
  }

  // ========================================
  // INITIALISATION
  // ========================================
  
  function init() {
    setActiveLink();
    updateNavOnScroll();
    createReadingProgress();
    
    console.log('✅ Navigation initialized');
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();