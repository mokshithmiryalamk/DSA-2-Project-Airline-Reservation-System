import React from 'react';

export default function FenwickTreeView({ result, steps = [], stepIndex = -1 }) {
  if (!result || !result.currentFares || !result.treeArray) return null;

  const visitedBitIndices = new Set();
  let activeBitIdx = null;
  for (let i = 0; i <= stepIndex && i < steps.length; i++) {
    const s = steps[i];
    if (s.nodeIndex > 0) {
      visitedBitIndices.add(s.nodeIndex);
      if (i === stepIndex) activeBitIdx = s.nodeIndex;
    }
  }

  return (
    <div className="fenwick-display-area">
      <div>
        <h4 className="text-heading" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          0-Based Input Fares Array (Client View)
        </h4>
        <div className="fenwick-row">
          <div className="fenwick-cells-wrapper">
            {result.currentFares.map((fare, idx) => {
              const inQueryRange = idx >= result.queryLeft && idx <= result.queryRight;
              return (
                <div
                  key={idx}
                  className={`fenwick-cell fenwick-cell--client ${inQueryRange ? 'fenwick-cell--visited' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span className="fenwick-cell-idx">idx [{idx}]</span>
                  <span className="fenwick-cell-val">₹{Math.round(fare).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-heading" style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          1-Based Fenwick Tree (BIT Array with LSB Responsibilities)
        </h4>
        <div className="fenwick-row">
          <div className="fenwick-cells-wrapper">
            {result.treeArray.slice(1).map((val, zeroIdx) => {
              const bitIdx = zeroIdx + 1;
              const lsb = bitIdx & -bitIdx;
              const coverStart = bitIdx - lsb;
              const coverEnd = bitIdx - 1;
              const isCurrent = bitIdx === activeBitIdx;
              const isVisited = visitedBitIndices.has(bitIdx);

              return (
                <div
                  key={bitIdx}
                  className={`fenwick-cell fenwick-cell--bit ${isCurrent ? 'fenwick-cell--current' : isVisited ? 'fenwick-cell--visited' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}
                >
                  <span className="fenwick-cell-idx">BIT[{bitIdx}]</span>
                  <span className="fenwick-binary">{bitIdx.toString(2).padStart(4, '0')}</span>
                  <span className="fenwick-cell-val">₹{Math.round(val).toLocaleString()}</span>
                  <span className="fenwick-cell-range">[{coverStart}..{coverEnd}]</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
