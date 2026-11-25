import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { usePlayback } from '../shared/usePlayback';
import PlaybackControls from '../shared/PlaybackControls';
import TreeCanvas from './TreeCanvas';
import TreeControls from './TreeControls';

const DEFAULT_KEYS = {
  bst: [105, 102, 107, 101, 104, 106, 109],
  avl: [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111],
  btree: [10, 20, 30, 40, 50, 60],
  bplus: [10, 20, 30, 40, 50, 60, 70, 80],
};

export default function TreeStudio({ passengers = [] }) {
  const [treeType, setTreeType] = useState('bst');
  const [keys, setKeys] = useState(DEFAULT_KEYS.bst);
  const [syncedPassengers, setSyncedPassengers] = useState(false);
  const [result, setResult] = useState(null);
  const [rangeResult, setRangeResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const steps = rangeResult?.steps || result?.steps || [];
  const playback = usePlayback(steps, 500);

  const executeTree = useCallback(async (type, payload) => {
    setLoading(true);
    setError(null);
    setRangeResult(null);
    try {
      let res;
      switch (type) {
        case 'avl': res = await api.runAvl(payload); break;
        case 'btree': res = await api.runBTree(payload); break;
        case 'bplus': res = await api.runBPlusTree(payload); break;
        case 'bst':
        default: res = await api.runBst(payload); break;
      }
      setResult(res);
      return res;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = syncedPassengers && passengers.length > 0
      ? passengers.map((p) => p.passengerId).slice(0, 64)
      : DEFAULT_KEYS[treeType];
    setKeys(initial);
    executeTree(treeType, { initialKeys: initial });
  }, [treeType, syncedPassengers, executeTree]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInsert = async (insertKey) => {
    if (keys.includes(insertKey)) {
      setError(`Duplicate key ${insertKey} already exists in ${treeType.toUpperCase()} index.`);
      await executeTree(treeType, { initialKeys: keys, insertKey });
      return;
    }
    const res = await executeTree(treeType, { initialKeys: keys, insertKey });
    if (res) {
      setKeys((prev) => [...prev, insertKey]);
    }
  };

  const handleSearch = async (searchKey) => {
    await executeTree(treeType, { initialKeys: keys, searchKey });
  };

  const handleRangeQuery = async (rangeLow, rangeHigh) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runBPlusRange({ initialKeys: keys, rangeLow, rangeHigh });
      setRangeResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSyncedPassengers(false);
    const def = DEFAULT_KEYS[treeType];
    setKeys(def);
    executeTree(treeType, { initialKeys: def });
  };

  return (
    <section id="view-tree-index" className="view-section is-active" role="tabpanel" aria-labelledby="tab-tree-index">
      <div className="section-header">
        <span className="section-pretitle">Commercial Flight Record &amp; Passenger Indexing</span>
        <h2 className="section-title"><span>🌲</span> Multiway Tree Indexing Studio</h2>
        <p className="section-desc">
          Database indexing structures backed by Java 21 <code>com.aeroops.dsa.tree</code>:
          Binary Search Tree, Self-Balancing AVL Tree (LL/RR/LR/RL rotations), B-Tree (t=3), and B+ Tree (t=3) with sequential leaf scan.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Index Structure</span>
            <span className="kpi-card__icon" aria-hidden="true">🌲</span>
          </div>
          <div className="kpi-card__value">{result?.treeType || treeType.toUpperCase()}</div>
          <p className="kpi-card__subtext">{treeType === 'btree' || treeType === 'bplus' ? 'Minimum degree t = 3' : 'Binary node hierarchy'}</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Indexed Keys</span>
            <span className="kpi-card__icon" aria-hidden="true">🔑</span>
          </div>
          <div className="kpi-card__value">{result?.nodeCount ?? keys.length}</div>
          <p className="kpi-card__subtext">Active keys in index</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Tree Height</span>
            <span className="kpi-card__icon" aria-hidden="true">📏</span>
          </div>
          <div className="kpi-card__value">{result?.height ?? 0}</div>
          <p className="kpi-card__subtext">{treeType === 'avl' ? 'Balanced |BF| ≤ 1' : 'Max root-to-leaf depth'}</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">{treeType === 'avl' ? 'Last Rotation' : 'Search Status'}</span>
            <span className="kpi-card__icon" aria-hidden="true">🔄</span>
          </div>
          <div className="kpi-card__value" style={{ fontSize: 'var(--text-base)' }}>
            {treeType === 'avl'
              ? (result?.lastRotation || 'None')
              : result?.found === true
                ? 'Key Found'
                : result?.found === false
                  ? 'Not Found'
                  : 'Ready'}
          </div>
          <p className="kpi-card__subtext">Java backend verified</p>
        </article>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <TreeControls
          treeType={treeType}
          onTreeTypeChange={(t) => { setError(null); setTreeType(t); }}
          onInsert={handleInsert}
          onSearch={handleSearch}
          onRangeQuery={handleRangeQuery}
          onSyncPassengers={() => setSyncedPassengers((p) => !p)}
          onReset={handleReset}
          loading={loading}
          syncedPassengers={syncedPassengers}
        />

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
          title={`${result?.treeType || treeType.toUpperCase()} Trace`}
          idleMessage="Insert or search a key to step through the Java tree indexing trace."
        />

        <TreeCanvas
          treeType={treeType}
          root={result?.root}
          currentStep={playback.currentStep}
          searchPath={result?.searchPath || []}
          found={result?.found}
          matchedKeys={rangeResult?.matchedKeys || []}
        />

        {/* Traversals & Range Results */}
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
          {rangeResult && (
            <div>
              <h4 className="text-heading" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                Range Scan [{rangeResult.low}, {rangeResult.high}] Matched Keys ({rangeResult.matchedKeys?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {rangeResult.matchedKeys?.length > 0 ? (
                  rangeResult.matchedKeys.map((k) => (
                    <span key={k} className="badge badge--green" style={{ fontFamily: 'var(--font-mono)' }}>{k}</span>
                  ))
                ) : (
                  <span className="text-xs text-muted">No keys matched within range.</span>
                )}
              </div>
            </div>
          )}

          {result?.traversals && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
              {Object.entries(result.traversals).map(([name, list]) => (
                <div
                  key={name}
                  style={{
                    background: 'rgba(20, 18, 26, 0.7)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent)',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                    [{(list || []).join(', ')}]
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
