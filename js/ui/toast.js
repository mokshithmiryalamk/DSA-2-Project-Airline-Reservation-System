/**
 * AEROOPS: Toast Notification Service
 * Lightweight, accessible, non-intrusive toast messages.
 */

(function (window) {
  'use strict';

  let container = null;

  function ensureContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }
    }
    return container;
  }

  const Toast = {
    show: function (message, type = 'info', duration = 3800) {
      const c = ensureContainer();

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.setAttribute('role', 'status');

      const iconMap = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `
        <div class="toast__icon">${iconMap[type] || 'ℹ'}</div>
        <div class="toast__content">
          <p class="toast__msg">${message}</p>
        </div>
        <button type="button" class="toast__close" aria-label="Close notification">&times;</button>
      `;

      const closeBtn = toast.querySelector('.toast__close');
      const removeToast = () => {
        toast.classList.add('toast--exit');
        setTimeout(() => {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 250);
      };

      closeBtn.addEventListener('click', removeToast);

      c.appendChild(toast);

      // Trigger reflow for animation
      void toast.offsetWidth;
      toast.classList.add('toast--visible');

      if (duration > 0) {
        setTimeout(removeToast, duration);
      }
    },

    success: function (msg, duration) {
      this.show(msg, 'success', duration);
    },

    error: function (msg, duration) {
      this.show(msg, 'error', duration);
    },

    warning: function (msg, duration) {
      this.show(msg, 'warning', duration);
    },

    info: function (msg, duration) {
      this.show(msg, 'info', duration);
    }
  };

  window.AeroToast = Toast;

})(window);
