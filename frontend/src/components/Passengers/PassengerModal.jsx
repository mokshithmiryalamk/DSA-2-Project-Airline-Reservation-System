import React, { useState, useEffect } from 'react';

export default function PassengerModal({ isOpen, passenger, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    passengerId: '',
    passengerName: '',
    age: '28',
    gender: 'Male',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!passenger;

  useEffect(() => {
    if (passenger) {
      setFormData({
        passengerId: passenger.passengerId ? String(passenger.passengerId) : '',
        passengerName: passenger.passengerName || '',
        age: passenger.age ? String(passenger.age) : '28',
        gender: passenger.gender || 'Male',
      });
      setError('');
    } else {
      setFormData({
        passengerId: '',
        passengerName: '',
        age: '28',
        gender: 'Male',
      });
      setError('');
    }
  }, [passenger, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = formData.passengerName.trim();
    if (!name) {
      setError('Passenger full name is required.');
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Age must be between 1 and 120.');
      return;
    }

    const payload = {
      passengerName: name,
      age: ageNum,
      gender: formData.gender,
    };

    if (!isEdit && formData.passengerId.trim()) {
      const pId = parseInt(formData.passengerId.trim(), 10);
      if (!isNaN(pId)) {
        payload.passengerId = pId;
      }
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload, isEdit ? passenger.passengerId : null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save passenger.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-passenger-title"
      onClick={onClose}
    >
      <div className="modal-window" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" id="modal-passenger-title">
            {isEdit ? `Edit Passenger #${passenger.passengerId}` : 'Register New Passenger'}
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="passenger-input-id" className="form-label">
                  Passenger ID {isEdit ? '(Locked)' : '(Optional - Auto-Sequenced)'}
                </label>
                <input
                  type="number"
                  id="passenger-input-id"
                  name="passengerId"
                  className="form-input font-mono"
                  placeholder="Auto-generated if empty"
                  value={formData.passengerId}
                  onChange={handleChange}
                  disabled={isEdit}
                />
                <span className="form-hint">Backend allocates via concurrency-safe sequence</span>
              </div>

              <div className="form-group">
                <label htmlFor="passenger-input-gender" className="form-label">Gender *</label>
                <select
                  id="passenger-input-gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passenger-input-name" className="form-label">Full Name *</label>
              <input
                type="text"
                id="passenger-input-name"
                name="passengerName"
                className="form-input"
                placeholder="e.g. Aarav Sharma"
                value={formData.passengerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="passenger-input-age" className="form-label">Age (Years) *</label>
              <input
                type="number"
                id="passenger-input-age"
                name="age"
                className="form-input font-mono"
                placeholder="e.g. 29"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn--secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Record' : 'Register Passenger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
