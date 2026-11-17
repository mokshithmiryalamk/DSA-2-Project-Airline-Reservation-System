import React, { useState, useMemo } from 'react';
import CreateBookingModal from './CreateBookingModal';
import BoardingPassModal from './BoardingPassModal';
import ConfirmModal from '../ConfirmModal';

export default function BookingTerminal({
  bookings,
  passengers,
  flights,
  loading,
  error,
  onCreateBooking,
  onCancelBooking,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [passModalBooking, setPassModalBooking] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);

  // KPIs
  const confirmedBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => b.status === 'CONFIRMED');
  }, [bookings]);

  const totalConfirmed = confirmedBookings.length;
  const totalRevenue = useMemo(() => {
    return confirmedBookings.reduce((acc, b) => acc + (b.fare || 0), 0);
  }, [confirmedBookings]);

  const avgTicket = totalConfirmed > 0 ? Math.round(totalRevenue / totalConfirmed) : 0;

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;

      const ticketMatch = String(b.ticketId).includes(q);
      const pName = (b.passenger?.passengerName || b.passengerName || '').toLowerCase();
      const pId = String(b.passenger?.passengerId || b.passengerId || '');
      const fId = (b.flight?.flightId || b.flightId || '').toLowerCase();
      const src = (b.flight?.sourceAirport?.airportCode || b.flight?.source || b.source || '').toLowerCase();
      const dst = (b.flight?.destinationAirport?.airportCode || b.flight?.destination || b.destination || '').toLowerCase();

      return (
        ticketMatch ||
        pName.includes(q) ||
        pId.includes(q) ||
        fId.includes(q) ||
        src.includes(q) ||
        dst.includes(q)
      );
    });
  }, [bookings, searchQuery]);

  return (
    <article className="console-card">
      <div className="console-card__header">
        <div>
          <h3 className="console-card__title">
            <span>🎫</span> Commercial Ticketing &amp; Reservation Desk
          </h3>
          <p className="console-card__desc">
            Issues and verifies confirmed flight tickets linking passengers to flights via Spring Boot <code>/api/v1/bookings</code>.
          </p>
        </div>
        <div className="flight-toolbar__actions">
          <button
            type="button"
            className="btn btn--primary"
            id="btn-open-book-ticket"
            onClick={() => setIsCreateOpen(true)}
          >
            <span>➕</span> Issue New Reservation
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Ticketing KPI Bar */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-4)' }}>
        <div className="kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div className="kpi-card__header">
            <span className="kpi-card__label">Confirmed Tickets</span>
            <span className="kpi-card__icon" aria-hidden="true">🎟️</span>
          </div>
          <div className="kpi-card__value" id="kpi-booking-total">{totalConfirmed}</div>
          <p className="kpi-card__subtext">Active commercial tickets</p>
        </div>

        <div className="kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div className="kpi-card__header">
            <span className="kpi-card__label">Gross Booked Revenue</span>
            <span className="kpi-card__icon" aria-hidden="true">💰</span>
          </div>
          <div className="kpi-card__value" id="kpi-booking-revenue">₹{totalRevenue.toLocaleString()}</div>
          <p className="kpi-card__subtext">Cumulative active ticket fares</p>
        </div>

        <div className="kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div className="kpi-card__header">
            <span className="kpi-card__label">Average Ticket Value</span>
            <span className="kpi-card__icon" aria-hidden="true">📈</span>
          </div>
          <div className="kpi-card__value" id="kpi-booking-avg-ticket">₹{avgTicket.toLocaleString()}</div>
          <p className="kpi-card__subtext">Per-reservation yield</p>
        </div>
      </div>

      {/* Booking Toolbar */}
      <div className="flight-toolbar">
        <div className="flight-search-wrap">
          <span className="flight-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            id="booking-search-input"
            className="flight-search-input"
            placeholder="Search ticket ID, passenger or sector..."
            aria-label="Filter bookings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flight-toolbar__actions">
          <button
            type="button"
            className="btn btn--xs btn--secondary"
            id="btn-reset-booking-filters"
            onClick={() => setSearchQuery('')}
            title="Reset booking search filter"
          >
            ✕ Reset
          </button>
          <span className="toolbar-chip" id="booking-count-chip">
            {filteredBookings.length} Issued
          </span>
        </div>
      </div>

      {/* Booking Table */}
      <div className="table-wrap">
        {loading && bookings.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading bookings registry from backend...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No reservation records match your query.
          </div>
        ) : (
          <table className="flight-table" aria-label="Commercial Reservations Table">
            <thead>
              <tr>
                <th scope="col">Ticket ID</th>
                <th scope="col">Passenger Name &amp; ID</th>
                <th scope="col">Flight &amp; Airframe</th>
                <th scope="col">Route Sector</th>
                <th scope="col">Seat Allocation</th>
                <th scope="col">Base Fare</th>
                <th scope="col">Reservation Status</th>
                <th scope="col" className="table-actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody id="booking-table-body">
              {filteredBookings.map((b) => {
                const pName = b.passenger?.passengerName || b.passengerName || 'Commercial Passenger';
                const pId = b.passenger?.passengerId || b.passengerId || '--';
                const fId = b.flight?.flightId || b.flightId || '--';
                const fName = b.flight?.flightName || 'Flight Airframe';
                const src = b.flight?.sourceAirport?.airportCode || b.flight?.source || b.source || '--';
                const dst = b.flight?.destinationAirport?.airportCode || b.flight?.destination || b.destination || '--';
                const isCancelled = b.status === 'CANCELLED';

                return (
                  <tr key={b.ticketId}>
                    <td className="font-mono text-accent font-bold">#{b.ticketId}</td>
                    <td>
                      <strong>{pName}</strong>
                      <span className="text-xs text-muted" style={{ display: 'block' }}>
                        Passenger #{pId}
                      </span>
                    </td>
                    <td>
                      <strong className="font-mono">{fId}</strong>
                      <span className="text-xs text-muted" style={{ display: 'block' }}>
                        {fName}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono badge badge--dark-pill">
                        {src} ➔ {dst}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-amber">
                      {b.seatNumber || 'AUTO'}
                    </td>
                    <td className="font-mono font-bold">
                      ₹{Number(b.fare || 0).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${!isCancelled ? 'badge--green' : 'badge--red'}`}>
                        {b.status || 'CONFIRMED'}
                      </span>
                    </td>
                    <td className="table-actions-cell">
                      <button
                        type="button"
                        className="btn btn--xs btn--secondary"
                        onClick={() => setPassModalBooking(b)}
                        title="View printable boarding pass"
                      >
                        🎫 Boarding Pass
                      </button>
                      {!isCancelled && (
                        <button
                          type="button"
                          className="btn btn--xs btn--danger"
                          onClick={() => setCancelModalBooking(b)}
                          title="Cancel ticket reservation"
                        >
                          ✕ Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <CreateBookingModal
        isOpen={isCreateOpen}
        passengers={passengers}
        flights={flights}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={onCreateBooking}
      />

      <BoardingPassModal
        isOpen={!!passModalBooking}
        booking={passModalBooking}
        onClose={() => setPassModalBooking(null)}
      />

      <ConfirmModal
        isOpen={!!cancelModalBooking}
        title="Cancel Reservation Ticket"
        message={
          cancelModalBooking
            ? `Are you sure you want to cancel Ticket #${cancelModalBooking.ticketId} (${cancelModalBooking.passenger?.passengerName || cancelModalBooking.passengerName || 'Passenger'} on ${cancelModalBooking.flight?.flightId || cancelModalBooking.flightId})? The seat will be released back to available inventory and booking status updated to CANCELLED.`
            : ''
        }
        confirmText="Cancel Reservation"
        onConfirm={() => {
          if (cancelModalBooking) {
            onCancelBooking(cancelModalBooking.ticketId);
            setCancelModalBooking(null);
          }
        }}
        onCancel={() => setCancelModalBooking(null)}
      />
    </article>
  );
}
