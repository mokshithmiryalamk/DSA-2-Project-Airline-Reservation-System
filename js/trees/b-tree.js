/**
 * AEROOPS: B-Tree Multiway Search Tree Engine (Stage 4)
 *
 * Faithfully mirrors `tree.BTree.java` and `tree.BTreeNode.java`.
 * Minimum degree configuration: t = 3
 * - Maximum keys per node = 2t - 1 = 5
 * - Maximum children per node = 2t = 6
 * - Minimum keys in non-root = t - 1 = 2
 *
 * Java methods implemented:
 * - insert(int key) -> insertNonFull(BTreeNode node, int key)
 * - splitChild(BTreeNode parent, int index, BTreeNode fullChild)
 * - search(int key) -> search(BTreeNode node, int key)
 * - traverse() -> traverseNode(BTreeNode node)
 *
 * Educational Extensions:
 * - Step execution trace for node splitting and median key promotion
 * - Structural metadata (node count, key count, tree height)
 *
 * Documented Limitation:
 * The original Java B-Tree class (`BTree.java`) does not implement deletion.
 */

(function (window) {
  'use strict';

  class BTreeNode {
    constructor(degree = 3, leaf = true) {
      this.degree = degree;
      this.leaf = leaf;
      this.keys = [];
      this.children = [];
      this.keyCount = 0;
    }
  }

  class BTree {
    constructor(degree = 3) {
      this.degree = degree;
      this.root = null;
    }

    reset() {
      this.root = null;
    }

    /**
     * Inserts a key into the B-Tree with step-by-step split tracing
     * Mirrors Java `insert(int key)`
     */
    insert(key) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey)) throw new Error('Key must be a valid integer.');

      const steps = [];
      const maxKeys = 2 * this.degree - 1;

      if (this.root === null) {
        this.root = new BTreeNode(this.degree, true);
        this.root.keys[0] = numKey;
        this.root.keyCount = 1;

        steps.push({
          type: 'init_root',
          activeKey: numKey,
          keys: [numKey],
          logMessage: `B-Tree was empty. Created root leaf node with Key [${numKey}].`
        });

        return { success: true, steps, root: this.root };
      }

      // If root is full, tree grows in height
      if (this.root.keyCount === maxKeys) {
        const oldRoot = this.root;
        const newRoot = new BTreeNode(this.degree, false);
        newRoot.children[0] = oldRoot;

        steps.push({
          type: 'root_full',
          activeKey: numKey,
          keys: [...oldRoot.keys],
          logMessage: `Root node is at max capacity (5 keys). Creating new parent root to split old root.`
        });

        this.splitChild(newRoot, 0, oldRoot, steps);

        let i = 0;
        if (newRoot.keys[0] < numKey) {
          i++;
        }

        this.insertNonFull(newRoot.children[i], numKey, steps);
        this.root = newRoot;
      } else {
        this.insertNonFull(this.root, numKey, steps);
      }

      return { success: true, steps, root: this.root };
    }

    /**
     * Inserts into a non-full node
     * Mirrors Java `insertNonFull(BTreeNode node, int key)`
     */
    insertNonFull(node, key, steps) {
      let i = node.keyCount - 1;
      const maxKeys = 2 * this.degree - 1;

      if (node.leaf) {
        // Prevent duplicate keys
        if (node.keys.includes(key)) {
          steps.push({
            type: 'duplicate',
            activeKey: key,
            logMessage: `Duplicate Key ${key} ignored. B-Tree index maintains unique keys.`
          });
          return;
        }

        // Shift keys greater than key
        while (i >= 0 && node.keys[i] > key) {
          node.keys[i + 1] = node.keys[i];
          i--;
        }

        node.keys[i + 1] = key;
        node.keyCount++;

        steps.push({
          type: 'inserted_leaf',
          activeKey: key,
          nodeKeys: [...node.keys],
          logMessage: `Inserted Key ${key} into leaf node [${node.keys.join(', ')}].`
        });
      } else {
        // Find child to branch into
        while (i >= 0 && node.keys[i] > key) {
          i--;
        }
        i++;

        steps.push({
          type: 'branch_internal',
          activeKey: key,
          childIndex: i,
          nodeKeys: [...node.keys],
          logMessage: `Navigating to child ${i} of internal node [${node.keys.join(', ')}].`
        });

        // If target child is full, split it first
        if (node.children[i].keyCount === maxKeys) {
          this.splitChild(node, i, node.children[i], steps);

          if (node.keys[i] < key) {
            i++;
          }
        }

        this.insertNonFull(node.children[i], key, steps);
      }
    }

    /**
     * Splits a full child node around its median key
     * Mirrors Java `splitChild(BTreeNode parent, int index, BTreeNode fullChild)`
     */
    splitChild(parent, index, fullChild, steps) {
      const t = this.degree; // 3
      const medianKey = fullChild.keys[t - 1]; // Index 2 (3rd key)

      const newChild = new BTreeNode(t, fullChild.leaf);
      newChild.keyCount = t - 1; // 2 keys

      // Copy right-hand keys to newChild
      for (let j = 0; j < t - 1; j++) {
        newChild.keys[j] = fullChild.keys[j + t];
      }
      newChild.keys = newChild.keys.slice(0, t - 1);

      // Copy right-hand children if not leaf
      if (!fullChild.leaf) {
        for (let j = 0; j < t; j++) {
          newChild.children[j] = fullChild.children[j + t];
        }
        newChild.children = newChild.children.slice(0, t);
      }

      // Truncate fullChild to left keys
      fullChild.keyCount = t - 1;
      fullChild.keys = fullChild.keys.slice(0, t - 1);
      if (!fullChild.leaf) {
        fullChild.children = fullChild.children.slice(0, t);
      }

      // Make room in parent for new child pointer
      for (let j = parent.keyCount; j >= index + 1; j--) {
        parent.children[j + 1] = parent.children[j];
      }
      parent.children[index + 1] = newChild;

      // Make room in parent for median key
      for (let j = parent.keyCount - 1; j >= index; j--) {
        parent.keys[j + 1] = parent.keys[j];
      }
      parent.keys[index] = medianKey;
      parent.keyCount++;

      steps.push({
        type: 'split_child',
        medianKey: medianKey,
        leftKeys: [...fullChild.keys],
        rightKeys: [...newChild.keys],
        parentKeys: [...parent.keys],
        logMessage: `Node split executed: Promoted median Key ${medianKey} to parent. Split child into [${fullChild.keys.join(', ')}] and [${newChild.keys.join(', ')}].`
      });
    }

    /**
     * Search for a key in the B-Tree
     * Mirrors Java `search(int key)` and `search(BTreeNode node, int key)`
     */
    search(key) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey)) throw new Error('Key must be a valid integer.');

      const steps = [];
      const visitedNodes = [];

      function searchNode(node) {
        if (!node) return null;

        visitedNodes.push([...node.keys]);
        let i = 0;

        steps.push({
          type: 'inspect_node',
          activeKey: numKey,
          nodeKeys: [...node.keys],
          isLeaf: node.leaf,
          logMessage: `Searching node [${node.keys.join(', ')}] for Key ${numKey}.`
        });

        while (i < node.keyCount && numKey > node.keys[i]) {
          i++;
        }

        if (i < node.keyCount && node.keys[i] === numKey) {
          steps.push({
            type: 'found',
            activeKey: numKey,
            nodeKeys: [...node.keys],
            keyIndex: i,
            logMessage: `Key ${numKey} located at position ${i} in node [${node.keys.join(', ')}]!`
          });
          return { found: true, node, index: i };
        }

        if (node.leaf) {
          steps.push({
            type: 'not_found',
            activeKey: numKey,
            logMessage: `Reached leaf node without match. Key ${numKey} does not exist in B-Tree.`
          });
          return null;
        }

        steps.push({
          type: 'descend_child',
          activeKey: numKey,
          childIndex: i,
          logMessage: `Target ${numKey} falls into child range ${i}. Descending to child node.`
        });

        return searchNode(node.children[i]);
      }

      const result = searchNode(this.root);
      return {
        found: result !== null,
        steps: steps,
        visitedNodes: visitedNodes,
        result: result
      };
    }

    /**
     * In-order traversal across all keys
     * Mirrors Java `traverse()`
     */
    traverse() {
      const result = [];
      function traverseNode(node) {
        if (!node) return;
        let i = 0;
        for (i = 0; i < node.keyCount; i++) {
          if (!node.leaf) {
            traverseNode(node.children[i]);
          }
          result.push(node.keys[i]);
        }
        if (!node.leaf) {
          traverseNode(node.children[i]);
        }
      }
      traverseNode(this.root);
      return result;
    }

    getStats() {
      let nodeCount = 0;
      let totalKeys = 0;

      function analyze(node) {
        if (!node) return 0;
        nodeCount++;
        totalKeys += node.keyCount;
        let maxChildH = 0;
        if (!node.leaf) {
          for (let i = 0; i <= node.keyCount; i++) {
            maxChildH = Math.max(maxChildH, analyze(node.children[i]));
          }
        }
        return 1 + maxChildH;
      }

      const height = analyze(this.root);

      return {
        type: 'B-Tree Multiway Index',
        javaClass: 'tree.BTree',
        degree: this.degree,
        maxKeysPerNode: 2 * this.degree - 1, // 5
        nodeCount: nodeCount,
        totalKeys: totalKeys,
        height: height,
        rootKeys: this.root ? [...this.root.keys] : [],
        supportsDeletion: false
      };
    }
  }

  window.AeroBTree = BTree;

})(window);
