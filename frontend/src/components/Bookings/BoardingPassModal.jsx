import React from 'react';

export default function BoardingPassModal({ isOpen, booking, onClose }) {
  if (!isOpen || !booking) return null;

  const src = booking.sourceCode || '--';
  const dst = booking.destinationCode || '--';
  const flightId = booking.flightId || '--';
  const carrierName = booking.flightName || 'Commercial Airframe';
  const passengerName = booking.passengerName || 'Commercial Passenger';
  const passengerId = booking.passengerId || '--';
  const fare = booking.fare || 0;
  const bookedAt = booking.bookedAt ? new Date(booking.bookedAt).toLocaleString() : '--';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pass-title"
      onClick={onClose}
    >
      <div className="modal-window modal-window--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-pass-title">
            <span>🎫</span> {booking.status === 'CANCELLED' ? 'Cancelled Boarding Pass' : 'Confirmed Boarding Pass'}
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="boarding-pass">
            <div className="boarding-pass__header">
              <div className="boarding-pass__brand">✈️ AEROOPS AIRLINE SYSTEM</div>
              <div className="font-mono text-accent font-bold" id="pass-ticket-id">
                #{booking.ticketId}
              </div>
            </div>

            <div className="boarding-pass__body">
              <div>
                <div className="boarding-pass__sector">
                  <span className="boarding-pass__hub" id="pass-source">{src}</span>
                  <span className="boarding-pass__flight-arrow">➔</span>
                  <span className="boarding-pass__hub" id="pass-dest">{dst}</span>
                </div>

                <div className="boarding-pass__meta-grid">
                  <div className="boarding-pass__meta-item">
                    <label>Passenger Name</label>
                    <span id="pass-passenger-name">{passengerName}</span>
                  </div>
                  <div className="boarding-pass__meta-item">
                    <label>Flight / Carrier</label>
                    <span className="text-accent font-bold font-mono" id="pass-flight-id">{flightId}</span>
                  </div>
                  <div className="boarding-pass__meta-item">
                    <label>Seat Allocation</label>
                    <span className="font-mono text-amber font-bold text-lg" id="pass-seat">
                      {booking.seatNumber || 'AUTO'}
                    </span>
                  </div>
                  <div className="boarding-pass__meta-item">
                    <label>Passenger Info</label>
                    <span className="text-xs" id="pass-passenger-details">
                      Passenger #{passengerId}
                    </span>
                  </div>
                  <div className="boarding-pass__meta-item">
                    <label>Airframe</label>
                    <span className="text-xs" id="pass-carrier-name">{carrierName}</span>
                  </div>
                  <div className="boarding-pass__meta-item">
                    <label>Base Sector Fare</label>
                    <span className="text-amber font-mono font-bold" id="pass-fare">
                      ₹{Number(fare).toLocaleString()}
                    </span>
                  </div>
                  <div className="boarding-pass__meta-item">
                    <label>Booking Reference</label>
                    <span className="text-xs font-mono text-accent">
                      {booking.bookingReference || `AERO-${flightId}-${booking.ticketId}`}
                    </span>
                  </div>
                  <div className="boarding-pass__meta-item">
                    <label>Issued Timestamp</label>
                    <span className="text-xs font-mono" id="pass-booked-at">{bookedAt}</span>
                  </div>
                </div>
              </div>

              <div className="boarding-pass__barcode-zone">
                <div className="barcode-strip" aria-hidden="true"></div>
                <span className="text-xs font-mono text-muted">
                  {booking.status === 'CANCELLED' ? 'VOID / CANCELLED RESERVATION' : 'AEROOPS-VERIFIED-RESERVATION'}
                </span>
                <span
                  className={`badge ${booking.status === 'CONFIRMED' ? 'badge--green' : 'badge--coral'}`}
                  style={{ marginTop: '0.5rem' }}
                >
                  {booking.status || 'CONFIRMED'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn--primary"
            id="btn-print-boarding-pass"
            onClick={handlePrint}
          >
            <span className="btn__icon" aria-hidden="true">🖨️</span> Print / Save Pass
          </button>
        </div>
      </div>
    </div>
  );
}
