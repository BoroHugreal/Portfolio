/**
 * CONTACT-FORM.JS
 * Gestion et validation du formulaire de contact
 */

(function() {
  'use strict';

  // ========================================
  // VARIABLES GLOBALES
  // ========================================
  
  let form;
  let formMessage;
  let submitBtn;
  let formFields = {};

  // ========================================
  // INITIALISATION
  // ========================================
  
  function init() {
    form = document.getElementById('contactForm');
    formMessage = document.getElementById('formMessage');
    submitBtn = document.getElementById('submitBtn');

    if (!form) {
      console.log('ℹ️ Contact form not found');
      return;
    }

    // Récupérer tous les champs
    formFields = {
      name: document.getElementById('name'),
      email: document.getElementById('email'),
      subject: document.getElementById('subject'),
      message: document.getElementById('message')
    };

    // Event listeners
    form.addEventListener('submit', handleSubmit);

    // Validation en temps réel
    Object.values(formFields).forEach(field => {
      if (field) {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
      }
    });

    console.log('📧 Contact form initialized');
  }

  // ========================================
  // VALIDATION DES CHAMPS
  // ========================================
  
  function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Validation selon le type de champ
    switch(fieldName) {
      case 'name':
        if (!value) {
          isValid = false;
          errorMessage = 'Le nom est requis';
        } else if (value.length < 2) {
          isValid = false;
          errorMessage = 'Le nom doit contenir au moins 2 caractères';
        }
        break;

      case 'email':
        if (!value) {
          isValid = false;
          errorMessage = 'L\'email est requis';
        } else if (!isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Email invalide';
        }
        break;

      case 'subject':
        if (!value) {
          isValid = false;
          errorMessage = 'Veuillez sélectionner un sujet';
        }
        break;

      case 'message':
        if (!value) {
          isValid = false;
          errorMessage = 'Le message est requis';
        } else if (value.length < 10) {
          isValid = false;
          errorMessage = 'Le message doit contenir au moins 10 caractères';
        }
        break;
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    } else {
      clearFieldError(field);
    }

    return isValid;
  }

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  function showFieldError(field, message) {
    // Retirer erreur existante
    clearFieldError(field);

    // Ajouter classe erreur
    field.classList.add('field-error');
    field.style.borderColor = '#ff4444';

    // Créer message d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #ff4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      animation: slideUp 0.3s ease;
    `;

    field.parentNode.appendChild(errorDiv);
  }

  function clearFieldError(field) {
    field.classList.remove('field-error');
    field.style.borderColor = '';

    const errorMessage = field.parentNode.querySelector('.field-error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  // ========================================
  // VALIDATION DU FORMULAIRE COMPLET
  // ========================================
  
  function validateForm() {
    let isValid = true;

    Object.values(formFields).forEach(field => {
      if (field && !validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // ========================================
  // SOUMISSION DU FORMULAIRE
  // ========================================
  
  async function handleSubmit(e) {
    e.preventDefault();

    // Valider le formulaire
    if (!validateForm()) {
      showMessage('Veuillez corriger les erreurs', 'error');
      return;
    }

    // Désactiver le bouton
    setSubmitButtonState(true);

    // Récupérer les données
    const formData = {
      name: formFields.name.value.trim(),
      email: formFields.email.value.trim(),
      subject: formFields.subject.value,
      message: formFields.message.value.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      // OPTION 1: Simuler envoi (à remplacer par votre backend)
      // await simulateSubmit(formData);

      // OPTION 2: Utiliser FormSubmit.co (service gratuit)
      // await submitToFormSubmit(formData);

      // OPTION 3: Utiliser EmailJS
      await submitToEmailJS(formData);

      // Succès
      showMessage('Message envoyé avec succès ! Je vous répondrai rapidement.', 'success');
      resetForm();

    } catch (error) {
      console.error('Erreur:', error);
      showMessage('Une erreur est survenue. Veuillez réessayer.', 'error');
    } finally {
      setSubmitButtonState(false);
    }
  }

  // ========================================
  // MÉTHODES D'ENVOI
  // ========================================
  
  // Simulation (pour demo)
  function simulateSubmit(data) {
    return new Promise((resolve) => {
      console.log('📧 Form data:', data);
      setTimeout(resolve, 1500);
    });
  }

  // FormSubmit.co (gratuit, sans backend)
  async function submitToFormSubmit(data) {
    // Remplacer YOUR_EMAIL par votre email
    const endpoint = 'https://formsubmit.co/YOUR_EMAIL';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Erreur réseau');
    }

    return response.json();
  }

  // EmailJS (nécessite compte gratuit)
  async function submitToEmailJS(data) {
    // Configuration EmailJS (à adapter)
    const serviceID = 'service_zkv9byh';
    const templateID = 'template_6e9jg2u';
    const publicKey = 'cRd7N54m_aDTjQMqi';

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: serviceID,
        template_id: templateID,
        user_id: publicKey,
        template_params: data
      })
    });

    if (!response.ok) {
      throw new Error('Erreur EmailJS');
    }
  }

  // ========================================
  // GESTION DES MESSAGES
  // ========================================
  
  function showMessage(text, type) {
    if (!formMessage) return;

    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
    formMessage.style.display = 'block';
    formMessage.style.animation = 'slideUp 0.3s ease';

    // Auto-masquer après 5 secondes
    setTimeout(() => {
      formMessage.style.opacity = '0';
      setTimeout(() => {
        formMessage.style.display = 'none';
        formMessage.style.opacity = '1';
      }, 300);
    }, 5000);
  }

  // ========================================
  // GESTION DU BOUTON
  // ========================================
  
  function setSubmitButtonState(loading) {
    if (!submitBtn) return;

    const span = submitBtn.querySelector('span');
    const svg = submitBtn.querySelector('svg');

    if (loading) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
      
      if (span) span.textContent = 'Envoi en cours...';
      if (svg) svg.style.display = 'none';

      // Ajouter spinner
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      spinner.style.cssText = `
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: rotate 1s linear infinite;
      `;
      submitBtn.appendChild(spinner);
    } else {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      
      if (span) span.textContent = 'Envoyer le message';
      if (svg) svg.style.display = 'block';

      const spinner = submitBtn.querySelector('.loading-spinner');
      if (spinner) spinner.remove();
    }
  }

  // ========================================
  // RESET DU FORMULAIRE
  // ========================================
  
  function resetForm() {
    form.reset();
    
    // Effacer toutes les erreurs
    Object.values(formFields).forEach(field => {
      if (field) clearFieldError(field);
    });
  }

  // ========================================
  // AUTO-SAVE (LOCAL STORAGE)
  // ========================================
  
  function initAutoSave() {
    const STORAGE_KEY = 'contact_form_draft';

    // Charger le brouillon
    function loadDraft() {
      try {
        const draft = localStorage.getItem(STORAGE_KEY);
        if (draft) {
          const data = JSON.parse(draft);
          Object.keys(data).forEach(key => {
            if (formFields[key]) {
              formFields[key].value = data[key];
            }
          });
          showMessage('Brouillon restauré', 'success');
        }
      } catch (error) {
        console.error('Erreur chargement brouillon:', error);
      }
    }

    // Sauvegarder le brouillon
    function saveDraft() {
      try {
        const data = {};
        Object.keys(formFields).forEach(key => {
          if (formFields[key]) {
            data[key] = formFields[key].value;
          }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Erreur sauvegarde brouillon:', error);
      }
    }

    // Effacer le brouillon
    function clearDraft() {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Charger au démarrage
    loadDraft();

    // Sauvegarder à chaque modification (debounced)
    let saveTimeout;
    Object.values(formFields).forEach(field => {
      if (field) {
        field.addEventListener('input', () => {
          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(saveDraft, 1000);
        });
      }
    });

    // Effacer après envoi réussi
    form.addEventListener('submit', () => {
      setTimeout(clearDraft, 2000);
    });
  }

  // ========================================
  // COMPTEUR DE CARACTÈRES
  // ========================================
  
  function initCharacterCounter() {
    const messageField = formFields.message;
    if (!messageField) return;

    const maxLength = 500;
    messageField.setAttribute('maxlength', maxLength);

    const counter = document.createElement('div');
    counter.className = 'character-counter';
    counter.style.cssText = `
      text-align: right;
      font-size: 0.75rem;
      color: var(--color-text-muted);
      margin-top: 0.25rem;
    `;

    messageField.parentNode.appendChild(counter);

    function updateCounter() {
      const length = messageField.value.length;
      counter.textContent = `${length} / ${maxLength}`;

      if (length > maxLength * 0.9) {
        counter.style.color = '#ff4444';
      } else {
        counter.style.color = 'var(--color-text-muted)';
      }
    }

    messageField.addEventListener('input', updateCounter);
    updateCounter();
  }

  // ========================================
  // INITIALISATION COMPLÈTE
  // ========================================
  
  function initAll() {
    init();
    initAutoSave();
    initCharacterCounter();
  }

  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();