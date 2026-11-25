import React from 'react';

export default function SortingCanvas({ result, currentStep, isComplete }) {
  const values = currentStep?.currentArray || (isComplete ? result?.sortedArray : result?.originalArray) || [];
  if (!values || values.length === 0) return null;

  const maxVal = Math.max(...values, 1);
  const idx1 = currentStep?.index1 ?? -1;
  const idx2 = currentStep?.index2 ?? -1;
  const action = currentStep?.action || '';

  return (
    <div className="sorting-bars-chart" role="img" aria-label="Animated sorting bar chart">
      {values.map((val, idx) => {
        const heightPct = Math.max(12, Math.round((val / maxVal) * 86));
        let modClass = '';

        if (isComplete) {
          modClass = 'sorting-bar--sorted';
        } else if (idx === idx1 || idx === idx2) {
          if (action.includes('pivot') || action.includes('lomuto')) {
            modClass = idx === idx1 ? 'sorting-bar--pivot' : 'sorting-bar--comparing';
          } else if (action.includes('swap') || action.includes('merge') || action.includes('extract')) {
            modClass = 'sorting-bar--swapped';
          } else {
            modClass = 'sorting-bar--comparing';
          }
        }

        return (
          <div key={idx} className="sorting-bar-col">
            <div className={`sorting-bar ${modClass}`} style={{ height: `${heightPct}%` }}>
              <span className="sorting-bar-val">₹{Math.round(val)}</span>
            </div>
            <div className="sorting-bar-label">
              <span className="sorting-idx">[{idx}]</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
