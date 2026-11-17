/**
 * AEROOPS: Flight Management & Deck Controller (Stage 2)
 *
 * Implements functional operations mirroring Java FlightService:
 * - addFlight(Flight flight)
 * - viewFlights()
 * - searchFlight(String flightId)
 * - deleteFlight(String flightId)
 * - updateFlightFare(int index / flightId, double newFare)
 *
 * Plus interactive filtering, sorting, telemetry updates, and modal handling.
 */

(function (window) {
  'use strict';

  const dataStore = window.AeroDataStore;
  const toast = window.AeroToast;
  const modal = window.AeroModal;

  let currentSearchQuery = '';
  let currentOriginFilter = 'ALL';
  let currentDestinationFilter = 'ALL';
  let currentSortBy = 'ID_ASC';

  const FlightManager = {
    init: function () {
      this.cacheDOMElements();
      this.bindEvents();
      this.render();

      // Subscribe to data store updates
      dataStore.subscribe((event) => {
        this.render();
      });
    },

    cacheDOMElements: function () {
      this.tableBody = document.getElementById('flight-table-body');
      this.searchInput = document.getElementById('flight-search-input');
      this.originFilter = document.getElementById('flight-origin-filter');
      this.destFilter = document.getElementById('flight-dest-filter');
      this.sortSelect = document.getElementById('flight-sort-select');
      this.counterBadge = document.getElementById('flight-count-chip');

      // KPIs
      this.kpiActiveFleet = document.getElementById('kpi-active-fleet');
      this.kpiRouteHubs = document.getElementById('kpi-route-hubs');
      this.kpiTotalPassengers = document.getElementById('kpi-total-passengers');
      this.kpiAverageFare = document.getElementById('kpi-average-fare');

      // Forms
      this.flightForm = document.getElementById('form-flight-modal');
      this.fareForm = document.getElementById('form-fare-modal');
      this.confirmModal = document.getElementById('modal-confirm');
      this.confirmBtn = document.getElementById('btn-confirm-action');
    },

    bindEvents: function () {
      // Search Input
      if (this.searchInput) {
        this.searchInput.addEventListener('input', (e) => {
          currentSearchQuery = e.target.value.toLowerCase().trim();
          this.renderTable();
        });
      }

      // Origin Filter
      if (this.originFilter) {
        this.originFilter.addEventListener('change', (e) => {
          currentOriginFilter = e.target.value;
          this.renderTable();
        });
      }

      // Destination Filter
      if (this.destFilter) {
        this.destFilter.addEventListener('change', (e) => {
          currentDestinationFilter = e.target.value;
          this.renderTable();
        });
      }

      // Sort Select
      if (this.sortSelect) {
        this.sortSelect.addEventListener('change', (e) => {
          currentSortBy = e.target.value;
          this.renderTable();
        });
      }

      // Reset Flight Filters Button (Toolbar)
      const resetFiltersBtn = document.getElementById('btn-reset-flight-filters');
      if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
          currentSearchQuery = '';
          currentOriginFilter = 'ALL';
          currentDestinationFilter = 'ALL';
          currentSortBy = 'ID_ASC';
          if (this.searchInput) this.searchInput.value = '';
          if (this.originFilter) this.originFilter.value = 'ALL';
          if (this.destFilter) this.destFilter.value = 'ALL';
          if (this.sortSelect) this.sortSelect.value = 'ID_ASC';
          this.renderTable();
        });
      }

      // "Add Flight" Button
      const addFlightBtn = document.getElementById('btn-open-add-flight');
      if (addFlightBtn) {
        addFlightBtn.addEventListener('click', () => {
          this.openFlightModal('add');
        });
      }

      // "Reset Demo Data" Button
      const resetBtn = document.getElementById('btn-reset-demo-data');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.showConfirmation(
            'Reset Application Data to Seed Defaults?',
            'This will re-initialize all flights, passengers, and bookings to the authentic initial demonstration set. Any custom additions will be reverted.',
            () => {
              dataStore.resetToSeed(true);
              toast.success('Demonstration state re-initialized to default seed data.');
            }
          );
        });
      }

      // Flight Form Submission (Add or Edit)
      if (this.flightForm) {
        this.flightForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleFlightFormSubmit();
        });
      }

      // Fare Form Submission (Quick Update)
      if (this.fareForm) {
        this.fareForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleFareFormSubmit();
        });
      }

      // Table Row Action Delegation (View, Edit, Fare, Delete)
      if (this.tableBody) {
        this.tableBody.addEventListener('click', (e) => {
          const actionBtn = e.target.closest('[data-action]');
          if (!actionBtn) return;

          const action = actionBtn.getAttribute('data-action');
          const flightId = actionBtn.getAttribute('data-flight-id');

          if (action === 'view') {
            this.viewFlightDetails(flightId);
          } else if (action === 'edit') {
            this.openFlightModal('edit', flightId);
          } else if (action === 'fare') {
            this.openFareModal(flightId);
          } else if (action === 'delete') {
            this.confirmDeleteFlight(flightId);
          }
        });
      }
    },

    render: function () {
      this.renderKPIs();
      this.populateFilterDropdowns();
      this.renderTable();
    },

    renderKPIs: function () {
      const telemetry = dataStore.getTelemetry();
      if (this.kpiActiveFleet) this.kpiActiveFleet.textContent = telemetry.activeFlights;
      if (this.kpiRouteHubs) this.kpiRouteHubs.textContent = telemetry.routeHubsCount;
      if (this.kpiTotalPassengers) this.kpiTotalPassengers.textContent = telemetry.totalPassengers;
      if (this.kpiAverageFare) {
        this.kpiAverageFare.textContent = `₹${telemetry.averageFare.toLocaleString('en-IN')}`;
      }
    },

    populateFilterDropdowns: function () {
      const flights = dataStore.getFlights();
      const origins = new Set();
      const destinations = new Set();

      flights.forEach(f => {
        if (f.source) origins.add(f.source);
        if (f.destination) destinations.add(f.destination);
      });

      const updateSelect = (selectEl, setValues, currentVal) => {
        if (!selectEl) return;
        const currentSelection = currentVal;
        selectEl.innerHTML = '<option value="ALL">All Hubs</option>';
        Array.from(setValues).sort().forEach(code => {
          const opt = document.createElement('option');
          opt.value = code;
          opt.textContent = code;
          if (code === currentSelection) opt.selected = true;
          selectEl.appendChild(opt);
        });
      };

      updateSelect(this.originFilter, origins, currentOriginFilter);
      updateSelect(this.destFilter, destinations, currentDestinationFilter);
    },

    getFilteredAndSortedFlights: function () {
      let list = dataStore.getFlights();

      // Search Filter
      if (currentSearchQuery) {
        list = list.filter(f => {
          const id = (f.flightId || '').toLowerCase();
          const name = (f.flightName || '').toLowerCase();
          const src = (f.source || '').toLowerCase();
          const dst = (f.destination || '').toLowerCase();
          return id.includes(currentSearchQuery) ||
                 name.includes(currentSearchQuery) ||
                 src.includes(currentSearchQuery) ||
                 dst.includes(currentSearchQuery);
        });
      }

      // Origin Filter
      if (currentOriginFilter !== 'ALL') {
        list = list.filter(f => f.source === currentOriginFilter);
      }

      // Destination Filter
      if (currentDestinationFilter !== 'ALL') {
        list = list.filter(f => f.destination === currentDestinationFilter);
      }

      // Sort
      list.sort((a, b) => {
        switch (currentSortBy) {
          case 'FARE_ASC':
            return a.fare - b.fare;
          case 'FARE_DESC':
            return b.fare - a.fare;
          case 'AIRLINE_ASC':
            return (a.flightName || '').localeCompare(b.flightName || '');
          case 'ROUTE_ASC':
            return `${a.source}-${a.destination}`.localeCompare(`${b.source}-${b.destination}`);
          case 'ID_ASC':
          default:
            return (a.flightId || '').localeCompare(b.flightId || '');
        }
      });

      return list;
    },

    renderTable: function () {
      if (!this.tableBody) return;

      const filtered = this.getFilteredAndSortedFlights();
      const allFlightsCount = dataStore.getFlights().length;

      if (this.counterBadge) {
        this.counterBadge.textContent = `${filtered.length} of ${allFlightsCount} Flights Loaded`;
      }

      if (filtered.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="table-empty-cell">
              <div class="empty-state">
                <span class="empty-state__icon" aria-hidden="true">🛫</span>
                <p class="empty-state__title">No Scheduled Flights Found</p>
                <p class="empty-state__desc">No flights match your search query or active hub filters.</p>
                <button type="button" class="btn btn--sm btn--secondary" id="btn-clear-flight-filters">Clear All Filters</button>
              </div>
            </td>
          </tr>
        `;
        const clearBtn = document.getElementById('btn-clear-flight-filters');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            currentSearchQuery = '';
            currentOriginFilter = 'ALL';
            currentDestinationFilter = 'ALL';
            if (this.searchInput) this.searchInput.value = '';
            if (this.originFilter) this.originFilter.value = 'ALL';
            if (this.destFilter) this.destFilter.value = 'ALL';
            this.renderTable();
          });
        }
        return;
      }

      const rowsHtml = filtered.map(flight => {
        const statusClass = flight.status === 'Boarding' ? 'badge--amber' :
                            flight.status === 'Delayed' ? 'badge--danger' : 'badge--green';
        const formattedFare = `₹${parseFloat(flight.fare).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        return `
          <tr data-row-flight-id="${flight.flightId}">
            <td class="flight-id-cell">
              <span class="badge badge--dark-pill font-mono">${flight.flightId}</span>
            </td>
            <td>
              <strong class="text-heading">${this.escapeHTML(flight.flightName)}</strong>
              <div class="flight-sub-schedule text-muted text-xs">
                Dep: ${flight.departureTime || 'TBD'} &bull; Arr: ${flight.arrivalTime || 'TBD'}
              </div>
            </td>
            <td>
              <span class="hub-pill font-mono">${flight.source}</span>
            </td>
            <td>
              <span class="hub-pill font-mono">${flight.destination}</span>
            </td>
            <td class="fare-cell font-mono">${formattedFare}</td>
            <td>
              <span class="badge ${statusClass}">${flight.status || 'Active'}</span>
            </td>
            <td class="table-actions-cell">
              <div class="btn-group-actions">
                <button type="button" class="btn-icon" data-action="view" data-flight-id="${flight.flightId}" title="View Flight Details & Passengers" aria-label="View flight ${flight.flightId}">
                  👁️
                </button>
                <button type="button" class="btn-icon" data-action="edit" data-flight-id="${flight.flightId}" title="Edit Flight Information" aria-label="Edit flight ${flight.flightId}">
                  ✏️
                </button>
                <button type="button" class="btn-icon" data-action="fare" data-flight-id="${flight.flightId}" title="Update Fare (FlightService.updateFlightFare)" aria-label="Update fare for ${flight.flightId}">
                  💳
                </button>
                <button type="button" class="btn-icon btn-icon--danger" data-action="delete" data-flight-id="${flight.flightId}" title="Delete Flight" aria-label="Delete flight ${flight.flightId}">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      this.tableBody.innerHTML = rowsHtml;
    },

    openFlightModal: function (mode = 'add', flightId = null) {
      const titleEl = document.getElementById('modal-flight-title');
      const flightIdInput = document.getElementById('flight-input-id');
      const carrierInput = document.getElementById('flight-input-carrier');
      const sourceInput = document.getElementById('flight-input-source');
      const destInput = document.getElementById('flight-input-dest');
      const fareInput = document.getElementById('flight-input-fare');
      const statusSelect = document.getElementById('flight-input-status');
      const modeInput = document.getElementById('flight-input-mode');
      const submitBtn = document.getElementById('btn-flight-submit');

      // Clear validation errors
      this.clearFormErrors('form-flight-modal');

      if (mode === 'edit' && flightId) {
        const flight = dataStore.searchFlight(flightId);
        if (!flight) {
          toast.error(`Flight "${flightId}" not found.`);
          return;
        }

        if (titleEl) titleEl.textContent = `Edit Flight ${flight.flightId}`;
        if (modeInput) modeInput.value = 'edit';
        if (flightIdInput) {
          flightIdInput.value = flight.flightId;
          flightIdInput.readOnly = true;
          flightIdInput.classList.add('is-readonly');
        }
        if (carrierInput) carrierInput.value = flight.flightName || '';
        if (sourceInput) sourceInput.value = flight.source || '';
        if (destInput) destInput.value = flight.destination || '';
        if (fareInput) fareInput.value = flight.fare || '';
        if (statusSelect) statusSelect.value = flight.status || 'On Time';
        if (submitBtn) submitBtn.textContent = 'Save Flight Changes';
      } else {
        if (titleEl) titleEl.textContent = 'Schedule New Commercial Flight';
        if (modeInput) modeInput.value = 'add';
        if (flightIdInput) {
          flightIdInput.value = '';
          flightIdInput.readOnly = false;
          flightIdInput.classList.remove('is-readonly');
        }
        if (carrierInput) carrierInput.value = '';
        if (sourceInput) sourceInput.value = '';
        if (destInput) destInput.value = '';
        if (fareInput) fareInput.value = '';
        if (statusSelect) statusSelect.value = 'On Time';
        if (submitBtn) submitBtn.textContent = 'Add Flight to Manifest';
      }

      modal.open('modal-flight');
    },

    handleFlightFormSubmit: function () {
      const mode = document.getElementById('flight-input-mode').value;
      const flightId = document.getElementById('flight-input-id').value.trim().toUpperCase();
      const flightName = document.getElementById('flight-input-carrier').value.trim();
      const source = document.getElementById('flight-input-source').value.trim().toUpperCase();
      const destination = document.getElementById('flight-input-dest').value.trim().toUpperCase();
      const fare = parseFloat(document.getElementById('flight-input-fare').value);
      const status = document.getElementById('flight-input-status').value;

      this.clearFormErrors('form-flight-modal');

      let hasError = false;

      if (!flightId) {
        this.showFieldError('flight-input-id', 'Flight ID is required (e.g. AI-101).');
        hasError = true;
      }

      if (!flightName) {
        this.showFieldError('flight-input-carrier', 'Carrier name is required.');
        hasError = true;
      }

      if (!source) {
        this.showFieldError('flight-input-source', 'Origin airport code is required.');
        hasError = true;
      }

      if (!destination) {
        this.showFieldError('flight-input-dest', 'Destination airport code is required.');
        hasError = true;
      }

      if (source && destination && source === destination) {
        this.showFieldError('flight-input-dest', 'Destination cannot be identical to origin.');
        hasError = true;
      }

      if (isNaN(fare) || fare <= 0) {
        this.showFieldError('flight-input-fare', 'Base fare must be a positive number greater than 0.');
        hasError = true;
      }

      if (hasError) return;

      try {
        if (mode === 'add') {
          dataStore.addFlight({
            flightId,
            flightName,
            source,
            destination,
            fare,
            status,
            departureTime: '12:00 UTC',
            arrivalTime: '14:30 UTC'
          });
          toast.success(`Flight "${flightId}" successfully added to Java FlightService manifest!`);
        } else {
          dataStore.updateFlight(flightId, {
            flightName,
            source,
            destination,
            fare,
            status
          });
          toast.success(`Flight "${flightId}" details updated successfully.`);
        }
        modal.close('modal-flight');
      } catch (err) {
        toast.error(err.message);
      }
    },

    openFareModal: function (flightId) {
      const flight = dataStore.searchFlight(flightId);
      if (!flight) return;

      document.getElementById('fare-modal-flight-id').textContent = flight.flightId;
      document.getElementById('fare-modal-carrier').textContent = flight.flightName;
      document.getElementById('fare-modal-route').textContent = `${flight.source} ➔ ${flight.destination}`;
      document.getElementById('fare-modal-current').textContent = `₹${parseFloat(flight.fare).toLocaleString('en-IN')}`;

      const targetIdInput = document.getElementById('fare-input-target-id');
      const fareInput = document.getElementById('fare-input-new-amount');
      if (targetIdInput) targetIdInput.value = flight.flightId;
      if (fareInput) {
        fareInput.value = flight.fare;
        fareInput.select();
      }

      this.clearFormErrors('form-fare-modal');
      modal.open('modal-fare');
    },

    handleFareFormSubmit: function () {
      const flightId = document.getElementById('fare-input-target-id').value;
      const newFare = parseFloat(document.getElementById('fare-input-new-amount').value);

      this.clearFormErrors('form-fare-modal');

      if (isNaN(newFare) || newFare <= 0) {
        this.showFieldError('fare-input-new-amount', 'New fare must be greater than 0.');
        return;
      }

      try {
        dataStore.updateFlightFare(flightId, newFare);
        toast.success(`Fare for Flight "${flightId}" updated to ₹${newFare.toLocaleString('en-IN')}.`);
        modal.close('modal-fare');
      } catch (err) {
        toast.error(err.message);
      }
    },

    viewFlightDetails: function (flightId) {
      const flight = dataStore.searchFlight(flightId);
      if (!flight) return;

      const tickets = dataStore.getTickets().filter(t => t.flightId.toUpperCase() === flight.flightId.toUpperCase());

      document.getElementById('detail-flight-id').textContent = flight.flightId;
      document.getElementById('detail-flight-carrier').textContent = flight.flightName;
      document.getElementById('detail-flight-route').textContent = `${flight.source} ➔ ${flight.destination}`;
      document.getElementById('detail-flight-fare').textContent = `₹${parseFloat(flight.fare).toLocaleString('en-IN')}`;
      document.getElementById('detail-flight-status').textContent = flight.status || 'Active';
      document.getElementById('detail-flight-bookings-count').textContent = `${tickets.length} Registered Bookings`;

      const manifestContainer = document.getElementById('detail-flight-passenger-manifest');
      if (manifestContainer) {
        if (tickets.length === 0) {
          manifestContainer.innerHTML = `
            <div class="empty-state empty-state--compact">
              <p class="text-muted text-sm">No passengers currently booked on this airframe.</p>
            </div>
          `;
        } else {
          manifestContainer.innerHTML = `
            <table class="table-compact">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Passenger</th>
                  <th>Age / Gender</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${tickets.map(t => `
                  <tr>
                    <td class="font-mono text-accent">#${t.ticketId}</td>
                    <td><strong>${this.escapeHTML(t.passenger.passengerName)}</strong></td>
                    <td class="text-muted">${t.passenger.age} yrs &bull; ${t.passenger.gender}</td>
                    <td><span class="badge badge--green">CONFIRMED</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `;
        }
      }

      modal.open('modal-flight-details');
    },

    confirmDeleteFlight: function (flightId) {
      const flight = dataStore.searchFlight(flightId);
      if (!flight) return;

      const tickets = dataStore.getTickets().filter(t => t.flightId.toUpperCase() === flight.flightId.toUpperCase());
      if (tickets.length > 0) {
        toast.error(`Cannot delete Flight "${flightId}": ${tickets.length} active ticket(s) are booked on this sector. Cancel them first.`);
        return;
      }

      this.showConfirmation(
        `Delete Flight ${flight.flightId}?`,
        `Are you sure you want to remove ${flight.flightName} (${flight.source} ➔ ${flight.destination}) from the flight manifest? This action is permanent.`,
        () => {
          try {
            dataStore.deleteFlight(flight.flightId);
            toast.success(`Flight "${flight.flightId}" successfully removed.`);
          } catch (err) {
            toast.error(err.message);
          }
        }
      );
    },

    showConfirmation: function (title, message, onConfirm) {
      const titleEl = document.getElementById('confirm-modal-title');
      const msgEl = document.getElementById('confirm-modal-msg');
      const actionBtn = document.getElementById('btn-confirm-action');

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.textContent = message;

      if (actionBtn) {
        // Clone button to remove previous listeners
        const newBtn = actionBtn.cloneNode(true);
        actionBtn.parentNode.replaceChild(newBtn, actionBtn);
        newBtn.addEventListener('click', () => {
          modal.close('modal-confirm');
          if (typeof onConfirm === 'function') onConfirm();
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

  window.AeroFlightManager = FlightManager;

})(window);
