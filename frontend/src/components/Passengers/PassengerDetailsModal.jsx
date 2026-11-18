import React from 'react';

export default function PassengerDetailsModal({ isOpen, passenger, bookings, onClose }) {
  if (!isOpen || !passenger) return null;

  const passengerBookings = bookings
    ? bookings.filter((b) => b.passengerId === passenger.passengerId)
    : [];

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-passenger-modal-title"
      onClick={onClose}
    >
      <div className="modal-window modal-window--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="detail-passenger-modal-title">
            <span>👤</span> Passenger Profile &amp; Ticketing Record
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div
            style={{
              background: 'var(--color-bg-card)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-3)',
            }}
          >
            <div>
              <span className="text-xs text-muted">Passenger ID:</span>
              <span className="font-mono text-accent font-bold" style={{ marginLeft: '0.35rem' }}>
                #{passenger.passengerId}
              </span>
              <h4 className="text-heading" style={{ fontSize: 'var(--text-lg)', marginTop: '0.15rem' }}>
                {passenger.passengerName}
              </h4>
              <p className="text-xs text-muted">
                {passenger.gender} &bull; {passenger.age} years old
              </p>
            </div>
            <div>
              <span className="badge badge--green">
                {passengerBookings.length} Reservations
              </span>
            </div>
          </div>

          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)', color: 'var(--color-text-heading)', marginBottom: 'var(--space-2)' }}>
            Flight Bookings History
          </h4>

          {passengerBookings.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
              No commercial flight reservations on record for this passenger.
            </div>
          ) : (
            <div className="table-wrap">
              <table className="flight-table" style={{ fontSize: 'var(--text-xs)' }}>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Flight / Carrier</th>
                    <th>Route Sector</th>
                    <th>Seat Number</th>
                    <th>Fare</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passengerBookings.map((b) => (
                    <tr key={b.ticketId}>
                      <td className="font-mono text-accent">#{b.ticketId}</td>
                      <td>
                        <strong>{b.flightId}</strong> ({b.flightName || 'Scheduled Flight'})
                      </td>
                      <td className="font-mono">{b.sourceCode} ➔ {b.destinationCode}</td>
                      <td className="font-mono text-amber font-bold">{b.seatNumber || 'AUTO'}</td>
                      <td className="font-mono">₹{Number(b.fare || 0).toLocaleString()}</td>
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
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
