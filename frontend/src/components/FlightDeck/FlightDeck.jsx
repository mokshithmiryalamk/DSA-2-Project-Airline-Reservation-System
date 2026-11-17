import React, { useState, useMemo } from 'react';
import ScheduleFlightModal from './ScheduleFlightModal';
import UpdateFareModal from './UpdateFareModal';
import FlightDetailsModal from './FlightDetailsModal';
import ConfirmModal from '../ConfirmModal';

export default function FlightDeck({
  flights,
  passengers,
  bookings,
  airports,
  loading,
  error,
  onCreateFlight,
  onUpdateFare,
  onDeleteFlight,
  onRefresh,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [originFilter, setOriginFilter] = useState('ALL');
  const [destFilter, setDestFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('ID_ASC');

  // Modals state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [fareModalFlight, setFareModalFlight] = useState(null);
  const [detailsModalFlight, setDetailsModalFlight] = useState(null);
  const [deleteModalFlight, setDeleteModalFlight] = useState(null);

  // Compute live KPIs
  const activeFleetCount = flights ? flights.length : 0;
  const uniqueHubs = useMemo(() => {
    if (!flights) return 0;
    const hubs = new Set();
    flights.forEach((f) => {
      const src = f.sourceAirport?.airportCode || f.source;
      const dst = f.destinationAirport?.airportCode || f.destination;
      if (src) hubs.add(src);
      if (dst) hubs.add(dst);
    });
    return hubs.size;
  }, [flights]);

  const totalPassengersCount = passengers ? passengers.length : 0;
  const avgFare = useMemo(() => {
    if (!flights || flights.length === 0) return 0;
    const sum = flights.reduce((acc, f) => acc + (f.fare || 0), 0);
    return Math.round(sum / flights.length);
  }, [flights]);

  // Origin/Dest dropdown options
  const hubOptions = useMemo(() => {
    if (!flights) return [];
    const hubs = new Set();
    flights.forEach((f) => {
      const src = f.sourceAirport?.airportCode || f.source;
      const dst = f.destinationAirport?.airportCode || f.destination;
      if (src) hubs.add(src);
      if (dst) hubs.add(dst);
    });
    return Array.from(hubs).sort();
  }, [flights]);

  // Filter & sort flights
  const filteredFlights = useMemo(() => {
    if (!flights) return [];
    let list = flights.filter((f) => {
      const q = searchQuery.toLowerCase().trim();
      const idMatch = f.flightId?.toLowerCase().includes(q);
      const nameMatch = f.flightName?.toLowerCase().includes(q);
      const srcMatch = (f.sourceAirport?.airportCode || f.source || '').toLowerCase().includes(q);
      const dstMatch = (f.destinationAirport?.airportCode || f.destination || '').toLowerCase().includes(q);

      if (q && !(idMatch || nameMatch || srcMatch || dstMatch)) return false;

      const src = f.sourceAirport?.airportCode || f.source;
      const dst = f.destinationAirport?.airportCode || f.destination;

      if (originFilter !== 'ALL' && src !== originFilter) return false;
      if (destFilter !== 'ALL' && dst !== destFilter) return false;

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      switch (sortOrder) {
        case 'FARE_ASC':
          return (a.fare || 0) - (b.fare || 0);
        case 'FARE_DESC':
          return (b.fare || 0) - (a.fare || 0);
        case 'AIRLINE_ASC':
          return (a.flightName || '').localeCompare(b.flightName || '');
        case 'ROUTE_ASC': {
          const rA = `${a.sourceAirport?.airportCode || a.source}-${a.destinationAirport?.airportCode || a.destination}`;
          const rB = `${b.sourceAirport?.airportCode || b.source}-${b.destinationAirport?.airportCode || b.destination}`;
          return rA.localeCompare(rB);
        }
        case 'ID_ASC':
        default:
          return (a.flightId || '').localeCompare(b.flightId || '');
      }
    });

    return list;
  }, [flights, searchQuery, originFilter, destFilter, sortOrder]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setOriginFilter('ALL');
    setDestFilter('ALL');
    setSortOrder('ID_ASC');
  };

  const getOccupiedSeatsCount = (flightId) => {
    if (!bookings) return 0;
    return bookings.filter(
      (b) => (b.flight?.flightId === flightId || b.flightId === flightId) && b.status === 'CONFIRMED'
    ).length;
  };

  return (
    <section id="view-flight-deck" className="view-section is-active" role="tabpanel" aria-labelledby="tab-flight-deck">
      <div className="section-header">
        <span className="section-pretitle">Commercial Operations &amp; Sector Scheduling</span>
        <h2 className="section-title">Flight Operations Deck</h2>
        <p className="section-desc">
          Direct interface into Spring Boot <code>/api/v1/flights</code> and PostgreSQL/H2 store. Schedule commercial airframes,
          inspect live occupancy, filter route sectors, update base fares, and enforce concurrency-safe capacity locks.
        </p>
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>⚠️ {error}</span>
          <button type="button" className="btn btn--xs btn--secondary" onClick={onRefresh}>
            Retry API
          </button>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Active Fleet</span>
            <span className="kpi-card__icon" aria-hidden="true">✈️</span>
          </div>
          <div className="kpi-card__value" id="kpi-active-fleet">{activeFleetCount}</div>
          <p className="kpi-card__subtext">Scheduled commercial airframes</p>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Route Hubs</span>
            <span className="kpi-card__icon" aria-hidden="true">📍</span>
          </div>
          <div className="kpi-card__value" id="kpi-route-hubs">{uniqueHubs}</div>
          <p className="kpi-card__subtext">Active airport nodes connected</p>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Manifest Passengers</span>
            <span className="kpi-card__icon" aria-hidden="true">👥</span>
          </div>
          <div className="kpi-card__value" id="kpi-total-passengers">{totalPassengersCount}</div>
          <p className="kpi-card__subtext">Registered in passenger database</p>
        </article>

        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Average Sector Fare</span>
            <span className="kpi-card__icon" aria-hidden="true">💳</span>
          </div>
          <div className="kpi-card__value" id="kpi-average-fare">₹{avgFare.toLocaleString()}</div>
          <p className="kpi-card__subtext">Live calculated fleet mean fare</p>
        </article>
      </div>

      {/* Scheduled Flight Fleet Console Card */}
      <article className="console-card">
        <div className="console-card__header">
          <div>
            <h3 className="console-card__title">Scheduled Flight Fleet</h3>
            <p className="console-card__desc">
              Synchronized with Spring Boot <code>FlightService</code> &amp; database repository.
            </p>
          </div>
          <div className="flight-toolbar__actions">
            <button
              type="button"
              className="btn btn--primary"
              id="btn-open-add-flight"
              onClick={() => setIsScheduleOpen(true)}
            >
              <span>➕</span> Schedule New Flight
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              id="btn-reset-demo-data"
              onClick={onRefresh}
              title="Refresh flight data from Spring Boot API"
            >
              <span>🔄</span> Refresh API Data
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flight-toolbar">
          <div className="flight-search-wrap">
            <span className="flight-search-icon" aria-hidden="true">🔍</span>
            <input
              type="text"
              id="flight-search-input"
              className="flight-search-input"
              placeholder="Search flight ID, carrier or route..."
              aria-label="Filter flight schedule"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flight-toolbar__actions">
            <label htmlFor="flight-origin-filter" className="form-label" style={{ margin: 0, alignSelf: 'center' }}>
              Origin:
            </label>
            <select
              id="flight-origin-filter"
              className="filter-select"
              aria-label="Filter by Origin Hub"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
            >
              <option value="ALL">All Hubs</option>
              {hubOptions.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <label htmlFor="flight-dest-filter" className="form-label" style={{ margin: 0, alignSelf: 'center' }}>
              Dest:
            </label>
            <select
              id="flight-dest-filter"
              className="filter-select"
              aria-label="Filter by Destination Hub"
              value={destFilter}
              onChange={(e) => setDestFilter(e.target.value)}
            >
              <option value="ALL">All Hubs</option>
              {hubOptions.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>

            <label htmlFor="flight-sort-select" className="form-label" style={{ margin: 0, alignSelf: 'center' }}>
              Sort:
            </label>
            <select
              id="flight-sort-select"
              className="filter-select"
              aria-label="Sort Flight Records"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="ID_ASC">Flight ID (A-Z)</option>
              <option value="FARE_ASC">Fare: Low to High</option>
              <option value="FARE_DESC">Fare: High to Low</option>
              <option value="AIRLINE_ASC">Carrier Name</option>
              <option value="ROUTE_ASC">Route Sector</option>
            </select>

            <button
              type="button"
              className="btn btn--xs btn--secondary"
              id="btn-reset-flight-filters"
              onClick={handleResetFilters}
              title="Reset all flight filters"
            >
              ✕ Reset
            </button>

            <span className="toolbar-chip" id="flight-count-chip">
              {filteredFlights.length} Flights
            </span>
          </div>
        </div>

        {/* Table Wrap */}
        <div className="table-wrap">
          {loading && flights.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Loading flight sectors from backend...
            </div>
          ) : filteredFlights.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No commercial flights match your filter criteria.
            </div>
          ) : (
            <table className="flight-table" aria-label="Commercial Flights Schedule Table">
              <thead>
                <tr>
                  <th scope="col">Flight ID</th>
                  <th scope="col">Carrier &amp; Airframe</th>
                  <th scope="col">Origin Hub</th>
                  <th scope="col">Destination</th>
                  <th scope="col">Base Fare</th>
                  <th scope="col">Occupancy</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="table-actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody id="flight-table-body">
                {filteredFlights.map((flight) => {
                  const src = flight.sourceAirport?.airportCode || flight.source || '--';
                  const dst = flight.destinationAirport?.airportCode || flight.destination || '--';
                  const occupied = getOccupiedSeatsCount(flight.flightId);
                  const cap = flight.capacity || 0;
                  const pct = cap > 0 ? Math.round((occupied / cap) * 100) : 0;

                  return (
                    <tr key={flight.flightId}>
                      <td className="font-mono text-accent font-bold">{flight.flightId}</td>
                      <td>
                        <strong>{flight.flightName}</strong>
                      </td>
                      <td>
                        <span className="font-mono badge badge--dark-pill">{src}</span>
                      </td>
                      <td>
                        <span className="font-mono badge badge--dark-pill">{dst}</span>
                      </td>
                      <td className="font-mono text-amber font-bold">
                        ₹{Number(flight.fare || 0).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="font-mono text-xs">
                            {occupied}/{cap} ({pct}%)
                          </span>
                          <div
                            style={{
                              width: '45px',
                              height: '5px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: pct >= 100 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#10b981',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            flight.status === 'SCHEDULED' || flight.status === 'BOARDING' || flight.status === 'ACTIVE'
                              ? 'badge--green'
                              : flight.status === 'CANCELLED'
                              ? 'badge--red'
                              : 'badge--amber'
                          }`}
                        >
                          {flight.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="table-actions-cell">
                        <button
                          type="button"
                          className="btn btn--xs btn--secondary"
                          onClick={() => setDetailsModalFlight(flight)}
                          title="View flight details & passenger manifest"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          className="btn btn--xs btn--secondary"
                          onClick={() => setFareModalFlight(flight)}
                          title="Update base fare"
                        >
                          ✏️ Fare
                        </button>
                        <button
                          type="button"
                          className="btn btn--xs btn--danger"
                          onClick={() => setDeleteModalFlight(flight)}
                          title="Delete flight sector"
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

        {/* Backend Connected Card */}
        <div className="upcoming-box" style={{ borderStyle: 'solid', textAlign: 'left', padding: 'var(--space-4) var(--space-5)', marginTop: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <strong className="text-heading" style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-sm)' }}>
                ⚡ Spring Boot FlightService REST Connected
              </strong>
              <p className="text-xs text-muted" style={{ marginTop: '0.15rem' }}>
                All actions on this deck communicate directly with <code>/api/v1/flights</code> backed by Spring Data JPA and Flyway migrations.
              </p>
            </div>
            <span className="badge badge--green">Live State Connected</span>
          </div>
        </div>
      </article>

      {/* Modals */}
      <ScheduleFlightModal
        isOpen={isScheduleOpen}
        airports={airports}
        onClose={() => setIsScheduleOpen(false)}
        onSubmit={onCreateFlight}
      />

      <UpdateFareModal
        isOpen={!!fareModalFlight}
        flight={fareModalFlight}
        onClose={() => setFareModalFlight(null)}
        onSubmit={onUpdateFare}
      />

      <FlightDetailsModal
        isOpen={!!detailsModalFlight}
        flight={detailsModalFlight}
        bookings={bookings}
        onClose={() => setDetailsModalFlight(null)}
      />

      <ConfirmModal
        isOpen={!!deleteModalFlight}
        title="Delete Flight Sector"
        message={
          deleteModalFlight
            ? `Are you sure you want to delete flight ${deleteModalFlight.flightId} (${deleteModalFlight.flightName})? If active bookings exist, the backend will preserve booking history and reject deletion with HTTP 409 Conflict.`
            : ''
        }
        confirmText="Delete Sector"
        onConfirm={() => {
          if (deleteModalFlight) {
            onDeleteFlight(deleteModalFlight.flightId);
            setDeleteModalFlight(null);
          }
        }}
        onCancel={() => setDeleteModalFlight(null)}
      />
    </section>
  );
}
