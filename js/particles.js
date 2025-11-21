/**
 * PARTICLES.JS
 * Système de particules animées en arrière-plan (style Gentlemates)
 */

(function() {
  'use strict';

  // ========================================
  // CONFIGURATION
  // ========================================
  
  const config = {
    particleCount: 50,
    particleSize: { min: 2, max: 4 },
    particleSpeed: { min: 0.5, max: 2 },
    colors: ['#00ffff', '#a855f7', '#ff00ff'],
    connectionDistance: 150,
    lineWidth: 1,
    lineOpacity: 0.2,
    enableConnections: true,
    enableMouse: true,
    mouseRadius: 200
  };

  // ========================================
  // CLASSE PARTICLE
  // ========================================
  
  class Particle {
    constructor(canvas) {
      this.canvas = canvas;
      this.reset();
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
      this.size = Math.random() * (config.particleSize.max - config.particleSize.min) + config.particleSize.min;
    }

    reset() {
      this.x = Math.random() * this.canvas.width;
      this.y = Math.random() * this.canvas.height;
      this.vx = (Math.random() - 0.5) * (Math.random() * (config.particleSpeed.max - config.particleSpeed.min) + config.particleSpeed.min);
      this.vy = (Math.random() - 0.5) * (Math.random() * (config.particleSpeed.max - config.particleSpeed.min) + config.particleSpeed.min);
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Rebondir sur les bords
      if (this.x < 0 || this.x > this.canvas.width) {
        this.vx *= -1;
      }
      if (this.y < 0 || this.y > this.canvas.height) {
        this.vy *= -1;
      }

      // Garder dans les limites
      this.x = Math.max(0, Math.min(this.canvas.width, this.x));
      this.y = Math.max(0, Math.min(this.canvas.height, this.y));
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // ========================================
  // CLASSE PARTICLE SYSTEM
  // ========================================
  
  class ParticleSystem {
    constructor(container) {
      this.container = container;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: null, y: null };
      this.animationId = null;

      this.init();
    }

    init() {
      // Setup canvas
      this.canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      `;

      this.container.appendChild(this.canvas);
      this.resize();

      // Créer les particules
      for (let i = 0; i < config.particleCount; i++) {
        this.particles.push(new Particle(this.canvas));
      }

      // Event listeners
      window.addEventListener('resize', () => this.resize());
      
      if (config.enableMouse) {
        this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.container.addEventListener('mouseleave', () => this.handleMouseLeave());
      }

      // Démarrer l'animation
      this.animate();
    }

    resize() {
      this.canvas.width = this.container.offsetWidth;
      this.canvas.height = this.container.offsetHeight;
    }

    handleMouseMove(e) {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    }

    handleMouseLeave() {
      this.mouse.x = null;
      this.mouse.y = null;
    }

    drawConnections() {
      const particles = this.particles;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            const opacity = (1 - distance / config.connectionDistance) * config.lineOpacity;
            
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
            this.ctx.lineWidth = config.lineWidth;
            this.ctx.moveTo(particles[i].x, particles[i].y);
            this.ctx.lineTo(particles[j].x, particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }

    drawMouseConnections() {
      if (!this.mouse.x || !this.mouse.y) return;

      this.particles.forEach(particle => {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < config.mouseRadius) {
          const opacity = (1 - distance / config.mouseRadius) * 0.5;
          
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
          this.ctx.lineWidth = 2;
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();

          // Repousser les particules
          const force = (config.mouseRadius - distance) / config.mouseRadius;
          particle.vx += (dx / distance) * force * 0.5;
          particle.vy += (dy / distance) * force * 0.5;
        }
      });

      // Dessiner le curseur glow
      this.ctx.beginPath();
      const gradient = this.ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, 50
      );
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.arc(this.mouse.x, this.mouse.y, 50, 0, Math.PI * 2);
      this.ctx.fill();
    }

    animate() {
      // Effacer le canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Dessiner les connexions
      if (config.enableConnections) {
        this.drawConnections();
      }

      // Dessiner les connexions avec la souris
      if (config.enableMouse) {
        this.drawMouseConnections();
      }

      // Mettre à jour et dessiner les particules
      this.particles.forEach(particle => {
        particle.update();
        particle.draw(this.ctx);
      });

      // Continuer l'animation
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
    }
  }

  // ========================================
  // INITIALISATION
  // ========================================
  
  function init() {
    // Trouver tous les conteneurs de particules
    const particleContainers = document.querySelectorAll('.particles');

    if (particleContainers.length === 0) {
      console.log('ℹ️ No particle containers found');
      return;
    }

    particleContainers.forEach(container => {
      new ParticleSystem(container);
    });

    console.log('✨ Particle system initialized');
  }

  // ========================================
  // ALTERNATIVE : PARTICULES CSS (PLUS LÉGÈRES)
  // ========================================
  
  function initCSSParticles() {
    const containers = document.querySelectorAll('.particles');

    containers.forEach(container => {
      // Créer 30 particules CSS
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Position aléatoire
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        // Couleur aléatoire
        const colors = ['#00ffff', '#a855f7', '#ff00ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
          position: absolute;
          left: ${x}%;
          top: ${y}%;
          width: ${size}px;
          height: ${size}px;
          background: ${color};
          border-radius: 50%;
          box-shadow: 0 0 10px ${color};
          opacity: ${Math.random() * 0.5 + 0.3};
          animation: particle-float-${i % 2 + 1} ${duration}s ease-in-out infinite;
          animation-delay: ${delay}s;
          pointer-events: none;
        `;

        container.appendChild(particle);
      }
    });

    console.log('✨ CSS Particles initialized');
  }

  // ========================================
  // CHOIX DE LA MÉTHODE
  // ========================================
  
  function initParticles() {
    // Détecter si on est sur mobile pour utiliser CSS plutôt que Canvas
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      console.log('⚡ Particles disabled (reduced motion preference)');
      return;
    }

    if (isMobile) {
      // Version légère pour mobile
      config.particleCount = 20;
      config.enableConnections = false;
      initCSSParticles();
    } else {
      // Version complète pour desktop
      init();
    }
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initParticles);
  } else {
    initParticles();
  }

})();