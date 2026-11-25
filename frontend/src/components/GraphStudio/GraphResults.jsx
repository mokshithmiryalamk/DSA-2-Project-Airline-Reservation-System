import React from 'react';

export default function GraphResults({ algorithm, result, currentStep }) {
  if (!result) return null;

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
      {/* Traversal Summary (BFS / DFS) */}
      {(algorithm === 'bfs' || algorithm === 'dfs') && Array.isArray(result.visitedOrder) && (
        <div>
          <h4 className="text-heading" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
            {result.algorithm} Traversal Order ({result.totalVisited} hubs visited from {result.startNode})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {result.visitedOrder.map((hub, idx) => (
              <span key={hub} className="badge badge--amber" style={{ fontFamily: 'var(--font-mono)' }}>
                {idx + 1}. {hub}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Shortest Path Summary (Dijkstra / Bellman-Ford) */}
      {(algorithm === 'dijkstra' || algorithm === 'bellman-ford') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <h4 className="text-heading" style={{ fontSize: 'var(--text-sm)' }}>
              {result.algorithm}: {result.startNode} ➔ {result.targetNode}
            </h4>
            {result.hasNegativeCycle ? (
              <span className="badge badge--coral">Negative Cycle Detected</span>
            ) : result.reachable ? (
              <span className="badge badge--green">
                Optimal Distance: {result.totalDistance?.toLocaleString()} km
              </span>
            ) : (
              <span className="badge badge--coral">Unreachable</span>
            )}
          </div>

          {Array.isArray(result.path) && result.path.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
              {result.path.map((hub, i) => (
                <React.Fragment key={`${hub}-${i}`}>
                  <span className="badge badge--green">{hub}</span>
                  {i < result.path.length - 1 && <span>➔</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {currentStep?.distances && Object.keys(currentStep.distances).length > 0 && (
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                Distance Table at Current Step:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 'var(--space-2)' }}>
                {Object.entries(currentStep.distances).map(([hub, dist]) => (
                  <div
                    key={hub}
                    style={{
                      background: 'rgba(20, 18, 26, 0.7)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.35rem 0.5rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>{hub}</span>
                    <span style={{ color: dist >= 2147483647 ? '#756A82' : '#F2A65A' }}>
                      {dist >= 2147483647 ? '∞' : `${dist} km`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MST Summary (Prim / Kruskal) */}
      {(algorithm === 'prim' || algorithm === 'kruskal') && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <h4 className="text-heading" style={{ fontSize: 'var(--text-sm)' }}>
              {result.algorithm} Minimum Spanning Tree
            </h4>
            <span className="badge badge--green">
              Total Network Weight: {result.totalWeight?.toLocaleString()} km ({result.mstEdges?.length || 0} corridors)
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {(result.mstEdges || []).map((e) => (
              <span key={e.id} className="badge badge--amber" style={{ fontFamily: 'var(--font-mono)' }}>
                {e.source}—{e.destination} ({e.weight} km)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Floyd-Warshall All-Pairs Matrix */}
      {algorithm === 'floyd-warshall' && result.distanceMatrix && Array.isArray(result.nodeIds) && (
        <div>
          <h4 className="text-heading" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
            Floyd-Warshall All-Pairs Shortest Path Matrix (km)
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th>From \ To</th>
                  {result.nodeIds.map((col) => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {result.nodeIds.map((row) => (
                  <tr key={row}>
                    <td style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{row}</td>
                    {result.nodeIds.map((col) => {
                      const val = result.distanceMatrix[row]?.[col];
                      return (
                        <td key={col} style={{ color: val === 0 ? '#34D399' : val < 0 ? '#756A82' : undefined }}>
                          {val < 0 ? '∞' : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
