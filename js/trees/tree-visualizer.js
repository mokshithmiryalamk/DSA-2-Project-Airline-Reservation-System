/**
 * AEROOPS: Interactive SVG Tree Visualizer (Stage 4)
 *
 * Renders Binary Trees (BST, AVL) and Multi-Key Trees (B-Tree, B+ Tree)
 * on a responsive SVG canvas with active path highlighting, rotation pivots,
 * and horizontal sequential leaf linkages.
 */

(function (window) {
  'use strict';

  class TreeVisualizer {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      this.options = Object.assign({
        width: 900,
        height: 480,
        nodeRadius: 20
      }, options);

      this.treeType = 'bst'; // 'bst', 'avl', 'btree', 'bplus'
      this.svg = null;
      this.highlights = {
        activeKeys: [],
        searchPath: [],
        rotationPivots: [],
        activeLeafIndex: null
      };

      this.init();
    }

    init() {
      if (!this.container) return;
      this.container.innerHTML = '';

      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
      this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      this.svg.classList.add('tree-canvas-svg');

      // Defs (Gradients and Markers)
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <marker id="tree-leaf-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#34D399" />
        </marker>
        <pattern id="tree-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="rgba(56, 189, 248, 0.08)" />
        </pattern>
      `;
      this.svg.appendChild(defs);

      // Background Grid
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('width', '100%');
      bg.setAttribute('height', '100%');
      bg.setAttribute('fill', 'url(#tree-grid)');
      this.svg.appendChild(bg);

      this.contentLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.contentLayer.classList.add('layer-tree-content');
      this.svg.appendChild(this.contentLayer);

      this.container.appendChild(this.svg);
    }

    setTreeType(type) {
      this.treeType = type;
      this.clearHighlights();
    }

    clearHighlights() {
      this.highlights = {
        activeKeys: [],
        searchPath: [],
        rotationPivots: [],
        activeLeafIndex: null
      };
    }

    highlightSearchPath(pathKeys = []) {
      this.highlights.searchPath = [...pathKeys];
      this.highlights.activeKeys = pathKeys.slice(-1);
    }

    highlightRotation(pivots = []) {
      this.highlights.rotationPivots = [...pivots];
    }

    highlightLeafIndex(idx) {
      this.highlights.activeLeafIndex = idx;
    }

    render(treeInstance) {
      if (!this.contentLayer) return;
      this.contentLayer.innerHTML = '';

      if (!treeInstance || !treeInstance.root) {
        this.renderEmptyState();
        return;
      }

      if (this.treeType === 'bst' || this.treeType === 'avl') {
        this.renderBinaryTree(treeInstance.root);
      } else if (this.treeType === 'btree') {
        this.renderBTree(treeInstance.root);
      } else if (this.treeType === 'bplus') {
        this.renderBPlusTree(treeInstance.root, treeInstance.getLeaves());
      }
    }

    renderEmptyState() {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${this.options.width / 2}, ${this.options.height / 2})`);

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('y', -10);
      icon.setAttribute('font-size', '36px');
      icon.textContent = '🌲';

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      title.setAttribute('text-anchor', 'middle');
      title.setAttribute('y', 30);
      title.setAttribute('fill', 'var(--color-text-secondary, #A49BAE)');
      title.setAttribute('font-size', '14px');
      title.setAttribute('font-family', 'var(--font-heading)');
      title.textContent = 'Tree structure is currently empty';

      const desc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      desc.setAttribute('text-anchor', 'middle');
      desc.setAttribute('y', 52);
      desc.setAttribute('fill', 'var(--color-text-muted, #756A82)');
      desc.setAttribute('font-size', '12px');
      desc.setAttribute('font-family', 'var(--font-body)');
      desc.textContent = 'Insert passenger ID keys or click "Load Demo Dataset" to visualize indexing.';

      g.appendChild(icon);
      g.appendChild(title);
      g.appendChild(desc);
      this.contentLayer.appendChild(g);
    }

    /* =========================================================================
       BINARY TREE RENDERING (BST & AVL)
       ========================================================================= */

    renderBinaryTree(root) {
      const positions = new Map();
      const radius = this.options.nodeRadius;

      // Assign horizontal coordinates using in-order sequence
      let xCounter = 0;
      function assignPositions(node, depth = 0) {
        if (!node) return;
        assignPositions(node.left, depth + 1);
        xCounter++;
        positions.set(node, { x: xCounter, depth });
        assignPositions(node.right, depth + 1);
      }
      assignPositions(root);

      const totalNodes = xCounter;
      const xMargin = 60;
      const availableWidth = this.options.width - (2 * xMargin);
      const xStep = totalNodes > 1 ? availableWidth / (totalNodes + 1) : availableWidth / 2;
      const yStep = 65;
      const yMargin = 50;

      // Map to pixel coordinates
      positions.forEach((pos, node) => {
        pos.px = xMargin + (pos.x * xStep);
        pos.py = yMargin + (pos.depth * yStep);
      });

      // 1. Draw Edges
      positions.forEach((pos, node) => {
        if (node.left) {
          const leftPos = positions.get(node.left);
          this.drawTreeEdge(pos.px, pos.py, leftPos.px, leftPos.py, node.key, node.left.key);
        }
        if (node.right) {
          const rightPos = positions.get(node.right);
          this.drawTreeEdge(pos.px, pos.py, rightPos.px, rightPos.py, node.key, node.right.key);
        }
      });

      // 2. Draw Nodes
      positions.forEach((pos, node) => {
        this.drawBinaryNode(pos.px, pos.py, node);
      });
    }

    drawTreeEdge(x1, y1, x2, y2, parentKey, childKey) {
      const isPathEdge = this.highlights.searchPath.includes(parentKey) && this.highlights.searchPath.includes(childKey);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.classList.add('tree-edge-line');
      if (isPathEdge) line.classList.add('is-path-edge');
      this.contentLayer.appendChild(line);
    }

    drawBinaryNode(x, y, node) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${x}, ${y})`);
      g.classList.add('tree-node-group');

      const isSearchActive = this.highlights.activeKeys.includes(node.key);
      const isPath = this.highlights.searchPath.includes(node.key);
      const isRotationPivot = this.highlights.rotationPivots.includes(node.key);

      // Node Circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', this.options.nodeRadius);
      circle.classList.add('tree-node-circle');
      if (isSearchActive) circle.classList.add('is-active-key');
      else if (isPath) circle.classList.add('is-path-key');
      if (isRotationPivot) circle.classList.add('is-rotation-pivot');
      g.appendChild(circle);

      // Node Key Text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('y', 4);
      text.setAttribute('text-anchor', 'middle');
      text.classList.add('tree-node-text');
      text.textContent = node.key;
      g.appendChild(text);

      // If AVL, display Balance Factor Badge
      if (this.treeType === 'avl' && node.height !== undefined) {
        const bf = (node.left ? node.left.height : 0) - (node.right ? node.right.height : 0);
        const bfBadge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        bfBadge.setAttribute('transform', 'translate(14, -14)');

        const badgeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        badgeRect.setAttribute('x', -10);
        badgeRect.setAttribute('y', -8);
        badgeRect.setAttribute('width', 20);
        badgeRect.setAttribute('height', 14);
        badgeRect.setAttribute('rx', 3);
        badgeRect.classList.add('tree-bf-badge');
        if (Math.abs(bf) > 1) badgeRect.classList.add('is-unbalanced');

        const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeText.setAttribute('y', 3);
        badgeText.setAttribute('text-anchor', 'middle');
        badgeText.classList.add('tree-bf-text');
        badgeText.textContent = bf > 0 ? `+${bf}` : `${bf}`;

        bfBadge.appendChild(badgeRect);
        bfBadge.appendChild(badgeText);
        g.appendChild(bfBadge);
      }

      this.contentLayer.appendChild(g);
    }

    /* =========================================================================
       MULTIWAY TREE RENDERING (B-TREE & B+ TREE)
       ========================================================================= */

    renderBTree(root) {
      const levels = [];
      function collectLevels(node, depth = 0) {
        if (!node) return;
        if (!levels[depth]) levels[depth] = [];
        levels[depth].push(node);
        if (!node.leaf) {
          for (let i = 0; i <= node.keyCount; i++) {
            collectLevels(node.children[i], depth + 1);
          }
        }
      }
      collectLevels(root);

      const positions = new Map();
      const yStep = 90;
      const yMargin = 60;

      levels.forEach((nodesInLevel, depth) => {
        const count = nodesInLevel.length;
        const xStep = this.options.width / (count + 1);
        nodesInLevel.forEach((node, idx) => {
          positions.set(node, {
            x: (idx + 1) * xStep,
            y: yMargin + (depth * yStep)
          });
        });
      });

      // 1. Draw Child Edges
      positions.forEach((pos, node) => {
        if (!node.leaf) {
          for (let i = 0; i <= node.keyCount; i++) {
            const child = node.children[i];
            if (child && positions.has(child)) {
              const childPos = positions.get(child);
              this.drawMultiwayEdge(pos.x, pos.y + 16, childPos.x, childPos.y - 16);
            }
          }
        }
      });

      // 2. Draw Multi-key Blocks
      positions.forEach((pos, node) => {
        this.drawBTreeNodeBlock(pos.x, pos.y, node);
      });
    }

    renderBPlusTree(root, leaves = []) {
      const levels = [];
      function collectLevels(node, depth = 0) {
        if (!node) return;
        if (!levels[depth]) levels[depth] = [];
        levels[depth].push(node);
        if (!node.leaf) {
          for (let i = 0; i <= node.keyCount; i++) {
            collectLevels(node.children[i], depth + 1);
          }
        }
      }
      collectLevels(root);

      const positions = new Map();
      const yStep = 90;
      const yMargin = 60;

      levels.forEach((nodesInLevel, depth) => {
        const count = nodesInLevel.length;
        const xStep = this.options.width / (count + 1);
        nodesInLevel.forEach((node, idx) => {
          positions.set(node, {
            x: (idx + 1) * xStep,
            y: yMargin + (depth * yStep)
          });
        });
      });

      // 1. Draw Tree Edges from Index nodes to children
      positions.forEach((pos, node) => {
        if (!node.leaf) {
          for (let i = 0; i <= node.keyCount; i++) {
            const child = node.children[i];
            if (child && positions.has(child)) {
              const childPos = positions.get(child);
              this.drawMultiwayEdge(pos.x, pos.y + 16, childPos.x, childPos.y - 16);
            }
          }
        }
      });

      // 2. Draw Horizontal Sequential Leaf Links (next pointers)
      for (let i = 0; i < leaves.length - 1; i++) {
        const currLeaf = leaves[i];
        const nextLeaf = leaves[i + 1];
        if (positions.has(currLeaf) && positions.has(nextLeaf)) {
          const p1 = positions.get(currLeaf);
          const p2 = positions.get(nextLeaf);
          this.drawLeafHorizontalLink(p1.x, p1.y, p2.x, p2.y, i === this.highlights.activeLeafIndex);
        }
      }

      // 3. Draw Multi-key Node Blocks
      positions.forEach((pos, node) => {
        this.drawBPlusNodeBlock(pos.x, pos.y, node);
      });
    }

    drawMultiwayEdge(x1, y1, x2, y2) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.classList.add('tree-edge-line');
      this.contentLayer.appendChild(line);
    }

    drawLeafHorizontalLink(x1, y1, x2, y2, isActive = false) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1 + 35);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2 - 35);
      line.setAttribute('y2', y2);
      line.classList.add('bplus-leaf-link');
      if (isActive) line.classList.add('is-active-link');
      line.setAttribute('marker-end', 'url(#tree-leaf-arrow)');
      this.contentLayer.appendChild(line);
    }

    drawBTreeNodeBlock(x, y, node) {
      const cellWidth = 28;
      const height = 30;
      const count = node.keyCount;
      const totalWidth = count * cellWidth;
      const startX = x - (totalWidth / 2);

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${startX}, ${y - height / 2})`);
      g.classList.add('btree-node-block');

      // Outer Box
      const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      box.setAttribute('width', totalWidth);
      box.setAttribute('height', height);
      box.setAttribute('rx', 4);
      box.classList.add('btree-box');
      g.appendChild(box);

      // Key Dividers & Text
      for (let i = 0; i < count; i++) {
        const k = node.keys[i];
        const isMatch = this.highlights.activeKeys.includes(k);

        if (i > 0) {
          const div = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          div.setAttribute('x1', i * cellWidth);
          div.setAttribute('y1', 0);
          div.setAttribute('x2', i * cellWidth);
          div.setAttribute('y2', height);
          div.classList.add('btree-divider');
          g.appendChild(div);
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (i * cellWidth) + (cellWidth / 2));
        text.setAttribute('y', 19);
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('btree-key-text');
        if (isMatch) text.classList.add('is-matched-key');
        text.textContent = k;
        g.appendChild(text);
      }

      this.contentLayer.appendChild(g);
    }

    drawBPlusNodeBlock(x, y, node) {
      const cellWidth = 28;
      const height = 30;
      const count = node.keyCount;
      const totalWidth = count * cellWidth;
      const startX = x - (totalWidth / 2);

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${startX}, ${y - height / 2})`);
      g.classList.add('bplus-node-block');
      if (node.leaf) g.classList.add('is-leaf-node');
      else g.classList.add('is-index-node');

      const box = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      box.setAttribute('width', totalWidth);
      box.setAttribute('height', height);
      box.setAttribute('rx', 4);
      box.classList.add('bplus-box');
      g.appendChild(box);

      for (let i = 0; i < count; i++) {
        const k = node.keys[i];
        const isMatch = this.highlights.activeKeys.includes(k);

        if (i > 0) {
          const div = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          div.setAttribute('x1', i * cellWidth);
          div.setAttribute('y1', 0);
          div.setAttribute('x2', i * cellWidth);
          div.setAttribute('y2', height);
          div.classList.add('bplus-divider');
          g.appendChild(div);
        }

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (i * cellWidth) + (cellWidth / 2));
        text.setAttribute('y', 19);
        text.setAttribute('text-anchor', 'middle');
        text.classList.add('bplus-key-text');
        if (isMatch) text.classList.add('is-matched-key');
        text.textContent = k;
        g.appendChild(text);
      }

      this.contentLayer.appendChild(g);
    }
  }

  window.AeroTreeVisualizer = TreeVisualizer;

})(window);
