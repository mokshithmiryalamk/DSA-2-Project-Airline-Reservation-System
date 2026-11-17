/**
 * AEROOPS: Sorting Algorithms & Comparative Analytics (Stage 5)
 *
 * Direct JavaScript ports of Java sorting classes:
 * - `sorting.MergeSort` (O(N log N) divide-and-conquer, stable)
 * - `sorting.QuickSort` (O(N log N) Lomuto partitioning, pivot = fares[high])
 * - `sorting.HeapSort` (O(N log N) binary max-heap build & extraction, in-place)
 *
 * Operates strictly on cloned arrays to preserve flight order.
 * Generates deterministic animation step traces and comparative benchmark telemetry.
 */

(function (window) {
  'use strict';

  /**
   * Helper: deep clones an array of items (numbers or flight objects)
   */
  function cloneArray(arr) {
    return arr.map(function (item, idx) {
      if (typeof item === 'number') {
        return {
          id: 'item-' + idx,
          flightId: 'FL-' + (idx + 1),
          fare: item,
          originalIndex: idx
        };
      }
      return {
        id: item.id || ('item-' + idx),
        flightId: item.flightId || ('FL-' + (idx + 1)),
        flightName: item.flightName || 'Flight',
        source: item.source || 'DEP',
        destination: item.destination || 'ARR',
        fare: Number(item.fare),
        originalIndex: typeof item.originalIndex === 'number' ? item.originalIndex : idx
      };
    });
  }

  // =========================================================================
  // 1. MERGE SORT (Faithful port of sorting.MergeSort)
  // =========================================================================

  const AeroMergeSort = {
    name: 'Merge Sort',
    javaClass: 'sorting.MergeSort',
    timeComplexity: {
      best: 'O(N log N)',
      average: 'O(N log N)',
      worst: 'O(N log N)'
    },
    spaceComplexity: 'O(N) Auxiliary',
    stability: 'Stable',
    description: 'A recursive divide-and-conquer algorithm that splits the array in half, recursively sorts both sub-arrays, and stably merges them in linear time.',

    /**
     * Pure sorting function on numbers
     */
    sort: function (fares) {
      const arr = fares.slice();
      function mergeSort(arr, left, right) {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSort(arr, left, mid);
          mergeSort(arr, mid + 1, right);
          merge(arr, left, mid, right);
        }
      }
      function merge(arr, left, mid, right) {
        const n1 = mid - left + 1;
        const n2 = right - mid;
        const leftArr = new Array(n1);
        const rightArr = new Array(n2);
        for (let i = 0; i < n1; i++) leftArr[i] = arr[left + i];
        for (let j = 0; j < n2; j++) rightArr[j] = arr[mid + 1 + j];

        let i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
          if (leftArr[i] <= rightArr[j]) {
            arr[k++] = leftArr[i++];
          } else {
            arr[k++] = rightArr[j++];
          }
        }
        while (i < n1) arr[k++] = leftArr[i++];
        while (j < n2) arr[k++] = rightArr[j++];
      }

      mergeSort(arr, 0, arr.length - 1);
      return arr;
    },

    /**
     * Step trace generator for visualizer playback
     */
    generateTrace: function (items) {
      const arr = cloneArray(items);
      const steps = [];
      let comparisons = 0;
      let swaps = 0; // In merge sort, writes to auxiliary / destination
      const sortedIndices = new Set();

      function record(type, comparing, swapped, pivot, message) {
        steps.push({
          type: type,
          snapshot: arr.map(it => Object.assign({}, it)),
          comparing: comparing ? comparing.slice() : [],
          swapped: swapped ? swapped.slice() : [],
          pivot: typeof pivot === 'number' ? pivot : null,
          sorted: Array.from(sortedIndices),
          comparisons: comparisons,
          swaps: swaps,
          message: message
        });
      }

      record('start', [], [], null, `Merge Sort initialized on ${arr.length} flights.`);

      function mergeSort(left, right) {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          record('divide', [], [], mid, `Dividing sub-array [${left}..${right}] at mid index ${mid}.`);

          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        } else if (left === right) {
          sortedIndices.add(left);
        }
      }

      function merge(left, mid, right) {
        const n1 = mid - left + 1;
        const n2 = right - mid;
        const leftArr = [];
        const rightArr = [];

        for (let i = 0; i < n1; i++) leftArr.push(arr[left + i]);
        for (let j = 0; j < n2; j++) rightArr.push(arr[mid + 1 + j]);

        let i = 0, j = 0, k = left;

        record('merge_start', [], [], mid, `Merging left partition [${left}..${mid}] and right partition [${mid + 1}..${right}].`);

        while (i < n1 && j < n2) {
          comparisons++;
          const idxL = left + i;
          const idxR = mid + 1 + j;

          record('compare', [idxL, idxR], [], null,
            `Comparing left fare ₹${leftArr[i].fare.toLocaleString()} (${leftArr[i].flightId}) with right fare ₹${rightArr[j].fare.toLocaleString()} (${rightArr[j].flightId}).`);

          if (leftArr[i].fare <= rightArr[j].fare) {
            arr[k] = leftArr[i++];
            swaps++;
            record('place', [], [k], null, `Placed ₹${arr[k].fare.toLocaleString()} from left partition at index ${k}.`);
          } else {
            arr[k] = rightArr[j++];
            swaps++;
            record('place', [], [k], null, `Placed ₹${arr[k].fare.toLocaleString()} from right partition at index ${k}.`);
          }
          k++;
        }

        while (i < n1) {
          arr[k] = leftArr[i++];
          swaps++;
          record('place', [], [k], null, `Flushing remaining left partition item ₹${arr[k].fare.toLocaleString()} to index ${k}.`);
          k++;
        }

        while (j < n2) {
          arr[k] = rightArr[j++];
          swaps++;
          record('place', [], [k], null, `Flushing remaining right partition item ₹${arr[k].fare.toLocaleString()} to index ${k}.`);
          k++;
        }

        for (let idx = left; idx <= right; idx++) {
          if (left === 0 && right === arr.length - 1) {
            sortedIndices.add(idx);
          }
        }
      }

      mergeSort(0, arr.length - 1);

      // Final pass: all items sorted
      for (let i = 0; i < arr.length; i++) sortedIndices.add(i);
      record('complete', [], [], null, `Merge Sort finished: all ${arr.length} flights sorted by fare ascending (${comparisons} comparisons, ${swaps} writes).`);

      return {
        algorithm: 'Merge Sort',
        javaClass: 'sorting.MergeSort',
        totalComparisons: comparisons,
        totalSwaps: swaps,
        sortedArray: arr,
        steps: steps
      };
    }
  };

  // =========================================================================
  // 2. QUICK SORT (Faithful port of sorting.QuickSort - Lomuto, pivot = fares[high])
  // =========================================================================

  const AeroQuickSort = {
    name: 'Quick Sort',
    javaClass: 'sorting.QuickSort',
    timeComplexity: {
      best: 'O(N log N)',
      average: 'O(N log N)',
      worst: 'O(N²)'
    },
    spaceComplexity: 'O(log N) Call Stack',
    stability: 'Unstable',
    description: 'An efficient in-place partition-exchange algorithm. Employs Lomuto partitioning choosing fares[high] as pivot, rearranging smaller fares to the left.',

    /**
     * Pure sorting function on numbers
     */
    sort: function (fares) {
      const arr = fares.slice();
      function quickSort(arr, low, high) {
        if (low < high) {
          const pivotIndex = partition(arr, low, high);
          quickSort(arr, low, pivotIndex - 1);
          quickSort(arr, pivotIndex + 1, high);
        }
      }
      function partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        for (let j = low; j < high; j++) {
          if (arr[j] <= pivot) {
            i++;
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
          }
        }
        const temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
      }

      quickSort(arr, 0, arr.length - 1);
      return arr;
    },

    /**
     * Step trace generator for visualizer playback
     */
    generateTrace: function (items) {
      const arr = cloneArray(items);
      const steps = [];
      let comparisons = 0;
      let swaps = 0;
      const sortedIndices = new Set();

      function record(type, comparing, swapped, pivot, message) {
        steps.push({
          type: type,
          snapshot: arr.map(it => Object.assign({}, it)),
          comparing: comparing ? comparing.slice() : [],
          swapped: swapped ? swapped.slice() : [],
          pivot: typeof pivot === 'number' ? pivot : null,
          sorted: Array.from(sortedIndices),
          comparisons: comparisons,
          swaps: swaps,
          message: message
        });
      }

      record('start', [], [], null, `Quick Sort initialized on ${arr.length} flights (Lomuto pivot = fares[high]).`);

      function quickSort(low, high) {
        if (low < high) {
          const pivotIndex = partition(low, high);
          sortedIndices.add(pivotIndex);

          quickSort(low, pivotIndex - 1);
          quickSort(pivotIndex + 1, high);
        } else if (low === high) {
          sortedIndices.add(low);
        }
      }

      function partition(low, high) {
        // Direct mirror of Java: pivot = fares[high]; int i = low - 1;
        const pivotVal = arr[high].fare;
        let i = low - 1;

        record('pivot_select', [], [], high,
          `Selected pivot at index ${high}: ₹${pivotVal.toLocaleString()} (${arr[high].flightId}) for partition range [${low}..${high}].`);

        for (let j = low; j < high; j++) {
          comparisons++;
          record('compare', [j, high], [], high,
            `Comparing element #${j} (₹${arr[j].fare.toLocaleString()}) with pivot #${high} (₹${pivotVal.toLocaleString()}).`);

          if (arr[j].fare <= pivotVal) {
            i++;
            if (i !== j) {
              swaps++;
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;

              record('swap', [], [i, j], high,
                `Swapped smaller element #${j} into partition slot #${i} (₹${arr[i].fare.toLocaleString()} ⇄ ₹${arr[j].fare.toLocaleString()}).`);
            }
          }
        }

        // Final pivot placement: swap arr[i + 1] with arr[high]
        swaps++;
        const pivotFinalIdx = i + 1;
        const temp = arr[pivotFinalIdx];
        arr[pivotFinalIdx] = arr[high];
        arr[high] = temp;

        record('pivot_placed', [], [pivotFinalIdx, high], pivotFinalIdx,
          `Placed pivot ₹${arr[pivotFinalIdx].fare.toLocaleString()} into final partitioned index ${pivotFinalIdx}.`);

        return pivotFinalIdx;
      }

      quickSort(0, arr.length - 1);

      for (let i = 0; i < arr.length; i++) sortedIndices.add(i);
      record('complete', [], [], null, `Quick Sort finished: all ${arr.length} flights sorted by fare ascending (${comparisons} comparisons, ${swaps} swaps).`);

      return {
        algorithm: 'Quick Sort',
        javaClass: 'sorting.QuickSort',
        totalComparisons: comparisons,
        totalSwaps: swaps,
        sortedArray: arr,
        steps: steps
      };
    }
  };

  // =========================================================================
  // 3. HEAP SORT (Faithful port of sorting.HeapSort - Max-Heap build & extract)
  // =========================================================================

  const AeroHeapSort = {
    name: 'Heap Sort',
    javaClass: 'sorting.HeapSort',
    timeComplexity: {
      best: 'O(N log N)',
      average: 'O(N log N)',
      worst: 'O(N log N)'
    },
    spaceComplexity: 'O(1) In-Place',
    stability: 'Unstable',
    description: 'An in-place sorting algorithm that builds a max-heap in O(N) time and iteratively extracts the maximum root element to the end of the array.',

    /**
     * Pure sorting function on numbers
     */
    sort: function (fares) {
      const arr = fares.slice();
      const n = arr.length;

      function heapify(arr, n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;

        if (largest !== i) {
          const temp = arr[i];
          arr[i] = arr[largest];
          arr[largest] = temp;
          heapify(arr, n, largest);
        }
      }

      // Build heap
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
      }

      // Extract from heap
      for (let i = n - 1; i > 0; i--) {
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
      }

      return arr;
    },

    /**
     * Step trace generator for visualizer playback
     */
    generateTrace: function (items) {
      const arr = cloneArray(items);
      const steps = [];
      let comparisons = 0;
      let swaps = 0;
      const sortedIndices = new Set();
      const n = arr.length;

      function record(type, comparing, swapped, pivot, message) {
        steps.push({
          type: type,
          snapshot: arr.map(it => Object.assign({}, it)),
          comparing: comparing ? comparing.slice() : [],
          swapped: swapped ? swapped.slice() : [],
          pivot: typeof pivot === 'number' ? pivot : null,
          sorted: Array.from(sortedIndices),
          comparisons: comparisons,
          swaps: swaps,
          message: message
        });
      }

      record('start', [], [], null, `Heap Sort initialized: building max-heap on ${n} flights.`);

      function heapify(size, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size) {
          comparisons++;
          record('compare', [left, largest], [], 0,
            `Checking left child #${left} (₹${arr[left].fare.toLocaleString()}) vs current largest #${largest} (₹${arr[largest].fare.toLocaleString()}).`);
          if (arr[left].fare > arr[largest].fare) {
            largest = left;
          }
        }

        if (right < size) {
          comparisons++;
          record('compare', [right, largest], [], 0,
            `Checking right child #${right} (₹${arr[right].fare.toLocaleString()}) vs current largest #${largest} (₹${arr[largest].fare.toLocaleString()}).`);
          if (arr[right].fare > arr[largest].fare) {
            largest = right;
          }
        }

        if (largest !== i) {
          swaps++;
          const temp = arr[i];
          arr[i] = arr[largest];
          arr[largest] = temp;

          record('swap', [], [i, largest], 0,
            `Heapify sifted down: swapped parent #${i} with larger child #${largest} (₹${arr[i].fare.toLocaleString()} ⇄ ₹${arr[largest].fare.toLocaleString()}).`);

          heapify(size, largest);
        }
      }

      // Phase 1: Build max heap
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        record('heap_build', [i], [], i, `Heapifying internal node at index ${i} (fare ₹${arr[i].fare.toLocaleString()}).`);
        heapify(n, i);
      }

      record('heap_built', [], [], 0, `Max-heap construction complete. Root contains maximum fare: ₹${arr[0].fare.toLocaleString()}.`);

      // Phase 2: Extract maximum one by one
      for (let i = n - 1; i > 0; i--) {
        swaps++;
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;

        sortedIndices.add(i);
        record('extract_max', [], [0, i], i,
          `Extracted max fare ₹${arr[i].fare.toLocaleString()} to sorted position #${i}. Sifting new root.`);

        heapify(i, 0);
      }

      sortedIndices.add(0);
      record('complete', [], [], null, `Heap Sort finished: all ${n} flights sorted by fare ascending (${comparisons} comparisons, ${swaps} swaps).`);

      return {
        algorithm: 'Heap Sort',
        javaClass: 'sorting.HeapSort',
        totalComparisons: comparisons,
        totalSwaps: swaps,
        sortedArray: arr,
        steps: steps
      };
    }
  };

  // =========================================================================
  // 4. COMPARATIVE BENCHMARK RUNNER
  // =========================================================================

  const AeroSortingSuite = {
    algorithms: {
      merge: AeroMergeSort,
      quick: AeroQuickSort,
      heap: AeroHeapSort
    },

    getAlgorithm: function (key) {
      return this.algorithms[key] || this.algorithms.merge;
    },

    /**
     * Executes synchronous head-to-head performance benchmarks
     */
    runComparativeBenchmark: function (dataset) {
      const results = {};
      const keys = ['merge', 'quick', 'heap'];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const algo = this.algorithms[key];

        // Measure execution time
        const start = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const traceResult = algo.generateTrace(dataset);
        const end = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

        // Verify sorted invariant
        let isSorted = true;
        const sorted = traceResult.sortedArray;
        for (let j = 0; j < sorted.length - 1; j++) {
          if (sorted[j].fare > sorted[j + 1].fare) {
            isSorted = false;
            break;
          }
        }

        results[key] = {
          name: algo.name,
          javaClass: algo.javaClass,
          timeComplexity: algo.timeComplexity,
          spaceComplexity: algo.spaceComplexity,
          stability: algo.stability,
          comparisons: traceResult.totalComparisons,
          swaps: traceResult.totalSwaps,
          totalSteps: traceResult.steps.length,
          executionTimeMs: Math.round((end - start) * 100) / 100,
          verified: isSorted
        };
      }

      return results;
    }
  };

  window.AeroMergeSort = AeroMergeSort;
  window.AeroQuickSort = AeroQuickSort;
  window.AeroHeapSort = AeroHeapSort;
  window.AeroSortingSuite = AeroSortingSuite;

})(typeof window !== 'undefined' ? window : global);
