import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { usePlayback } from '../shared/usePlayback';
import PlaybackControls from '../shared/PlaybackControls';
import SegmentTreeView from './SegmentTreeView';
import FenwickTreeView from './FenwickTreeView';

const DEFAULT_FARES = [5200, 4800, 6100, 3900, 5400, 7200, 4300, 5800];

export default function FareAnalytics() {
  const [mode, setMode] = useState('segment'); // 'segment' | 'fenwick'
  const [fares, setFares] = useState(DEFAULT_FARES);
  const [syncWithFlights, setSyncWithFlights] = useState(false);
  const [queryLeft, setQueryLeft] = useState(1);
  const [queryRight, setQueryRight] = useState(5);
  const [updateIndex, setUpdateIndex] = useState('');
  const [updateValue, setUpdateValue] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = result?.steps || [];
  const playback = usePlayback(steps, 550);

  const runQuery = useCallback(async (customPayload = {}) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        fares: syncWithFlights ? undefined : fares,
        syncWithFlights,
        queryLeft: Number(queryLeft),
        queryRight: Number(queryRight),
        ...customPayload,
      };
      if (updateIndex !== '' && updateValue !== '') {
        payload.updateIndex = Number(updateIndex);
        payload.updateValue = Number(updateValue);
      }

      const res = mode === 'segment'
        ? await api.runSegmentTree(payload)
        : await api.runFenwickTree(payload);

      setResult(res);
      if (res?.currentFares) {
        setFares(res.currentFares);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mode, fares, syncWithFlights, queryLeft, queryRight, updateIndex, updateValue]);

  useEffect(() => {
    runQuery();
  }, [mode, syncWithFlights]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleSync = async () => {
    const nextSync = !syncWithFlights;
    setSyncWithFlights(nextSync);
    if (nextSync) {
      try {
        const activeFares = await api.getDsaFares();
        if (Array.isArray(activeFares) && activeFares.length > 0) {
          setFares(activeFares);
          setQueryLeft(0);
          setQueryRight(Math.max(0, activeFares.length - 1));
        }
      } catch (err) {
        setError(err.message);
      }
    } else {
      setFares(DEFAULT_FARES);
      setQueryLeft(1);
      setQueryRight(5);
    }
  };

  return (
    <section id="view-fare-analytics" className="view-section is-active" role="tabpanel" aria-labelledby="tab-fare-analytics">
      <div className="section-header">
        <span className="section-pretitle">Statistical Fare Distribution &amp; Range Queries</span>
        <h2 className="section-title"><span>📊</span> Fare Analytics Studio (Segment &amp; Fenwick Trees)</h2>
        <p className="section-desc">
          O(log N) fare analytics powered by Java 21 <code>com.aeroops.dsa.analytics</code>:
          4N Segment Tree for Range Minimum Queries (RMQ) and 1-based Fenwick Tree (BIT) for prefix &amp; range sums.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Active Structure</span>
            <span className="kpi-card__icon" aria-hidden="true">📊</span>
          </div>
          <div className="kpi-card__value" style={{ fontSize: 'var(--text-lg)' }}>
            {mode === 'segment' ? 'Segment Tree' : 'Fenwick (BIT)'}
          </div>
          <p className="kpi-card__subtext">{mode === 'segment' ? '4N RMQ heap array' : 'LSB bitwise prefix hops'}</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Dataset Size</span>
            <span className="kpi-card__icon" aria-hidden="true">🧾</span>
          </div>
          <div className="kpi-card__value">{result?.arraySize ?? fares.length}</div>
          <p className="kpi-card__subtext">{syncWithFlights ? 'Synced w/ live flights' : 'Demo sector fares'}</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Query Interval</span>
            <span className="kpi-card__icon" aria-hidden="true">🎯</span>
          </div>
          <div className="kpi-card__value">[{queryLeft} .. {queryRight}]</div>
          <p className="kpi-card__subtext">0-based inclusive bounds</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">{mode === 'segment' ? 'Range Minimum' : 'Range Sum'}</span>
            <span className="kpi-card__icon" aria-hidden="true">₹</span>
          </div>
          <div className="kpi-card__value">
            {mode === 'segment'
              ? (result?.resultMinimum !== undefined ? `₹${Math.round(result.resultMinimum).toLocaleString()}` : '—')
              : (result?.resultSum !== undefined ? `₹${Math.round(result.resultSum).toLocaleString()}` : '—')}
          </div>
          <p className="kpi-card__subtext">Java O(log N) result</p>
        </article>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Controls */}
        <div
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className={`btn btn--sm ${mode === 'segment' ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setMode('segment')}
              >
                Segment Tree (RMQ)
              </button>
              <button
                type="button"
                className={`btn btn--sm ${mode === 'fenwick' ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setMode('fenwick')}
              >
                Fenwick Tree (BIT)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="analytics-left">Left Index</label>
                <input
                  id="analytics-left"
                  type="number"
                  className="form-input"
                  value={queryLeft}
                  onChange={(e) => setQueryLeft(e.target.value)}
                  style={{ width: '84px' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="analytics-right">Right Index</label>
                <input
                  id="analytics-right"
                  type="number"
                  className="form-input"
                  value={queryRight}
                  onChange={(e) => setQueryRight(e.target.value)}
                  style={{ width: '84px' }}
                />
              </div>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => runQuery()} disabled={loading}>
                {loading ? 'Querying...' : '▶ Run Range Query'}
              </button>
              <button
                type="button"
                className={`btn btn--sm ${syncWithFlights ? 'btn--primary' : 'btn--secondary'}`}
                onClick={handleToggleSync}
              >
                {syncWithFlights ? '✓ Synced Flights' : '⟳ Sync Flights'}
              </button>
            </div>
          </div>

          {/* Educational Point Update */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              Point Update Simulation (does not alter DB):
            </span>
            <input
              type="number"
              className="form-input"
              placeholder="Index"
              value={updateIndex}
              onChange={(e) => setUpdateIndex(e.target.value)}
              aria-label="Update index"
              style={{ width: '80px', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
            />
            <input
              type="number"
              className="form-input"
              placeholder="New Fare ₹"
              value={updateValue}
              onChange={(e) => setUpdateValue(e.target.value)}
              aria-label="Update fare value"
              style={{ width: '110px', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
            />
            <button
              type="button"
              className="btn btn--secondary btn--xs"
              onClick={() => runQuery()}
              disabled={loading || updateIndex === '' || updateValue === ''}
            >
              Apply Update &amp; Re-Query
            </button>
            {(updateIndex !== '' || updateValue !== '') && (
              <button
                type="button"
                className="btn btn--secondary btn--xs"
                onClick={() => { setUpdateIndex(''); setUpdateValue(''); }}
              >
                Clear Update
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              background: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {error}
          </div>
        )}

        <PlaybackControls
          playback={playback}
          title={result?.treeType || 'Fare Analytics'}
          idleMessage="Run a Segment Tree RMQ or Fenwick BIT range query to step through the Java execution."
        />

        {mode === 'segment' ? (
          <SegmentTreeView result={result} steps={steps} stepIndex={playback.stepIndex} />
        ) : (
          <FenwickTreeView result={result} steps={steps} stepIndex={playback.stepIndex} />
        )}
      </div>
    </section>
  );
}
