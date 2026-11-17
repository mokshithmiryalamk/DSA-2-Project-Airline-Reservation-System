/**
 * AEROOPS: Interactive SVG Graph Visualizer (Stage 3)
 *
 * Renders national route network topology on an interactive, responsive SVG canvas.
 * Handles state transitions: start node, target node, active step, visited nodes,
 * optimal path corridors, and MST spanning trees.
 */

(function (window) {
  'use strict';

  class GraphVisualizer {
    constructor(svgContainerId, options = {}) {
      this.container = document.getElementById(svgContainerId);
      this.options = Object.assign({
        width: 900,
        height: 520,
        nodeRadius: 18,
        onNodeClick: null
      }, options);

      this.graph = null;
      this.startNodeId = null;
      this.targetNodeId = null;
      this.svg = null;
      this.edgesLayer = null;
      this.nodesLayer = null;
      this.tooltipsLayer = null;

      this.init();
    }

    init() {
      if (!this.container) return;
      this.container.innerHTML = '';

      // Create SVG Element
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
      this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      this.svg.classList.add('route-graph-svg');

      // Defs (Glow filters and gradients)
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <pattern id="radar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(242, 166, 90, 0.04)" stroke-width="1"/>
        </pattern>
      `;
      this.svg.appendChild(defs);

      // Background Grid
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', 'url(#radar-grid)');
      this.svg.appendChild(bgRect);

      // Radar Concentric Circles
      const radarGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      radarGroup.classList.add('radar-range-rings');
      radarGroup.innerHTML = `
        <circle cx="450" cy="260" r="130" fill="none" stroke="rgba(242, 166, 90, 0.05)" stroke-dasharray="4 4"/>
        <circle cx="450" cy="260" r="240" fill="none" stroke="rgba(242, 166, 90, 0.04)" stroke-dasharray="6 6"/>
        <circle cx="450" cy="260" r="350" fill="none" stroke="rgba(242, 166, 90, 0.03)"/>
      `;
      this.svg.appendChild(radarGroup);

      // Layers (Edges drawn first, then Nodes on top)
      this.edgesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.edgesLayer.classList.add('layer-edges');
      this.svg.appendChild(this.edgesLayer);

      this.nodesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.nodesLayer.classList.add('layer-nodes');
      this.svg.appendChild(this.nodesLayer);

      this.tooltipsLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.tooltipsLayer.classList.add('layer-tooltips');
      this.svg.appendChild(this.tooltipsLayer);

      this.container.appendChild(this.svg);
    }

    setGraph(graph) {
      this.graph = graph;
      this.render();
    }

    setSelections(startId, targetId = null) {
      this.startNodeId = startId ? startId.toUpperCase() : null;
      this.targetNodeId = targetId ? targetId.toUpperCase() : null;
      this.updateSelectionClasses();
    }

    render() {
      if (!this.graph || !this.svg) return;

      this.edgesLayer.innerHTML = '';
      this.nodesLayer.innerHTML = '';

      const nodes = this.graph.getNodes();
      const edges = this.graph.getEdges();

      // Render Edges
      edges.forEach(edge => {
        const u = this.graph.getNode(edge.source);
        const v = this.graph.getNode(edge.destination);
        if (!u || !v) return;

        const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        edgeGroup.classList.add('graph-edge');
        edgeGroup.setAttribute('data-edge-id', `${edge.source}-${edge.destination}`);
        edgeGroup.setAttribute('data-source', edge.source);
        edgeGroup.setAttribute('data-destination', edge.destination);

        // Line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', u.x);
        line.setAttribute('y1', u.y);
        line.setAttribute('x2', v.x);
        line.setAttribute('y2', v.y);
        line.classList.add('edge-line');
        edgeGroup.appendChild(line);

        // Edge Weight Badge at Midpoint
        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;

        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.classList.add('edge-label-group');

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', midX - 22);
        rect.setAttribute('y', midY - 9);
        rect.setAttribute('width', 44);
        rect.setAttribute('height', 18);
        rect.setAttribute('rx', 4);
        rect.classList.add('edge-label-bg');
        labelGroup.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY + 4);
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('edge-label-text');
        text.textContent = `${edge.weight}k`;
        labelGroup.appendChild(text);

        // Tooltip title for edge
        const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        titleEl.textContent = `Air Corridor: ${edge.source} ➔ ${edge.destination} | Distance: ${edge.weight} km`;
        edgeGroup.appendChild(titleEl);

        edgeGroup.appendChild(labelGroup);
        this.edgesLayer.appendChild(edgeGroup);
      });

      // Render Nodes
      nodes.forEach(node => {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.classList.add('graph-node');
        nodeGroup.setAttribute('data-node-id', node.id);
        nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        // Halo Ring for radar effect
        const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        ring.setAttribute('r', this.options.nodeRadius + 6);
        ring.classList.add('node-halo');
        nodeGroup.appendChild(ring);

        // Circle marker
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.options.nodeRadius);
        circle.classList.add('node-circle');
        nodeGroup.appendChild(circle);

        // Airport IATA code text
        const codeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        codeText.setAttribute('y', 4);
        codeText.setAttribute('text-anchor', 'middle');
        codeText.classList.add('node-code');
        codeText.textContent = node.id;
        nodeGroup.appendChild(codeText);

        // City name subtitle below marker
        const cityText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        cityText.setAttribute('y', this.options.nodeRadius + 14);
        cityText.setAttribute('text-anchor', 'middle');
        cityText.classList.add('node-city');
        cityText.textContent = node.city;
        nodeGroup.appendChild(cityText);

        // Tooltip
        const titleEl = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        titleEl.textContent = `${node.name} (${node.id})\nCity: ${node.city}, ${node.state || 'India'}\nClick to choose as route anchor.`;
        nodeGroup.appendChild(titleEl);

        // Click Handler
        nodeGroup.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof this.options.onNodeClick === 'function') {
            this.options.onNodeClick(node.id);
          }
        });

        this.nodesLayer.appendChild(nodeGroup);
      });

      this.updateSelectionClasses();
    }

    updateSelectionClasses() {
      if (!this.nodesLayer) return;

      const allNodes = this.nodesLayer.querySelectorAll('.graph-node');
      allNodes.forEach(nodeEl => {
        const id = nodeEl.getAttribute('data-node-id');
        nodeEl.classList.toggle('is-start', id === this.startNodeId);
        nodeEl.classList.toggle('is-target', id === this.targetNodeId);
      });
    }

    /**
     * Updates visual state based on an execution step
     */
    visualizeStep(step) {
      if (!step || !this.svg) return;

      // 1. Reset dynamic execution highlights
      this.svg.querySelectorAll('.is-active-node').forEach(el => el.classList.remove('is-active-node'));
      this.svg.querySelectorAll('.is-active-edge').forEach(el => el.classList.remove('is-active-edge'));
      this.svg.querySelectorAll('.is-visited').forEach(el => el.classList.remove('is-visited'));
      this.svg.querySelectorAll('.is-solution-edge').forEach(el => el.classList.remove('is-solution-edge'));

      // 2. Mark visited nodes
      if (Array.isArray(step.visitedNodes)) {
        step.visitedNodes.forEach(nodeId => {
          const el = this.nodesLayer.querySelector(`[data-node-id="${nodeId}"]`);
          if (el) el.classList.add('is-visited');
        });
      }

      // 3. Mark active node
      if (step.activeNode) {
        const activeEl = this.nodesLayer.querySelector(`[data-node-id="${step.activeNode}"]`);
        if (activeEl) activeEl.classList.add('is-active-node');
      }

      // 4. Mark active edge being evaluated
      if (step.activeEdge) {
        const u = step.activeEdge.source;
        const v = step.activeEdge.destination;
        const edgeEl = this.findEdgeElement(u, v);
        if (edgeEl) edgeEl.classList.add('is-active-edge');
      }

      // 5. Mark selected solution edges (Path or MST)
      if (Array.isArray(step.selectedEdges) && step.selectedEdges.length > 0) {
        step.selectedEdges.forEach(e => {
          const edgeEl = this.findEdgeElement(e.source, e.destination);
          if (edgeEl) edgeEl.classList.add('is-solution-edge');
        });
      }
    }

    /**
     * Renders final completed result
     */
    visualizeFinalResult(result) {
      if (!result || !this.svg) return;

      // Reset
      this.svg.querySelectorAll('.is-active-node, .is-active-edge, .is-visited, .is-solution-edge, .is-dimmed').forEach(el => {
        el.classList.remove('is-active-node', 'is-active-edge', 'is-visited', 'is-solution-edge', 'is-dimmed');
      });

      // Highlight MST edges or Shortest Path
      const edgesToHighlight = result.mstEdges || result.pathEdges || [];
      if (edgesToHighlight.length > 0) {
        // Dim all edges first
        this.edgesLayer.querySelectorAll('.graph-edge').forEach(el => el.classList.add('is-dimmed'));

        edgesToHighlight.forEach(e => {
          const edgeEl = this.findEdgeElement(e.source, e.destination);
          if (edgeEl) {
            edgeEl.classList.remove('is-dimmed');
            edgeEl.classList.add('is-solution-edge');
          }
        });
      }

      // Highlight Traversal Path Nodes or Visited Nodes
      const pathNodes = result.path || result.traversalOrder || [];
      if (pathNodes.length > 0) {
        pathNodes.forEach(id => {
          const nodeEl = this.nodesLayer.querySelector(`[data-node-id="${id}"]`);
          if (nodeEl) nodeEl.classList.add('is-visited');
        });
      }

      this.updateSelectionClasses();
    }

    resetVisualization() {
      if (!this.svg) return;
      this.svg.querySelectorAll('.is-active-node, .is-active-edge, .is-visited, .is-solution-edge, .is-dimmed').forEach(el => {
        el.classList.remove('is-active-node', 'is-active-edge', 'is-visited', 'is-solution-edge', 'is-dimmed');
      });
      this.updateSelectionClasses();
    }

    findEdgeElement(u, v) {
      if (!this.edgesLayer) return null;
      let el = this.edgesLayer.querySelector(`[data-edge-id="${u}-${v}"]`);
      if (!el) {
        el = this.edgesLayer.querySelector(`[data-edge-id="${v}-${u}"]`);
      }
      return el;
    }
  }

  window.AeroGraphVisualizer = GraphVisualizer;

})(window);
