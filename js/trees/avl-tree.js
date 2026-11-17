/**
 * AEROOPS: AVL Self-Balancing Tree Engine (Stage 4)
 *
 * Faithfully mirrors `tree.AVLTree.java` and `tree.AVLNode.java`.
 * Java methods implemented:
 * - height(AVLNode node)
 * - getBalance(AVLNode node) = height(left) - height(right)
 * - rightRotate(AVLNode y)  [LL Rotation]
 * - leftRotate(AVLNode x)   [RR Rotation]
 * - insert(Passenger passenger) -> insertRec(node, passenger)
 * - search(int passengerId)
 * - inorder() -> inorderRec(node)
 *
 * Educational Extensions:
 * - Tracks exact rotation case (LL, RR, LR, RL)
 * - Step-by-step trace capturing balance factors and rotation pivots
 * - Invariant verification: Balance Factor always in {-1, 0, 1}
 *
 * Documented Limitation:
 * The original Java AVL class (`AVLTree.java`) does not implement deletion.
 */

(function (window) {
  'use strict';

  class AVLNode {
    constructor(key, passenger = null) {
      this.key = parseInt(key, 10);
      this.passenger = passenger || { passengerId: this.key, passengerName: `Passenger #${this.key}` };
      this.left = null;
      this.right = null;
      this.height = 1; // Standard Java implementation starts height at 1
    }
  }

  class AVLTree {
    constructor() {
      this.root = null;
      this.lastRotation = null;
    }

    reset() {
      this.root = null;
      this.lastRotation = null;
    }

    height(node) {
      if (!node) return 0;
      return node.height;
    }

    getBalance(node) {
      if (!node) return 0;
      return this.height(node.left) - this.height(node.right);
    }

    /**
     * Right Rotation (LL Case)
     * Mirrors Java `rightRotate(AVLNode y)`
     */
    rightRotate(y) {
      const x = y.left;
      const temp = x.right;

      // Perform rotation
      x.right = y;
      y.left = temp;

      // Update heights
      y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
      x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

      return x;
    }

    /**
     * Left Rotation (RR Case)
     * Mirrors Java `leftRotate(AVLNode x)`
     */
    leftRotate(x) {
      const y = x.right;
      const temp = y.left;

      // Perform rotation
      y.left = x;
      x.right = temp;

      // Update heights
      x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
      y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

      return y;
    }

    /**
     * Inserts a key into the AVL Tree and maintains the AVL balance invariant
     */
    insert(key, passenger = null) {
      const numKey = parseInt(key, 10);
      if (isNaN(numKey)) throw new Error('Key must be a valid integer.');

      const steps = [];
      let rotationApplied = null;
      let duplicateDetected = false;

      const self = this;

      function insertRec(node) {
        if (!node) {
          steps.push({
            type: 'created_node',
            activeKey: numKey,
            logMessage: `Created new AVL leaf node for Key ${numKey} (Height: 1, BF: 0).`
          });
          return new AVLNode(numKey, passenger);
        }

        if (numKey < node.key) {
          steps.push({
            type: 'traverse_left',
            activeKey: node.key,
            logMessage: `Key ${numKey} < ${node.key}. Traversing left subtree.`
          });
          node.left = insertRec(node.left);
        } else if (numKey > node.key) {
          steps.push({
            type: 'traverse_right',
            activeKey: node.key,
            logMessage: `Key ${numKey} > ${node.key}. Traversing right subtree.`
          });
          node.right = insertRec(node.right);
        } else {
          duplicateDetected = true;
          steps.push({
            type: 'duplicate',
            activeKey: node.key,
            logMessage: `Duplicate Key ${numKey} ignored. Key already exists in AVL index.`
          });
          return node;
        }

        // Update height of current ancestor node
        node.height = 1 + Math.max(self.height(node.left), self.height(node.right));

        // Calculate balance factor
        const balance = self.getBalance(node);

        steps.push({
          type: 'balance_check',
          activeKey: node.key,
          height: node.height,
          balance: balance,
          logMessage: `Calculated balance for Node ${node.key}: Height=${node.height}, Balance Factor=${balance}.`
        });

        // 1. Left-Left (LL) Case -> Right Rotate
        if (balance > 1 && numKey < node.left.key) {
          rotationApplied = {
            type: 'LL (Right Rotation)',
            pivotKey: node.key,
            childKey: node.left.key,
            reason: `Left-heavy imbalance (BF = +${balance}) after left insertion.`
          };
          steps.push({
            type: 'rotation_ll',
            activeKey: node.key,
            rotation: rotationApplied,
            logMessage: `Unbalanced node ${node.key} (BF=${balance}). Executing Right Rotation (LL Case).`
          });
          return self.rightRotate(node);
        }

        // 2. Right-Right (RR) Case -> Left Rotate
        if (balance < -1 && numKey > node.right.key) {
          rotationApplied = {
            type: 'RR (Left Rotation)',
            pivotKey: node.key,
            childKey: node.right.key,
            reason: `Right-heavy imbalance (BF = ${balance}) after right insertion.`
          };
          steps.push({
            type: 'rotation_rr',
            activeKey: node.key,
            rotation: rotationApplied,
            logMessage: `Unbalanced node ${node.key} (BF=${balance}). Executing Left Rotation (RR Case).`
          });
          return self.leftRotate(node);
        }

        // 3. Left-Right (LR) Case -> Left Rotate on left child, then Right Rotate on node
        if (balance > 1 && numKey > node.left.key) {
          rotationApplied = {
            type: 'LR (Left-Right Double Rotation)',
            pivotKey: node.key,
            childKey: node.left.key,
            reason: `Left-Right zigzag imbalance (BF = +${balance}).`
          };
          steps.push({
            type: 'rotation_lr',
            activeKey: node.key,
            rotation: rotationApplied,
            logMessage: `Unbalanced node ${node.key} (BF=${balance}). Executing Left Rotate on child ${node.left.key}, then Right Rotate on ${node.key}.`
          });
          node.left = self.leftRotate(node.left);
          return self.rightRotate(node);
        }

        // 4. Right-Left (RL) Case -> Right Rotate on right child, then Left Rotate on node
        if (balance < -1 && numKey < node.right.key) {
          rotationApplied = {
            type: 'RL (Right-Left Double Rotation)',
            pivotKey: node.key,
            childKey: node.right.key,
            reason: `Right-Left zigzag imbalance (BF = ${balance}).`
          };
          steps.push({
            type: 'rotation_rl',
            activeKey: node.key,
            rotation: rotationApplied,
            logMessage: `Unbalanced node ${node.key} (BF=${balance}). Executing Right Rotate on child ${node.right.key}, then Left Rotate on ${node.key}.`
          });
          node.right = self.rightRotate(node.right);
          return self.leftRotate(node);
        }

        return node;
      }

      this.root = insertRec(this.root);
      this.lastRotation = rotationApplied;

      return {
        success: !duplicateDetected,
        duplicate: duplicateDetected,
        rotationApplied: rotationApplied,
        rotationType: rotationApplied ? rotationApplied.type : 'None',
        steps: steps,
        root: this.root
      };
    }

    /**
     * Search for key in AVL tree
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
        logMessage: `Commencing guaranteed O(log N) search for Key ${numKey} in balanced AVL tree.`
      });

      while (current !== null) {
        path.push(current.key);

        if (numKey === current.key) {
          steps.push({
            type: 'found',
            activeKey: current.key,
            visitedKeys: [...path],
            logMessage: `Key ${numKey} successfully verified in AVL index!`
          });
          return { found: true, path, steps, node: current };
        }

        if (numKey < current.key) {
          steps.push({
            type: 'search_left',
            activeKey: current.key,
            visitedKeys: [...path],
            logMessage: `Target ${numKey} < ${current.key}. Navigating to left branch.`
          });
          current = current.left;
        } else {
          steps.push({
            type: 'search_right',
            activeKey: current.key,
            visitedKeys: [...path],
            logMessage: `Target ${numKey} > ${current.key}. Navigating to right branch.`
          });
          current = current.right;
        }
      }

      steps.push({
        type: 'not_found',
        activeKey: null,
        visitedKeys: [...path],
        logMessage: `Key ${numKey} does not exist in the AVL tree.`
      });

      return { found: false, path, steps, node: null };
    }

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
     * Verifies the AVL balance invariant across all nodes
     */
    isBalanced() {
      const self = this;
      function check(node) {
        if (!node) return true;
        const bf = self.getBalance(node);
        if (Math.abs(bf) > 1) return false;
        return check(node.left) && check(node.right);
      }
      return check(this.root);
    }

    getStats() {
      let count = 0;
      let maxBf = 0;
      const self = this;

      function analyze(node) {
        if (!node) return;
        count++;
        const bf = Math.abs(self.getBalance(node));
        if (bf > maxBf) maxBf = bf;
        analyze(node.left);
        analyze(node.right);
      }

      analyze(this.root);

      return {
        type: 'AVL Balanced Tree',
        javaClass: 'tree.AVLTree',
        nodeCount: count,
        height: this.height(this.root),
        maxBalanceFactor: maxBf,
        isBalanced: this.isBalanced(),
        lastRotation: this.lastRotation ? this.lastRotation.type : 'None',
        rootKey: this.root ? this.root.key : null,
        supportsDeletion: false
      };
    }
  }

  window.AeroAVLTree = AVLTree;

})(window);
