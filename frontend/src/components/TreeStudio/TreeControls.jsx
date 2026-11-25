import React, { useState } from 'react';

const TREE_TYPES = [
  { id: 'bst', label: 'Binary Search Tree (BST)' },
  { id: 'avl', label: 'AVL Self-Balancing Tree' },
  { id: 'btree', label: 'B-Tree (Order t = 3)' },
  { id: 'bplus', label: 'B+ Tree (Order t = 3)' },
];

export default function TreeControls({
  treeType,
  onTreeTypeChange,
  onInsert,
  onSearch,
  onRangeQuery,
  onSyncPassengers,
  onReset,
  loading,
  syncedPassengers,
}) {
  const [keyInput, setKeyInput] = useState('');
  const [rangeLow, setRangeLow] = useState('25');
  const [rangeHigh, setRangeHigh] = useState('65');

  const handleInsert = (e) => {
    e.preventDefault();
    const val = parseInt(keyInput, 10);
    if (Number.isNaN(val)) return;
    onInsert(val);
    setKeyInput('');
  };

  const handleSearch = () => {
    const val = parseInt(keyInput, 10);
    if (Number.isNaN(val)) return;
    onSearch(val);
  };

  const handleRange = (e) => {
    e.preventDefault();
    const low = parseInt(rangeLow, 10);
    const high = parseInt(rangeHigh, 10);
    if (Number.isNaN(low) || Number.isNaN(high)) return;
    onRangeQuery(low, high);
  };

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
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div className="form-group" style={{ marginBottom: 0, minWidth: '220px' }}>
          <label className="form-label" htmlFor="tree-type-select">Index Structure</label>
          <select
            id="tree-type-select"
            className="form-select"
            value={treeType}
            onChange={(e) => onTreeTypeChange(e.target.value)}
          >
            {TREE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleInsert} style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="tree-key-input">Passenger / Record Key</label>
            <input
              id="tree-key-input"
              type="number"
              className="form-input"
              placeholder="e.g. 112"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              style={{ width: '130px' }}
            />
          </div>
          <button type="submit" className="btn btn--primary btn--sm" disabled={loading || !keyInput}>
            + Insert
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={handleSearch} disabled={loading || !keyInput}>
            🔍 Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn--sm ${syncedPassengers ? 'btn--primary' : 'btn--secondary'}`}
            onClick={onSyncPassengers}
            disabled={loading}
          >
            {syncedPassengers ? '✓ Passenger IDs Synced' : '⟳ Sync Passenger IDs'}
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onReset} disabled={loading}>
            ⟲ Reset Demo Keys
          </button>
        </div>
      </div>

      {treeType === 'bplus' && (
        <form
          onSubmit={handleRange}
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
            B+ Tree Sequential Leaf Range Scan:
          </span>
          <input
            type="number"
            className="form-input"
            value={rangeLow}
            onChange={(e) => setRangeLow(e.target.value)}
            aria-label="Range lower bound"
            style={{ width: '84px', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
          />
          <span>to</span>
          <input
            type="number"
            className="form-input"
            value={rangeHigh}
            onChange={(e) => setRangeHigh(e.target.value)}
            aria-label="Range upper bound"
            style={{ width: '84px', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
          />
          <button type="submit" className="btn btn--primary btn--xs" disabled={loading}>
            Run Range Scan
          </button>
        </form>
      )}
    </div>
  );
}
