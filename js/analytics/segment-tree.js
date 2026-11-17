/**
 * AEROOPS: Segment Tree Implementation (Stage 5)
 *
 * Direct JavaScript port of Java `tree.SegmentTree`.
 * Implements Range Minimum Query (RMQ) and dynamic point updates in O(log N).
 * Allocates 4*N array representation with 0-indexed root and binary branching.
 */

(function (window) {
  'use strict';

  class SegmentTree {
    /**
     * Constructs a Segment Tree from an array of fare numbers.
     * @param {number[]} faresArray
     */
    constructor(faresArray) {
      if (!Array.isArray(faresArray) || faresArray.length === 0) {
        this.fares = [0];
      } else {
        this.fares = faresArray.map(Number);
      }

      this.n = this.fares.length;
      // Mirror Java: tree = new double[4 * fares.length];
      this.tree = new Array(4 * this.n).fill(Infinity);
      this.buildTree(0, 0, this.n - 1);
    }

    /**
     * Recursive tree construction mirroring Java buildTree(int node, int start, int end)
     */
    buildTree(node, start, end) {
      if (start === end) {
        this.tree[node] = this.fares[start];
      } else {
        const mid = Math.floor((start + end) / 2);
        const leftNode = 2 * node + 1;
        const rightNode = 2 * node + 2;

        this.buildTree(leftNode, start, mid);
        this.buildTree(rightNode, mid + 1, end);

        this.tree[node] = Math.min(this.tree[leftNode], this.tree[rightNode]);
      }
    }

    /**
     * Pure Java-parity Range Minimum Query
     * @param {number} left 0-based start index
     * @param {number} right 0-based end index
     * @returns {number} Minimum fare in [left, right]
     */
    rangeMinimumQuery(left, right) {
      if (left < 0 || right >= this.n || left > right) {
        return Infinity;
      }
      return this._query(0, 0, this.n - 1, left, right);
    }

    _query(node, start, end, left, right) {
      // Disjoint: outside range
      if (right < start || end < left) {
        return Infinity; // Mirror Java Double.MAX_VALUE
      }

      // Total overlap: range fully covers this segment
      if (left <= start && end <= right) {
        return this.tree[node];
      }

      // Partial overlap: recurse both children
      const mid = Math.floor((start + end) / 2);
      const leftMin = this._query(2 * node + 1, start, mid, left, right);
      const rightMin = this._query(2 * node + 2, mid + 1, end, left, right);

      return Math.min(leftMin, rightMin);
    }

    /**
     * Pure Java-parity Point Fare Update
     * @param {number} index 0-based flight index
     * @param {number} newFare new fare value
     */
    updateFare(index, newFare) {
      if (index < 0 || index >= this.n) return;
      this._update(0, 0, this.n - 1, index, Number(newFare));
    }

    _update(node, start, end, index, newFare) {
      if (start === end) {
        this.fares[index] = newFare;
        this.tree[node] = newFare;
      } else {
        const mid = Math.floor((start + end) / 2);
        if (index <= mid) {
          this._update(2 * node + 1, start, mid, index, newFare);
        } else {
          this._update(2 * node + 2, mid + 1, end, index, newFare);
        }
        this.tree[node] = Math.min(this.tree[2 * node + 1], this.tree[2 * node + 2]);
      }
    }

    // =========================================================================
    // VISUALIZATION & INTERACTIVE STEP TRACE GENERATORS
    // =========================================================================

    /**
     * Executes RMQ while recording an algorithmic step trace for animated UI playback.
     */
    rangeMinimumQueryWithTrace(left, right) {
      const steps = [];
      const clampL = Math.max(0, left);
      const clampR = Math.min(this.n - 1, right);

      if (clampL > clampR) {
        return {
          result: Infinity,
          steps: [{
            type: 'invalid',
            log: `Invalid query range [${left}, ${right}]. Range must satisfy 0 <= left <= right < ${this.n}.`
          }]
        };
      }

      steps.push({
        type: 'start_query',
        queryRange: [clampL, clampR],
        log: `Initiating Range Minimum Query RMQ([${clampL}, ${clampR}]) across fleet array (size ${this.n}).`
      });

      const self = this;
      function traceQuery(node, start, end) {
        // Disjoint
        if (clampR < start || end < clampL) {
          steps.push({
            type: 'visit_disjoint',
            nodeIndex: node,
            segment: [start, end],
            value: self.tree[node],
            log: `Node [${start}..${end}] is completely outside query [${clampL}..${clampR}]. Pruned (return ∞).`
          });
          return Infinity;
        }

        // Total Overlap
        if (clampL <= start && end <= clampR) {
          steps.push({
            type: 'visit_total_overlap',
            nodeIndex: node,
            segment: [start, end],
            value: self.tree[node],
            log: `Node [${start}..${end}] is fully inside query [${clampL}..${clampR}]. Return segment minimum ₹${self.tree[node].toLocaleString()}.`
          });
          return self.tree[node];
        }

        // Partial Overlap
        const mid = Math.floor((start + end) / 2);
        steps.push({
          type: 'visit_partial_overlap',
          nodeIndex: node,
          segment: [start, end],
          mid: mid,
          value: self.tree[node],
          log: `Node [${start}..${end}] partially overlaps [${clampL}..${clampR}]. Splitting into left [${start}..${mid}] and right [${mid + 1}..${end}].`
        });

        const leftMin = traceQuery(2 * node + 1, start, mid);
        const rightMin = traceQuery(2 * node + 2, mid + 1, end);
        const combinedMin = Math.min(leftMin, rightMin);

        steps.push({
          type: 'merge_children',
          nodeIndex: node,
          segment: [start, end],
          leftMin: leftMin,
          rightMin: rightMin,
          combinedMin: combinedMin,
          log: `Combined results for [${start}..${end}]: min(₹${leftMin === Infinity ? '∞' : leftMin.toLocaleString()}, ₹${rightMin === Infinity ? '∞' : rightMin.toLocaleString()}) = ₹${combinedMin.toLocaleString()}.`
        });

        return combinedMin;
      }

      const finalMin = traceQuery(0, 0, this.n - 1);

      steps.push({
        type: 'query_complete',
        queryRange: [clampL, clampR],
        result: finalMin,
        log: `RMQ([${clampL}, ${clampR}]) complete. Minimum fare found: ₹${finalMin.toLocaleString()}.`
      });

      return {
        result: finalMin,
        queryRange: [clampL, clampR],
        steps: steps
      };
    }

    /**
     * Point update with visual step trace
     */
    updateFareWithTrace(index, newFare) {
      const steps = [];
      const fareVal = Number(newFare);
      const prevFare = this.fares[index];

      steps.push({
        type: 'start_update',
        index: index,
        prevFare: prevFare,
        newFare: fareVal,
        log: `Updating Flight #${index} fare from ₹${prevFare.toLocaleString()} to ₹${fareVal.toLocaleString()}.`
      });

      const self = this;
      function traceUpdate(node, start, end) {
        if (start === end) {
          self.fares[index] = fareVal;
          self.tree[node] = fareVal;
          steps.push({
            type: 'leaf_updated',
            nodeIndex: node,
            segment: [start, end],
            newFare: fareVal,
            log: `Reached leaf node [${start}]. Set leaf value to ₹${fareVal.toLocaleString()}.`
          });
        } else {
          const mid = Math.floor((start + end) / 2);
          const leftChild = 2 * node + 1;
          const rightChild = 2 * node + 2;

          steps.push({
            type: 'descend_update',
            nodeIndex: node,
            segment: [start, end],
            targetIndex: index,
            direction: index <= mid ? 'left' : 'right',
            log: `At node [${start}..${end}], index ${index} is in ${index <= mid ? 'left' : 'right'} subtree [${index <= mid ? start + '..' + mid : (mid + 1) + '..' + end}].`
          });

          if (index <= mid) {
            traceUpdate(leftChild, start, mid);
          } else {
            traceUpdate(rightChild, mid + 1, end);
          }

          self.tree[node] = Math.min(self.tree[leftChild], self.tree[rightChild]);
          steps.push({
            type: 'recalculate_node',
            nodeIndex: node,
            segment: [start, end],
            recomputedMin: self.tree[node],
            log: `Recalculated min for node [${start}..${end}]: min(₹${self.tree[leftChild].toLocaleString()}, ₹${self.tree[rightChild].toLocaleString()}) = ₹${self.tree[node].toLocaleString()}.`
          });
        }
      }

      traceUpdate(0, 0, this.n - 1);

      steps.push({
        type: 'update_complete',
        index: index,
        newFare: fareVal,
        log: `Point update complete. Root minimum is now ₹${this.tree[0].toLocaleString()}.`
      });

      return {
        prevFare: prevFare,
        newFare: fareVal,
        steps: steps
      };
    }

    /**
     * Builds hierarchical node tree for SVG/DOM rendering
     */
    getHierarchy() {
      const self = this;
      function buildNode(node, start, end, depth) {
        const item = {
          nodeIndex: node,
          start: start,
          end: end,
          value: self.tree[node],
          isLeaf: start === end,
          depth: depth,
          children: []
        };

        if (start < end) {
          const mid = Math.floor((start + end) / 2);
          item.children.push(buildNode(2 * node + 1, start, mid, depth + 1));
          item.children.push(buildNode(2 * node + 2, mid + 1, end, depth + 1));
        }

        return item;
      }

      return buildNode(0, 0, this.n - 1, 0);
    }

    /**
     * Returns structural metadata for KPI telemetry
     */
    getStats() {
      return {
        type: 'Segment Tree',
        javaClass: 'tree.SegmentTree',
        elementCount: this.n,
        treeArraySize: 4 * this.n,
        height: Math.ceil(Math.log2(this.n)) + 1,
        rootMin: this.tree[0],
        operationComplexity: {
          build: 'O(N)',
          rmq: 'O(log N)',
          update: 'O(log N)',
          space: 'O(4N)'
        }
      };
    }
  }

  window.AeroSegmentTree = SegmentTree;

})(typeof window !== 'undefined' ? window : global);
