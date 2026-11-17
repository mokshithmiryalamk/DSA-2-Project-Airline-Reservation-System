import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import NavTabs from './components/NavTabs';
import FlightDeck from './components/FlightDeck/FlightDeck';
import PassengerRegistry from './components/Passengers/PassengerRegistry';
import BookingTerminal from './components/Bookings/BookingTerminal';
import DsaStudioPreview from './components/DsaPreview/DsaStudioPreview';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import { api } from './services/api';
import './design-tokens.css';
import './main.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('flight-deck');
  const [flights, setFlights] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const health = await api.getHealth().catch(() => null);
      if (health && health.status === 'UP') {
        setBackendConnected(true);
      } else {
        setBackendConnected(false);
      }

      const [airportsData, flightsData, passengersData, bookingsData] = await Promise.all([
        api.getAirports().catch(() => []),
        api.getFlights().catch(() => []),
        api.getPassengers().catch(() => []),
        api.getBookings().catch(() => []),
      ]);

      setAirports(airportsData || []);
      setFlights(flightsData || []);
      setPassengers(passengersData || []);
      setBookings(bookingsData || []);
      setBackendConnected(true);
    } catch (err) {
      setBackendConnected(false);
      const msg = err.message || 'Failed to load data from backend server.';
      setGlobalError(msg);
      addToast('Backend Connection Notice', msg, 'warning');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Operational Flight Actions
  const handleCreateFlight = async (flightData) => {
    try {
      const created = await api.createFlight(flightData);
      addToast('Flight Scheduled', `Flight ${created.flightId} (${created.flightName}) created successfully.`, 'success');
      const updated = await api.getFlights();
      setFlights(updated);
    } catch (err) {
      addToast('Schedule Rejected', err.message, 'error');
      throw err;
    }
  };

  const handleUpdateFare = async (flightId, newFare) => {
    try {
      await api.updateFlight(flightId, { fare: newFare });
      addToast('Fare Updated', `Sector ${flightId} base fare updated to ₹${Number(newFare).toLocaleString()}.`, 'success');
      const updated = await api.getFlights();
      setFlights(updated);
    } catch (err) {
      addToast('Fare Update Rejected', err.message, 'error');
      throw err;
    }
  };

  const handleDeleteFlight = async (flightId) => {
    try {
      await api.deleteFlight(flightId);
      addToast('Flight Deleted', `Sector ${flightId} removed from operational fleet.`, 'success');
      const updated = await api.getFlights();
      setFlights(updated);
    } catch (err) {
      addToast('Deletion Prevented', err.message, 'error');
    }
  };

  // Operational Passenger Actions
  const handleCreatePassenger = async (passengerData) => {
    try {
      const created = await api.createPassenger(passengerData);
      addToast('Passenger Registered', `Passenger #${created.passengerId} (${created.passengerName}) added to registry.`, 'success');
      const updated = await api.getPassengers();
      setPassengers(updated);
    } catch (err) {
      addToast('Registration Rejected', err.message, 'error');
      throw err;
    }
  };

  const handleUpdatePassenger = async (id, passengerData) => {
    try {
      await api.updatePassenger(id, passengerData);
      addToast('Passenger Updated', `Passenger #${id} records updated.`, 'success');
      const updated = await api.getPassengers();
      setPassengers(updated);
    } catch (err) {
      addToast('Update Rejected', err.message, 'error');
      throw err;
    }
  };

  const handleDeletePassenger = async (passengerId) => {
    try {
      await api.deletePassenger(passengerId);
      addToast('Passenger Deleted', `Passenger #${passengerId} deleted from registry.`, 'success');
      const updated = await api.getPassengers();
      setPassengers(updated);
    } catch (err) {
      addToast('Deletion Prevented', err.message, 'error');
    }
  };

  // Operational Booking Actions
  const handleCreateBooking = async (bookingData) => {
    try {
      const created = await api.createBooking(bookingData);
      addToast('Reservation Issued', `Confirmed Ticket #${created.ticketId} issued! Allocated seat: ${created.seatNumber}.`, 'success');
      const [bUpdated, fUpdated] = await Promise.all([
        api.getBookings(),
        api.getFlights(),
      ]);
      setBookings(bUpdated);
      setFlights(fUpdated);
    } catch (err) {
      addToast('Reservation Rejected', err.message, 'error');
      throw err;
    }
  };

  const handleCancelBooking = async (ticketId) => {
    try {
      await api.cancelBooking(ticketId);
      addToast('Ticket Cancelled', `Ticket #${ticketId} cancelled. Seat released back to inventory.`, 'success');
      const [bUpdated, fUpdated] = await Promise.all([
        api.getBookings(),
        api.getFlights(),
      ]);
      setBookings(bUpdated);
      setFlights(fUpdated);
    } catch (err) {
      addToast('Cancellation Error', err.message, 'error');
    }
  };

  return (
    <div className="app-shell">
      <Header backendConnected={backendConnected} />
      <NavTabs activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="main-content" role="main">
        <div className="container">
          {activeTab === 'flight-deck' && (
            <FlightDeck
              flights={flights}
              passengers={passengers}
              bookings={bookings}
              airports={airports}
              loading={loading}
              error={globalError}
              onCreateFlight={handleCreateFlight}
              onUpdateFare={handleUpdateFare}
              onDeleteFlight={handleDeleteFlight}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'passengers' && (
            <section id="view-passengers" className="view-section is-active" role="tabpanel" aria-labelledby="tab-passengers">
              <div className="section-header">
                <span className="section-pretitle">Passenger Manifest &amp; Commercial Ticketing Desk</span>
                <h2 className="section-title">Passengers &amp; Bookings Terminal</h2>
                <p className="section-desc">
                  Direct interface into Spring Boot <code>/api/v1/passengers</code> and <code>/api/v1/bookings</code>.
                  Manage registered passengers, issue reservations with concurrency-safe auto seat allocation, and print official boarding passes.
                </p>
              </div>

              <PassengerRegistry
                passengers={passengers}
                bookings={bookings}
                loading={loading}
                error={globalError}
                onCreatePassenger={handleCreatePassenger}
                onUpdatePassenger={handleUpdatePassenger}
                onDeletePassenger={handleDeletePassenger}
                onRefresh={loadData}
              />

              <div style={{ marginTop: 'var(--space-6)' }}>
                <BookingTerminal
                  bookings={bookings}
                  passengers={passengers}
                  flights={flights}
                  loading={loading}
                  error={globalError}
                  onCreateBooking={handleCreateBooking}
                  onCancelBooking={handleCancelBooking}
                  onRefresh={loadData}
                />
              </div>
            </section>
          )}

          {(activeTab === 'routes' || activeTab === 'tree-index' || activeTab === 'fare-analytics') && (
            <DsaStudioPreview viewType={activeTab} />
          )}
        </div>
      </main>

      <Footer />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
