import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { usePlayback } from '../shared/usePlayback';
import PlaybackControls from '../shared/PlaybackControls';
import GraphCanvas from './GraphCanvas';
import GraphControls from './GraphControls';
import GraphResults from './GraphResults';

export default function GraphStudio() {
  const [topology, setTopology] = useState({ nodes: [], edges: [], nodeCount: 0, edgeCount: 0, isConnected: true });
  const [algorithm, setAlgorithm] = useState('dijkstra');
  const [startNode, setStartNode] = useState('DEL');
  const [targetNode, setTargetNode] = useState('BLR');
  const [syncWithFlights, setSyncWithFlights] = useState(false);
  const [customEdges, setCustomEdges] = useState([]);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const steps = result?.steps || [];
  const playback = usePlayback(steps, 550);

  const loadTopology = useCallback(async (sync) => {
    try {
      const data = await api.getDsaTopology(sync);
      setTopology(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadTopology(syncWithFlights);
  }, [syncWithFlights, loadTopology]);

  const runAlgorithm = useCallback(async (algoOverride) => {
    const activeAlgo = algoOverride || algorithm;
    setRunning(true);
    setError(null);
    try {
      const payload = {
        startNode,
        targetNode,
        syncWithFlights,
        customEdges: customEdges.length > 0 ? customEdges : undefined,
      };
      let res;
      switch (activeAlgo) {
        case 'bfs': res = await api.runBfs(payload); break;
        case 'dfs': res = await api.runDfs(payload); break;
        case 'dijkstra': res = await api.runDijkstra(payload); break;
        case 'bellman-ford': res = await api.runBellmanFord(payload); break;
        case 'prim': res = await api.runPrim(payload); break;
        case 'kruskal': res = await api.runKruskal(payload); break;
        case 'floyd-warshall': res = await api.runFloydWarshall(payload); break;
        default: res = await api.runDijkstra(payload);
      }
      setResult(res);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setRunning(false);
    }
  }, [algorithm, startNode, targetNode, syncWithFlights, customEdges]);

  // Merge custom edges into displayed topology
  const displayedEdges = React.useMemo(() => {
    const list = [...(topology.edges || [])];
    customEdges.forEach((ce) => {
      const idx = list.findIndex(
        (e) => (e.source === ce.source && e.destination === ce.destination) ||
               (e.source === ce.destination && e.destination === ce.source)
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], weight: ce.weight };
      } else {
        list.push({ id: `${ce.source}-${ce.destination}`, ...ce });
      }
    });
    return list;
  }, [topology.edges, customEdges]);

  const handleNodeClick = (nodeId) => {
    if (algorithm === 'dijkstra' || algorithm === 'bellman-ford') {
      if (nodeId !== startNode) {
        setTargetNode(nodeId);
      }
    } else {
      setStartNode(nodeId);
    }
  };

  return (
    <section id="view-routes" className="view-section is-active" role="tabpanel" aria-labelledby="tab-routes">
      <div className="section-header">
        <span className="section-pretitle">Route Network Topology &amp; Graph Optimization</span>
        <h2 className="section-title"><span>🌐</span> National Route Network &amp; Graph Algorithms Studio</h2>
        <p className="section-desc">
          Interactive route optimization powered by Java 21 <code>com.aeroops.dsa.graph</code>.
          Run BFS, DFS, Dijkstra, Bellman-Ford, Prim MST, Kruskal MST, and Floyd-Warshall across 10 Indian subcontinent hubs.
        </p>
      </div>

      {/* KPI Strip */}
      <div className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Airport Hub Nodes</span>
            <span className="kpi-card__icon" aria-hidden="true">🛫</span>
          </div>
          <div className="kpi-card__value">{topology.nodeCount || 10}</div>
          <p className="kpi-card__subtext">Active vertices in graph</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Air Corridors</span>
            <span className="kpi-card__icon" aria-hidden="true">〰️</span>
          </div>
          <div className="kpi-card__value">{displayedEdges.length || 17}</div>
          <p className="kpi-card__subtext">{syncWithFlights ? 'Synced w/ live flights' : 'Weighted route corridors'}</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Network Connectivity</span>
            <span className="kpi-card__icon" aria-hidden="true">🔗</span>
          </div>
          <div className="kpi-card__value">{topology.isConnected ? 'Connected' : 'Partitioned'}</div>
          <p className="kpi-card__subtext">All hubs reachable</p>
        </article>
        <article className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__label">Active Engine</span>
            <span className="kpi-card__icon" aria-hidden="true">⚡</span>
          </div>
          <div className="kpi-card__value">{result?.algorithm || algorithm.toUpperCase()}</div>
          <p className="kpi-card__subtext">{steps.length > 0 ? `${steps.length} trace steps` : 'Ready to execute'}</p>
        </article>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <GraphControls
          nodes={topology.nodes || []}
          algorithm={algorithm}
          onAlgorithmChange={(a) => { setAlgorithm(a); setResult(null); }}
          startNode={startNode}
          onStartNodeChange={setStartNode}
          targetNode={targetNode}
          onTargetNodeChange={setTargetNode}
          syncWithFlights={syncWithFlights}
          onToggleSync={() => setSyncWithFlights((prev) => !prev)}
          customEdges={customEdges}
          onAddCustomEdge={(edge) => setCustomEdges((prev) => [
            ...prev.filter((e) => !((e.source === edge.source && e.destination === edge.destination) || (e.source === edge.destination && e.destination === edge.source))),
            edge,
          ])}
          onClearCustomEdges={() => setCustomEdges([])}
          onRun={() => runAlgorithm()}
          running={running}
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
            <strong>Validation / Execution Notice:</strong> {error}
          </div>
        )}

        <PlaybackControls
          playback={playback}
          title={result?.algorithm || 'Graph Algorithm'}
          idleMessage="Click 'Run in Java' (or click any airport node on the radar map) to compute and animate the route trace."
        />

        <GraphCanvas
          nodes={topology.nodes || []}
          edges={displayedEdges}
          startNode={startNode}
          targetNode={targetNode}
          currentStep={playback.currentStep}
          finalPath={result?.path || []}
          finalMstEdges={result?.mstEdges || []}
          isComplete={playback.isComplete}
          onNodeClick={handleNodeClick}
        />

        <GraphResults algorithm={algorithm} result={result} currentStep={playback.currentStep} />
      </div>
    </section>
  );
}
