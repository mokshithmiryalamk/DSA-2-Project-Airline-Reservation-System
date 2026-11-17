/**
 * AEROOPS: Airline Reservation & Flight Network Suite
 * Application Coordinator & Shell Navigation Manager (Stage 2)
 */

(function (window) {
  'use strict';

  // DOM Elements
  const tabButtons = Array.from(document.querySelectorAll('.nav-tabs__btn'));
  const viewSections = Array.from(document.querySelectorAll('.view-section'));
  const utcClockEl = document.getElementById('live-utc-clock');

  /**
   * Updates the live UTC telemetry clock in the header
   */
  function startUtcClock() {
    function update() {
      if (!utcClockEl) return;
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      utcClockEl.textContent = `UTC: ${hours}:${minutes}:${seconds}`;
    }
    update();
    setInterval(update, 1000);
  }

  /**
   * Resolves a hash string or alias to a valid view section ID
   * @param {string} hash
   * @returns {string} - e.g. 'view-flight-deck'
   */
  function resolveViewId(hash) {
    if (!hash) return 'view-flight-deck';
    const clean = hash.replace(/^#\/?/, '').trim().toLowerCase();

    // Direct match
    if (document.getElementById(clean)) return clean;
    if (document.getElementById(`view-${clean}`)) return `view-${clean}`;

    // Aliases
    const aliasMap = {
      'flight-deck': 'view-flight-deck',
      'flights': 'view-flight-deck',
      'flight': 'view-flight-deck',
      'passengers': 'view-passengers',
      'bookings': 'view-passengers',
      'passengers-bookings': 'view-passengers',
      'routes': 'view-routes',
      'network': 'view-routes',
      'route-network': 'view-routes',
      'trees': 'view-tree-index',
      'tree-index': 'view-tree-index',
      'tree-indexing': 'view-tree-index',
      'analytics': 'view-fare-analytics',
      'sorting': 'view-fare-analytics',
      'fare-analytics': 'view-fare-analytics'
    };

    return aliasMap[clean] || 'view-flight-deck';
  }

  /**
   * Switches the active view tab
   * @param {string} targetViewId - ID of the target section (e.g. 'view-flight-deck')
   * @param {boolean} [pushHistory=true] - Whether to push state to browser history
   */
  function switchView(targetViewId, pushHistory = true) {
    const validViewId = resolveViewId(targetViewId);
    const targetSection = document.getElementById(validViewId);
    if (!targetSection) return;

    // Update Tab Buttons (ARIA & Styling)
    tabButtons.forEach((btn) => {
      const isTarget = btn.getAttribute('data-target') === validViewId;
      btn.classList.toggle('is-active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      btn.setAttribute('tabindex', isTarget ? '0' : '-1');
    });

    // Update View Sections
    viewSections.forEach((section) => {
      const isTarget = section.id === validViewId;
      section.classList.toggle('is-active', isTarget);
      section.hidden = !isTarget;
    });

    // Synchronize URL Hash & Browser History
    const cleanHash = validViewId.replace('view-', '');
    if (pushHistory && window.history && window.history.pushState) {
      if (window.location.hash !== `#${cleanHash}`) {
        window.history.pushState({ view: validViewId }, '', `#${cleanHash}`);
      }
    }

    // Trigger visualizer render on tab activations if SVG needs layout recalculation
    if (validViewId === 'view-fare-analytics' && window.AeroAnalyticsManager) {
      window.AeroAnalyticsManager.renderCurrentMode();
    }

    // Scroll to top of main content smoothly
    const mainEl = document.querySelector('.main-content');
    if (mainEl && window.scrollY > 120) {
      mainEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Handles W3C ARIA Tab keyboard navigation (Left/Right/Home/End)
   * @param {KeyboardEvent} e
   */
  function handleTabKeydown(e) {
    const currentBtn = e.target.closest('.nav-tabs__btn');
    if (!currentBtn) return;

    const currentIndex = tabButtons.indexOf(currentBtn);
    if (currentIndex === -1) return;

    let targetIndex = -1;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        targetIndex = (currentIndex + 1) % tabButtons.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        targetIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = tabButtons.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const targetBtn = tabButtons[targetIndex];
    if (targetBtn) {
      targetBtn.focus();
      const targetView = targetBtn.getAttribute('data-target');
      switchView(targetView, true);
    }
  }

  /**
   * Initializes tab navigation event listeners and history listeners
   */
  function initNavigation() {
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetViewId = btn.getAttribute('data-target');
        switchView(targetViewId, true);
      });

      btn.addEventListener('keydown', handleTabKeydown);
    });

    // Listen to browser Back / Forward events (popstate & hashchange)
    window.addEventListener('popstate', (e) => {
      const stateView = e.state && e.state.view;
      const hashView = window.location.hash.replace('#', '');
      const viewToOpen = stateView || hashView || 'view-flight-deck';
      switchView(viewToOpen, false);
    });

    window.addEventListener('hashchange', () => {
      const hashView = window.location.hash.replace('#', '');
      switchView(hashView, false);
    });

    // Support deep-linking on initial page load
    const initialHash = window.location.hash;
    const initialView = resolveViewId(initialHash);
    switchView(initialView, false);
  }

  // Initialization on DOM Load
  document.addEventListener('DOMContentLoaded', () => {
    startUtcClock();
    initNavigation();

    // Initialize Operational Managers
    if (window.AeroFlightManager) window.AeroFlightManager.init();
    if (window.AeroPassengerManager) window.AeroPassengerManager.init();
    if (window.AeroBookingManager) window.AeroBookingManager.init();
    if (window.AeroGraphManager) window.AeroGraphManager.init();
    if (window.AeroTreeManager) window.AeroTreeManager.init();
    if (window.AeroAnalyticsManager) window.AeroAnalyticsManager.init();

    console.info('AEROOPS: Stage 5 Fare Analytics & Comparative Sorting Suite Initialized Successfully.');
  });

  // Global Export
  window.AeroOpsApp = {
    switchView: switchView,
    resolveViewId: resolveViewId
  };

})(window);
