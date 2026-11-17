import React, { useState } from 'react';
import { api } from '../../services/api';

export default function DsaStudioPreview({ viewType }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testDsaApi = async () => {
    try {
      setTesting(true);
      const res = await api.getDsaTopology(false);
      setTestResult({
        success: true,
        message: `Java Graph Engine verified! Loaded ${res.nodeCount} airport hubs, ${res.edgeCount} national air corridors (Connected: ${res.isConnected}).`,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: `DSA Engine test failed: ${err.message}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const config = {
    routes: {
      pretitle: 'Route Network Topology & Graph Optimization',
      title: 'National Route Network & Graph Algorithms Studio',
      desc: 'Interactive route optimization and pathfinding suite backed by Java com.aeroops.dsa.graph. Exposes Dijkstra, Bellman-Ford, Prim MST, Kruskal MST, BFS, DFS, and Floyd-Warshall over 10 Indian subcontinent airport hubs and 17 commercial corridors.',
      endpoints: [
        'POST /api/v1/dsa/graph/topology',
        'POST /api/v1/dsa/graph/dijkstra',
        'POST /api/v1/dsa/graph/bellman-ford',
        'POST /api/v1/dsa/graph/prim',
        'POST /api/v1/dsa/graph/kruskal',
        'POST /api/v1/dsa/graph/floyd-warshall',
        'POST /api/v1/dsa/graph/bfs',
        'POST /api/v1/dsa/graph/dfs',
      ],
      icon: '🌐',
      kpis: [
        { label: 'Airport Hub Nodes', val: '10', sub: 'Vertices (DEL, BOM, BLR...)' },
        { label: 'Air Corridors', val: '17', sub: 'Weighted route corridors' },
        { label: 'Dijkstra Minimum', val: '1,740 km', sub: 'DEL ➔ BLR direct sector' },
        { label: 'National MST', val: '4,465 km', sub: 'Prim & Kruskal verified' },
      ],
    },
    'tree-index': {
      pretitle: 'Commercial Flight Record & Passenger Indexing',
      title: 'Multiway Tree Indexing Studio',
      desc: 'Hierarchical database indexing structures backed by Java com.aeroops.dsa.tree. Implements Binary Search Tree (BST), Self-Balancing AVL Tree (with LL, RR, LR, RL rotations), B-Tree (t=3), and B+ Tree (t=3) with horizontal sequential leaf linking and range queries.',
      endpoints: [
        'POST /api/v1/dsa/trees/bst',
        'POST /api/v1/dsa/trees/avl',
        'POST /api/v1/dsa/trees/btree',
        'POST /api/v1/dsa/trees/bplus',
        'POST /api/v1/dsa/trees/bplus/range',
      ],
      icon: '🌲',
      kpis: [
        { label: 'Index Architecture', val: 'B+ Tree', sub: 'Sequential leaf chain' },
        { label: 'Minimum Degree', val: 't = 3', sub: 'Max 5 keys / 6 children' },
        { label: 'AVL Invariant', val: '|BF| ≤ 1', sub: 'Self-balancing rotations' },
        { label: 'Range Search', val: 'O(log N + K)', sub: 'Sequential leaf traversal' },
      ],
    },
    'fare-analytics': {
      pretitle: 'Statistical Fare Distribution & Comparative Sorting',
      title: 'Fare Analytics & Sorting Benchmark Studio',
      desc: 'Real-time fare query and sorting analytics backed by Java com.aeroops.dsa.analytics and com.aeroops.dsa.sorting. Implements 4N Segment Tree (RMQ), 1-based Fenwick Tree (BIT prefix/range sums), and head-to-head benchmarking of Merge, Quick (Lomuto pivot), and Heap Sort.',
      endpoints: [
        'POST /api/v1/dsa/analytics/segment-tree',
        'POST /api/v1/dsa/analytics/fenwick-tree',
        'GET /api/v1/dsa/analytics/fares',
        'POST /api/v1/dsa/sorting/sort',
        'POST /api/v1/dsa/sorting/benchmark',
      ],
      icon: '📊',
      kpis: [
        { label: 'Segment Tree RMQ', val: 'O(log N)', sub: '4N binary heap array' },
        { label: 'Fenwick Tree BIT', val: 'O(log N)', sub: 'LSB bitwise updates' },
        { label: 'Sorting Algorithms', val: '3 Engines', sub: 'Merge, Quick, Heap' },
        { label: 'Lomuto Pivot', val: 'fares[high]', sub: 'Strict academic partition' },
      ],
    },
  }[viewType] || {
    pretitle: 'Data Structures & Algorithms Engine',
    title: 'AEROOPS DSA Studio',
    desc: 'Java 21 DSA REST Engine.',
    endpoints: [],
    icon: '⚡',
    kpis: [],
  };

  return (
    <section className="view-section is-active" role="tabpanel">
      <div className="section-header">
        <span className="section-pretitle">{config.pretitle}</span>
        <h2 className="section-title">
          <span>{config.icon}</span> {config.title}
        </h2>
        <p className="section-desc">{config.desc}</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {config.kpis.map((kpi, idx) => (
          <article key={idx} className="kpi-card">
            <div className="kpi-card__header">
              <span className="kpi-card__label">{kpi.label}</span>
              <span className="kpi-card__icon" aria-hidden="true">{config.icon}</span>
            </div>
            <div className="kpi-card__value">{kpi.val}</div>
            <p className="kpi-card__subtext">{kpi.sub}</p>
          </article>
        ))}
      </div>

      {/* Stage 5 Notice & Telemetry Card */}
      <article className="console-card">
        <div className="console-card__header">
          <div>
            <h3 className="console-card__title">
              <span>⚡</span> Stage 5 Interactive Visualizer Engine Ready
            </h3>
            <p className="console-card__desc">
              The backend Java 21 DSA Engine is fully implemented and operational under Spring Boot. Interactive canvas visualizers will be migrated in Stage 5.
            </p>
          </div>
          <div className="flight-toolbar__actions">
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={testDsaApi}
              disabled={testing}
            >
              <span>🧪</span> {testing ? 'Testing API...' : 'Test Java DSA Endpoint'}
            </button>
          </div>
        </div>

        {testResult && (
          <div
            style={{
              margin: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${testResult.success ? '#10b981' : '#ef4444'}`,
              color: testResult.success ? '#6ee7b7' : '#fca5a5',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {testResult.success ? '✅ ' : '⚠️ '}
            {testResult.message}
          </div>
        )}

        <div style={{ padding: 'var(--space-5)' }}>
          <h4
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-heading)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Connected Spring Boot REST Endpoints (Ready for Stage 5 Visualizers)
          </h4>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-3)',
            }}
          >
            {config.endpoints.map((ep, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--color-bg-card)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{ep}</span>
                <span className="badge badge--green" style={{ fontSize: '0.65rem' }}>Active</span>
              </div>
            ))}
          </div>

          <div
            className="upcoming-box"
            style={{
              borderStyle: 'dashed',
              textAlign: 'center',
              padding: 'var(--space-6)',
              marginTop: 'var(--space-5)',
              background: 'rgba(56, 189, 248, 0.03)',
            }}
          >
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: 'var(--space-2)' }}>🎨</span>
            <strong className="text-heading" style={{ fontSize: 'var(--text-base)', display: 'block' }}>
              Stage 5: React Visualizer Migration
            </strong>
            <p className="text-xs text-muted" style={{ maxWidth: '580px', margin: '0.5rem auto 0 auto' }}>
              Full SVG route topology canvases, tree hierarchy nodes, rotation animations, and sorting race bars will consume these Spring Boot endpoints in Stage 5.
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
