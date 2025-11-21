/**
 * ANIMATIONS.JS
 * Gestion des animations au scroll et interactions
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  
  const config = {
    threshold: 0.1,           // 10% visible pour déclencher
    rootMargin: '0px 0px -50px 0px',
    animationDelay: 100       // Délai entre animations en cascade (ms)
  };

  // ========================================
  // INTERSECTION OBSERVER - ANIMATIONS AU SCROLL
  // ========================================
  
  function initScrollAnimations() {
    // Éléments à animer
    const animatedElements = document.querySelectorAll(
      '.fade-in, .slide-up, .slide-left, .slide-right, .scale-in'
    );

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Ajouter classe "visible" avec délai
          const delay = entry.target.style.animationDelay || '0s';
          const delayMs = parseFloat(delay) * 1000;

          setTimeout(() => {
            entry.target.classList.add('visible');
            entry.target.style.opacity = '1';
          }, delayMs);

          // Ne plus observer après animation
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: config.threshold,
      rootMargin: config.rootMargin
    });

    // Observer tous les éléments
    animatedElements.forEach(el => {
      // S'assurer que l'opacité est 0 au départ
      if (!el.classList.contains('visible')) {
        el.style.opacity = '0';
      }
      observer.observe(el);
    });
  }

  // ========================================
  // ANIMATION EN CASCADE POUR GRILLES
  // ========================================
  
  function initCascadeAnimations() {
    const grids = document.querySelectorAll(
      '.overview-grid, .skills-grid, .projects-grid, .languages-grid, .tech-grid, .faq-grid'
    );

    grids.forEach(grid => {
      const items = grid.querySelectorAll('.slide-up, .fade-in');
      
      items.forEach((item, index) => {
        // Définir un délai progressif
        const delay = index * 0.1; // 100ms entre chaque
        item.style.animationDelay = `${delay}s`;
      });
    });
  }

  // ========================================
  // PARALLAX SCROLL (EFFET DE PROFONDEUR)
  // ========================================
  
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    function updateParallax() {
      const scrollY = window.scrollY;

      parallaxElements.forEach(el => {
        const speed = el.getAttribute('data-parallax') || 0.5;
        const yPos = -(scrollY * speed);
        el.style.transform = `translateY(${yPos}px)`;
      });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateParallax(); // Init
  }

  // ========================================
  // ANIMATION DES COMPTEURS (NUMBERS)
  // ========================================
  
  function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60 FPS
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');

    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.textContent);
          if (!isNaN(target)) {
            entry.target.textContent = '0';
            animateCounter(entry.target, target);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  // ========================================
  // ANIMATION DES BARRES DE PROGRESSION
  // ========================================
  
  function initProgressBars() {
    const progressBars = document.querySelectorAll('.skill-progress, .language-progress');

    if (progressBars.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.style.width || '0%';
          
          // Reset puis animer
          bar.style.width = '0%';
          
          setTimeout(() => {
            bar.style.transition = 'width 1.5s ease';
            bar.style.width = targetWidth;
          }, 200);

          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    progressBars.forEach(bar => observer.observe(bar));
  }

  // ========================================
  // HOVER EFFECT 3D SUR CARDS
  // ========================================
  
  function init3DCardEffect() {
    const cards = document.querySelectorAll(
      '.project-card, .overview-card, .skill-category, .info-card'
    );

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          scale(1.02)
        `;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }

  // ========================================
  // CURSOR GLOW EFFECT (EFFET NÉON CURSOR)
  // ========================================
  
  function initCursorGlow() {
    // Créer l'élément de glow
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(
        circle,
        rgba(0, 255, 255, 0.1) 0%,
        rgba(0, 255, 255, 0.05) 30%,
        transparent 70%
      );
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      opacity: 0;
      mix-blend-mode: screen;
    `;

    document.body.appendChild(glow);

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    // Smooth follow
    function animateGlow() {
      const dx = mouseX - glowX;
      const dy = mouseY - glowY;

      glowX += dx * 0.1;
      glowY += dy * 0.1;

      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;

      requestAnimationFrame(animateGlow);
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });

    animateGlow();
  }

  // ========================================
  // TEXT REVEAL ANIMATION (TYPING EFFECT)
  // ========================================
  
  function initTextReveal() {
    const textElements = document.querySelectorAll('.text-reveal');

    textElements.forEach(el => {
      const text = el.textContent;
      el.textContent = '';
      el.style.display = 'inline-block';

      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(timer);
          el.style.borderRight = 'none'; // Enlever le curseur
        }
      }, 50);
    });
  }

  // ========================================
  // LAZY LOADING IMAGES
  // ========================================
  
  function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }

          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // ========================================
  // SCROLL TO TOP BUTTON
  // ========================================
  
  function initScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    scrollBtn.setAttribute('aria-label', 'Retour en haut');

    scrollBtn.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 50px;
      height: 50px;
      background: var(--gradient-primary);
      border: none;
      border-radius: 50%;
      color: var(--color-bg);
      cursor: pointer;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
      opacity: 0;
      transform: translateY(100px);
      transition: all 0.3s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    document.body.appendChild(scrollBtn);

    // Afficher/masquer selon scroll
    function updateScrollBtn() {
      if (window.scrollY > 500) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.transform = 'translateY(0)';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.transform = 'translateY(100px)';
      }
    }

    window.addEventListener('scroll', updateScrollBtn, { passive: true });

    // Clic pour scroll to top
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Hover effect
    scrollBtn.addEventListener('mouseenter', () => {
      scrollBtn.style.transform = 'translateY(0) scale(1.1)';
      scrollBtn.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8)';
    });

    scrollBtn.addEventListener('mouseleave', () => {
      scrollBtn.style.transform = 'translateY(0) scale(1)';
      scrollBtn.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
    });
  }

  // ========================================
  // PERFORMANCE - REDUCE MOTION
  // ========================================
  
  function checkReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Désactiver les animations complexes
      document.body.style.setProperty('--transition-base', '0s');
      document.body.style.setProperty('--transition-slow', '0s');
      
      console.log('⚡ Animations réduites pour performances');
    }
  }

  // ========================================
  // INITIALISATION
  // ========================================
  
  function init() {
    checkReducedMotion();
    initScrollAnimations();
    initCascadeAnimations();
    initParallax();
    initCounterAnimations();
    initProgressBars();
    init3DCardEffect();
    initCursorGlow();
    initTextReveal();
    initLazyLoading();
    initScrollToTop();

    console.log('✨ Animations initialized');
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();