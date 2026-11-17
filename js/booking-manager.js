/**
 * AEROOPS: Commercial Ticketing & Reservation Manager (Stage 2)
 *
 * Implements functional operations mirroring Java BookingService:
 * - bookTicket(int ticketId, Passenger passenger, Flight flight)
 * - viewTickets()
 * - searchTicket(int ticketId)
 * - cancelTicket(int ticketId)
 *
 * Plus interactive ticket searching, dynamic dropdown populating,
 * authentic boarding pass generator, and cancellation modal handling.
 */

(function (window) {
  'use strict';

  const dataStore = window.AeroDataStore;
  const toast = window.AeroToast;
  const modal = window.AeroModal;

  let currentSearchQuery = '';

  const BookingManager = {
    init: function () {
      this.cacheDOMElements();
      this.bindEvents();
      this.render();

      dataStore.subscribe((event) => {
        this.render();
      });
    },

    cacheDOMElements: function () {
      this.tableBody = document.getElementById('booking-table-body');
      this.searchInput = document.getElementById('booking-search-input');
      this.countChip = document.getElementById('booking-count-chip');

      // KPIs
      this.kpiTotal = document.getElementById('kpi-booking-total');
      this.kpiRevenue = document.getElementById('kpi-booking-revenue');
      this.kpiAvgTicket = document.getElementById('kpi-booking-avg-ticket');

      // Form
      this.bookingForm = document.getElementById('form-booking-modal');
      this.passengerSelect = document.getElementById('booking-input-passenger');
      this.flightSelect = document.getElementById('booking-input-flight');
      this.ticketIdInput = document.getElementById('booking-input-id');
      this.farePreview = document.getElementById('booking-preview-fare');
    },

    bindEvents: function () {
      // Search
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          currentSearchQuery = e.target.value.toLowerCase().trim();
          this.renderTable();
        });
      }

      // Reset Booking Search Filter (Toolbar)
      const resetBookingBtn = document.getElementById('btn-reset-booking-filters');
      if (resetBookingBtn) {
        resetBookingBtn.addEventListener('click', () => {
          currentSearchQuery = '';
          if (this.searchInput) this.searchInput.value = '';
          this.renderTable();
        });
      }

      // Open Booking Modal
      const openBtn = document.getElementById('btn-open-book-ticket');
      if (openBtn) {
        openBtn.addEventListener('click', () => {
          this.openBookingModal();
        });
      }

      // Dynamic Flight Selection Change in Modal to update fare preview
      if (this.flightSelect) {
        this.flightSelect.addEventListener('change', () => {
          this.updateFarePreview();
        });
      }

      // Booking Form Submit
      if (this.bookingForm) {
        this.bookingForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleBookingFormSubmit();
        });
      }

      // Action Delegation for Ticket Table
      if (this.tableBody) {
        this.tableBody.addEventListener('click', (e) => {
          const actionBtn = e.target.closest('[data-action]');
          if (!actionBtn) return;

          const action = actionBtn.getAttribute('data-action');
          const ticketId = parseInt(actionBtn.getAttribute('data-ticket-id'), 10);

          if (action === 'pass') {
            this.viewBoardingPass(ticketId);
          } else if (action === 'cancel') {
            this.confirmCancelTicket(ticketId);
          }
        });
      }

      // Print Boarding Pass Trigger
      const printBtn = document.getElementById('btn-print-boarding-pass');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          window.print();
        });
      }
    },

    render: function () {
      this.renderKPIs();
      this.renderTable();
    },

    renderKPIs: function () {
      const tickets = dataStore.getTickets();
      const telemetry = dataStore.getTelemetry();

      if (this.kpiTotal) this.kpiTotal.textContent = tickets.length;
      if (this.kpiRevenue) {
        this.kpiRevenue.textContent = `₹${telemetry.bookedRevenue.toLocaleString('en-IN')}`;
      }
      if (this.kpiAvgTicket) {
        const avg = tickets.length > 0 ? telemetry.bookedRevenue / tickets.length : 0;
        this.kpiAvgTicket.textContent = `₹${Math.round(avg).toLocaleString('en-IN')}`;
      }
    },

    getFilteredTickets: function () {
      let list = dataStore.getTickets();

      if (currentSearchQuery) {
        list = list.filter(t => {
          const id = String(t.ticketId);
          const pName = (t.passenger.passengerName || '').toLowerCase();
          const fId = (t.flight.flightId || '').toLowerCase();
          const route = `${t.flight.source}-${t.flight.destination}`.toLowerCase();
          return id.includes(currentSearchQuery) ||
                 pName.includes(currentSearchQuery) ||
                 fId.includes(currentSearchQuery) ||
                 route.includes(currentSearchQuery);
        });
      }

      return list;
    },

    renderTable: function () {
      if (!this.tableBody) return;

      const filtered = this.getFilteredTickets();
      const allCount = dataStore.getTickets().length;

      if (this.countChip) {
        this.countChip.textContent = `${filtered.length} of ${allCount} Issued`;
      }

      if (filtered.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="table-empty-cell">
              <div class="empty-state">
                <span class="empty-state__icon" aria-hidden="true">🎫</span>
                <p class="empty-state__title">No Issued Tickets Found</p>
                <p class="empty-state__desc">No confirmed reservations match your ticket search criteria.</p>
                <button type="button" class="btn btn--sm btn--primary" onclick="window.AeroBookingManager.openBookingModal();">
                  Issue New Reservation
                </button>
              </div>
            </td>
          </tr>
        `;
        return;
      }

      const rowsHtml = filtered.map(t => {
        const formattedFare = `₹${parseFloat(t.flight.fare).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        return `
          <tr data-row-ticket-id="${t.ticketId}">
            <td class="font-mono">
              <span class="badge badge--dark-pill text-accent font-mono">#${t.ticketId}</span>
            </td>
            <td>
              <strong class="text-heading">${this.escapeHTML(t.passenger.passengerName)}</strong>
              <div class="text-muted text-xs font-mono">Passenger #${t.passenger.passengerId} &bull; ${t.passenger.gender}</div>
            </td>
            <td>
              <span class="text-accent font-mono font-bold">${t.flight.flightId}</span>
              <div class="text-muted text-xs">${this.escapeHTML(t.flight.flightName)}</div>
            </td>
            <td>
              <div class="route-cell">
                <span class="hub-pill font-mono">${t.flight.source}</span>
                <span class="route-arrow" aria-hidden="true">➔</span>
                <span class="hub-pill font-mono">${t.flight.destination}</span>
              </div>
            </td>
            <td class="fare-cell font-mono">${formattedFare}</td>
            <td>
              <span class="badge badge--green">CONFIRMED</span>
            </td>
            <td class="table-actions-cell">
              <div class="btn-group-actions">
                <button type="button" class="btn btn--xs btn--secondary" data-action="pass" data-ticket-id="${t.ticketId}" title="View Boarding Pass" aria-label="View Boarding pass for ticket ${t.ticketId}">
                  🎫 Boarding Pass
                </button>
                <button type="button" class="btn-icon btn-icon--danger" data-action="cancel" data-ticket-id="${t.ticketId}" title="Cancel Ticket Reservation" aria-label="Cancel ticket ${t.ticketId}">
                  ❌
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      this.tableBody.innerHTML = rowsHtml;
    },

    openBookingModal: function () {
      const passengers = dataStore.getPassengers();
      const flights = dataStore.getFlights();

      if (passengers.length === 0) {
        toast.warning('No passengers in manifest. Please register a passenger first.');
        window.AeroOpsApp.switchView('view-passengers');
        window.AeroPassengerManager.openPassengerModal('add');
        return;
      }

      if (flights.length === 0) {
        toast.warning('No flights in manifest. Please add a flight first.');
        window.AeroOpsApp.switchView('view-flight-deck');
        window.AeroFlightManager.openFlightModal('add');
        return;
      }

      // Populate Passenger Select
      if (this.passengerSelect) {
        this.passengerSelect.innerHTML = '<option value="">Select a registered passenger...</option>' +
          passengers.map(p => `
            <option value="${p.passengerId}">#${p.passengerId} &mdash; ${this.escapeHTML(p.passengerName)} (${p.gender}, ${p.age}y)</option>
          `).join('');
      }

      // Populate Flight Select
      if (this.flightSelect) {
        this.flightSelect.innerHTML = '<option value="">Select an active flight sector...</option>' +
          flights.map(f => `
            <option value="${f.flightId}">${f.flightId} &mdash; ${this.escapeHTML(f.flightName)} (${f.source} ➔ ${f.destination}) - ₹${parseFloat(f.fare).toLocaleString('en-IN')}</option>
          `).join('');
      }

      // Auto Ticket ID
      if (this.ticketIdInput) {
        const maxId = dataStore.getTickets().reduce((max, t) => Math.max(max, t.ticketId), 1000);
        this.ticketIdInput.value = maxId + 1;
      }

      this.updateFarePreview();
      this.clearFormErrors('form-booking-modal');

      modal.open('modal-booking');
    },

    updateFarePreview: function () {
      if (!this.farePreview) return;
      const flightId = this.flightSelect ? this.flightSelect.value : '';
      if (!flightId) {
        this.farePreview.textContent = '₹0.00';
        return;
      }
      const flight = dataStore.searchFlight(flightId);
      if (flight) {
        this.farePreview.textContent = `₹${parseFloat(flight.fare).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      } else {
        this.farePreview.textContent = '₹0.00';
      }
    },

    handleBookingFormSubmit: function () {
      const ticketId = parseInt(this.ticketIdInput.value, 10);
      const passengerId = parseInt(this.passengerSelect.value, 10);
      const flightId = this.flightSelect.value;

      this.clearFormErrors('form-booking-modal');
      let hasError = false;

      if (isNaN(ticketId) || ticketId <= 0) {
        this.showFieldError('booking-input-id', 'Valid numeric Ticket ID is required.');
        hasError = true;
      }

      if (isNaN(passengerId) || passengerId <= 0) {
        this.showFieldError('booking-input-passenger', 'Please select a passenger.');
        hasError = true;
      }

      if (!flightId) {
        this.showFieldError('booking-input-flight', 'Please select a scheduled flight.');
        hasError = true;
      }

      if (hasError) return;

      try {
        const ticket = dataStore.bookTicket({ ticketId, passengerId, flightId });
        toast.success(`Ticket #${ticketId} confirmed for ${ticket.passenger.passengerName} on Flight ${ticket.flight.flightId}!`);
        modal.close('modal-booking');
      } catch (err) {
        toast.error(err.message);
      }
    },

    viewBoardingPass: function (ticketId) {
      const ticket = dataStore.searchTicket(ticketId);
      if (!ticket) {
        toast.error(`Ticket #${ticketId} not found.`);
        return;
      }

      document.getElementById('pass-ticket-id').textContent = `#${ticket.ticketId}`;
      document.getElementById('pass-passenger-name').textContent = ticket.passenger.passengerName;
      document.getElementById('pass-passenger-details').textContent = `Passenger #${ticket.passenger.passengerId} • ${ticket.passenger.gender}, ${ticket.passenger.age} yrs`;
      document.getElementById('pass-flight-id').textContent = ticket.flight.flightId;
      document.getElementById('pass-carrier-name').textContent = ticket.flight.flightName;
      document.getElementById('pass-source').textContent = ticket.flight.source;
      document.getElementById('pass-dest').textContent = ticket.flight.destination;
      document.getElementById('pass-fare').textContent = `₹${parseFloat(ticket.flight.fare).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      document.getElementById('pass-booked-at').textContent = new Date(ticket.bookedAt).toUTCString();

      modal.open('modal-boarding-pass');
    },

    confirmCancelTicket: function (ticketId) {
      const ticket = dataStore.searchTicket(ticketId);
      if (!ticket) return;

      const title = `Cancel Ticket Reservation #${ticket.ticketId}?`;
      const msg = `Are you sure you want to cancel the confirmed reservation for ${ticket.passenger.passengerName} on flight ${ticket.flight.flightId} (${ticket.flight.source} ➔ ${ticket.flight.destination})? This will immediately free the booking.`;

      const titleEl = document.getElementById('confirm-modal-title');
      const msgEl = document.getElementById('confirm-modal-msg');
      const actionBtn = document.getElementById('btn-confirm-action');

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = msg;

      if (actionBtn) {
        const newBtn = actionBtn.cloneNode(true);
        actionBtn.parentNode.replaceChild(newBtn, actionBtn);
        newBtn.addEventListener('click', () => {
          modal.close('modal-confirm');
          try {
            dataStore.cancelTicket(ticketId);
            toast.success(`Ticket #${ticketId} successfully cancelled.`);
          } catch (err) {
            toast.error(err.message);
          }
        });
      }

      modal.open('modal-confirm');
    },

    showFieldError: function (fieldId, errorMsg) {
      const el = document.getElementById(fieldId);
      if (!el) return;
      el.classList.add('is-invalid');
      let errorEl = el.parentElement.querySelector('.form-error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        el.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = errorMsg;
    },

    clearFormErrors: function (formId) {
      const form = document.getElementById(formId);
      if (!form) return;
      form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      form.querySelectorAll('.form-error').forEach(el => el.remove());
    },

    escapeHTML: function (str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  window.AeroBookingManager = BookingManager;

})(window);
