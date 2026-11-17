/**
 * AEROOPS: Fenwick Tree (Binary Indexed Tree) Implementation (Stage 5)
 *
 * Direct JavaScript port of Java `tree.FenwickTree`.
 * Implements prefix sum queries, range sum queries (RSQ), and dynamic point
 * delta updates in O(log N) using lowest set bit (LSB) operations: index & (-index).
 */

(function (window) {
  'use strict';

  class FenwickTree {
    /**
     * Constructs a Fenwick Tree.
     * Can be initialized with a size or an initial array of fares.
     * @param {number|number[]} sizeOrFares
     */
    constructor(sizeOrFares) {
      if (Array.isArray(sizeOrFares)) {
        this.size = Math.max(1, sizeOrFares.length);
        this.tree = new Array(this.size + 1).fill(0);
        this.fares = sizeOrFares.map(Number);
        // Build matching FlightService.java buildFenwickTree()
        for (let i = 0; i < this.fares.length; i++) {
          this.update(i, this.fares[i]);
        }
      } else {
        this.size = Math.max(1, Number(sizeOrFares) || 1);
        this.tree = new Array(this.size + 1).fill(0);
        this.fares = new Array(this.size).fill(0);
      }
    }

    /**
     * Updates the tree by adding `value` delta to element at 0-based `index`.
     * Direct mirror of Java FenwickTree.update(int index, double value)
     * @param {number} index 0-based index
     * @param {number} value delta value to add
     */
    update(index, value) {
      if (index < 0 || index >= this.size) return;

      let idx = index + 1; // 1-based indexing
      const delta = Number(value);

      while (idx <= this.size) {
        this.tree[idx] += delta;
        idx += idx & (-idx);
      }
    }

    /**
     * Replaces the fare at 0-based `index` with `newFare`, adjusting the delta in BIT.
     */
    setFare(index, newFare) {
      if (index < 0 || index >= this.size) return;
      const targetFare = Number(newFare);
      const delta = targetFare - (this.fares[index] || 0);
      this.fares[index] = targetFare;
      this.update(index, delta);
      return delta;
    }

    /**
     * Pure Java-parity Prefix Sum Query: sum of elements from index 0 to index.
     * Direct mirror of Java FenwickTree.getPrefixSum(int index)
     * @param {number} index 0-based index
     * @returns {number} Sum of fares in [0, index]
     */
    getPrefixSum(index) {
      if (index < 0) return 0;
      if (index >= this.size) index = this.size - 1;

      let idx = index + 1; // 1-based indexing
      let sum = 0;

      while (idx > 0) {
        sum += this.tree[idx];
        idx -= idx & (-idx);
      }

      return sum;
    }

    /**
     * Pure Java-parity Range Sum Query: sum of elements in [left, right].
     * Direct mirror of Java FenwickTree.getRangeSum(int left, int right)
     * @param {number} left 0-based start index
     * @param {number} right 0-based end index
     * @returns {number} Sum of fares in [left, right]
     */
    getRangeSum(left, right) {
      if (left < 0 || right >= this.size || left > right) {
        return 0;
      }

      if (left === 0) {
        return this.getPrefixSum(right);
      }

      return this.getPrefixSum(right) - this.getPrefixSum(left - 1);
    }

    // =========================================================================
    // VISUALIZATION & INTERACTIVE STEP TRACE GENERATORS
    // =========================================================================

    /**
     * Computes range sum with animated step-by-step trace showing LSB transitions
     */
    getRangeSumWithTrace(left, right) {
      const steps = [];
      const clampL = Math.max(0, left);
      const clampR = Math.min(this.size - 1, right);

      if (clampL > clampR) {
        return {
          rangeSum: 0,
          steps: [{
            type: 'invalid',
            log: `Invalid query range [${left}, ${right}]. Must satisfy 0 <= left <= right < ${this.size}.`
          }]
        };
      }

      steps.push({
        type: 'start_range_query',
        left: clampL,
        right: clampR,
        log: `Initiating Range Sum Query RSQ([${clampL}, ${clampR}]). Formula: RSQ(L, R) = PrefixSum(${clampR}) - PrefixSum(${clampL - 1}).`
      });

      // 1. Trace PrefixSum(clampR)
      const rightSteps = [];
      let idxR = clampR + 1;
      let sumR = 0;

      while (idxR > 0) {
        const lsb = idxR & (-idxR);
        const addedVal = this.tree[idxR];
        sumR += addedVal;
        const nextIdx = idxR - lsb;

        rightSteps.push({
          bitIndex: idxR,
          binary: idxR.toString(2).padStart(4, '0'),
          lsb: lsb,
          nextIndex: nextIdx,
          addedValue: addedVal,
          currentSum: sumR,
          clientRange: `[${nextIdx}..${idxR - 1}]`,
          log: `[PrefixSum(${clampR})] At 1-based index ${idxR} (bin: ${idxR.toString(2).padStart(4, '0')}), add tree[${idxR}] = ₹${addedVal.toLocaleString()}. LSB = ${lsb}. Jump to ${nextIdx}.`
        });

        idxR = nextIdx;
      }

      // 2. Trace PrefixSum(clampL - 1) if clampL > 0
      const leftSteps = [];
      let sumL = 0;
      if (clampL > 0) {
        let idxL = clampL; // (clampL - 1) + 1 = clampL
        while (idxL > 0) {
          const lsb = idxL & (-idxL);
          const addedVal = this.tree[idxL];
          sumL += addedVal;
          const nextIdx = idxL - lsb;

          leftSteps.push({
            bitIndex: idxL,
            binary: idxL.toString(2).padStart(4, '0'),
            lsb: lsb,
            nextIndex: nextIdx,
            addedValue: addedVal,
            currentSum: sumL,
            clientRange: `[${nextIdx}..${idxL - 1}]`,
            log: `[PrefixSum(${clampL - 1})] At 1-based index ${idxL} (bin: ${idxL.toString(2).padStart(4, '0')}), add tree[${idxL}] = ₹${addedVal.toLocaleString()}. LSB = ${lsb}. Jump to ${nextIdx}.`
          });

          idxL = nextIdx;
        }
      }

      const totalRangeSum = sumR - sumL;

      steps.push({
        type: 'prefix_right_complete',
        index: clampR,
        prefixSum: sumR,
        subSteps: rightSteps,
        log: `PrefixSum(${clampR}) calculated: ₹${sumR.toLocaleString()} across ${rightSteps.length} BIT hops.`
      });

      if (clampL > 0) {
        steps.push({
          type: 'prefix_left_complete',
          index: clampL - 1,
          prefixSum: sumL,
          subSteps: leftSteps,
          log: `PrefixSum(${clampL - 1}) calculated: ₹${sumL.toLocaleString()} across ${leftSteps.length} BIT hops.`
        });
      } else {
        steps.push({
          type: 'prefix_left_skipped',
          log: `Left index is 0, so PrefixSum(-1) = 0. No subtraction required.`
        });
      }

      steps.push({
        type: 'range_complete',
        left: clampL,
        right: clampR,
        sumRight: sumR,
        sumLeft: sumL,
        rangeSum: totalRangeSum,
        log: `RSQ([${clampL}, ${clampR}]) = ₹${sumR.toLocaleString()} - ₹${sumL.toLocaleString()} = ₹${totalRangeSum.toLocaleString()}.`
      });

      return {
        left: clampL,
        right: clampR,
        sumRight: sumR,
        sumLeft: sumL,
        rangeSum: totalRangeSum,
        steps: steps,
        rightSteps: rightSteps,
        leftSteps: leftSteps
      };
    }

    /**
     * Point update with animated step trace showing index += index & (-index)
     */
    updateWithTrace(index, delta) {
      const steps = [];
      const deltaVal = Number(delta);
      const clampIdx = Math.max(0, Math.min(this.size - 1, index));

      steps.push({
        type: 'start_update',
        index: clampIdx,
        delta: deltaVal,
        log: `Updating 0-based index ${clampIdx} with delta +₹${deltaVal.toLocaleString()}.`
      });

      let idx = clampIdx + 1; // 1-based
      const hops = [];

      while (idx <= this.size) {
        const lsb = idx & (-idx);
        const prevTreeVal = this.tree[idx];
        this.tree[idx] += deltaVal;
        const nextIdx = idx + lsb;

        hops.push({
          bitIndex: idx,
          binary: idx.toString(2).padStart(4, '0'),
          lsb: lsb,
          prevValue: prevTreeVal,
          newValue: this.tree[idx],
          nextIndex: nextIdx,
          log: `1-based tree[${idx}] += ₹${deltaVal.toLocaleString()} (now ₹${this.tree[idx].toLocaleString()}). LSB = ${lsb}. Next index = ${idx} + ${lsb} = ${nextIdx}.`
        });

        idx = nextIdx;
      }

      steps.push({
        type: 'update_complete',
        index: clampIdx,
        delta: deltaVal,
        hops: hops,
        log: `Point update complete across ${hops.length} BIT nodes.`
      });

      return {
        index: clampIdx,
        delta: deltaVal,
        steps: steps,
        hops: hops
      };
    }

    /**
     * Returns BIT array status and responsibility intervals for visual layout
     */
    getTreeState() {
      const items = [];
      for (let i = 1; i <= this.size; i++) {
        const lsb = i & (-i);
        const lowerBound = i - lsb; // 0-based client lower bound
        const upperBound = i - 1;   // 0-based client upper bound

        items.push({
          bitIndex: i,
          binary: i.toString(2).padStart(4, '0'),
          lsb: lsb,
          treeValue: this.tree[i],
          responsibleRange: [lowerBound, upperBound],
          responsibleCount: lsb,
          clientFare: this.fares[i - 1] || 0
        });
      }

      return {
        size: this.size,
        nodes: items,
        totalFleetSum: this.getPrefixSum(this.size - 1)
      };
    }

    /**
     * Returns structural metadata for KPI telemetry
     */
    getStats() {
      return {
        type: 'Fenwick Tree (BIT)',
        javaClass: 'tree.FenwickTree',
        size: this.size,
        internalArraySize: this.size + 1,
        totalSum: this.getPrefixSum(this.size - 1),
        operationComplexity: {
          rsq: 'O(log N)',
          prefixSum: 'O(log N)',
          update: 'O(log N)',
          space: 'O(N)'
        }
      };
    }
  }

  window.AeroFenwickTree = FenwickTree;

})(typeof window !== 'undefined' ? window : global);
