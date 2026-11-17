import React, { useState, useMemo } from 'react';

export default function CreateBookingModal({ isOpen, passengers, flights, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    passengerId: '',
    flightId: '',
    seatNumber: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available flights that have capacity
  const activeFlights = useMemo(() => {
    if (!flights) return [];
    return flights.filter((f) => f.status !== 'CANCELLED');
  }, [flights]);

  const selectedFlight = useMemo(() => {
    if (!formData.flightId || !flights) return null;
    return flights.find((f) => f.flightId === formData.flightId) || null;
  }, [formData.flightId, flights]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const pId = parseInt(formData.passengerId, 10);
    if (isNaN(pId)) {
      setError('Please select a registered passenger.');
      return;
    }

    if (!formData.flightId) {
      setError('Please select a commercial flight sector.');
      return;
    }

    const payload = {
      passengerId: pId,
      flightId: formData.flightId,
    };

    if (formData.seatNumber.trim()) {
      payload.seatNumber = formData.seatNumber.trim().toUpperCase();
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to issue reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-booking-title"
      onClick={onClose}
    >
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-booking-title">
            <span>🎫</span> Issue Flight Reservation Ticket
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#fca5a5',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-3)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="booking-input-passenger" className="form-label">Select Passenger *</label>
              <select
                id="booking-input-passenger"
                className="form-select"
                value={formData.passengerId}
                onChange={(e) => setFormData((p) => ({ ...p, passengerId: e.target.value }))}
                required
              >
                <option value="">Select a registered passenger...</option>
                {passengers && passengers.map((p) => (
                  <option key={p.passengerId} value={p.passengerId}>
                    #{p.passengerId} &bull; {p.passengerName} ({p.gender}, {p.age} yrs)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="booking-input-flight" className="form-label">Select Flight Sector *</label>
              <select
                id="booking-input-flight"
                className="form-select font-mono"
                value={formData.flightId}
                onChange={(e) => setFormData((p) => ({ ...p, flightId: e.target.value }))}
                required
              >
                <option value="">Select an active flight sector...</option>
                {activeFlights.map((f) => {
                  const src = f.sourceAirport?.airportCode || f.source;
                  const dst = f.destinationAirport?.airportCode || f.destination;
                  return (
                    <option key={f.flightId} value={f.flightId}>
                      {f.flightId} &bull; {src} ➔ {dst} &bull; ₹{Number(f.fare || 0).toLocaleString()} ({f.flightName})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="booking-input-seat" className="form-label">
                Seat Number (Optional)
              </label>
              <input
                type="text"
                id="booking-input-seat"
                className="form-input font-mono"
                placeholder="e.g. 1A, 2F (Leave blank for auto-allocation)"
                value={formData.seatNumber}
                onChange={(e) => setFormData((p) => ({ ...p, seatNumber: e.target.value }))}
              />
              <span className="form-hint">
                Standard 6-seat cabin layout (columns A–F). Java backend validates seat bounds or automatically assigns next free seat.
              </span>
            </div>

            <div
              style={{
                background: 'var(--color-bg-card)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span className="text-xs text-muted">Total Reservation Fare:</span>
              <strong className="font-mono text-accent text-lg" id="booking-preview-fare">
                ₹{selectedFlight ? Number(selectedFlight.fare || 0).toLocaleString() : '0.00'}
              </strong>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
