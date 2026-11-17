/**
 * AEROOPS: Accessible Modal Controller
 * Handles modal display, focus management, Escape key dismiss, and backdrop clicks.
 */

(function (window) {
  'use strict';

  let activeModal = null;
  let previousActiveElement = null;

  const ModalController = {
    /**
     * Opens a modal by ID
     * @param {string} modalId - The DOM ID of the modal container
     * @param {Element} [triggerEl] - The element that triggered the modal
     */
    open: function (modalId, triggerEl = null) {
      const modal = document.getElementById(modalId);
      if (!modal) {
        console.error(`[ModalController] Modal not found: #${modalId}`);
        return;
      }

      if (activeModal && activeModal !== modal) {
        this.close(activeModal.id);
      }

      previousActiveElement = triggerEl || document.activeElement;
      activeModal = modal;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');

      // Focus first focusable element inside modal
      const focusableElements = modal.querySelectorAll('input:not([type="hidden"]), select, textarea, button:not([disabled]), [tabindex="0"]');
      if (focusableElements.length > 0) {
        setTimeout(() => focusableElements[0].focus(), 50);
      }

      // Dispatch open event
      modal.dispatchEvent(new CustomEvent('modal:opened', { bubbles: true }));
    },

    /**
     * Closes an open modal by ID
     * @param {string} modalId
     */
    close: function (modalId) {
      const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
      if (!modal) return;

      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');

      if (activeModal === modal) {
        activeModal = null;
        document.body.classList.remove('modal-open');
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
          previousActiveElement.focus();
        }
      }

      modal.dispatchEvent(new CustomEvent('modal:closed', { bubbles: true }));
    },

    /**
     * Returns whether any modal is currently open
     */
    isOpen: function () {
      return activeModal !== null;
    },

    /**
     * Initializes global keyboard and backdrop dismiss listeners
     */
    init: function () {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) {
          e.preventDefault();
          this.close(activeModal.id);
        }

        // Trap focus inside active modal
        if (e.key === 'Tab' && activeModal) {
          const focusables = Array.from(activeModal.querySelectorAll('input:not([type="hidden"]), select, textarea, button:not([disabled]), [tabindex="0"]'))
            .filter(el => el.offsetParent !== null);
          if (focusables.length === 0) return;

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      });

      // Delegated click handler for close buttons & backdrops
      document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-modal-close]');
        if (closeBtn) {
          e.preventDefault();
          const modal = closeBtn.closest('.modal-overlay');
          if (modal) {
            this.close(modal.id);
          }
          return;
        }

        // Backdrop click (click directly on overlay, not modal-window)
        if (e.target.classList.contains('modal-overlay')) {
          this.close(e.target.id);
        }
      });
    }
  };

  ModalController.init();
  window.AeroModal = ModalController;

})(window);
