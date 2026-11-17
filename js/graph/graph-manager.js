/**
 * AEROOPS: Route Network & Graph Algorithm Manager (Stage 3)
 *
 * Coordinates graph state, algorithm execution, interactive playback,
 * step-by-step progress logging, and Floyd-Warshall matrix visualization.
 */

(function (window) {
  'use strict';

  const graphData = window.AeroGraphData.instance;
  const algorithms = window.AeroGraphAlgorithms;
  const toast = window.AeroToast;

  class GraphManager {
    constructor() {
      this.visualizer = null;
      this.currentAlgorithm = 'dijkstra';
      this.currentStartId = 'DEL';
      this.currentTargetId = 'BLR';

      // Execution Playback State
      this.executionResult = null;
      this.currentStepIndex = -1;
      this.playbackTimer = null;
      this.playbackSpeedMs = 700;
      this.isPlaying = false;
    }

    init() {
      this.cacheDOMElements();

      // Initialize Visualizer
      this.visualizer = new window.AeroGraphVisualizer('route-network-canvas-container', {
        onNodeClick: (nodeId) => this.handleCanvasNodeClick(nodeId)
      });
      this.visualizer.setGraph(graphData);
      this.visualizer.setSelections(this.currentStartId, this.currentTargetId);

      this.populateNodeDropdowns();
      this.bindEvents();
      this.updateNetworkOverview();
      this.updateAlgorithmControlsUI();

      // Optional initial run of default algorithm
      this.runCurrentAlgorithm(false);
    }

    cacheDOMElements() {
      this.algoSelect = document.getElementById('graph-algo-select');
      this.startSelect = document.getElementById('graph-start-node');
      this.targetSelect = document.getElementById('graph-target-node');
      this.targetGroup = document.getElementById('graph-target-group');
      this.speedSelect = document.getElementById('graph-playback-speed');

      // Buttons
      this.btnRun = document.getElementById('btn-graph-run');
      this.btnStep = document.getElementById('btn-graph-step');
      this.btnPlay = document.getElementById('btn-graph-play');
      this.btnReset = document.getElementById('btn-graph-reset');
      this.btnSyncFlights = document.getElementById('btn-sync-graph-flights');

      // Badges & Counters
      this.statusBadge = document.getElementById('graph-exec-status');
      this.stepCounter = document.getElementById('graph-step-counter');
      this.logContainer = document.getElementById('graph-step-logs');

      // Results Panel
      this.resSummary = document.getElementById('graph-result-summary');
      this.resDetails = document.getElementById('graph-result-details');
      this.resCost = document.getElementById('graph-result-cost');
      this.algoComplexityBadge = document.getElementById('graph-algo-complexity');
      this.matrixContainer = document.getElementById('graph-matrix-container');

      // Overview KPIs
      this.kpiNodeCount = document.getElementById('kpi-network-nodes');
      this.kpiEdgeCount = document.getElementById('kpi-network-edges');
      this.kpiConnectivity = document.getElementById('kpi-network-connectivity');
    }

    bindEvents() {
      // Algorithm Selection
      if (this.algoSelect) {
        this.algoSelect.addEventListener('change', (e) => {
          this.currentAlgorithm = e.target.value;
          this.updateAlgorithmControlsUI();
          this.resetPlayback();
          this.runCurrentAlgorithm(false);
        });
      }

      // Start Node Selection
      if (this.startSelect) {
        this.startSelect.addEventListener('change', (e) => {
          this.currentStartId = e.target.value;
          this.visualizer.setSelections(this.currentStartId, this.currentTargetId);
          this.resetPlayback();
        });
      }

      // Target Node Selection
      if (this.targetSelect) {
        this.targetSelect.addEventListener('change', (e) => {
          this.currentTargetId = e.target.value;
          this.visualizer.setSelections(this.currentStartId, this.currentTargetId);
          this.resetPlayback();
        });
      }

      // Playback Speed
      if (this.speedSelect) {
        this.speedSelect.addEventListener('change', (e) => {
          this.playbackSpeedMs = parseInt(e.target.value, 10) || 700;
          if (this.isPlaying) {
            this.pausePlayback();
            this.startPlayback();
          }
        });
      }

      // Run Button
      if (this.btnRun) {
        this.btnRun.addEventListener('click', () => {
          this.pausePlayback();
          this.runCurrentAlgorithm(true);
        });
      }

      // Step Forward Button
      if (this.btnStep) {
        this.btnStep.addEventListener('click', () => {
          this.pausePlayback();
          this.stepForward();
        });
      }

      // Play / Pause Toggle Button
      if (this.btnPlay) {
        this.btnPlay.addEventListener('click', () => {
          if (this.isPlaying) {
            this.pausePlayback();
          } else {
            this.startPlayback();
          }
        });
      }

      // Reset Button
      if (this.btnReset) {
        this.btnReset.addEventListener('click', () => {
          this.resetPlayback();
          this.visualizer.resetVisualization();
          toast.info('Route Network visualization reset to baseline graph state.');
        });
      }

      // Synchronize with Stage 2 Flight Data
      if (this.btnSyncFlights) {
        this.btnSyncFlights.addEventListener('click', () => {
          if (window.AeroDataStore) {
            const flights = window.AeroDataStore.getFlights();
            graphData.syncFromFlights(flights);
            this.visualizer.render();
            this.populateNodeDropdowns();
            this.updateNetworkOverview();
            toast.success(`Synchronized ${flights.length} commercial flight sectors into network topology.`);
          }
        });
      }
    }

    populateNodeDropdowns() {
      const nodes = graphData.getNodes();

      const populate = (selectEl, currentVal) => {
        if (!selectEl) return;
        selectEl.innerHTML = '';
        nodes.forEach(n => {
          const opt = document.createElement('option');
          opt.value = n.id;
          opt.textContent = `${n.id} &mdash; ${n.city} (${n.name})`;
          if (n.id === currentVal) opt.selected = true;
          selectEl.appendChild(opt);
        });
      };

      populate(this.startSelect, this.currentStartId);
      populate(this.targetSelect, this.currentTargetId);
    }

    updateNetworkOverview() {
      const stats = graphData.getStats();
      if (this.kpiNodeCount) this.kpiNodeCount.textContent = stats.nodeCount;
      if (this.kpiEdgeCount) this.kpiEdgeCount.textContent = stats.edgeCount;
      if (this.kpiConnectivity) {
        this.kpiConnectivity.textContent = stats.isConnected ? 'Connected' : 'Partitioned';
        this.kpiConnectivity.className = stats.isConnected ? 'badge badge--green' : 'badge badge--amber';
      }
    }

    updateAlgorithmControlsUI() {
      const isPointToPoint = (this.currentAlgorithm === 'dijkstra' || this.currentAlgorithm === 'bellman_ford');
      const isStartRequired = (this.currentAlgorithm !== 'kruskal_mst' && this.currentAlgorithm !== 'floyd_warshall');

      if (this.targetGroup) {
        this.targetGroup.style.display = isPointToPoint ? 'block' : 'none';
      }

      if (this.startSelect) {
        this.startSelect.parentElement.style.display = isStartRequired ? 'block' : 'none';
      }

      // Complexity Badges
      const complexityMap = {
        dijkstra: { time: 'O((V + E) log V)', space: 'O(V)', label: "Dijkstra Shortest Path" },
        bellman_ford: { time: 'O(V · E)', space: 'O(V)', label: "Bellman-Ford Shortest Path" },
        prim_mst: { time: 'O(E log V)', space: 'O(V + E)', label: "Prim's Minimum Spanning Tree" },
        kruskal_mst: { time: 'O(E log E)', space: 'O(V + E)', label: "Kruskal's Minimum Spanning Tree" },
        bfs: { time: 'O(V + E)', space: 'O(V)', label: "Breadth-First Search" },
        dfs: { time: 'O(V + E)', space: 'O(V)', label: "Depth-First Search" },
        floyd_warshall: { time: 'O(V³)', space: 'O(V²)', label: "Floyd-Warshall All-Pairs" }
      };

      const meta = complexityMap[this.currentAlgorithm] || { time: 'O(V + E)', space: 'O(V)', label: '' };
      if (this.algoComplexityBadge) {
        this.algoComplexityBadge.innerHTML = `
          <span class="badge badge--dark-pill">${meta.label}</span>
          <span class="badge badge--accent font-mono">Time: ${meta.time}</span>
          <span class="badge badge--secondary font-mono">Space: ${meta.space}</span>
        `;
      }
    }

    handleCanvasNodeClick(nodeId) {
      if (!nodeId) return;

      const isPointToPoint = (this.currentAlgorithm === 'dijkstra' || this.currentAlgorithm === 'bellman_ford');

      if (isPointToPoint) {
        if (!this.currentStartId || (this.currentStartId && this.currentTargetId)) {
          this.currentStartId = nodeId;
          this.currentTargetId = null;
          toast.info(`Selected ${nodeId} as Origin Hub. Click another hub for Destination.`);
        } else if (this.currentStartId && !this.currentTargetId) {
          if (nodeId === this.currentStartId) {
            toast.warning('Origin and destination cannot be identical.');
            return;
          }
          this.currentTargetId = nodeId;
          toast.success(`Selected route: ${this.currentStartId} ➔ ${this.currentTargetId}.`);
        }
      } else {
        this.currentStartId = nodeId;
        toast.info(`Selected starting airport: ${nodeId}.`);
      }

      if (this.startSelect) this.startSelect.value = this.currentStartId || '';
      if (this.targetSelect && this.currentTargetId) this.targetSelect.value = this.currentTargetId;

      this.visualizer.setSelections(this.currentStartId, this.currentTargetId);
      this.resetPlayback();
    }

    runCurrentAlgorithm(showToast = true) {
      try {
        let result;
        const start = this.currentStartId;
        const target = this.currentTargetId;

        switch (this.currentAlgorithm) {
          case 'dijkstra':
            result = algorithms.dijkstra(graphData, start, target);
            break;
          case 'bellman_ford':
            result = algorithms.bellmanFord(graphData, start, target);
            break;
          case 'prim_mst':
            result = algorithms.primMST(graphData, start);
            break;
          case 'kruskal_mst':
            result = algorithms.kruskalMST(graphData);
            break;
          case 'bfs':
            result = algorithms.bfs(graphData, start);
            break;
          case 'dfs':
            result = algorithms.dfs(graphData, start);
            break;
          case 'floyd_warshall':
            result = algorithms.floydWarshall(graphData);
            break;
          default:
            throw new Error(`Unknown algorithm: ${this.currentAlgorithm}`);
        }

        this.executionResult = result;
        this.currentStepIndex = -1;
        this.updateResultsDisplay(result);

        if (showToast) {
          toast.success(`${result.algorithm} completed calculation! Use step controls to inspect execution.`);
        }

        // Show all steps in the log
        this.populateStepLogs(result.steps);

        // Visualize final state initially
        this.visualizer.visualizeFinalResult(result);
        this.updateStepCounter(result.steps.length, result.steps.length);

      } catch (err) {
        toast.error(err.message);
        console.error('[GraphManager] Algorithm error:', err);
      }
    }

    updateResultsDisplay(result) {
      if (!this.resSummary) return;

      if (this.matrixContainer) {
        this.matrixContainer.style.display = (this.currentAlgorithm === 'floyd_warshall') ? 'block' : 'none';
      }

      if (this.currentAlgorithm === 'floyd_warshall') {
        this.resSummary.textContent = 'All-Pairs Shortest Distance Matrix Computed';
        if (this.resDetails) {
          this.resDetails.textContent = `Calculated shortest path distance between all ${result.cities.length} airport hubs.`;
        }
        if (this.resCost) this.resCost.textContent = `${result.cities.length * result.cities.length} Sectors`;
        this.renderFloydWarshallMatrix(result);
        return;
      }

      if (this.currentAlgorithm === 'dijkstra' || this.currentAlgorithm === 'bellman_ford') {
        if (result.unreachable) {
          this.resSummary.textContent = 'Destination Unreachable';
          if (this.resDetails) this.resDetails.textContent = `No available flight corridor connecting ${result.startNode} and ${result.targetNode}.`;
          if (this.resCost) this.resCost.textContent = '∞';
        } else if (result.path.length > 0) {
          this.resSummary.textContent = `Optimal Path: ${result.path.join(' ➔ ')}`;
          if (this.resDetails) {
            this.resDetails.textContent = `Shortest flight corridor sequence across ${result.path.length} airport nodes.`;
          }
          if (this.resCost) this.resCost.textContent = `${result.totalCost.toLocaleString('en-IN')} km`;
        } else {
          this.resSummary.textContent = `Single-source shortest distances computed from ${result.startNode}.`;
          if (this.resCost) this.resCost.textContent = 'All Sectors';
        }
        return;
      }

      if (this.currentAlgorithm === 'prim_mst' || this.currentAlgorithm === 'kruskal_mst') {
        this.resSummary.textContent = `Minimum Spanning Tree (${result.mstEdges.length} Corridors)`;
        if (this.resDetails) {
          const corridors = result.mstEdges.map(e => `${e.source}-${e.destination}(${e.weight}k)`).join(', ');
          this.resDetails.textContent = `Selected MST edges: ${corridors}`;
        }
        if (this.resCost) this.resCost.textContent = `${result.totalCost.toLocaleString('en-IN')} km`;
        return;
      }

      if (this.currentAlgorithm === 'bfs' || this.currentAlgorithm === 'dfs') {
        this.resSummary.textContent = `Traversal Sequence (${result.traversalOrder.length} Hubs)`;
        if (this.resDetails) {
          this.resDetails.textContent = `Visit order: ${result.traversalOrder.join(' ➔ ')}`;
        }
        if (this.resCost) this.resCost.textContent = `${result.visitedCount} Nodes`;
      }
    }

    renderFloydWarshallMatrix(result) {
      if (!this.matrixContainer) return;

      const cities = result.cities;
      const matrix = result.matrix;

      let html = `
        <div style="overflow-x: auto; margin-top: var(--space-4);">
          <table class="table-compact font-mono text-xs">
            <thead>
              <tr>
                <th>From / To</th>
                ${cities.map(c => `<th>${c}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${cities.map((fromCity, i) => `
                <tr>
                  <td class="font-bold text-accent">${fromCity}</td>
                  ${cities.map((toCity, j) => {
                    const dist = matrix[i][j];
                    const val = dist === Infinity ? '∞' : `${dist}k`;
                    const isDiag = (i === j);
                    return `<td style="${isDiag ? 'color: var(--color-text-muted);' : 'color: var(--color-text-primary);'}">${val}</td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      this.matrixContainer.innerHTML = html;
    }

    populateStepLogs(steps) {
      if (!this.logContainer) return;
      this.logContainer.innerHTML = steps.map((s, idx) => `
        <div class="log-entry" id="log-step-${idx}" data-step-idx="${idx}">
          <span class="log-step-num font-mono">Step ${s.stepNumber}:</span>
          <span class="log-msg">${this.escapeHTML(s.logMessage)}</span>
        </div>
      `).join('');
    }

    stepForward() {
      if (!this.executionResult || !this.executionResult.steps) {
        this.runCurrentAlgorithm(false);
      }

      const steps = this.executionResult.steps;
      if (this.currentStepIndex < steps.length - 1) {
        this.currentStepIndex++;
        this.applyStep(this.currentStepIndex);
      } else {
        toast.info('Reached the final step of algorithm execution.');
        this.pausePlayback();
      }
    }

    applyStep(index) {
      const steps = this.executionResult.steps;
      if (index < 0 || index >= steps.length) return;

      const step = steps[index];
      this.visualizer.visualizeStep(step);
      this.updateStepCounter(index + 1, steps.length);

      // Highlight log row
      if (this.logContainer) {
        this.logContainer.querySelectorAll('.is-active-log').forEach(el => el.classList.remove('is-active-log'));
        const activeLog = document.getElementById(`log-step-${index}`);
        if (activeLog) {
          activeLog.classList.add('is-active-log');
          activeLog.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }

    startPlayback() {
      if (!this.executionResult) {
        this.runCurrentAlgorithm(false);
      }

      if (this.currentStepIndex >= this.executionResult.steps.length - 1) {
        this.currentStepIndex = -1;
      }

      this.isPlaying = true;
      if (this.btnPlay) {
        this.btnPlay.innerHTML = '<span>⏸️</span> Pause';
        this.btnPlay.classList.add('btn--amber');
      }
      if (this.statusBadge) {
        this.statusBadge.textContent = 'Playing Steps...';
        this.statusBadge.className = 'badge badge--amber';
      }

      this.playbackTimer = setInterval(() => {
        const steps = this.executionResult.steps;
        if (this.currentStepIndex < steps.length - 1) {
          this.currentStepIndex++;
          this.applyStep(this.currentStepIndex);
        } else {
          this.pausePlayback();
          toast.success('Algorithm step-by-step playback completed.');
        }
      }, this.playbackSpeedMs);
    }

    pausePlayback() {
      this.isPlaying = false;
      if (this.playbackTimer) {
        clearInterval(this.playbackTimer);
        this.playbackTimer = null;
      }
      if (this.btnPlay) {
        this.btnPlay.innerHTML = '<span>▶️</span> Play';
        this.btnPlay.classList.remove('btn--amber');
      }
      if (this.statusBadge) {
        this.statusBadge.textContent = 'Paused / Step Ready';
        this.statusBadge.className = 'badge badge--green';
      }
    }

    resetPlayback() {
      this.pausePlayback();
      this.currentStepIndex = -1;
      this.updateStepCounter(0, this.executionResult ? this.executionResult.steps.length : 0);
      if (this.logContainer) {
        this.logContainer.querySelectorAll('.is-active-log').forEach(el => el.classList.remove('is-active-log'));
      }
    }

    updateStepCounter(curr, total) {
      if (this.stepCounter) {
        this.stepCounter.textContent = `Step ${curr} of ${total}`;
      }
    }

    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  }

  window.AeroGraphManager = new GraphManager();

})(window);
