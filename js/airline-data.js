/**
 * AEROOPS: Airline Reservation & Flight Network Suite
 * Central Data Architecture & State Store (Stage 2)
 *
 * Faithfully mirrors the models and operations of the original Java codebase:
 * - model.Flight (flightId, flightName, source, destination, fare)
 * - model.Passenger (passengerId, passengerName, age, gender)
 * - model.Ticket (ticketId, passenger, flight)
 * - service.FlightService (addFlight, viewFlights, searchFlight, deleteFlight, updateFlightFare)
 * - service.PassengerService (addPassenger, viewPassengers, searchPassenger, deletePassenger)
 * - service.BookingService (bookTicket, viewTickets, searchTicket, cancelTicket)
 *
 * Provides LocalStorage persistence with resilient schema fallback and seed data.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'aeroops_airline_state_v2';

  // Authentic Seed Data representing Indian National Aviation Corridors
  const SEED_FLIGHTS = [
    {
      flightId: 'AI-101',
      flightName: 'Air India Dreamliner',
      source: 'DEL',
      destination: 'BOM',
      fare: 5400.00,
      status: 'On Time',
      departureTime: '06:00 UTC',
      arrivalTime: '08:15 UTC'
    },
    {
      flightId: '6E-204',
      flightName: 'IndiGo Express',
      source: 'BOM',
      destination: 'BLR',
      fare: 4200.00,
      status: 'On Time',
      departureTime: '09:30 UTC',
      arrivalTime: '11:15 UTC'
    },
    {
      flightId: 'UK-812',
      flightName: 'Vistara Prime',
      source: 'DEL',
      destination: 'BLR',
      fare: 6800.00,
      status: 'Boarding',
      departureTime: '11:00 UTC',
      arrivalTime: '13:45 UTC'
    },
    {
      flightId: 'SG-415',
      flightName: 'SpiceJet Shuttle',
      source: 'HYD',
      destination: 'MAA',
      fare: 3900.00,
      status: 'On Time',
      departureTime: '14:20 UTC',
      arrivalTime: '15:35 UTC'
    },
    {
      flightId: 'QP-133',
      flightName: 'Akasa Air Citylink',
      source: 'BOM',
      destination: 'GOI',
      fare: 3500.00,
      status: 'On Time',
      departureTime: '16:00 UTC',
      arrivalTime: '17:15 UTC'
    },
    {
      flightId: 'AI-509',
      flightName: 'Air India Regional',
      source: 'CCU',
      destination: 'DEL',
      fare: 5900.00,
      status: 'On Time',
      departureTime: '17:45 UTC',
      arrivalTime: '20:10 UTC'
    },
    {
      flightId: '6E-651',
      flightName: 'IndiGo Connector',
      source: 'DEL',
      destination: 'HYD',
      fare: 4600.00,
      status: 'Scheduled',
      departureTime: '19:15 UTC',
      arrivalTime: '21:30 UTC'
    },
    {
      flightId: 'UK-993',
      flightName: 'Vistara Business Wing',
      source: 'BLR',
      destination: 'DEL',
      fare: 7100.00,
      status: 'Scheduled',
      departureTime: '21:00 UTC',
      arrivalTime: '23:40 UTC'
    }
  ];

  const SEED_PASSENGERS = [
    { passengerId: 101, passengerName: 'Aarav Sharma', age: 29, gender: 'Male' },
    { passengerId: 102, passengerName: 'Ananya Iyer', age: 34, gender: 'Female' },
    { passengerId: 103, passengerName: 'Vikram Malhotra', age: 45, gender: 'Male' },
    { passengerId: 104, passengerName: 'Pooja Hegde', age: 27, gender: 'Female' },
    { passengerId: 105, passengerName: 'Rohan Verma', age: 22, gender: 'Male' },
    { passengerId: 106, passengerName: 'Kavita Nair', age: 51, gender: 'Female' }
  ];

  const SEED_TICKETS = [
    { ticketId: 1001, passengerId: 101, flightId: 'AI-101', bookedAt: '2026-11-10T08:30:00Z', status: 'CONFIRMED' },
    { ticketId: 1002, passengerId: 102, flightId: '6E-204', bookedAt: '2026-11-10T09:15:00Z', status: 'CONFIRMED' },
    { ticketId: 1003, passengerId: 103, flightId: 'UK-812', bookedAt: '2026-11-11T12:00:00Z', status: 'CONFIRMED' },
    { ticketId: 1004, passengerId: 104, flightId: 'SG-415', bookedAt: '2026-11-11T14:45:00Z', status: 'CONFIRMED' }
  ];

  class AirlineDataStore {
    constructor() {
      this.listeners = [];
      this.flights = [];
      this.passengers = [];
      this.tickets = [];
      this.load();
    }

    /**
     * Subscribe to state mutations
     * @param {Function} callback
     */
    subscribe(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }

    /**
     * Notify subscribers of state mutation
     */
    notify(event = {}) {
      this.save();
      this.listeners.forEach(cb => {
        try {
          cb(event);
        } catch (err) {
          console.error('[AirlineDataStore] Listener error:', err);
        }
      });
    }

    /**
     * Load state from LocalStorage or seed defaults
     */
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.flights) && Array.isArray(parsed.passengers) && Array.isArray(parsed.tickets)) {
            this.flights = parsed.flights;
            this.passengers = parsed.passengers;
            this.tickets = parsed.tickets;
            return;
          }
        }
      } catch (err) {
        console.warn('[AirlineDataStore] Failed to load stored state. Falling back to defaults.', err);
      }
      this.resetToSeed(false);
    }

    /**
     * Save current state to LocalStorage
     */
    save() {
      try {
        const payload = JSON.stringify({
          flights: this.flights,
          passengers: this.passengers,
          tickets: this.tickets,
          savedAt: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY, payload);
      } catch (err) {
        console.error('[AirlineDataStore] LocalStorage write error:', err);
      }
    }

    /**
     * Reset store to initial demo seed data
     */
    resetToSeed(shouldNotify = true) {
      this.flights = JSON.parse(JSON.stringify(SEED_FLIGHTS));
      this.passengers = JSON.parse(JSON.stringify(SEED_PASSENGERS));
      this.tickets = JSON.parse(JSON.stringify(SEED_TICKETS));
      this.save();
      if (shouldNotify) {
        this.notify({ type: 'RESET_SEED' });
      }
    }

    // =========================================================================
    // FLIGHT OPERATIONS (FlightService.java mirror)
    // =========================================================================

    getFlights() {
      return [...this.flights];
    }

    searchFlight(flightId) {
      if (!flightId) return null;
      const clean = String(flightId).trim().toUpperCase();
      return this.flights.find(f => f.flightId.toUpperCase() === clean) || null;
    }

    addFlight(flightData) {
      const flightId = String(flightData.flightId || '').trim().toUpperCase();
      if (!flightId) {
        throw new Error('Flight ID is required.');
      }
      if (this.searchFlight(flightId)) {
        throw new Error(`Flight ID "${flightId}" already exists in the system.`);
      }

      const fare = parseFloat(flightData.fare);
      if (isNaN(fare) || fare <= 0) {
        throw new Error('Base fare must be a positive number greater than 0.');
      }

      const source = String(flightData.source || '').trim().toUpperCase();
      const destination = String(flightData.destination || '').trim().toUpperCase();

      if (!source || !destination) {
        throw new Error('Origin source and destination airport codes are required.');
      }
      if (source === destination) {
        throw new Error('Source and destination cannot be identical.');
      }

      const newFlight = {
        flightId: flightId,
        flightName: String(flightData.flightName || 'Commercial Carrier').trim(),
        source: source,
        destination: destination,
        fare: fare,
        status: flightData.status || 'Scheduled',
        departureTime: flightData.departureTime || 'TBD',
        arrivalTime: flightData.arrivalTime || 'TBD'
      };

      this.flights.push(newFlight);
      this.notify({ type: 'ADD_FLIGHT', flight: newFlight });
      return newFlight;
    }

    updateFlight(flightId, updatedFields) {
      const cleanId = String(flightId).trim().toUpperCase();
      const index = this.flights.findIndex(f => f.flightId.toUpperCase() === cleanId);
      if (index === -1) {
        throw new Error(`Flight "${flightId}" not found.`);
      }

      const existing = this.flights[index];
      const fare = updatedFields.fare !== undefined ? parseFloat(updatedFields.fare) : existing.fare;
      if (isNaN(fare) || fare <= 0) {
        throw new Error('Base fare must be greater than 0.');
      }

      const source = updatedFields.source ? String(updatedFields.source).trim().toUpperCase() : existing.source;
      const destination = updatedFields.destination ? String(updatedFields.destination).trim().toUpperCase() : existing.destination;

      if (source === destination) {
        throw new Error('Source and destination cannot be identical.');
      }

      const updated = {
        ...existing,
        ...updatedFields,
        flightId: existing.flightId, // ID remains immutable
        source: source,
        destination: destination,
        fare: fare
      };

      this.flights[index] = updated;
      this.notify({ type: 'UPDATE_FLIGHT', flight: updated });
      return updated;
    }

    updateFlightFare(flightId, newFare) {
      const fare = parseFloat(newFare);
      if (isNaN(fare) || fare <= 0) {
        throw new Error('Fare must be greater than 0.');
      }
      return this.updateFlight(flightId, { fare: fare });
    }

    deleteFlight(flightId) {
      const cleanId = String(flightId).trim().toUpperCase();
      const index = this.flights.findIndex(f => f.flightId.toUpperCase() === cleanId);
      if (index === -1) {
        throw new Error(`Flight "${flightId}" not found.`);
      }

      // Check if tickets are currently booked on this flight
      const activeTickets = this.tickets.filter(t => t.flightId.toUpperCase() === cleanId);
      if (activeTickets.length > 0) {
        throw new Error(`Cannot delete flight "${cleanId}": ${activeTickets.length} active ticket(s) are currently booked on this airframe. Please cancel linked tickets first.`);
      }

      const deleted = this.flights.splice(index, 1)[0];
      this.notify({ type: 'DELETE_FLIGHT', flight: deleted });
      return deleted;
    }

    // =========================================================================
    // PASSENGER OPERATIONS (PassengerService.java mirror)
    // =========================================================================

    getPassengers() {
      return [...this.passengers];
    }

    searchPassenger(passengerId) {
      const id = parseInt(passengerId, 10);
      if (isNaN(id)) return null;
      return this.passengers.find(p => p.passengerId === id) || null;
    }

    addPassenger(passengerData) {
      let passengerId = parseInt(passengerData.passengerId, 10);
      if (isNaN(passengerId) || passengerId <= 0) {
        // Auto-generate highest ID + 1 if not supplied
        const maxId = this.passengers.reduce((max, p) => Math.max(max, p.passengerId), 100);
        passengerId = maxId + 1;
      }

      if (this.searchPassenger(passengerId)) {
        throw new Error(`Passenger ID ${passengerId} already exists in the manifest.`);
      }

      const name = String(passengerData.passengerName || '').trim();
      if (!name) {
        throw new Error('Passenger name is required.');
      }

      const age = parseInt(passengerData.age, 10);
      if (isNaN(age) || age < 1 || age > 120) {
        throw new Error('Age must be a valid number between 1 and 120.');
      }

      const gender = String(passengerData.gender || 'Other').trim();

      const newPassenger = {
        passengerId: passengerId,
        passengerName: name,
        age: age,
        gender: gender
      };

      this.passengers.push(newPassenger);
      this.notify({ type: 'ADD_PASSENGER', passenger: newPassenger });
      return newPassenger;
    }

    updatePassenger(passengerId, updatedFields) {
      const id = parseInt(passengerId, 10);
      const index = this.passengers.findIndex(p => p.passengerId === id);
      if (index === -1) {
        throw new Error(`Passenger ID ${passengerId} not found.`);
      }

      const existing = this.passengers[index];
      const name = updatedFields.passengerName ? String(updatedFields.passengerName).trim() : existing.passengerName;
      if (!name) {
        throw new Error('Passenger name cannot be empty.');
      }

      const age = updatedFields.age !== undefined ? parseInt(updatedFields.age, 10) : existing.age;
      if (isNaN(age) || age < 1 || age > 120) {
        throw new Error('Age must be between 1 and 120.');
      }

      const gender = updatedFields.gender ? String(updatedFields.gender).trim() : existing.gender;

      const updated = {
        ...existing,
        passengerName: name,
        age: age,
        gender: gender
      };

      this.passengers[index] = updated;
      this.notify({ type: 'UPDATE_PASSENGER', passenger: updated });
      return updated;
    }

    deletePassenger(passengerId) {
      const id = parseInt(passengerId, 10);
      const index = this.passengers.findIndex(p => p.passengerId === id);
      if (index === -1) {
        throw new Error(`Passenger ID ${passengerId} not found.`);
      }

      // Check if passenger has active tickets
      const linkedTickets = this.tickets.filter(t => t.passengerId === id);
      if (linkedTickets.length > 0) {
        throw new Error(`Cannot delete passenger ID ${id}: ${linkedTickets.length} active ticket(s) are registered to this passenger. Cancel the tickets first.`);
      }

      const deleted = this.passengers.splice(index, 1)[0];
      this.notify({ type: 'DELETE_PASSENGER', passenger: deleted });
      return deleted;
    }

    // =========================================================================
    // BOOKING OPERATIONS (BookingService.java mirror)
    // =========================================================================

    getTickets() {
      // Returns enriched tickets with full passenger and flight details
      return this.tickets.map(ticket => {
        const passenger = this.searchPassenger(ticket.passengerId) || {
          passengerId: ticket.passengerId,
          passengerName: 'Unknown Passenger',
          age: 0,
          gender: 'Unknown'
        };
        const flight = this.searchFlight(ticket.flightId) || {
          flightId: ticket.flightId,
          flightName: 'Unknown Flight',
          source: 'N/A',
          destination: 'N/A',
          fare: 0
        };
        return {
          ...ticket,
          passenger: passenger,
          flight: flight
        };
      });
    }

    searchTicket(ticketId) {
      const id = parseInt(ticketId, 10);
      if (isNaN(id)) return null;
      const raw = this.tickets.find(t => t.ticketId === id);
      if (!raw) return null;

      const passenger = this.searchPassenger(raw.passengerId);
      const flight = this.searchFlight(raw.flightId);
      return {
        ...raw,
        passenger: passenger,
        flight: flight
      };
    }

    bookTicket(bookingData) {
      let ticketId = parseInt(bookingData.ticketId, 10);
      if (isNaN(ticketId) || ticketId <= 0) {
        // Auto-generate ticketId
        const maxId = this.tickets.reduce((max, t) => Math.max(max, t.ticketId), 1000);
        ticketId = maxId + 1;
      }

      if (this.tickets.some(t => t.ticketId === ticketId)) {
        throw new Error(`Ticket ID #${ticketId} already exists in the system.`);
      }

      const passengerId = parseInt(bookingData.passengerId, 10);
      const passenger = this.searchPassenger(passengerId);
      if (!passenger) {
        throw new Error(`Cannot book ticket: Passenger ID ${passengerId} does not exist.`);
      }

      const flightId = String(bookingData.flightId || '').trim().toUpperCase();
      const flight = this.searchFlight(flightId);
      if (!flight) {
        throw new Error(`Cannot book ticket: Flight ID "${flightId}" does not exist.`);
      }

      const newTicket = {
        ticketId: ticketId,
        passengerId: passenger.passengerId,
        flightId: flight.flightId,
        bookedAt: new Date().toISOString(),
        status: 'CONFIRMED'
      };

      this.tickets.push(newTicket);
      this.notify({ type: 'BOOK_TICKET', ticket: newTicket });
      return this.searchTicket(ticketId);
    }

    cancelTicket(ticketId) {
      const id = parseInt(ticketId, 10);
      const index = this.tickets.findIndex(t => t.ticketId === id);
      if (index === -1) {
        throw new Error(`Ticket #${ticketId} not found.`);
      }

      const cancelled = this.tickets.splice(index, 1)[0];
      this.notify({ type: 'CANCEL_TICKET', ticket: cancelled });
      return cancelled;
    }

    // =========================================================================
    // TELEMETRY & SYSTEM ANALYTICS
    // =========================================================================

    getTelemetry() {
      const activeFlights = this.flights.length;
      const totalPassengers = this.passengers.length;
      const activeTickets = this.tickets.length;

      const totalFares = this.flights.reduce((acc, f) => acc + (f.fare || 0), 0);
      const averageFare = activeFlights > 0 ? totalFares / activeFlights : 0;

      const bookedRevenue = this.tickets.reduce((acc, t) => {
        const flight = this.searchFlight(t.flightId);
        return acc + (flight ? flight.fare : 0);
      }, 0);

      // Hub airports set
      const hubs = new Set();
      this.flights.forEach(f => {
        if (f.source) hubs.add(f.source);
        if (f.destination) hubs.add(f.destination);
      });

      return {
        activeFlights,
        totalPassengers,
        activeTickets,
        averageFare: Math.round(averageFare),
        totalFares,
        bookedRevenue,
        routeHubsCount: hubs.size,
        routeHubsList: Array.from(hubs).sort()
      };
    }
  }

  // Export singleton instance to window
  window.AeroDataStore = new AirlineDataStore();

})(window);
