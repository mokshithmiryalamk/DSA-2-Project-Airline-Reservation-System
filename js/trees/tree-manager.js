/**
 * AEROOPS: Tree Indexing Studio Manager (Stage 4)
 *
 * Coordinates data structures, user interactions, educational details,
 * statistical metrics, traversal execution, and SVG rendering.
 */

(function (window) {
  'use strict';

  const toast = window.AeroToast;

  class TreeStudioManager {
    constructor() {
      this.bst = new window.AeroBST();
      this.avl = new window.AeroAVLTree();
      this.btree = new window.AeroBTree(3);
      this.bplus = new window.AeroBPlusTree(3);

      this.currentType = 'bst'; // 'bst', 'avl', 'btree', 'bplus'
      this.visualizer = null;
      this.playbackTimer = null;
    }

    init() {
      this.cacheDOMElements();

      // Initialize Visualizer
      this.visualizer = new window.AeroTreeVisualizer('tree-canvas-container');
      this.visualizer.setTreeType(this.currentType);

      // Seed initial demo data for BST
      this.loadDataset('standard', false);

      this.bindEvents();
      this.updateEducationalPanel();
      this.updateStatistics();
      this.render();
    }

    getActiveTree() {
      switch (this.currentType) {
        case 'avl': return this.avl;
        case 'btree': return this.btree;
        case 'bplus': return this.bplus;
        case 'bst':
        default:
          return this.bst;
      }
    }

    cacheDOMElements() {
      this.treeTypeSelector = document.getElementById('tree-type-selector');
      this.keyInput = document.getElementById('tree-key-input');
      this.btnInsert = document.getElementById('btn-tree-insert');
      this.btnSearch = document.getElementById('btn-tree-search');
      this.btnReset = document.getElementById('btn-tree-reset');
      this.btnDemoSeed = document.getElementById('btn-tree-demo-seed');
      this.btnSyncPassengers = document.getElementById('btn-tree-sync-passengers');

      // Traversal Buttons
      this.btnInorder = document.getElementById('btn-tree-inorder');
      this.btnPreorder = document.getElementById('btn-tree-preorder');
      this.btnPostorder = document.getElementById('btn-tree-postorder');
      this.btnLevelOrder = document.getElementById('btn-tree-levelorder');
      this.btnSeqLeaves = document.getElementById('btn-tree-seq-leaves');

      // KPIs & Metrics
      this.kpiTreeType = document.getElementById('kpi-tree-type');
      this.kpiNodeCount = document.getElementById('kpi-tree-nodes');
      this.kpiHeight = document.getElementById('kpi-tree-height');
      this.kpiBalanceMetric = document.getElementById('kpi-tree-balance-metric');

      // Educational Elements
      this.eduTitle = document.getElementById('tree-edu-title');
      this.eduDesc = document.getElementById('tree-edu-desc');
      this.eduInvariant = document.getElementById('tree-edu-invariant');
      this.eduComplexitySearch = document.getElementById('tree-edu-search-comp');
      this.eduComplexityInsert = document.getElementById('tree-edu-insert-comp');
      this.eduJavaClass = document.getElementById('tree-edu-java-class');

      // Log & Traversal Result
      this.logContainer = document.getElementById('tree-execution-logs');
      this.traversalResult = document.getElementById('tree-traversal-result');
    }

    bindEvents() {
      // Tree Type Buttons
      if (this.treeTypeSelector) {
        this.treeTypeSelector.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-tree-type]');
          if (!btn) return;

          this.treeTypeSelector.querySelectorAll('[data-tree-type]').forEach(b => {
            b.classList.remove('is-active', 'btn--primary');
            b.classList.add('btn--secondary');
          });
          btn.classList.add('is-active', 'btn--primary');
          btn.classList.remove('btn--secondary');

          this.currentType = btn.getAttribute('data-tree-type');
          this.visualizer.setTreeType(this.currentType);

          // Update traversal buttons visibility based on tree type
          this.updateTraversalControlsVisibility();
          this.updateEducationalPanel();
          this.updateStatistics();
          this.render();

          toast.info(`Switched to ${this.getActiveTree().getStats().type}.`);
        });
      }

      // Insert Key
      if (this.btnInsert) {
        this.btnInsert.addEventListener('click', () => this.handleInsert());
      }

      // Search Key
      if (this.btnSearch) {
        this.btnSearch.addEventListener('click', () => this.handleSearch());
      }

      // Enter key in input
      if (this.keyInput) {
        this.keyInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.handleInsert();
          }
        });
      }

      // Reset
      if (this.btnReset) {
        this.btnReset.addEventListener('click', () => {
          this.getActiveTree().reset();
          this.visualizer.clearHighlights();
          this.addLogEntry('Reset', 'Cleared all keys from the current tree structure.');
          this.updateStatistics();
          this.render();
          toast.info('Tree structure reset.');
        });
      }

      // Load Dataset Seeds
      if (this.btnDemoSeed) {
        this.btnDemoSeed.addEventListener('click', () => {
          let datasetName = 'standard';
          if (this.currentType === 'avl') datasetName = 'avlLR';
          else if (this.currentType === 'btree' || this.currentType === 'bplus') datasetName = 'bTreeSplit';

          this.loadDataset(datasetName, true);
        });
      }

      // Sync Stage 2 Passengers
      if (this.btnSyncPassengers) {
        this.btnSyncPassengers.addEventListener('click', () => {
          const tree = this.getActiveTree();
          tree.reset();

          const ids = window.AeroTreeData.getPassengerIds();
          ids.forEach(id => {
            tree.insert(id);
          });

          this.addLogEntry('Passenger Manifest Sync', `Loaded ${ids.length} passenger ID keys [${ids.join(', ')}] from Stage 2 registry.`);
          this.updateStatistics();
          this.render();
          toast.success(`Indexed ${ids.length} passenger IDs from active PassengerService.`);
        });
      }

      // Traversals
      if (this.btnInorder) {
        this.btnInorder.addEventListener('click', () => this.executeTraversal('inorder'));
      }
      if (this.btnPreorder) {
        this.btnPreorder.addEventListener('click', () => this.executeTraversal('preorder'));
      }
      if (this.btnPostorder) {
        this.btnPostorder.addEventListener('click', () => this.executeTraversal('postorder'));
      }
      if (this.btnLevelOrder) {
        this.btnLevelOrder.addEventListener('click', () => this.executeTraversal('levelorder'));
      }
      if (this.btnSeqLeaves) {
        this.btnSeqLeaves.addEventListener('click', () => this.executeSequentialLeafTraversal());
      }
    }

    loadDataset(datasetName, showToast = true) {
      const keys = window.AeroTreeData.getDataset(datasetName);
      const tree = this.getActiveTree();
      tree.reset();

      keys.forEach(k => {
        tree.insert(k);
      });

      this.addLogEntry('Dataset Loaded', `Seeded ${keys.length} keys [${keys.join(', ')}] into ${tree.getStats().type}.`);
      this.updateStatistics();
      this.render();

      if (showToast) {
        toast.success(`Loaded dataset [${keys.join(', ')}] into ${this.currentType.toUpperCase()}.`);
      }
    }

    handleInsert() {
      if (!this.keyInput) return;
      const val = this.keyInput.value.trim();
      const numKey = parseInt(val, 10);

      if (isNaN(numKey) || numKey <= 0) {
        toast.warning('Please enter a valid positive numeric passenger key.');
        return;
      }

      const tree = this.getActiveTree();

      try {
        const result = tree.insert(numKey);
        this.keyInput.value = '';

        if (result.duplicate) {
          toast.warning(`Key ${numKey} already exists in ${tree.getStats().type}.`);
          this.addLogEntry('Duplicate Key', `Key ${numKey} rejected (unique constraint enforced).`);
          return;
        }

        this.visualizer.clearHighlights();
        this.visualizer.highlights.activeKeys = [numKey];

        if (result.rotationApplied) {
          this.visualizer.highlightRotation([result.rotationApplied.pivotKey, result.rotationApplied.childKey]);
          toast.success(`Inserted ${numKey} & executed ${result.rotationApplied.type}!`);
          this.addLogEntry('AVL Rotation', `${result.rotationApplied.type} at pivot ${result.rotationApplied.pivotKey}: ${result.rotationApplied.reason}`);
        } else {
          toast.success(`Inserted Key ${numKey} into ${tree.getStats().type}.`);
          this.addLogEntry('Insert', `Successfully added Key ${numKey} to index structure.`);
        }

        this.updateStatistics();
        this.render();

      } catch (err) {
        toast.error(err.message);
      }
    }

    handleSearch() {
      if (!this.keyInput) return;
      const val = this.keyInput.value.trim();
      const numKey = parseInt(val, 10);

      if (isNaN(numKey) || numKey <= 0) {
        toast.warning('Please enter a positive numeric key to search.');
        return;
      }

      const tree = this.getActiveTree();
      const searchRes = tree.search(numKey);

      this.visualizer.clearHighlights();

      if (searchRes.path) {
        this.visualizer.highlightSearchPath(searchRes.path);
      }

      this.render();

      if (searchRes.found) {
        toast.success(`Key ${numKey} located!`);
        this.addLogEntry('Search Match', `Key ${numKey} found. Search path: ${searchRes.path ? searchRes.path.join(' ➔ ') : 'Direct match'}.`);
      } else {
        toast.warning(`Key ${numKey} not found.`);
        this.addLogEntry('Search Miss', `Key ${numKey} does not exist in ${tree.getStats().type}.`);
      }
    }

    executeTraversal(type) {
      const tree = this.getActiveTree();
      let sequence = [];
      let label = '';

      if (type === 'inorder') {
        sequence = tree.inorder ? tree.inorder() : (tree.traverse ? tree.traverse() : []);
        label = 'In-order Traversal (Left ➔ Root ➔ Right)';
      } else if (type === 'preorder' && tree.preorder) {
        sequence = tree.preorder();
        label = 'Pre-order Traversal (Root ➔ Left ➔ Right)';
      } else if (type === 'postorder' && tree.postorder) {
        sequence = tree.postorder();
        label = 'Post-order Traversal (Left ➔ Right ➔ Root)';
      } else if (type === 'levelorder' && tree.levelOrder) {
        sequence = tree.levelOrder();
        label = 'Level-order (BFS) Traversal';
      }

      if (this.traversalResult) {
        this.traversalResult.innerHTML = `
          <strong class="text-accent font-mono">${label}:</strong>
          <span class="text-heading font-mono" style="margin-left: var(--space-2);">[ ${sequence.join(', ')} ]</span>
        `;
      }

      this.addLogEntry('Traversal', `${label}: [ ${sequence.join(', ')} ]`);
    }

    executeSequentialLeafTraversal() {
      if (this.currentType !== 'bplus') return;
      const bplus = this.bplus;
      const result = bplus.sequentialLeafTraversal();

      if (this.traversalResult) {
        this.traversalResult.innerHTML = `
          <strong class="text-accent font-mono">Sequential Leaf Link Traversal (via 'next' pointers):</strong>
          <span class="text-heading font-mono" style="margin-left: var(--space-2);">[ ${result.keys.join(' ➔ ')} ]</span>
        `;
      }

      this.addLogEntry('Sequential Leaf Scan', `Followed horizontal leaf pointers across ${result.leavesCount} leaf data nodes: [${result.keys.join(', ')}].`);

      // Animate leaf highlight
      let idx = 0;
      clearInterval(this.playbackTimer);
      this.playbackTimer = setInterval(() => {
        if (idx < result.leavesCount) {
          this.visualizer.highlightLeafIndex(idx);
          this.render();
          idx++;
        } else {
          clearInterval(this.playbackTimer);
          this.visualizer.highlightLeafIndex(null);
          this.render();
        }
      }, 600);
    }

    updateTraversalControlsVisibility() {
      const isBinary = (this.currentType === 'bst' || this.currentType === 'avl');
      const isBPlus = (this.currentType === 'bplus');

      if (this.btnPreorder) this.btnPreorder.style.display = isBinary ? 'inline-flex' : 'none';
      if (this.btnPostorder) this.btnPostorder.style.display = isBinary ? 'inline-flex' : 'none';
      if (this.btnLevelOrder) this.btnLevelOrder.style.display = isBinary ? 'inline-flex' : 'none';
      if (this.btnSeqLeaves) this.btnSeqLeaves.style.display = isBPlus ? 'inline-flex' : 'none';
    }

    updateEducationalPanel() {
      const infoMap = {
        bst: {
          title: 'Binary Search Tree (BST)',
          javaClass: 'tree.BST & tree.BSTNode',
          desc: 'A hierarchical binary tree where every node\'s left subtree contains strictly lesser passenger keys and its right subtree contains strictly greater keys.',
          invariant: 'Left Child Key < Root Key < Right Child Key',
          searchComp: 'Average: O(log n) | Worst: O(n)',
          insertComp: 'Average: O(log n) | Worst: O(n)'
        },
        avl: {
          title: 'AVL Self-Balancing Tree',
          javaClass: 'tree.AVLTree & tree.AVLNode',
          desc: 'A height-balanced binary search tree that dynamically maintains balanced subtrees by performing single (LL, RR) or double (LR, RL) rotations upon height discrepancy.',
          invariant: 'Balance Factor = Height(Left) - Height(Right) ∈ {-1, 0, 1}',
          searchComp: 'Strict Guarantee: O(log n)',
          insertComp: 'Strict Guarantee: O(log n)'
        },
        btree: {
          title: 'B-Tree Multiway Search Tree (Degree t = 3)',
          javaClass: 'tree.BTree & tree.BTreeNode',
          desc: 'A self-balancing search tree optimized for disk storage with multiple keys per node. Nodes split around the median key upon reaching 2t-1 (5) capacity.',
          invariant: 'Every internal node has at least t-1 (2) keys and up to 2t-1 (5) keys.',
          searchComp: 'Strict Guarantee: O(log n)',
          insertComp: 'Strict Guarantee: O(t · log_t n)'
        },
        bplus: {
          title: 'B+ Tree Sequential Index (Degree t = 3)',
          javaClass: 'tree.BPlusTree & tree.BPlusTreeNode (Enhanced Frontend Visualization)',
          desc: 'A high-throughput database index structure where internal nodes act exclusively as search routers, all data records reside in leaf nodes, and leaves are linked sequentially via next pointers for O(1) interval scans. Note: The original Java BPlusTree.java provided a simplified single-node insertSimple(); this frontend suite implements complete multiway leaf splitting, index routing, and horizontal leaf links.',
          invariant: 'All leaves linked horizontally via \'next\'. All internal keys replicated in leaves. Nodes split at 2t-1 keys.',
          searchComp: 'Point Search: O(log n) | Range: O(log n + k)',
          insertComp: 'Strict Guarantee: O(t · log_t n)'
        }
      };

      const info = infoMap[this.currentType] || infoMap.bst;

      if (this.eduTitle) this.eduTitle.textContent = info.title;
      if (this.eduDesc) this.eduDesc.textContent = info.desc;
      if (this.eduInvariant) this.eduInvariant.textContent = info.invariant;
      if (this.eduComplexitySearch) this.eduComplexitySearch.textContent = info.searchComp;
      if (this.eduComplexityInsert) this.eduComplexityInsert.textContent = info.insertComp;
      if (this.eduJavaClass) this.eduJavaClass.textContent = info.javaClass;
    }

    updateStatistics() {
      const stats = this.getActiveTree().getStats();

      if (this.kpiTreeType) this.kpiTreeType.textContent = stats.type;
      if (this.kpiNodeCount) this.kpiNodeCount.textContent = stats.nodeCount !== undefined ? stats.nodeCount : stats.totalKeys;
      if (this.kpiHeight) this.kpiHeight.textContent = stats.height;

      if (this.kpiBalanceMetric) {
        if (this.currentType === 'avl') {
          this.kpiBalanceMetric.textContent = stats.isBalanced ? 'Balanced (|BF| ≤ 1)' : 'Unbalanced';
          this.kpiBalanceMetric.className = stats.isBalanced ? 'badge badge--green' : 'badge badge--danger';
        } else if (this.currentType === 'btree' || this.currentType === 'bplus') {
          this.kpiBalanceMetric.textContent = `Degree t = 3`;
          this.kpiBalanceMetric.className = 'badge badge--accent';
        } else {
          this.kpiBalanceMetric.textContent = 'Unbalanced BST';
          this.kpiBalanceMetric.className = 'badge badge--dark-pill';
        }
      }
    }

    addLogEntry(action, message) {
      if (!this.logContainer) return;
      const entry = document.createElement('div');
      entry.className = 'log-entry is-active-log';
      entry.innerHTML = `
        <span class="log-step-num font-mono">${action}:</span>
        <span class="log-msg text-xs">${message}</span>
      `;
      this.logContainer.prepend(entry);
    }

    render() {
      if (this.visualizer) {
        this.visualizer.render(this.getActiveTree());
      }
    }
  }

  window.AeroTreeManager = new TreeStudioManager();

})(window);
