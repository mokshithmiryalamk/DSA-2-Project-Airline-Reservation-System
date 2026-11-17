/**
 * AEROOPS: Binary Search Tree (BST) Engine (Stage 4)
 *
 * Faithfully mirrors `tree.BST.java` and `tree.BSTNode.java`.
 * Java methods implemented:
 * - insert(Passenger passenger) -> insertRec(root, passenger)
 * - search(int passengerId)
 * - inorder() -> inorderRec(root)
 *
 * Frontend extensions for interactive educational studio:
 * - Preorder, Postorder, and Level-Order traversals
 * - Step-by-step search and insertion trace generator
 * - Visual tree metrics (node count, height, min/max key)
 *
 * Documented Limitation:
 * The original Java BST class (`BST.java`) does not implement deletion.
 */

(function (window) {
  'use strict';

  class BSTNode {
    constructor(key, passenger = null) {
      this.key = parseInt(key, 10);
      this.passenger = passenger || { passengerId: this.key, passengerName: `Passenger #${this.key}` };
      this.left = null;
      this.right = null;
    }
  }

  class BinarySearchTree {
    constructor() {
      this.root = null;
    }

    /**
     * Clears all nodes from the tree
     */
    reset() {
      this.root = null;
    }

    /**
     * Inserts a key into the BST with execution step tracing
     * Mirrors Java `insert(Passenger passenger)` & `insertRec(BSTNode, Passenger)`
     */
    insert(key, passenger = null) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey)) throw new Error('Key must be a valid integer.');

      const steps = [];
      const newNode = new BSTNode(numKey, passenger);

      if (this.root === null) {
        this.root = newNode;
        steps.push({
          type: 'insert_root',
          activeKey: numKey,
          visitedKeys: [numKey],
          logMessage: `Tree was empty. Created root node with Key ${numKey}.`
        });
        return { success: true, steps, root: this.root };
      }

      let current = this.root;
      const visited = [];

      while (current !== null) {
        visited.push(current.key);

        if (numKey === current.key) {
          steps.push({
            type: 'duplicate',
            activeKey: current.key,
            visitedKeys: [...visited],
            logMessage: `Duplicate Key ${numKey} rejected. BST enforces unique passenger ID keys.`
          });
          return { success: false, duplicate: true, steps, root: this.root };
        }

        if (numKey < current.key) {
          steps.push({
            type: 'compare_left',
            activeKey: current.key,
            visitedKeys: [...visited],
            logMessage: `Key ${numKey} < ${current.key}. Navigating to left subtree.`
          });

          if (current.left === null) {
            current.left = newNode;
            steps.push({
              type: 'inserted',
              activeKey: numKey,
              parentKey: current.key,
              direction: 'left',
              visitedKeys: [...visited, numKey],
              logMessage: `Inserted Key ${numKey} as left child of ${current.key}.`
            });
            break;
          }
          current = current.left;
        } else {
          steps.push({
            type: 'compare_right',
            activeKey: current.key,
            visitedKeys: [...visited],
            logMessage: `Key ${numKey} > ${current.key}. Navigating to right subtree.`
          });

          if (current.right === null) {
            current.right = newNode;
            steps.push({
              type: 'inserted',
              activeKey: numKey,
              parentKey: current.key,
              direction: 'right',
              visitedKeys: [...visited, numKey],
              logMessage: `Inserted Key ${numKey} as right child of ${current.key}.`
            });
            break;
          }
          current = current.right;
        }
      }

      return { success: true, steps, root: this.root };
    }

    /**
     * Searches for a key in the BST
     * Mirrors Java `search(int passengerId)`
     */
    search(key) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey)) throw new Error('Key must be a valid integer.');

      const steps = [];
      const path = [];
      let current = this.root;

      steps.push({
        type: 'search_start',
        activeKey: current ? current.key : null,
        visitedKeys: [],
        logMessage: `Initiating binary search for Key ${numKey} starting from root.`
      });

      while (current !== null) {
        path.push(current.key);

        if (numKey === current.key) {
          steps.push({
            type: 'found',
            activeKey: current.key,
            visitedKeys: [...path],
            logMessage: `Key ${numKey} found at node. Associated passenger record retrieved.`
          });
          return { found: true, path, steps, node: current };
        }

        if (numKey < current.key) {
          steps.push({
            type: 'search_left',
            activeKey: current.key,
            visitedKeys: [...path],
            logMessage: `Target ${numKey} < ${current.key}. Branching left.`
          });
          current = current.left;
        } else {
          steps.push({
            type: 'search_right',
            activeKey: current.key,
            visitedKeys: [...path],
            logMessage: `Target ${numKey} > ${current.key}. Branching right.`
          });
          current = current.right;
        }
      }

      steps.push({
        type: 'not_found',
        activeKey: null,
        visitedKeys: [...path],
        logMessage: `Key ${numKey} was not located in the BST (Reached null leaf link).`
      });

      return { found: false, path, steps, node: null };
    }

    /**
     * In-order traversal: Left -> Root -> Right
     * Mirrors Java `inorder()` & `inorderRec()`
     */
    inorder() {
      const result = [];
      function traverse(node) {
        if (!node) return;
        traverse(node.left);
        result.push(node.key);
        traverse(node.right);
      }
      traverse(this.root);
      return result;
    }

    /**
     * Pre-order traversal: Root -> Left -> Right
     */
    preorder() {
      const result = [];
      function traverse(node) {
        if (!node) return;
        result.push(node.key);
        traverse(node.left);
        traverse(node.right);
      }
      traverse(this.root);
      return result;
    }

    /**
     * Post-order traversal: Left -> Right -> Root
     */
    postorder() {
      const result = [];
      function traverse(node) {
        if (!node) return;
        traverse(node.left);
        traverse(node.right);
        result.push(node.key);
      }
      traverse(this.root);
      return result;
    }

    /**
     * Level-order (BFS) traversal
     */
    levelOrder() {
      const result = [];
      if (!this.root) return result;
      const queue = [this.root];
      while (queue.length > 0) {
        const node = queue.shift();
        result.push(node.key);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }
      return result;
    }

    /**
     * Returns structural metadata of the tree
     */
    getStats() {
      let count = 0;
      function countNodes(node) {
        if (!node) return 0;
        return 1 + countNodes(node.left) + countNodes(node.right);
      }
      function getHeight(node) {
        if (!node) return 0;
        return 1 + Math.max(getHeight(node.left), getHeight(node.right));
      }

      return {
        type: 'Binary Search Tree',
        javaClass: 'tree.BST',
        nodeCount: countNodes(this.root),
        height: getHeight(this.root),
        rootKey: this.root ? this.root.key : null,
        supportsDeletion: false
      };
    }
  }

  window.AeroBST = BinarySearchTree;

})(window);
