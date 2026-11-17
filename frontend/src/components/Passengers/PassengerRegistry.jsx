import React, { useState, useMemo } from 'react';
import PassengerModal from './PassengerModal';
import PassengerDetailsModal from './PassengerDetailsModal';
import ConfirmModal from '../ConfirmModal';

export default function PassengerRegistry({
  passengers,
  bookings,
  loading,
  error,
  onCreatePassenger,
  onUpdatePassenger,
  onDeletePassenger,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editPassenger, setEditPassenger] = useState(null);
  const [detailsPassenger, setDetailsPassenger] = useState(null);
  const [deletePassenger, setDeletePassenger] = useState(null);

  // Demographics KPIs
  const totalCount = passengers ? passengers.length : 0;
  const avgAge = useMemo(() => {
    if (!passengers || passengers.length === 0) return 0;
    const sum = passengers.reduce((acc, p) => acc + (p.age || 0), 0);
    return Math.round(sum / passengers.length);
  }, [passengers]);

  const genderRatio = useMemo(() => {
    if (!passengers || passengers.length === 0) return '0M : 0F';
    const m = passengers.filter((p) => p.gender === 'Male').length;
    const f = passengers.filter((p) => p.gender === 'Female').length;
    return `${m}M : ${f}F`;
  }, [passengers]);

  // Filter passengers
  const filteredPassengers = useMemo(() => {
    if (!passengers) return [];
    return passengers.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = p.passengerName?.toLowerCase().includes(q);
      const idMatch = String(p.passengerId).includes(q);

      if (q && !(nameMatch || idMatch)) return false;
      if (genderFilter !== 'ALL' && p.gender !== genderFilter) return false;

      return true;
    });
  }, [passengers, searchQuery, genderFilter]);

  const getPassengerBookingsCount = (passengerId) => {
    if (!bookings) return 0;
    return bookings.filter(
      (b) => (b.passenger?.passengerId === passengerId || b.passengerId === passengerId) && b.status === 'CONFIRMED'
    ).length;
  };

  return (
    <article className="console-card">
      <div className="console-card__header">
        <div>
          <h3 className="console-card__title">
            <span>👤</span> Passenger Registry
          </h3>
          <p className="console-card__desc">
            Manages verified passenger records backed by Spring Boot <code>/api/v1/passengers</code>.
          </p>
        </div>
        <div className="flight-toolbar__actions">
          <button
            type="button"
            className="btn btn--primary"
            id="btn-open-add-passenger"
            onClick={() => setIsRegisterOpen(true)}
          >
            <span>➕</span> Register New Passenger
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

      {/* Demographics KPI Bar */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-4)' }}>
        <div className="kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div className="kpi-card__header">
            <span className="kpi-card__label">Registered Passengers</span>
            <span className="kpi-card__icon" aria-hidden="true">👥</span>
          </div>
          <div className="kpi-card__value" id="kpi-passenger-total">{totalCount}</div>
          <p className="kpi-card__subtext">PassengerRepository entity store</p>
        </div>

        <div className="kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div className="kpi-card__header">
            <span className="kpi-card__label">Average Age</span>
            <span className="kpi-card__icon" aria-hidden="true">🎂</span>
          </div>
          <div className="kpi-card__value" id="kpi-passenger-avg-age">{avgAge} yrs</div>
          <p className="kpi-card__subtext">Demographic cohort average</p>
        </div>

        <div className="kpi-card" style={{ padding: 'var(--space-4)' }}>
          <div className="kpi-card__header">
            <span className="kpi-card__label">Gender Demographics</span>
            <span className="kpi-card__icon" aria-hidden="true">⚧️</span>
          </div>
          <div className="kpi-card__value" id="kpi-passenger-gender-ratio">{genderRatio}</div>
          <p className="kpi-card__subtext">Distribution across manifest</p>
        </div>
      </div>

      {/* Passenger Toolbar */}
      <div className="flight-toolbar">
        <div className="flight-search-wrap">
          <span className="flight-search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            id="passenger-search-input"
            className="flight-search-input"
            placeholder="Search passenger ID or name..."
            aria-label="Filter passenger list"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flight-toolbar__actions">
          <label htmlFor="passenger-gender-filter" className="form-label" style={{ margin: 0, alignSelf: 'center' }}>
            Gender:
          </label>
          <select
            id="passenger-gender-filter"
            className="filter-select"
            aria-label="Filter passengers by gender"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button
            type="button"
            className="btn btn--xs btn--secondary"
            id="btn-reset-passenger-filters"
            onClick={() => {
              setSearchQuery('');
              setGenderFilter('ALL');
            }}
            title="Reset passenger filters"
          >
            ✕ Reset
          </button>

          <span className="toolbar-chip" id="passenger-count-chip">
            {filteredPassengers.length} Registered
          </span>
        </div>
      </div>

      {/* Passenger Table */}
      <div className="table-wrap">
        {loading && passengers.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading passenger registry from backend...
          </div>
        ) : filteredPassengers.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No passenger records match your query.
          </div>
        ) : (
          <table className="flight-table" aria-label="Registered Passengers Table">
            <thead>
              <tr>
                <th scope="col">Passenger ID</th>
                <th scope="col">Full Name</th>
                <th scope="col">Age</th>
                <th scope="col">Gender</th>
                <th scope="col">Active Bookings</th>
                <th scope="col" className="table-actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody id="passenger-table-body">
              {filteredPassengers.map((p) => {
                const activeBookings = getPassengerBookingsCount(p.passengerId);
                return (
                  <tr key={p.passengerId}>
                    <td className="font-mono text-accent font-bold">#{p.passengerId}</td>
                    <td>
                      <strong>{p.passengerName}</strong>
                    </td>
                    <td className="font-mono">{p.age} yrs</td>
                    <td>{p.gender}</td>
                    <td>
                      <span className={`badge ${activeBookings > 0 ? 'badge--green' : 'badge--dark-pill'}`}>
                        {activeBookings} Active
                      </span>
                    </td>
                    <td className="table-actions-cell">
                      <button
                        type="button"
                        className="btn btn--xs btn--secondary"
                        onClick={() => setDetailsPassenger(p)}
                        title="View profile & history"
                      >
                        👁️ Profile
                      </button>
                      <button
                        type="button"
                        className="btn btn--xs btn--secondary"
                        onClick={() => setEditPassenger(p)}
                        title="Edit passenger details"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--xs btn--danger"
                        onClick={() => setDeletePassenger(p)}
                        title="Delete passenger"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <PassengerModal
        isOpen={isRegisterOpen || !!editPassenger}
        passenger={editPassenger}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditPassenger(null);
        }}
        onSubmit={async (payload, id) => {
          if (id) {
            await onUpdatePassenger(id, payload);
          } else {
            await onCreatePassenger(payload);
          }
        }}
      />

      <PassengerDetailsModal
        isOpen={!!detailsPassenger}
        passenger={detailsPassenger}
        bookings={bookings}
        onClose={() => setDetailsPassenger(null)}
      />

      <ConfirmModal
        isOpen={!!deletePassenger}
        title="Delete Passenger Record"
        message={
          deletePassenger
            ? `Are you sure you want to delete passenger #${deletePassenger.passengerId} (${deletePassenger.passengerName})? If this passenger has any historical or active bookings, the backend will preserve booking integrity and return HTTP 409 Conflict.`
            : ''
        }
        confirmText="Delete Passenger"
        onConfirm={() => {
          if (deletePassenger) {
            onDeletePassenger(deletePassenger.passengerId);
            setDeletePassenger(null);
          }
        }}
        onCancel={() => setDeletePassenger(null)}
      />
    </article>
  );
}
