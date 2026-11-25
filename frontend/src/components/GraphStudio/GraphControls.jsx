import React, { useState } from 'react';

const ALGORITHMS = [
  { id: 'dijkstra', label: 'Dijkstra Shortest Path', needsStart: true, needsTarget: true },
  { id: 'bellman-ford', label: 'Bellman-Ford Shortest Path', needsStart: true, needsTarget: true },
  { id: 'bfs', label: 'Breadth-First Search (BFS)', needsStart: true, needsTarget: false },
  { id: 'dfs', label: 'Depth-First Search (DFS)', needsStart: true, needsTarget: false },
  { id: 'prim', label: "Prim's Minimum Spanning Tree", needsStart: true, needsTarget: false },
  { id: 'kruskal', label: "Kruskal's Minimum Spanning Tree", needsStart: false, needsTarget: false },
  { id: 'floyd-warshall', label: 'Floyd-Warshall All-Pairs', needsStart: false, needsTarget: false },
];

export default function GraphControls({
  nodes = [],
  algorithm,
  onAlgorithmChange,
  startNode,
  onStartNodeChange,
  targetNode,
  onTargetNodeChange,
  syncWithFlights,
  onToggleSync,
  customEdges = [],
  onAddCustomEdge,
  onClearCustomEdges,
  onRun,
  running,
}) {
  const [edgeSrc, setEdgeSrc] = useState('DEL');
  const [edgeDst, setEdgeDst] = useState('BOM');
  const [edgeWeight, setEdgeWeight] = useState('950');

  const meta = ALGORITHMS.find((a) => a.id === algorithm) || ALGORITHMS[0];

  const handleAddEdge = (e) => {
    e.preventDefault();
    const w = parseInt(edgeWeight, 10);
    if (Number.isNaN(w)) return;
    onAddCustomEdge({ source: edgeSrc, destination: edgeDst, weight: w });
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
        gap: 'var(--space-4)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          alignItems: 'end',
        }}
      >
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="graph-algo-select">Algorithm</label>
          <select
            id="graph-algo-select"
            className="form-select"
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value)}
          >
            {ALGORITHMS.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>

        {meta.needsStart && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="graph-start-select">Origin Hub</label>
            <select
              id="graph-start-select"
              className="form-select"
              value={startNode}
              onChange={(e) => onStartNodeChange(e.target.value)}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.id} — {n.city}</option>
              ))}
            </select>
          </div>
        )}

        {meta.needsTarget && (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="graph-target-select">Target Hub</label>
            <select
              id="graph-target-select"
              className="form-select"
              value={targetNode}
              onChange={(e) => onTargetNodeChange(e.target.value)}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.id} — {n.city}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onRun}
            disabled={running}
          >
            {running ? 'Running Java Engine...' : '▶ Run in Java'}
          </button>

          <button
            type="button"
            className={`btn btn--sm ${syncWithFlights ? 'btn--primary' : 'btn--secondary'}`}
            onClick={onToggleSync}
            title="Sync graph corridors with active flight fares from PostgreSQL/H2"
          >
            {syncWithFlights ? '✓ Synced w/ Flights' : '⟳ Sync Flights'}
          </button>
        </div>
      </div>

      {/* Custom Corridor Override / Negative Weight Sandbox */}
      <form
        onSubmit={handleAddEdge}
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
          Custom Corridor Weight:
        </span>
        <select
          className="form-select"
          value={edgeSrc}
          onChange={(e) => setEdgeSrc(e.target.value)}
          aria-label="Custom corridor source"
          style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
        >
          {nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
        </select>
        <span>↔</span>
        <select
          className="form-select"
          value={edgeDst}
          onChange={(e) => setEdgeDst(e.target.value)}
          aria-label="Custom corridor destination"
          style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
        >
          {nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
        </select>
        <input
          type="number"
          className="form-input"
          value={edgeWeight}
          onChange={(e) => setEdgeWeight(e.target.value)}
          placeholder="Weight (km)"
          aria-label="Custom corridor weight"
          style={{ width: '100px', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
        />
        <button type="submit" className="btn btn--secondary btn--xs">
          + Apply Weight
        </button>
        {customEdges.length > 0 && (
          <>
            <span className="badge badge--amber">{customEdges.length} custom</span>
            <button
              type="button"
              className="btn btn--secondary btn--xs"
              onClick={onClearCustomEdges}
            >
              Reset Default
            </button>
          </>
        )}
      </form>
    </div>
  );
}
