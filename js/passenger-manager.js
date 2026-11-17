/**
 * AEROOPS: Passenger Registry Manager (Stage 2)
 *
 * Implements functional operations mirroring Java PassengerService:
 * - addPassenger(Passenger passenger)
 * - viewPassengers()
 * - searchPassenger(int passengerId)
 * - deletePassenger(int passengerId)
 *
 * Plus interactive filtering, demographic analytics, and modal handling.
 */

(function (window) {
  'use strict';

  const dataStore = window.AeroDataStore;
  const toast = window.AeroToast;
  const modal = window.AeroModal;

  let currentSearchQuery = '';
  let currentGenderFilter = 'ALL';

  const PassengerManager = {
    init: function () {
      this.cacheDOMElements();
      this.bindEvents();
      this.render();

      dataStore.subscribe((event) => {
        this.render();
      });
    },

    cacheDOMElements: function () {
      this.tableBody = document.getElementById('passenger-table-body');
      this.searchInput = document.getElementById('passenger-search-input');
      this.genderFilter = document.getElementById('passenger-gender-filter');
      this.countChip = document.getElementById('passenger-count-chip');

      // KPIs
      this.kpiTotal = document.getElementById('kpi-passenger-total');
      this.kpiGenderRatio = document.getElementById('kpi-passenger-gender-ratio');
      this.kpiAvgAge = document.getElementById('kpi-passenger-avg-age');

      // Form
      this.passengerForm = document.getElementById('form-passenger-modal');
    },

    bindEvents: function () {
      // Search
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          currentSearchQuery = e.target.value.toLowerCase().trim();
          this.renderTable();
        });
      }

      // Gender Filter
      if (this.genderFilter) {
        this.genderFilter.addEventListener('change', (e) => {
          currentGenderFilter = e.target.value;
          this.renderTable();
        });
      }

      // Reset Passenger Filters Button (Toolbar)
      const resetPassengerFiltersBtn = document.getElementById('btn-reset-passenger-filters');
      if (resetPassengerFiltersBtn) {
        resetPassengerFiltersBtn.addEventListener('click', () => {
          currentSearchQuery = '';
          currentGenderFilter = 'ALL';
          if (this.searchInput) this.searchInput.value = '';
          if (this.genderFilter) this.genderFilter.value = 'ALL';
          this.renderTable();
        });
      }

      // Open Add Passenger Modal
      const addBtn = document.getElementById('btn-open-add-passenger');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          this.openPassengerModal('add');
        });
      }

      // Form Submit
      if (this.passengerForm) {
        this.passengerForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handlePassengerFormSubmit();
        });
      }

      // Table Action Delegation
      if (this.tableBody) {
        this.tableBody.addEventListener('click', (e) => {
          const actionBtn = e.target.closest('[data-action]');
          if (!actionBtn) return;

          const action = actionBtn.getAttribute('data-action');
          const passengerId = parseInt(actionBtn.getAttribute('data-passenger-id'), 10);

          if (action === 'view') {
            this.viewPassengerDetails(passengerId);
          } else if (action === 'edit') {
            this.openPassengerModal('edit', passengerId);
          } else if (action === 'delete') {
            this.confirmDeletePassenger(passengerId);
          }
        });
      }
    },

    render: function () {
      this.renderKPIs();
      this.renderTable();
    },

    renderKPIs: function () {
      const passengers = dataStore.getPassengers();
      const total = passengers.length;

      let totalAge = 0;
      let maleCount = 0;
      let femaleCount = 0;

      passengers.forEach(p => {
        totalAge += (p.age || 0);
        if (p.gender === 'Male') maleCount++;
        else if (p.gender === 'Female') femaleCount++;
      });

      const avgAge = total > 0 ? Math.round(totalAge / total) : 0;

      if (this.kpiTotal) this.kpiTotal.textContent = total;
      if (this.kpiAvgAge) this.kpiAvgAge.textContent = `${avgAge} yrs`;
      if (this.kpiGenderRatio) {
        this.kpiGenderRatio.textContent = `${maleCount}M : ${femaleCount}F`;
      }
    },

    getFilteredPassengers: function () {
      let list = dataStore.getPassengers();

      if (currentSearchQuery) {
        list = list.filter(p => {
          const id = String(p.passengerId);
          const name = (p.passengerName || '').toLowerCase();
          return id.includes(currentSearchQuery) || name.includes(currentSearchQuery);
        });
      }

      if (currentGenderFilter !== 'ALL') {
        list = list.filter(p => p.gender === currentGenderFilter);
      }

      return list;
    },

    renderTable: function () {
      if (!this.tableBody) return;

      const filtered = this.getFilteredPassengers();
      const allCount = dataStore.getPassengers().length;

      if (this.countChip) {
        this.countChip.textContent = `${filtered.length} of ${allCount} Registered`;
      }

      if (filtered.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="table-empty-cell">
              <div class="empty-state">
                <span class="empty-state__icon" aria-hidden="true">👥</span>
                <p class="empty-state__title">No Passengers Located</p>
                <p class="empty-state__desc">No passenger records match your current search query or filter.</p>
                <button type="button" class="btn btn--sm btn--secondary" id="btn-clear-passenger-filters">Clear Filter</button>
              </div>
            </td>
          </tr>
        `;
        const clearBtn = document.getElementById('btn-clear-passenger-filters');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            currentSearchQuery = '';
            currentGenderFilter = 'ALL';
            if (this.searchInput) this.searchInput.value = '';
            if (this.genderFilter) this.genderFilter.value = 'ALL';
            this.renderTable();
          });
        }
        return;
      }

      const allTickets = dataStore.getTickets();

      const rowsHtml = filtered.map(passenger => {
        const userTickets = allTickets.filter(t => t.passengerId === passenger.passengerId);
        const bookingCountBadge = userTickets.length > 0 
          ? `<span class="badge badge--green">${userTickets.length} Active</span>`
          : `<span class="badge badge--muted">0 Bookings</span>`;

        const genderBadgeClass = passenger.gender === 'Female' ? 'badge--amber' : 'badge--accent';

        return `
          <tr data-row-passenger-id="${passenger.passengerId}">
            <td class="font-mono">
              <span class="badge badge--dark-pill">#${passenger.passengerId}</span>
            </td>
            <td>
              <strong class="text-heading">${this.escapeHTML(passenger.passengerName)}</strong>
            </td>
            <td class="font-mono">${passenger.age} yrs</td>
            <td>
              <span class="badge ${genderBadgeClass}">${passenger.gender}</span>
            </td>
            <td>${bookingCountBadge}</td>
            <td class="table-actions-cell">
              <div class="btn-group-actions">
                <button type="button" class="btn-icon" data-action="view" data-passenger-id="${passenger.passengerId}" title="View Passenger Profile & Bookings" aria-label="View passenger ${passenger.passengerId}">
                  👁️
                </button>
                <button type="button" class="btn-icon" data-action="edit" data-passenger-id="${passenger.passengerId}" title="Edit Passenger Data" aria-label="Edit passenger ${passenger.passengerId}">
                  ✏️
                </button>
                <button type="button" class="btn-icon btn-icon--danger" data-action="delete" data-passenger-id="${passenger.passengerId}" title="Delete Passenger from Manifest" aria-label="Delete passenger ${passenger.passengerId}">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      this.tableBody.innerHTML = rowsHtml;
    },

    openPassengerModal: function (mode = 'add', passengerId = null) {
      const titleEl = document.getElementById('modal-passenger-title');
      const idInput = document.getElementById('passenger-input-id');
      const nameInput = document.getElementById('passenger-input-name');
      const ageInput = document.getElementById('passenger-input-age');
      const genderSelect = document.getElementById('passenger-input-gender');
      const modeInput = document.getElementById('passenger-input-mode');
      const submitBtn = document.getElementById('btn-passenger-submit');

      this.clearFormErrors('form-passenger-modal');

      if (mode === 'edit' && passengerId) {
        const passenger = dataStore.searchPassenger(passengerId);
        if (!passenger) return;

        if (titleEl) titleEl.textContent = `Edit Passenger #${passenger.passengerId}`;
        if (modeInput) modeInput.value = 'edit';
        if (idInput) {
          idInput.value = passenger.passengerId;
          idInput.readOnly = true;
          idInput.classList.add('is-readonly');
        }
        if (nameInput) nameInput.value = passenger.passengerName || '';
        if (ageInput) ageInput.value = passenger.age || '';
        if (genderSelect) genderSelect.value = passenger.gender || 'Male';
        if (submitBtn) submitBtn.textContent = 'Save Passenger Changes';
      } else {
        if (titleEl) titleEl.textContent = 'Register New Passenger (PassengerService)';
        if (modeInput) modeInput.value = 'add';
        if (idInput) {
          // Suggest next ID
          const maxId = dataStore.getPassengers().reduce((max, p) => Math.max(max, p.passengerId), 100);
          idInput.value = maxId + 1;
          idInput.readOnly = false;
          idInput.classList.remove('is-readonly');
        }
        if (nameInput) nameInput.value = '';
        if (ageInput) ageInput.value = '';
        if (genderSelect) genderSelect.value = 'Male';
        if (submitBtn) submitBtn.textContent = 'Register to Manifest';
      }

      modal.open('modal-passenger');
    },

    handlePassengerFormSubmit: function () {
      const mode = document.getElementById('passenger-input-mode').value;
      const id = parseInt(document.getElementById('passenger-input-id').value, 10);
      const name = document.getElementById('passenger-input-name').value.trim();
      const age = parseInt(document.getElementById('passenger-input-age').value, 10);
      const gender = document.getElementById('passenger-input-gender').value;

      this.clearFormErrors('form-passenger-modal');
      let hasError = false;

      if (isNaN(id) || id <= 0) {
        this.showFieldError('passenger-input-id', 'Valid numeric Passenger ID is required.');
        hasError = true;
      }

      if (!name) {
        this.showFieldError('passenger-input-name', 'Passenger name is required.');
        hasError = true;
      }

      if (isNaN(age) || age < 1 || age > 120) {
        this.showFieldError('passenger-input-age', 'Age must be between 1 and 120 years.');
        hasError = true;
      }

      if (hasError) return;

      try {
        if (mode === 'add') {
          dataStore.addPassenger({ passengerId: id, passengerName: name, age: age, gender: gender });
          toast.success(`Passenger #${id} (${name}) registered successfully into Java PassengerService registry!`);
        } else {
          dataStore.updatePassenger(id, { passengerName: name, age: age, gender: gender });
          toast.success(`Passenger #${id} profile updated.`);
        }
        modal.close('modal-passenger');
      } catch (err) {
        toast.error(err.message);
      }
    },

    viewPassengerDetails: function (passengerId) {
      const passenger = dataStore.searchPassenger(passengerId);
      if (!passenger) return;

      const tickets = dataStore.getTickets().filter(t => t.passengerId === passenger.passengerId);

      document.getElementById('detail-passenger-id').textContent = `#${passenger.passengerId}`;
      document.getElementById('detail-passenger-name').textContent = passenger.passengerName;
      document.getElementById('detail-passenger-age-gender').textContent = `${passenger.age} years old &bull; ${passenger.gender}`;
      document.getElementById('detail-passenger-tickets-count').textContent = `${tickets.length} Confirmed Reservation(s)`;

      const listContainer = document.getElementById('detail-passenger-bookings-list');
      if (listContainer) {
        if (tickets.length === 0) {
          listContainer.innerHTML = `
            <div class="empty-state empty-state--compact">
              <p class="text-muted text-sm">No confirmed flight bookings for this passenger.</p>
            </div>
          `;
        } else {
          listContainer.innerHTML = `
            <table class="table-compact">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Flight</th>
                  <th>Sector</th>
                  <th>Fare</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${tickets.map(t => `
                  <tr>
                    <td class="font-mono text-accent">#${t.ticketId}</td>
                    <td><strong>${t.flight.flightId}</strong> (${this.escapeHTML(t.flight.flightName)})</td>
                    <td class="font-mono">${t.flight.source} ➔ ${t.flight.destination}</td>
                    <td class="font-mono">₹${parseFloat(t.flight.fare).toLocaleString('en-IN')}</td>
                    <td>
                      <button type="button" class="btn btn--xs btn--secondary" onclick="window.AeroBookingManager.viewBoardingPass(${t.ticketId});">
                        Boarding Pass
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }

      modal.open('modal-passenger-details');
    },

    confirmDeletePassenger: function (passengerId) {
      const passenger = dataStore.searchPassenger(passengerId);
      if (!passenger) return;

      const tickets = dataStore.getTickets().filter(t => t.passengerId === passenger.passengerId);
      if (tickets.length > 0) {
        toast.error(`Cannot delete passenger #${passengerId}: ${tickets.length} active ticket(s) are booked in their name. Cancel tickets first.`);
        return;
      }

      const title = `Remove Passenger #${passenger.passengerId}?`;
      const msg = `Are you sure you want to delete ${passenger.passengerName} from the manifest? This action cannot be undone.`;

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
            dataStore.deletePassenger(passengerId);
            toast.success(`Passenger #${passengerId} deleted from manifest.`);
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

  window.AeroPassengerManager = PassengerManager;

})(window);
