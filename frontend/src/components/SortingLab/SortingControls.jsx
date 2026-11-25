import React from 'react';

const ALGORITHMS = [
  { id: 'MERGE', label: 'Merge Sort (O(N log N) Stable)' },
  { id: 'QUICK', label: 'Quick Sort (Lomuto fares[high] Pivot)' },
  { id: 'HEAP', label: 'Heap Sort (Max-Heap In-Place)' },
];

const DISTRIBUTIONS = [
  { id: 'random', label: 'Random Fares' },
  { id: 'sorted', label: 'Already Sorted' },
  { id: 'reverse', label: 'Reverse Sorted' },
  { id: 'duplicates', label: 'Heavy Duplicates' },
];

export default function SortingControls({
  algorithm,
  onAlgorithmChange,
  distribution,
  onDistributionChange,
  customInput,
  onCustomInputChange,
  onUseDistribution,
  syncWithFlights,
  onToggleSync,
  onRunSort,
  onRunBenchmark,
  benchmarkSize,
  onBenchmarkSizeChange,
  loading,
}) {
  return (
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 'var(--space-3)',
          alignItems: 'end',
        }}
      >
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="sort-algo-select">Sorting Algorithm</label>
          <select
            id="sort-algo-select"
            className="form-select"
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value)}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="sort-dist-select">Preset Distribution</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <select
              id="sort-dist-select"
              className="form-select"
              value={distribution}
              onChange={(e) => onDistributionChange(e.target.value)}
            >
              {DISTRIBUTIONS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
            <button type="button" className="btn btn--secondary btn--xs" onClick={onUseDistribution} disabled={loading}>
              Load
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--primary btn--sm" onClick={onRunSort} disabled={loading}>
            {loading ? 'Sorting...' : '▶ Run Sort in Java'}
          </button>
          <button
            type="button"
            className={`btn btn--sm ${syncWithFlights ? 'btn--primary' : 'btn--secondary'}`}
            onClick={onToggleSync}
          >
            {syncWithFlights ? '✓ Synced Flights' : '⟳ Sync Flights'}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--color-border)',
          fontSize: 'var(--text-xs)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '1 1 320px' }}>
          <label htmlFor="sort-custom-input" style={{ color: 'var(--color-text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Custom Fares:
          </label>
          <input
            id="sort-custom-input"
            type="text"
            className="form-input"
            value={customInput}
            onChange={(e) => onCustomInputChange(e.target.value)}
            placeholder="e.g. 5200, 3900, 7200, 4800, 6100"
            style={{ padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <label htmlFor="bench-size-select" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Benchmark N:
          </label>
          <select
            id="bench-size-select"
            className="form-select"
            value={benchmarkSize}
            onChange={(e) => onBenchmarkSizeChange(Number(e.target.value))}
            style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
          >
            <option value={100}>100 items</option>
            <option value={500}>500 items</option>
            <option value={2000}>2,000 items</option>
            <option value={5000}>5,000 items</option>
          </select>
          <button type="button" className="btn btn--secondary btn--xs" onClick={onRunBenchmark} disabled={loading}>
            ⚡ Run 3-Way Java Benchmark
          </button>
        </div>
      </div>
    </div>
  );
}
