import React, { useState } from 'react';

const STATUS_OPTIONS = ['SCHEDULED', 'BOARDING', 'DEPARTED', 'IN_AIR', 'ARRIVED', 'DELAYED', 'CANCELLED'];

export default function ScheduleFlightModal({ isOpen, airports, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    flightId: '',
    flightName: '',
    source: airports?.[0]?.airportCode || 'DEL',
    destination: airports?.[1]?.airportCode || 'BOM',
    fare: '5000',
    capacity: '180',
    status: 'SCHEDULED',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanId = formData.flightId.trim().toUpperCase();
    if (!cleanId) {
      setError('Flight ID cannot be empty.');
      return;
    }
    if (formData.source === formData.destination) {
      setError('Origin and destination airport hubs cannot be identical.');
      return;
    }
    const fareNum = parseFloat(formData.fare);
    if (isNaN(fareNum) || fareNum <= 0) {
      setError('Base fare must be a positive number greater than 0.');
      return;
    }
    const capNum = parseInt(formData.capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      setError('Aircraft capacity must be a positive integer greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        flightId: cleanId,
        flightName: formData.flightName.trim() || `${cleanId} Express`,
        source: formData.source,
        destination: formData.destination,
        fare: fareNum,
        capacity: capNum,
        status: formData.status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule flight.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-flight-title"
      onClick={onClose}
    >
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-flight-title">Schedule New Commercial Flight</h3>
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="flight-input-id" className="form-label">Flight ID (Callsign) *</label>
                <input
                  type="text"
                  id="flight-input-id"
                  name="flightId"
                  className="form-input font-mono"
                  placeholder="e.g. AI-204"
                  value={formData.flightId}
                  onChange={handleChange}
                  required
                />
                <span className="form-hint">Unique sector designator</span>
              </div>
              <div className="form-group">
                <label htmlFor="flight-input-status" className="form-label">Operational Status</label>
                <select
                  id="flight-input-status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="flight-input-name" className="form-label">Carrier &amp; Airframe Description *</label>
              <input
                type="text"
                id="flight-input-name"
                name="flightName"
                className="form-input"
                placeholder="e.g. Air India Boeing 787-9 Dreamliner"
                value={formData.flightName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="flight-input-source" className="form-label">Origin Hub *</label>
                <select
                  id="flight-input-source"
                  name="source"
                  className="form-select font-mono"
                  value={formData.source}
                  onChange={handleChange}
                >
                  {airports && airports.length > 0 ? (
                    airports.map((a) => (
                      <option key={a.airportCode} value={a.airportCode}>
                        {a.airportCode} — {a.cityName} ({a.airportName})
                      </option>
                    ))
                  ) : (
                    <option value="DEL">DEL — Delhi</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="flight-input-dest" className="form-label">Destination Hub *</label>
                <select
                  id="flight-input-dest"
                  name="destination"
                  className="form-select font-mono"
                  value={formData.destination}
                  onChange={handleChange}
                >
                  {airports && airports.length > 0 ? (
                    airports.map((a) => (
                      <option key={a.airportCode} value={a.airportCode}>
                        {a.airportCode} — {a.cityName} ({a.airportName})
                      </option>
                    ))
                  ) : (
                    <option value="BOM">BOM — Mumbai</option>
                  )}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="flight-input-fare" className="form-label">Base Sector Fare (₹) *</label>
                <input
                  type="number"
                  id="flight-input-fare"
                  name="fare"
                  className="form-input font-mono"
                  placeholder="5000"
                  min="1"
                  step="0.01"
                  value={formData.fare}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="flight-input-cap" className="form-label">Aircraft Capacity *</label>
                <input
                  type="number"
                  id="flight-input-cap"
                  name="capacity"
                  className="form-input font-mono"
                  placeholder="180"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
                <span className="form-hint">Cabin seat rows (6 seats/row)</span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
