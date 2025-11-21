/**
 * PROJECT-FILTERS.JS
 * Système de filtrage des projets par catégorie
 */

(function() {
  'use strict';

  // ========================================
  // VARIABLES GLOBALES
  // ========================================
  
  let currentFilter = 'all';
  let projectCards = [];
  let filterButtons = [];

  // ========================================
  // INITIALISATION
  // ========================================
  
  function init() {
    // Récupérer les éléments
    filterButtons = document.querySelectorAll('.filter-btn');
    projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length === 0 || projectCards.length === 0) {
      console.log('ℹ️ No filters or projects found');
      return;
    }

    // Ajouter les event listeners
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => handleFilterClick(btn));
    });

    // Initialiser le compteur de projets
    updateProjectCount();

    console.log('🔍 Project filters initialized');
  }

  // ========================================
  // GESTION DES CLICS SUR FILTRES
  // ========================================
  
  function handleFilterClick(button) {
    const filter = button.getAttribute('data-filter');

    // Ne rien faire si déjà actif
    if (filter === currentFilter) return;

    // Mettre à jour l'état
    currentFilter = filter;

    // Mettre à jour les boutons
    updateFilterButtons(button);

    // Filtrer les projets
    filterProjects(filter);

    // Mettre à jour le compteur
    updateProjectCount();
  }

  // ========================================
  // MISE À JOUR DES BOUTONS
  // ========================================
  
  function updateFilterButtons(activeButton) {
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    activeButton.classList.add('active');
  }

  // ========================================
  // FILTRAGE DES PROJETS
  // ========================================
  
  function filterProjects(filter) {
    projectCards.forEach((card, index) => {
      const categories = card.getAttribute('data-category') || '';
      const shouldShow = filter === 'all' || categories.includes(filter);

      if (shouldShow) {
        showCard(card, index);
      } else {
        hideCard(card);
      }
    });
  }

  function showCard(card, index) {
    // Animation d'entrée
    card.style.display = 'block';
    
    // Force reflow
    void card.offsetWidth;
    
    // Ajouter classe visible avec délai
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    }, index * 50); // Cascade
  }

  function hideCard(card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    
    setTimeout(() => {
      card.style.display = 'none';
    }, 300);
  }

  // ========================================
  // COMPTEUR DE PROJETS
  // ========================================
  
  function updateProjectCount() {
    const visibleProjects = Array.from(projectCards).filter(card => {
      return window.getComputedStyle(card).display !== 'none';
    });

    const count = visibleProjects.length;
    
    // Mettre à jour ou créer le compteur
    let counter = document.querySelector('.projects-count');
    
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'projects-count';
      
      const filtersSection = document.querySelector('.filters-section .container');
      if (filtersSection) {
        counter.style.cssText = `
          text-align: center;
          margin-top: 1rem;
          color: var(--color-text-muted);
          font-size: 0.875rem;
        `;
        filtersSection.appendChild(counter);
      }
    }

    counter.textContent = `${count} projet${count > 1 ? 's' : ''} affiché${count > 1 ? 's' : ''}`;
    
    // Animation du compteur
    counter.style.animation = 'fadeIn 0.3s ease';
  }

  // ========================================
  // RECHERCHE DE PROJETS (OPTIONNEL)
  // ========================================
  
  function initProjectSearch() {
    const searchInput = document.querySelector('.project-search');
    
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        searchProjects(query);
      }, 300); // Debounce
    });
  }

  function searchProjects(query) {
    if (!query) {
      // Si recherche vide, appliquer le filtre actuel
      filterProjects(currentFilter);
      return;
    }

    projectCards.forEach((card, index) => {
      const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
      const description = card.querySelector('.project-description')?.textContent.toLowerCase() || '';
      const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase()).join(' ');
      
      const searchContent = `${title} ${description} ${tags}`;
      const shouldShow = searchContent.includes(query);

      if (shouldShow) {
        showCard(card, index);
      } else {
        hideCard(card);
      }
    });

    updateProjectCount();
  }

  // ========================================
  // NAVIGATION CLAVIER DANS LES FILTRES
  // ========================================
  
  function initKeyboardNavigation() {
    let currentIndex = 0;

    document.addEventListener('keydown', (e) => {
      // Ignorer si on tape dans un champ
      const activeElement = document.activeElement;
      if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
        return;
      }

      // Flèche gauche/droite pour naviguer entre filtres
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();

        if (e.key === 'ArrowRight') {
          currentIndex = (currentIndex + 1) % filterButtons.length;
        } else {
          currentIndex = (currentIndex - 1 + filterButtons.length) % filterButtons.length;
        }

        filterButtons[currentIndex].focus();
      }

      // Entrée pour activer le filtre
      if (e.key === 'Enter' && document.activeElement.classList.contains('filter-btn')) {
        document.activeElement.click();
      }
    });
  }

  // ========================================
  // ANIMATION DES CARDS AU HOVER
  // ========================================
  
  function initCardAnimations() {
    projectCards.forEach(card => {
      const overlay = card.querySelector('.project-overlay');
      
      if (!overlay) return;

      card.addEventListener('mouseenter', () => {
        // Animer les tags
        const tags = overlay.querySelectorAll('.tag');
        tags.forEach((tag, index) => {
          tag.style.animation = `slideUp 0.3s ease ${index * 0.05}s forwards`;
        });
      });
    });
  }

  // ========================================
  // URL PARAMETERS (DEEP LINKING)
  // ========================================
  
  function initURLFilters() {
    // Lire le paramètre de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');

    if (filterParam) {
      const filterBtn = document.querySelector(`.filter-btn[data-filter="${filterParam}"]`);
      
      if (filterBtn) {
        filterBtn.click();
      }
    }

    // Mettre à jour l'URL quand on change de filtre
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        
        if (filter !== 'all') {
          const newUrl = new URL(window.location);
          newUrl.searchParams.set('filter', filter);
          window.history.pushState({}, '', newUrl);
        } else {
          // Retirer le paramètre si "all"
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('filter');
          window.history.pushState({}, '', newUrl);
        }
      });
    });
  }

  // ========================================
  // STATS PAR CATÉGORIE
  // ========================================
  
  function calculateCategoryStats() {
    const stats = {};

    projectCards.forEach(card => {
      const categories = (card.getAttribute('data-category') || '').split(' ');
      
      categories.forEach(category => {
        if (category) {
          stats[category] = (stats[category] || 0) + 1;
        }
      });
    });

    // Ajouter le nombre à chaque bouton
    filterButtons.forEach(btn => {
      const filter = btn.getAttribute('data-filter');
      
      if (filter === 'all') {
        const total = projectCards.length;
        btn.innerHTML = `<span>Tous</span> <span class="filter-count">(${total})</span>`;
      } else if (stats[filter]) {
        const count = stats[filter];
        const label = btn.textContent.trim();
        btn.innerHTML = `<span>${label}</span> <span class="filter-count">(${count})</span>`;
      }
    });

    // Style pour les compteurs
    document.querySelectorAll('.filter-count').forEach(count => {
      count.style.cssText = `
        color: var(--color-text-muted);
        font-size: 0.875em;
        margin-left: 0.25rem;
      `;
    });
  }

  // ========================================
  // INITIALISATION COMPLÈTE
  // ========================================
  
  function initAll() {
    init();
    initProjectSearch();
    initKeyboardNavigation();
    initCardAnimations();
    initURLFilters();
    calculateCategoryStats();
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();