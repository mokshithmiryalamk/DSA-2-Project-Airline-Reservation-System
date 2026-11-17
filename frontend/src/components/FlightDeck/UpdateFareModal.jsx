import React, { useState, useEffect } from 'react';

export default function UpdateFareModal({ isOpen, flight, onClose, onSubmit }) {
  const [fare, setFare] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (flight) {
      setFare(flight.fare ? String(flight.fare) : '');
      setError('');
    }
  }, [flight]);

  if (!isOpen || !flight) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fareNum = parseFloat(fare);
    if (isNaN(fareNum) || fareNum <= 0) {
      setError('Please enter a valid fare greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(flight.flightId, fareNum);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update fare.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fare-modal-title"
      onClick={onClose}
    >
      <div className="modal-window" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="fare-modal-title">
            <span>💳</span> Update Sector Base Fare
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

            <div
              style={{
                background: 'var(--color-bg-card)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <div className="text-xs text-muted">Selected Airframe:</div>
              <strong className="font-mono text-accent">{flight.flightId}</strong> &bull; {flight.flightName}
              <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                Sector: <span className="font-mono">{flight.sourceAirport?.airportCode || flight.source} ➔ {flight.destinationAirport?.airportCode || flight.destination}</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="fare-input-amount" className="form-label">New Base Sector Fare (₹) *</label>
              <input
                type="number"
                id="fare-input-amount"
                className="form-input font-mono"
                placeholder="e.g. 5200"
                min="1"
                step="0.01"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                required
                autoFocus
              />
              <span className="form-hint">Invokes backend FlightService update via Spring Boot API</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Fare'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
