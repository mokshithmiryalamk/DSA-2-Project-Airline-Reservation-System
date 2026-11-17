/**
 * AEROOPS: B+ Tree Multiway Index Engine (Stage 4)
 *
 * Faithfully mirrors `tree.BPlusTree.java` and `tree.BPlusTreeNode.java`.
 * Minimum degree configuration: t = 3
 * - Internal Nodes: Store index routing keys and child branch pointers.
 * - Leaf Nodes: Store all data records and sequential `next` pointer links.
 *
 * Java methods implemented:
 * - insert(int key) -> inserts into leaf, splits full leaves, links next pointers
 * - search(int key) -> search following leaf pointers
 * - display() -> sequential leaf traversal across `current = current.next`
 *
 * Educational Extensions:
 * - Distinguishes Internal Index Nodes vs. Data Leaf Nodes
 * - Range search across sequential leaf links [minKey, maxKey]
 * - Sequential leaf traversal step tracer
 *
 * Documented Limitation:
 * The original Java B+ Tree class (`BPlusTree.java`) does not implement deletion.
 */

(function (window) {
  'use strict';

  class BPlusTreeNode {
    constructor(degree = 3, leaf = true) {
      this.degree = degree;
      this.leaf = leaf;
      this.keys = [];
      this.children = [];
      this.next = null; // Horizontal pointer linking sequential leaf nodes
      this.keyCount = 0;
    }
  }

  class BPlusTree {
    constructor(degree = 3) {
      this.degree = degree;
      this.root = null;
    }

    reset() {
      this.root = null;
    }

    /**
     * Inserts a key into the B+ Tree
     */
    insert(key) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey)) throw new Error('Key must be a valid integer.');

      const steps = [];
      const maxKeys = 2 * this.degree - 1; // 5

      if (this.root === null) {
        this.root = new BPlusTreeNode(this.degree, true);
        this.root.keys[0] = numKey;
        this.root.keyCount = 1;

        steps.push({
          type: 'init_root',
          activeKey: numKey,
          keys: [numKey],
          logMessage: `B+ Tree was empty. Initialized root leaf node with Key [${numKey}].`
        });

        return { success: true, steps, root: this.root };
      }

      // Root split if capacity exceeded
      if (this.root.keyCount === maxKeys) {
        const oldRoot = this.root;
        const newRoot = new BPlusTreeNode(this.degree, false);
        newRoot.children[0] = oldRoot;

        steps.push({
          type: 'root_full',
          activeKey: numKey,
          keys: [...oldRoot.keys],
          logMessage: `Root node full (5 keys). Creating new internal root index node to split.`
        });

        this.splitChild(newRoot, 0, oldRoot, steps);

        let i = 0;
        if (newRoot.keys[0] <= numKey) {
          i++;
        }

        this.insertNonFull(newRoot.children[i], numKey, steps);
        this.root = newRoot;
      } else {
        this.insertNonFull(this.root, numKey, steps);
      }

      return { success: true, steps, root: this.root };
    }

    insertNonFull(node, key, steps) {
      let i = node.keyCount - 1;
      const maxKeys = 2 * this.degree - 1;

      if (node.leaf) {
        // Prevent duplicate keys
        if (node.keys.includes(key)) {
          steps.push({
            type: 'duplicate',
            activeKey: key,
            logMessage: `Duplicate Key ${key} ignored. B+ Tree maintains unique keys.`
          });
          return;
        }

        while (i >= 0 && node.keys[i] > key) {
          node.keys[i + 1] = node.keys[i];
          i--;
        }

        node.keys[i + 1] = key;
        node.keyCount++;

        steps.push({
          type: 'inserted_leaf',
          activeKey: key,
          leafKeys: [...node.keys],
          logMessage: `Inserted Key ${key} into leaf node [${node.keys.join(', ')}].`
        });
      } else {
        while (i >= 0 && node.keys[i] > key) {
          i--;
        }
        i++;

        if (node.children[i].keyCount === maxKeys) {
          this.splitChild(node, i, node.children[i], steps);

          if (node.keys[i] <= key) {
            i++;
          }
        }

        this.insertNonFull(node.children[i], key, steps);
      }
    }

    splitChild(parent, index, fullChild, steps) {
      const t = this.degree;
      const newChild = new BPlusTreeNode(t, fullChild.leaf);

      if (fullChild.leaf) {
        // For LEAF NODES: keys stay in leaf and copy median up to parent
        const splitPoint = t; // Split index
        newChild.keys = fullChild.keys.slice(splitPoint - 1);
        newChild.keyCount = newChild.keys.length;

        fullChild.keys = fullChild.keys.slice(0, splitPoint - 1);
        fullChild.keyCount = fullChild.keys.length;

        // Maintain sequential leaf links: fullChild -> newChild -> oldNext
        newChild.next = fullChild.next;
        fullChild.next = newChild;

        const promotedKey = newChild.keys[0]; // Copy first key of right leaf to parent index

        // Insert newChild pointer into parent
        parent.children.splice(index + 1, 0, newChild);
        // Insert promotedKey into parent index keys
        parent.keys.splice(index, 0, promotedKey);
        parent.keyCount = parent.keys.length;

        steps.push({
          type: 'split_leaf',
          promotedKey: promotedKey,
          leftKeys: [...fullChild.keys],
          rightKeys: [...newChild.keys],
          logMessage: `Split leaf node. Linked sequential leaf: [${fullChild.keys.join(', ')}] ➔ [${newChild.keys.join(', ')}]. Copied router key [${promotedKey}] to parent index.`
        });
      } else {
        // For INTERNAL INDEX NODES: promote median key (standard B-Tree style)
        const medianKey = fullChild.keys[t - 1];

        newChild.keys = fullChild.keys.slice(t);
        newChild.keyCount = newChild.keys.length;

        newChild.children = fullChild.children.slice(t);

        fullChild.keys = fullChild.keys.slice(0, t - 1);
        fullChild.keyCount = fullChild.keys.length;

        fullChild.children = fullChild.children.slice(0, t);

        parent.children.splice(index + 1, 0, newChild);
        parent.keys.splice(index, 0, medianKey);
        parent.keyCount = parent.keys.length;

        steps.push({
          type: 'split_internal',
          promotedKey: medianKey,
          leftKeys: [...fullChild.keys],
          rightKeys: [...newChild.keys],
          logMessage: `Split internal index node around median key [${medianKey}].`
        });
      }
    }

    /**
     * Search for key in B+ Tree
     * Mirrors Java `search(int key)` and supports index-guided routing
     */
    search(key) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey)) throw new Error('Key must be a valid integer.');

      const steps = [];
      const visitedNodes = [];

      // 1. Traverse index nodes down to leaf
      let current = this.root;

      steps.push({
        type: 'search_start',
        activeKey: numKey,
        logMessage: `Starting B+ Tree search for Key ${numKey}.`
      });

      while (current !== null && !current.leaf) {
        visitedNodes.push([...current.keys]);
        let i = 0;
        while (i < current.keyCount && numKey >= current.keys[i]) {
          i++;
        }

        steps.push({
          type: 'index_routing',
          activeKey: numKey,
          indexKeys: [...current.keys],
          branchIndex: i,
          logMessage: `Internal index node [${current.keys.join(', ')}]: Routing to child branch ${i}.`
        });

        current = current.children[i];
      }

      // 2. Search within target leaf node
      if (current && current.leaf) {
        visitedNodes.push([...current.keys]);
        const found = current.keys.includes(numKey);

        steps.push({
          type: found ? 'found_leaf' : 'not_found',
          activeKey: numKey,
          leafKeys: [...current.keys],
          found: found,
          logMessage: found 
            ? `Key ${numKey} located in data leaf [${current.keys.join(', ')}]!`
            : `Key ${numKey} not found in targeted data leaf [${current.keys.join(', ')}].`
        });

        return {
          found: found,
          targetLeaf: current,
          visitedNodes: visitedNodes,
          steps: steps
        };
      }

      return { found: false, visitedNodes, steps };
    }

    /**
     * Returns an ordered array of all leaf nodes by following `next` pointers
     * Mirrors Java `display()`: `while (current != null) { ... current = current.next; }`
     */
    getLeaves() {
      const leaves = [];
      let current = this.root;
      if (!current) return leaves;

      // Descend to leftmost leaf
      while (current && !current.leaf) {
        current = current.children[0];
      }

      // Follow next pointers
      while (current !== null) {
        leaves.push(current);
        current = current.next;
      }

      return leaves;
    }

    /**
     * Performs sequential leaf traversal across all connected leaves
     */
    sequentialLeafTraversal() {
      const leaves = this.getLeaves();
      const allKeys = [];
      const steps = [];

      steps.push({
        type: 'start_sequential',
        logMessage: `Beginning sequential leaf traversal following horizontal 'next' pointers.`
      });

      leaves.forEach((leaf, idx) => {
        allKeys.push(...leaf.keys);
        steps.push({
          type: 'leaf_visit',
          leafIndex: idx,
          keys: [...leaf.keys],
          hasNext: leaf.next !== null,
          logMessage: `Scanning Leaf ${idx + 1}: Keys [${leaf.keys.join(', ')}] ${leaf.next ? '➔ (next leaf pointer)' : '➔ (End of chain)'}`
        });
      });

      return {
        keys: allKeys,
        leavesCount: leaves.length,
        steps: steps
      };
    }

    /**
     * Range query using leaf sequential traversal [minKey, maxKey]
     */
    rangeSearch(minKey, maxKey) {
      const min = parseInt(minKey, 10);
      const max = parseInt(maxKey, 10);
      const result = [];
      const searchRes = this.search(min);

      let currentLeaf = searchRes.targetLeaf;
      while (currentLeaf !== null) {
        for (let i = 0; i < currentLeaf.keyCount; i++) {
          const k = currentLeaf.keys[i];
          if (k >= min && k <= max) {
            result.push(k);
          } else if (k > max) {
            return result;
          }
        }
        currentLeaf = currentLeaf.next;
      }

      return result;
    }

    getStats() {
      let internalCount = 0;
      let leafCount = 0;
      let totalKeys = 0;

      function count(node) {
        if (!node) return 0;
        if (node.leaf) {
          leafCount++;
          totalKeys += node.keyCount;
          return 1;
        } else {
          internalCount++;
          let maxH = 0;
          for (let i = 0; i <= node.keyCount; i++) {
            maxH = Math.max(maxH, count(node.children[i]));
          }
          return 1 + maxH;
        }
      }

      const height = count(this.root);

      return {
        type: 'B+ Tree Index',
        javaClass: 'tree.BPlusTree',
        degree: this.degree,
        height: height,
        internalNodes: internalCount,
        leafNodes: leafCount,
        totalKeys: totalKeys,
        rootKeys: this.root ? [...this.root.keys] : [],
        supportsDeletion: false
      };
    }
  }

  window.AeroBPlusTree = BPlusTree;

})(window);
