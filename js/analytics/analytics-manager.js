/**
 * AEROOPS: Analytics & Sorting Manager (Stage 5)
 *
 * Coordinates Segment Tree RMQ, Fenwick Tree RSQ, and Sorting Visualizer.
 * Provides unified playback controls, dataset loading, live telemetry logging,
 * and head-to-head algorithm benchmark execution.
 */

(function (window) {
  'use strict';

  class AnalyticsManager {
    constructor() {
      this.currentMode = 'segment'; // 'segment', 'fenwick', 'sorting'
      this.activeDatasetName = 'random';
      this.items = [];
      this.fares = [];

      this.segmentTree = null;
      this.fenwickTree = null;

      this.currentSortingAlgoKey = 'merge'; // 'merge', 'quick', 'heap'
      this.sortingTrace = null;

      this.playbackSteps = [];
      this.currentStepIdx = 0;
      this.playbackTimer = null;
      this.playbackSpeed = 400; // ms per step

      this.visualizer = null;
    }

    /**
     * Initializes manager, binds DOM elements, and loads default dataset
     */
    init() {
      this.cacheDom();
      this.bindEvents();

      // Initialize visualizer with DOM containers
      this.visualizer = new window.AeroAnalyticsVisualizer({
        segmentSvg: this.segmentSvg,
        fenwickContainer: this.fenwickContainer,
        sortingContainer: this.sortingContainer
      });

      // Load initial dataset and render
      this.loadDataset('random');
      this.switchMode('segment');
      this.logTelemetry('Analytics & Sorting Engine initialized. Ready for operations.');
    }

    cacheDom() {
      // Sub-mode tab buttons
      this.modeButtons = document.querySelectorAll('.analytics-mode-btn');
      this.panelSegment = document.getElementById('panel-segment-tree');
      this.panelFenwick = document.getElementById('panel-fenwick-tree');
      this.panelSorting = document.getElementById('panel-sorting-lab');

      // Visual containers
      this.segmentSvg = document.getElementById('segment-tree-svg');
      this.fenwickContainer = document.getElementById('fenwick-tree-display');
      this.sortingContainer = document.getElementById('sorting-bars-container');

      // Shared controls
      this.datasetSelect = document.getElementById('analytics-dataset-select');
      this.btnReloadDataset = document.getElementById('btn-analytics-reload');
      this.terminalOutput = document.getElementById('analytics-terminal-output');
      this.btnClearLogs = document.getElementById('btn-analytics-clear-logs');

      // Playback controls
      this.btnPlay = document.getElementById('btn-analytics-play');
      this.btnPause = document.getElementById('btn-analytics-pause');
      this.btnStepForward = document.getElementById('btn-analytics-step-forward');
      this.btnStepBack = document.getElementById('btn-analytics-step-back');
      this.btnReset = document.getElementById('btn-analytics-reset');
      this.speedSlider = document.getElementById('analytics-speed-slider');
      this.speedLabel = document.getElementById('analytics-speed-label');

      // Segment Tree inputs
      this.segQueryLeft = document.getElementById('seg-query-left');
      this.segQueryRight = document.getElementById('seg-query-right');
      this.btnSegQuery = document.getElementById('btn-seg-query');
      this.segUpdateIdx = document.getElementById('seg-update-idx');
      this.segUpdateVal = document.getElementById('seg-update-val');
      this.btnSegUpdate = document.getElementById('btn-seg-update');

      // Fenwick Tree inputs
      this.fenQueryLeft = document.getElementById('fen-query-left');
      this.fenQueryRight = document.getElementById('fen-query-right');
      this.btnFenQuery = document.getElementById('btn-fen-query');
      this.fenUpdateIdx = document.getElementById('fen-update-idx');
      this.fenUpdateDelta = document.getElementById('fen-update-delta');
      this.btnFenUpdate = document.getElementById('btn-fen-update');

      // Sorting inputs
      this.sortingAlgoButtons = document.querySelectorAll('.sorting-algo-btn');
      this.btnRunBenchmark = document.getElementById('btn-run-benchmark');
      this.benchmarkTableBody = document.getElementById('benchmark-table-body');

      // KPI telemetry badges
      this.kpiTotalElements = document.getElementById('kpi-analytics-elements');
      this.kpiOperationMetric = document.getElementById('kpi-analytics-metric');
      this.kpiComplexity = document.getElementById('kpi-analytics-complexity');
      this.kpiOperationsCount = document.getElementById('kpi-analytics-ops');
    }

    bindEvents() {
      const self = this;

      // Mode Switching
      if (this.modeButtons) {
        this.modeButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const mode = btn.getAttribute('data-mode');
            self.switchMode(mode);
          });
        });
      }

      // Dataset Loading
      if (this.datasetSelect) {
        this.datasetSelect.addEventListener('change', () => {
          self.loadDataset(self.datasetSelect.value);
        });
      }
      if (this.btnReloadDataset) {
        this.btnReloadDataset.addEventListener('click', () => {
          self.loadDataset(self.activeDatasetName);
        });
      }

      // Terminal Logs Clear
      if (this.btnClearLogs) {
        this.btnClearLogs.addEventListener('click', () => {
          if (self.terminalOutput) self.terminalOutput.innerHTML = '';
        });
      }

      // Playback Controls
      if (this.btnPlay) this.btnPlay.addEventListener('click', () => self.play());
      if (this.btnPause) this.btnPause.addEventListener('click', () => self.pause());
      if (this.btnStepForward) this.btnStepForward.addEventListener('click', () => self.stepForward());
      if (this.btnStepBack) this.btnStepBack.addEventListener('click', () => self.stepBack());
      if (this.btnReset) this.btnReset.addEventListener('click', () => self.resetPlayback());
      if (this.speedSlider) {
        this.speedSlider.addEventListener('input', () => {
          self.playbackSpeed = Number(self.speedSlider.value);
          if (self.speedLabel) self.speedLabel.textContent = `${self.playbackSpeed}ms`;
          if (self.playbackTimer) {
            self.pause();
            self.play();
          }
        });
      }

      // Segment Tree RMQ & Point Update
      if (this.btnSegQuery) {
        this.btnSegQuery.addEventListener('click', () => self.executeSegmentRMQ());
      }
      if (this.btnSegUpdate) {
        this.btnSegUpdate.addEventListener('click', () => self.executeSegmentUpdate());
      }

      // Fenwick Tree RSQ & Point Update
      if (this.btnFenQuery) {
        this.btnFenQuery.addEventListener('click', () => self.executeFenwickRSQ());
      }
      if (this.btnFenUpdate) {
        this.btnFenUpdate.addEventListener('click', () => self.executeFenwickUpdate());
      }

      // Sorting Algorithm Switching
      if (this.sortingAlgoButtons) {
        this.sortingAlgoButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            const algoKey = btn.getAttribute('data-algo');
            self.selectSortingAlgo(algoKey);
          });
        });
      }

      // Benchmark Run
      if (this.btnRunBenchmark) {
        this.btnRunBenchmark.addEventListener('click', () => self.runBenchmarkSuite());
      }

      // Synchronize with AeroDataStore mutations (Stage 6 cross-module integration)
      if (window.AeroDataStore && typeof window.AeroDataStore.subscribe === 'function') {
        window.AeroDataStore.subscribe((event) => {
          if (self.activeDatasetName === 'fleet') {
            self.loadDataset('fleet');
            self.logTelemetry(`AeroDataStore mutated (${event.type || 'SYNC'}). Fleet dataset live-synchronized.`);
          }
        });
      }
    }

    // =========================================================================
    // DATASET & MODE MANAGEMENT
    // =========================================================================

    loadDataset(name) {
      this.pause();
      this.activeDatasetName = name || 'random';
      this.items = window.AeroFareData.getDataset(this.activeDatasetName);
      this.fares = window.AeroFareData.getFareArray(this.items);

      // Rebuild trees
      this.segmentTree = new window.AeroSegmentTree(this.fares);
      this.fenwickTree = new window.AeroFenwickTree(this.fares);

      // Set input ranges bounds
      const maxIdx = Math.max(0, this.items.length - 1);
      if (this.segQueryLeft) { this.segQueryLeft.max = maxIdx; this.segQueryLeft.value = 0; }
      if (this.segQueryRight) { this.segQueryRight.max = maxIdx; this.segQueryRight.value = Math.min(maxIdx, 5); }
      if (this.segUpdateIdx) { this.segUpdateIdx.max = maxIdx; this.segUpdateIdx.value = 0; }
      if (this.fenQueryLeft) { this.fenQueryLeft.max = maxIdx; this.fenQueryLeft.value = 0; }
      if (this.fenQueryRight) { this.fenQueryRight.max = maxIdx; this.fenQueryRight.value = Math.min(maxIdx, 5); }
      if (this.fenUpdateIdx) { this.fenUpdateIdx.max = maxIdx; this.fenUpdateIdx.value = 0; }

      this.logTelemetry(`Loaded dataset "${this.activeDatasetName}" with ${this.items.length} flights. Rebuilt Segment Tree and Fenwick Tree.`);

      // Update current view
      this.renderCurrentMode();
      this.updateKPIs();
    }

    switchMode(mode) {
      this.pause();
      this.currentMode = mode || 'segment';

      // Update Tab button states
      if (this.modeButtons) {
        this.modeButtons.forEach(btn => {
          const isActive = btn.getAttribute('data-mode') === this.currentMode;
          btn.classList.toggle('btn--primary', isActive);
          btn.classList.toggle('btn--secondary', !isActive);
        });
      }

      // Show/hide sub-panels
      if (this.panelSegment) this.panelSegment.hidden = this.currentMode !== 'segment';
      if (this.panelFenwick) this.panelFenwick.hidden = this.currentMode !== 'fenwick';
      if (this.panelSorting) this.panelSorting.hidden = this.currentMode !== 'sorting';

      this.renderCurrentMode();
      this.updateKPIs();
    }

    renderCurrentMode() {
      if (this.currentMode === 'segment') {
        if (this.visualizer && this.segmentTree) {
          this.visualizer.renderSegmentTree(this.segmentTree.getHierarchy(), {});
        }
      } else if (this.currentMode === 'fenwick') {
        if (this.visualizer && this.fenwickTree) {
          this.visualizer.renderFenwickTree(this.fenwickTree.getTreeState(), {});
        }
      } else if (this.currentMode === 'sorting') {
        this.prepareSortingTrace();
      }
    }

    // =========================================================================
    // SEGMENT TREE OPERATIONS
    // =========================================================================

    executeSegmentRMQ() {
      const left = parseInt(this.segQueryLeft ? this.segQueryLeft.value : 0, 10) || 0;
      const right = parseInt(this.segQueryRight ? this.segQueryRight.value : 0, 10) || 0;

      const trace = this.segmentTree.rangeMinimumQueryWithTrace(left, right);
      this.loadPlaybackSteps(trace.steps, 'segment_rmq', trace);

      if (this.kpiOperationMetric) {
        this.kpiOperationMetric.textContent = trace.result === Infinity ? 'Invalid' : `RMQ = ₹${trace.result.toLocaleString()}`;
        this.kpiOperationMetric.className = 'badge badge--green';
      }
    }

    executeSegmentUpdate() {
      const index = parseInt(this.segUpdateIdx ? this.segUpdateIdx.value : 0, 10) || 0;
      const newFare = parseFloat(this.segUpdateVal ? this.segUpdateVal.value : 4000) || 4000;

      const trace = this.segmentTree.updateFareWithTrace(index, newFare);
      if (this.items[index]) this.items[index].fare = newFare;
      this.fares[index] = newFare;

      // Update Fenwick tree as well to maintain synchronization
      this.fenwickTree.setFare(index, newFare);

      // If in fleet mode, also update AeroDataStore
      if (this.activeDatasetName === 'fleet' && window.AeroDataStore && window.AeroDataStore.updateFlightFare) {
        const target = this.items[index];
        if (target && target.flightId) {
          window.AeroDataStore.updateFlightFare(target.flightId, newFare);
        }
      }

      this.loadPlaybackSteps(trace.steps, 'segment_update', trace);

      if (this.kpiOperationMetric) {
        this.kpiOperationMetric.textContent = `Updated #${index} ➔ ₹${newFare.toLocaleString()}`;
        this.kpiOperationMetric.className = 'badge badge--cyan';
      }
    }

    // =========================================================================
    // FENWICK TREE OPERATIONS
    // =========================================================================

    executeFenwickRSQ() {
      const left = parseInt(this.fenQueryLeft ? this.fenQueryLeft.value : 0, 10) || 0;
      const right = parseInt(this.fenQueryRight ? this.fenQueryRight.value : 0, 10) || 0;

      const trace = this.fenwickTree.getRangeSumWithTrace(left, right);
      this.loadPlaybackSteps(trace.steps, 'fenwick_rsq', trace);

      if (this.kpiOperationMetric) {
        this.kpiOperationMetric.textContent = `RSQ = ₹${trace.rangeSum.toLocaleString()}`;
        this.kpiOperationMetric.className = 'badge badge--green';
      }
    }

    executeFenwickUpdate() {
      const index = parseInt(this.fenUpdateIdx ? this.fenUpdateIdx.value : 0, 10) || 0;
      const delta = parseFloat(this.fenUpdateDelta ? this.fenUpdateDelta.value : 500) || 500;

      const trace = this.fenwickTree.updateWithTrace(index, delta);
      if (this.items[index]) this.items[index].fare += delta;
      this.fares[index] += delta;

      // Also update Segment Tree
      this.segmentTree.updateFare(index, this.fares[index]);

      // If in fleet mode, also update AeroDataStore
      if (this.activeDatasetName === 'fleet' && window.AeroDataStore && window.AeroDataStore.updateFlightFare) {
        const target = this.items[index];
        if (target && target.flightId) {
          window.AeroDataStore.updateFlightFare(target.flightId, this.fares[index]);
        }
      }

      this.loadPlaybackSteps(trace.steps, 'fenwick_update', trace);

      if (this.kpiOperationMetric) {
        this.kpiOperationMetric.textContent = `Delta +₹${delta.toLocaleString()} at #${index}`;
        this.kpiOperationMetric.className = 'badge badge--cyan';
      }
    }

    // =========================================================================
    // SORTING LAB & BENCHMARKS
    // =========================================================================

    selectSortingAlgo(algoKey) {
      this.pause();
      this.currentSortingAlgoKey = algoKey || 'merge';

      if (this.sortingAlgoButtons) {
        this.sortingAlgoButtons.forEach(btn => {
          const isActive = btn.getAttribute('data-algo') === this.currentSortingAlgoKey;
          btn.classList.toggle('btn--primary', isActive);
          btn.classList.toggle('btn--secondary', !isActive);
        });
      }

      this.prepareSortingTrace();
      this.updateKPIs();
    }

    prepareSortingTrace() {
      const algo = window.AeroSortingSuite.getAlgorithm(this.currentSortingAlgoKey);
      this.sortingTrace = algo.generateTrace(this.items);

      this.playbackSteps = this.sortingTrace.steps;
      this.currentStepIdx = 0;

      // Render initial snapshot
      if (this.playbackSteps.length > 0 && this.visualizer) {
        const firstStep = this.playbackSteps[0];
        this.visualizer.renderSortingBars(firstStep.snapshot, firstStep);
      }

      this.logTelemetry(`Prepared ${algo.name} animation trace (${this.playbackSteps.length} steps). Press Play to visualize.`);
    }

    runBenchmarkSuite() {
      const results = window.AeroSortingSuite.runComparativeBenchmark(this.items);
      this.renderBenchmarkTable(results);
      this.logTelemetry(`Comparative benchmark executed across Merge Sort, Quick Sort, and Heap Sort.`);
    }

    renderBenchmarkTable(results) {
      if (!this.benchmarkTableBody || !results) return;

      const rows = [
        results.merge,
        results.quick,
        results.heap
      ];

      this.benchmarkTableBody.innerHTML = rows.map(r => `
        <tr>
          <td>
            <strong>${r.name}</strong><br>
            <span class="text-xs text-muted font-mono">${r.javaClass}</span>
          </td>
          <td>
            <span class="font-mono text-xs">Avg: ${r.timeComplexity.average}</span><br>
            <span class="text-xs text-muted font-mono">Worst: ${r.timeComplexity.worst}</span>
          </td>
          <td><span class="font-mono text-xs">${r.spaceComplexity}</span></td>
          <td>
            <span class="badge ${r.stability === 'Stable' ? 'badge--green' : 'badge--amber'}">
              ${r.stability}
            </span>
          </td>
          <td class="font-mono font-semibold">${r.comparisons.toLocaleString()}</td>
          <td class="font-mono font-semibold">${r.swaps.toLocaleString()}</td>
          <td class="font-mono font-semibold text-accent">${r.executionTimeMs} ms</td>
          <td>
            <span class="badge badge--green">✓ Monotonic</span>
          </td>
        </tr>
      `).join('');
    }

    // =========================================================================
    // PLAYBACK CONTROLLER
    // =========================================================================

    loadPlaybackSteps(steps, actionType, meta) {
      this.pause();
      this.playbackSteps = steps || [];
      this.currentStepIdx = 0;
      this.play();
    }

    play() {
      if (this.playbackTimer) return;
      if (this.currentStepIdx >= this.playbackSteps.length - 1) {
        this.currentStepIdx = 0;
      }

      const self = this;
      this.playbackTimer = setInterval(() => {
        if (self.currentStepIdx < self.playbackSteps.length) {
          self.renderStep(self.currentStepIdx);
          self.currentStepIdx++;
        } else {
          self.pause();
        }
      }, this.playbackSpeed);
    }

    pause() {
      if (this.playbackTimer) {
        clearInterval(this.playbackTimer);
        this.playbackTimer = null;
      }
    }

    stepForward() {
      this.pause();
      if (this.currentStepIdx < this.playbackSteps.length) {
        this.renderStep(this.currentStepIdx);
        this.currentStepIdx++;
      }
    }

    stepBack() {
      this.pause();
      if (this.currentStepIdx > 1) {
        this.currentStepIdx -= 2;
        this.renderStep(this.currentStepIdx);
        this.currentStepIdx++;
      }
    }

    resetPlayback() {
      this.pause();
      this.currentStepIdx = 0;
      if (this.playbackSteps.length > 0) {
        this.renderStep(0);
      } else {
        this.renderCurrentMode();
      }
    }

    renderStep(index) {
      const step = this.playbackSteps[index];
      if (!step) return;

      if (step.log || step.message) {
        this.logTelemetry(step.log || step.message);
      }

      if (this.currentMode === 'segment') {
        const highlight = {
          active: step.nodeIndex !== undefined ? [step.nodeIndex] : [],
          full: step.type === 'visit_total_overlap' ? [step.nodeIndex] : [],
          disjoint: step.type === 'visit_disjoint' ? [step.nodeIndex] : [],
          partial: step.type === 'visit_partial_overlap' ? [step.nodeIndex] : []
        };
        this.visualizer.renderSegmentTree(this.segmentTree.getHierarchy(), highlight);
      } else if (this.currentMode === 'fenwick') {
        const highlight = {
          hops: step.subSteps || (step.bitIndex ? [step] : []),
          currentHop: step
        };
        this.visualizer.renderFenwickTree(this.fenwickTree.getTreeState(), highlight);
      } else if (this.currentMode === 'sorting') {
        this.visualizer.renderSortingBars(step.snapshot, step);
        if (this.kpiOperationsCount) {
          this.kpiOperationsCount.textContent = `C: ${step.comparisons} | S: ${step.swaps}`;
        }
      }
    }

    // =========================================================================
    // TELEMETRY & KPIS
    // =========================================================================

    updateKPIs() {
      if (this.kpiTotalElements) {
        this.kpiTotalElements.textContent = `${this.items.length} Flights`;
      }

      if (this.currentMode === 'segment') {
        if (this.kpiComplexity) this.kpiComplexity.textContent = 'RMQ: O(log N) | Space: O(4N)';
        if (this.kpiOperationMetric) {
          const rootMin = this.segmentTree ? this.segmentTree.tree[0] : 0;
          this.kpiOperationMetric.textContent = `Fleet Min: ₹${rootMin.toLocaleString()}`;
          this.kpiOperationMetric.className = 'badge badge--green';
        }
      } else if (this.currentMode === 'fenwick') {
        if (this.kpiComplexity) this.kpiComplexity.textContent = 'RSQ: O(log N) | Space: O(N)';
        if (this.kpiOperationMetric) {
          const total = this.fenwickTree ? this.fenwickTree.getPrefixSum(this.items.length - 1) : 0;
          this.kpiOperationMetric.textContent = `Fleet Sum: ₹${total.toLocaleString()}`;
          this.kpiOperationMetric.className = 'badge badge--green';
        }
      } else if (this.currentMode === 'sorting') {
        const algo = window.AeroSortingSuite.getAlgorithm(this.currentSortingAlgoKey);
        if (this.kpiComplexity) this.kpiComplexity.textContent = `Time: ${algo.timeComplexity.average} | Space: ${algo.spaceComplexity}`;
        if (this.kpiOperationMetric) {
          this.kpiOperationMetric.textContent = `${algo.name} (${algo.stability})`;
          this.kpiOperationMetric.className = 'badge badge--cyan';
        }
      }
    }

    logTelemetry(msg) {
      if (!this.terminalOutput) return;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const div = document.createElement('div');
      div.className = 'terminal-line';
      div.innerHTML = `<span class="terminal-time">[${timeStr}]</span> <span class="terminal-msg">${msg}</span>`;
      this.terminalOutput.appendChild(div);
      this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }
  }

  window.AeroAnalyticsManager = new AnalyticsManager();

})(typeof window !== 'undefined' ? window : global);
