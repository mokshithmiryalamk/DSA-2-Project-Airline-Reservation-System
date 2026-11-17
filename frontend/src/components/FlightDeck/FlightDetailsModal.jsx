import React from 'react';

export default function FlightDetailsModal({ isOpen, flight, bookings, onClose }) {
  if (!isOpen || !flight) return null;

  const flightBookings = bookings
    ? bookings.filter((b) => b.flight?.flightId === flight.flightId || b.flightId === flight.flightId)
    : [];

  const sourceCode = flight.sourceAirport?.airportCode || flight.source || '--';
  const destCode = flight.destinationAirport?.airportCode || flight.destination || '--';
  const availableSeats = Math.max(0, (flight.capacity || 0) - flightBookings.length);

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-flight-modal-title"
      onClick={onClose}
    >
      <div className="modal-window modal-window--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="detail-flight-modal-title">
            <span>🛫</span> Flight Sector Telemetry &amp; Manifest
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--space-3)',
              background: 'var(--color-bg-card)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Flight ID</span>
              <strong className="font-mono text-accent text-lg">{flight.flightId}</strong>
            </div>
            <div>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Carrier</span>
              <strong className="text-heading text-sm">{flight.flightName}</strong>
            </div>
            <div>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Sector</span>
              <strong className="font-mono text-sm">{sourceCode} ➔ {destCode}</strong>
            </div>
            <div>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Base Fare</span>
              <strong className="font-mono text-amber text-lg">₹{Number(flight.fare || 0).toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-xs text-muted" style={{ display: 'block' }}>Capacity / Available</span>
              <strong className="font-mono text-sm">{flightBookings.length} / {flight.capacity} seats ({availableSeats} free)</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-heading)' }}>
              Booked Passenger Manifest
            </h4>
            <span className="badge badge--dark-pill">{flightBookings.length} Bookings</span>
          </div>

          {flightBookings.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              No passengers currently booked on this flight.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="flight-table" style={{ fontSize: 'var(--text-xs)' }}>
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Passenger Name</th>
                    <th>Passenger ID</th>
                    <th>Seat</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {flightBookings.map((b) => (
                    <tr key={b.ticketId}>
                      <td className="font-mono text-accent">#{b.ticketId}</td>
                      <td>{b.passenger?.passengerName || b.passengerName || 'Passenger'}</td>
                      <td className="font-mono">#{b.passenger?.passengerId || b.passengerId}</td>
                      <td className="font-mono font-bold text-amber">{b.seatNumber || 'AUTO'}</td>
                      <td>
                        <span className={`badge ${b.status === 'CONFIRMED' ? 'badge--green' : 'badge--amber'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <span className="badge badge--green">{flight.status || 'ACTIVE'}</span>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
