/**
 * AEROOPS: Analytics & Sorting Visualizer (Stage 5)
 *
 * Renders interactive SVG diagrams and animated bar charts for:
 * 1. Segment Tree (Interval nodes, RMQ query bounding, and pruning)
 * 2. Fenwick Tree (Dual 0-based vs 1-based arrays with LSB bit-hop animations)
 * 3. Sorting Lab (Vertical animated fare bars with comparison/swap highlights)
 */

(function (window) {
  'use strict';

  class AnalyticsVisualizer {
    constructor(containers) {
      this.segmentSvg = containers.segmentSvg || null;
      this.fenwickContainer = containers.fenwickContainer || null;
      this.sortingContainer = containers.sortingContainer || null;
    }

    // =========================================================================
    // 1. SEGMENT TREE RENDERING
    // =========================================================================

    /**
     * Renders hierarchical Segment Tree onto SVG
     * @param {Object} hierarchy Root node from segmentTree.getHierarchy()
     * @param {Object} activeHighlight Step highlight state { activeNodes: Set/Array, totalOverlap: Set, disjoint: Set }
     */
    renderSegmentTree(hierarchy, activeHighlight) {
      if (!this.segmentSvg || !hierarchy) return;

      const svg = this.segmentSvg;
      svg.innerHTML = '';

      const highlight = activeHighlight || {};
      const activeNodes = new Set(highlight.active || []);
      const fullOverlapNodes = new Set(highlight.full || []);
      const disjointNodes = new Set(highlight.disjoint || []);
      const partialNodes = new Set(highlight.partial || []);

      const width = svg.clientWidth || 900;
      const height = Math.max(450, (hierarchy.depth + 4) * 80);
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

      // Calculate node positions level-by-level
      const levels = [];
      function traverse(node, depth, leftFrac, rightFrac) {
        node.depth = depth;
        node.x = ((leftFrac + rightFrac) / 2) * width;
        node.y = 45 + depth * 75;

        if (!levels[depth]) levels[depth] = [];
        levels[depth].push(node);

        if (node.children && node.children.length === 2) {
          const mid = (leftFrac + rightFrac) / 2;
          traverse(node.children[0], depth + 1, leftFrac, mid);
          traverse(node.children[1], depth + 1, mid, rightFrac);
        }
      }

      traverse(hierarchy, 0, 0.05, 0.95);

      // 1. Draw SVG Connection Lines
      const linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      linesGroup.setAttribute('class', 'tree-links');

      function drawLinks(node) {
        if (!node.children || node.children.length === 0) return;
        node.children.forEach(child => {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', node.x);
          line.setAttribute('y1', node.y);
          line.setAttribute('x2', child.x);
          line.setAttribute('y2', child.y);
          line.setAttribute('stroke', 'var(--color-border, #1E293B)');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('stroke-dasharray', '3 3');
          linesGroup.appendChild(line);

          drawLinks(child);
        });
      }
      drawLinks(hierarchy);
      svg.appendChild(linesGroup);

      // 2. Draw Nodes
      const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodesGroup.setAttribute('class', 'tree-nodes');

      function drawNodes(node) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'segment-node-group');
        g.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        // Node styling based on query trace state
        let strokeColor = '#F2A65A'; // Runway Amber default
        let fillColor = '#231E30';   // Twilight surface
        let filterEffect = '';

        if (fullOverlapNodes.has(node.nodeIndex)) {
          strokeColor = '#10B981'; // Emerald: included in RMQ answer
          fillColor = 'rgba(16, 185, 129, 0.25)';
        } else if (partialNodes.has(node.nodeIndex)) {
          strokeColor = '#A995C7'; // Soft Lilac: branching
          fillColor = 'rgba(169, 149, 199, 0.2)';
        } else if (disjointNodes.has(node.nodeIndex)) {
          strokeColor = '#594F68'; // Muted twilight: pruned
          fillColor = 'rgba(35, 30, 48, 0.6)';
        } else if (activeNodes.has(node.nodeIndex)) {
          strokeColor = '#E47B65'; // Muted Coral: currently evaluated
          fillColor = 'rgba(228, 123, 101, 0.25)';
        }

        const rectWidth = 72;
        const rectHeight = 44;

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -rectWidth / 2);
        rect.setAttribute('y', -rectHeight / 2);
        rect.setAttribute('width', rectWidth);
        rect.setAttribute('height', rectHeight);
        rect.setAttribute('rx', '6');
        rect.setAttribute('fill', fillColor);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', activeNodes.has(node.nodeIndex) || fullOverlapNodes.has(node.nodeIndex) ? '2.5' : '1.5');
        rect.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))');
        g.appendChild(rect);

        // Segment interval label [L..R]
        const textRange = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textRange.setAttribute('y', -4);
        textRange.setAttribute('text-anchor', 'middle');
        textRange.setAttribute('fill', 'var(--color-text-secondary, #A49BAE)');
        textRange.setAttribute('font-size', '10px');
        textRange.setAttribute('font-family', 'var(--font-mono, monospace)');
        textRange.textContent = `[${node.start}..${node.end}]`;
        g.appendChild(textRange);

        // Minimum fare label
        const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textVal.setAttribute('y', 14);
        textVal.setAttribute('text-anchor', 'middle');
        textVal.setAttribute('fill', fullOverlapNodes.has(node.nodeIndex) ? '#34D399' : 'var(--color-text-primary, #F6F0E7)');
        textVal.setAttribute('font-weight', '600');
        textVal.setAttribute('font-size', '11px');
        textVal.setAttribute('font-family', 'var(--font-mono, monospace)');
        textVal.textContent = node.value === Infinity ? '∞' : `₹${node.value.toLocaleString()}`;
        g.appendChild(textVal);

        nodesGroup.appendChild(g);

        if (node.children) {
          node.children.forEach(child => drawNodes(child));
        }
      }

      drawNodes(hierarchy);
      svg.appendChild(nodesGroup);
    }

    // =========================================================================
    // 2. FENWICK TREE RENDERING
    // =========================================================================

    /**
     * Renders dual-layer Fenwick Tree layout with BIT indices & responsibility intervals
     * @param {Object} treeState State from fenwickTree.getTreeState()
     * @param {Object} highlight Step highlight info { activeHops: [...], currentSum: number }
     */
    renderFenwickTree(treeState, highlight) {
      if (!this.fenwickContainer || !treeState) return;

      const container = this.fenwickContainer;
      container.innerHTML = '';

      const activeBitIndices = new Set((highlight && highlight.hops) ? highlight.hops.map(h => h.bitIndex) : []);
      const currentHop = (highlight && highlight.currentHop) || null;

      // 1. Client Array Row (0-based)
      const clientRow = document.createElement('div');
      clientRow.className = 'fenwick-row fenwick-row--client';
      clientRow.innerHTML = `
        <div class="fenwick-row-header">
          <span class="text-xs text-muted uppercase font-mono font-semibold">0-Based Flight Array (Original Fares)</span>
        </div>
        <div class="fenwick-cells-wrapper" id="fenwick-client-cells"></div>
      `;
      container.appendChild(clientRow);

      const clientWrapper = clientRow.querySelector('#fenwick-client-cells');
      treeState.nodes.forEach((node, idx) => {
        const cell = document.createElement('div');
        cell.className = 'fenwick-cell fenwick-cell--client';
        cell.innerHTML = `
          <div class="fenwick-cell-idx">#${idx}</div>
          <div class="fenwick-cell-val">₹${node.clientFare.toLocaleString()}</div>
        `;
        clientWrapper.appendChild(cell);
      });

      // 2. Fenwick Tree Array Row (1-based)
      const bitRow = document.createElement('div');
      bitRow.className = 'fenwick-row fenwick-row--bit';
      bitRow.innerHTML = `
        <div class="fenwick-row-header">
          <span class="text-xs text-muted uppercase font-mono font-semibold">1-Based Binary Indexed Tree [BIT] (tree[i += i & -i])</span>
        </div>
        <div class="fenwick-cells-wrapper" id="fenwick-bit-cells"></div>
      `;
      container.appendChild(bitRow);

      const bitWrapper = bitRow.querySelector('#fenwick-bit-cells');
      treeState.nodes.forEach(node => {
        const isVisited = activeBitIndices.has(node.bitIndex);
        const isCurrent = currentHop && currentHop.bitIndex === node.bitIndex;

        const cell = document.createElement('div');
        cell.className = 'fenwick-cell fenwick-cell--bit' + 
          (isCurrent ? ' fenwick-cell--current' : (isVisited ? ' fenwick-cell--visited' : ''));
        
        cell.innerHTML = `
          <div class="fenwick-cell-idx">i=${node.bitIndex} <span class="fenwick-binary">(${node.binary})</span></div>
          <div class="fenwick-cell-val font-semibold">₹${node.treeValue.toLocaleString()}</div>
          <div class="fenwick-cell-range" title="Covers elements from index ${node.responsibleRange[0]} to ${node.responsibleRange[1]}">
            Span: [${node.responsibleRange[0]}..${node.responsibleRange[1]}]
          </div>
        `;
        bitWrapper.appendChild(cell);
      });
    }

    // =========================================================================
    // 3. SORTING BAR CHART RENDERING
    // =========================================================================

    /**
     * Renders vertical bar chart for sorting visualization
     * @param {Array} items Snapshot array of flight items
     * @param {Object} step Current step object containing comparing, swapped, pivot, sorted
     */
    renderSortingBars(items, step) {
      if (!this.sortingContainer || !Array.isArray(items)) return;

      const container = this.sortingContainer;
      container.innerHTML = '';

      if (items.length === 0) return;

      const maxFare = Math.max(...items.map(it => it.fare), 10000);
      const comparingSet = new Set(step ? step.comparing : []);
      const swappedSet = new Set(step ? step.swapped : []);
      const sortedSet = new Set(step ? step.sorted : []);
      const pivotIdx = step ? step.pivot : null;

      const chartWrapper = document.createElement('div');
      chartWrapper.className = 'sorting-bars-chart';

      items.forEach((item, idx) => {
        const heightPercent = Math.max(12, Math.round((item.fare / maxFare) * 100));

        const barCol = document.createElement('div');
        barCol.className = 'sorting-bar-col';

        let barClass = 'sorting-bar';
        if (sortedSet.has(idx)) {
          barClass += ' sorting-bar--sorted';
        } else if (idx === pivotIdx) {
          barClass += ' sorting-bar--pivot';
        } else if (swappedSet.has(idx)) {
          barClass += ' sorting-bar--swapped';
        } else if (comparingSet.has(idx)) {
          barClass += ' sorting-bar--comparing';
        }

        barCol.innerHTML = `
          <div class="sorting-bar-val">₹${item.fare.toLocaleString()}</div>
          <div class="${barClass}" style="height: ${heightPercent}%;"></div>
          <div class="sorting-bar-label">
            <span class="sorting-flight-id">${item.flightId || ('#' + idx)}</span>
            <span class="sorting-idx">[${idx}]</span>
          </div>
        `;

        chartWrapper.appendChild(barCol);
      });

      container.appendChild(chartWrapper);
    }
  }

  window.AeroAnalyticsVisualizer = AnalyticsVisualizer;

})(typeof window !== 'undefined' ? window : global);
