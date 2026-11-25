import React from 'react';

export default function BenchmarkView({ benchmark }) {
  if (!benchmark || !benchmark.metrics) return null;

  const entries = Object.entries(benchmark.metrics);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h4 className="text-heading" style={{ fontSize: 'var(--text-sm)' }}>
            Head-to-Head Java Benchmark ({benchmark.datasetSize?.toLocaleString()} items • {benchmark.distribution} distribution)
          </h4>
          <p className="text-xs text-muted">
            Executed inside JVM after JIT warmup; compares Merge Sort, Quick Sort (Lomuto), and Heap Sort.
          </p>
        </div>
        <span className="badge badge--green">Fastest: {benchmark.winner}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
        {entries.map(([name, m]) => {
          const isWinner = name === benchmark.winner;
          return (
            <div
              key={name}
              style={{
                background: isWinner ? 'rgba(52, 211, 153, 0.08)' : 'rgba(20, 18, 26, 0.7)',
                border: `1px solid ${isWinner ? '#34D399' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-heading)' }}>{name}</strong>
                {isWinner && <span className="badge badge--green" style={{ fontSize: '0.65rem' }}>Winner</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <div>Time: <span style={{ color: '#F2A65A' }}>{m.timeFormatted}</span></div>
                <div>Comparisons: <span style={{ color: 'var(--color-text-primary)' }}>{m.comparisons?.toLocaleString()}</span></div>
                <div>Swaps / Moves: <span style={{ color: 'var(--color-text-primary)' }}>{m.swapsOrMoves?.toLocaleString()}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
