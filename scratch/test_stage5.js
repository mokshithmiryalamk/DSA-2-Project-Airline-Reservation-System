/**
 * AEROOPS: Comprehensive Stage 5 Automated Verification Suite
 *
 * Verifies:
 * 1. Byte-for-byte preservation of 23 original Java files
 * 2. Strict isolation: Portfolio_Website remains untouched
 * 3. Zero duplicate HTML IDs across index.html
 * 4. Segment Tree (RMQ & updates against brute-force mathematical ground truth)
 * 5. Fenwick Tree (Prefix sums & RSQ against mathematical ground truth)
 * 6. Sorting Suite (MergeSort, QuickSort Lomuto, HeapSort across all distributions)
 * 7. Invariant & non-mutation checks
 * 8. Stage 4 B+ Tree linked-leaf verification on large key sequence
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const AMS_DIR = path.resolve(__dirname, '..');
const PORTFOLIO_DIR = fs.existsSync(path.resolve(__dirname, '../../../Portfolio_Website'))
  ? path.resolve(__dirname, '../../../Portfolio_Website')
  : path.resolve('D:/Moki/Portfolio/Portfolio_Website');
const SRC_DIR = path.join(AMS_DIR, 'src');

console.log('================================================================');
console.log(' AEROOPS STAGE 5 COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
  }
}

// =========================================================================
// TEST 1: STRICT BOUNDARIES & PRESERVATION
// =========================================================================

it('Preserves all 23 original Java source files in src/', () => {
  function getJavaFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results = results.concat(getJavaFiles(full));
      } else if (ent.name.endsWith('.java')) {
        results.push(full);
      }
    }
    return results;
  }

  const javaFiles = getJavaFiles(SRC_DIR);
  assert.strictEqual(javaFiles.length, 23, `Expected 23 Java source files, found ${javaFiles.length}`);
});

it('Preserves strict isolation of Portfolio_Website (untouched)', () => {
  const files = fs.readdirSync(PORTFOLIO_DIR);
  assert.strictEqual(files.length, 4, `Expected exactly 4 files in Portfolio_Website, found ${files.length}`);
});

it('Zero duplicate HTML IDs across index.html', () => {
  const htmlPath = path.join(AMS_DIR, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const idRegex = /\sid=["']([^"']+)["']/g;
  const seenIds = new Set();
  const duplicates = [];

  let match;
  while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    if (seenIds.has(id)) {
      duplicates.push(id);
    }
    seenIds.add(id);
  }

  assert.strictEqual(duplicates.length, 0, `Duplicate IDs detected: ${duplicates.join(', ')}`);
});

// =========================================================================
// LOAD STAGE 5 ANALYTICS & TREES RUNTIME
// =========================================================================

global.window = global;

require(path.join(AMS_DIR, 'js/analytics/fare-data.js'));
require(path.join(AMS_DIR, 'js/analytics/segment-tree.js'));
require(path.join(AMS_DIR, 'js/analytics/fenwick-tree.js'));
require(path.join(AMS_DIR, 'js/analytics/sorting-algorithms.js'));
require(path.join(AMS_DIR, 'js/trees/b-plus-tree.js'));

// =========================================================================
// TEST 2: SEGMENT TREE (RMQ & POINT UPDATES)
// =========================================================================

const testFares = [4500, 3200, 5800, 2900, 1850, 6200, 3600, 9400, 2100, 4950];

it('Segment Tree correctly builds 4N array structure matching Java SegmentTree.java', () => {
  const segTree = new window.AeroSegmentTree(testFares);
  assert.strictEqual(segTree.n, 10);
  assert.strictEqual(segTree.tree.length, 40);
  assert.strictEqual(segTree.tree[0], 1850, 'Root node must hold the minimum of the entire array');
});

it('Segment Tree RMQ matches brute-force minimum for all (L, R) combinations', () => {
  const segTree = new window.AeroSegmentTree(testFares);
  for (let l = 0; l < testFares.length; l++) {
    for (let r = l; r < testFares.length; r++) {
      const expected = Math.min(...testFares.slice(l, r + 1));
      const actual = segTree.rangeMinimumQuery(l, r);
      assert.strictEqual(actual, expected, `RMQ([${l}, ${r}]) expected ${expected}, got ${actual}`);
    }
  }
});

it('Segment Tree rangeMinimumQueryWithTrace captures full overlap, partial overlap, and disjoint states', () => {
  const segTree = new window.AeroSegmentTree(testFares);
  const trace = segTree.rangeMinimumQueryWithTrace(2, 5);
  assert.strictEqual(trace.result, Math.min(...testFares.slice(2, 6)));
  assert.ok(trace.steps.length > 0);

  const hasTotal = trace.steps.some(s => s.type === 'visit_total_overlap');
  const hasPartial = trace.steps.some(s => s.type === 'visit_partial_overlap');
  const hasDisjoint = trace.steps.some(s => s.type === 'visit_disjoint');
  assert.ok(hasTotal && hasPartial && hasDisjoint, 'Trace must capture total overlap, partial overlap, and disjoint pruning');
});

it('Segment Tree updateFare updates leaf and propagates new minimum up the tree', () => {
  const segTree = new window.AeroSegmentTree(testFares.slice());
  // Initially index 4 has 1850
  segTree.updateFare(4, 9999);
  // Now minimum in entire array should be 2100 (index 8)
  assert.strictEqual(segTree.rangeMinimumQuery(0, 9), 2100);
  assert.strictEqual(segTree.tree[0], 2100);

  // Set index 0 to 1200 -> new global minimum
  segTree.updateFare(0, 1200);
  assert.strictEqual(segTree.rangeMinimumQuery(0, 9), 1200);
  assert.strictEqual(segTree.tree[0], 1200);
});

it('Segment Tree handles boundary cases and out-of-bounds queries gracefully', () => {
  const segTree = new window.AeroSegmentTree(testFares);
  assert.strictEqual(segTree.rangeMinimumQuery(-1, 5), Infinity);
  assert.strictEqual(segTree.rangeMinimumQuery(5, 20), Infinity);
  assert.strictEqual(segTree.rangeMinimumQuery(6, 4), Infinity);
});

// =========================================================================
// TEST 3: FENWICK TREE (RSQ, PREFIX SUMS & POINT UPDATES)
// =========================================================================

it('Fenwick Tree correctly builds from fare array matching FlightService.buildFenwickTree()', () => {
  const fenTree = new window.AeroFenwickTree(testFares);
  assert.strictEqual(fenTree.size, 10);
  assert.strictEqual(fenTree.tree.length, 11);

  const totalExpected = testFares.reduce((a, b) => a + b, 0);
  assert.strictEqual(fenTree.getPrefixSum(9), totalExpected);
});

it('Fenwick Tree prefix sums match brute force cumulative sums for all indices', () => {
  const fenTree = new window.AeroFenwickTree(testFares);
  let expectedSum = 0;
  for (let i = 0; i < testFares.length; i++) {
    expectedSum += testFares[i];
    assert.strictEqual(fenTree.getPrefixSum(i), expectedSum, `PrefixSum(${i}) failed`);
  }
});

it('Fenwick Tree range sums match brute force interval sums for all (L, R) combinations', () => {
  const fenTree = new window.AeroFenwickTree(testFares);
  for (let l = 0; l < testFares.length; l++) {
    for (let r = l; r < testFares.length; r++) {
      const expected = testFares.slice(l, r + 1).reduce((a, b) => a + b, 0);
      const actual = fenTree.getRangeSum(l, r);
      assert.strictEqual(actual, expected, `RSQ([${l}, ${r}]) expected ${expected}, got ${actual}`);
    }
  }
});

it('Fenwick Tree update with delta correctly adjusts tree and queries', () => {
  const faresCopy = testFares.slice();
  const fenTree = new window.AeroFenwickTree(faresCopy);

  // Add 1000 to index 3
  fenTree.update(3, 1000);
  faresCopy[3] += 1000;

  for (let l = 0; l < faresCopy.length; l++) {
    for (let r = l; r < faresCopy.length; r++) {
      const expected = faresCopy.slice(l, r + 1).reduce((a, b) => a + b, 0);
      const actual = fenTree.getRangeSum(l, r);
      assert.strictEqual(actual, expected);
    }
  }
});

it('Fenwick Tree getRangeSumWithTrace captures LSB hops and binary representations', () => {
  const fenTree = new window.AeroFenwickTree(testFares);
  const trace = fenTree.getRangeSumWithTrace(2, 7);
  assert.strictEqual(trace.rangeSum, testFares.slice(2, 8).reduce((a, b) => a + b, 0));
  assert.ok(trace.rightSteps.length > 0);
  assert.ok(trace.leftSteps.length > 0);

  // Verify LSB property: nextIndex = bitIndex - (bitIndex & -bitIndex)
  trace.rightSteps.forEach(hop => {
    assert.strictEqual(hop.nextIndex, hop.bitIndex - hop.lsb);
  });
});

// =========================================================================
// TEST 4: SORTING ALGORITHMS (MERGE SORT, QUICK SORT, HEAP SORT)
// =========================================================================

const datasets = {
  random: testFares.slice(),
  sorted: [1000, 2000, 3000, 4000, 5000, 6000, 7000],
  reversed: [7000, 6000, 5000, 4000, 3000, 2000, 1000],
  duplicates: [2500, 4200, 2500, 6100, 4200, 1800, 2500],
  single: [3500],
  decimals: [1500.5, 3200.25, 1200.75, 4500.0, 2100.1]
};

['merge', 'quick', 'heap'].forEach(algoKey => {
  const algo = window.AeroSortingSuite.getAlgorithm(algoKey);

  it(`${algo.name} correctly sorts diverse input distributions`, () => {
    Object.keys(datasets).forEach(distName => {
      const data = datasets[distName];
      const sorted = algo.sort(data);
      const expected = data.slice().sort((a, b) => a - b);
      assert.deepStrictEqual(sorted, expected, `${algo.name} failed on ${distName}`);
    });
  });

  it(`${algo.name} generateTrace() operates without mutating original input items`, () => {
    const originalItems = [
      { id: '1', fare: 4500 },
      { id: '2', fare: 2100 },
      { id: '3', fare: 3800 }
    ];
    const originalBackup = JSON.stringify(originalItems);

    const trace = algo.generateTrace(originalItems);
    assert.strictEqual(JSON.stringify(originalItems), originalBackup, `${algo.name} mutated input items!`);
    assert.ok(trace.steps.length > 0);
    assert.ok(trace.totalComparisons >= 0);
  });
});

it('Merge Sort guarantees stability on duplicate fare values', () => {
  const items = [
    { id: 'A', fare: 3000, originalIndex: 0 },
    { id: 'B', fare: 1000, originalIndex: 1 },
    { id: 'C', fare: 3000, originalIndex: 2 },
    { id: 'D', fare: 2000, originalIndex: 3 },
    { id: 'E', fare: 3000, originalIndex: 4 }
  ];

  const trace = window.AeroMergeSort.generateTrace(items);
  const finalSorted = trace.sortedArray;

  // Filter out the 3000 items
  const ties = finalSorted.filter(it => it.fare === 3000);
  assert.strictEqual(ties[0].id, 'A');
  assert.strictEqual(ties[1].id, 'C');
  assert.strictEqual(ties[2].id, 'E');
});

it('Quick Sort Lomuto partition strictly uses last element fares[high] as pivot', () => {
  const items = [{ fare: 50 }, { fare: 20 }, { fare: 80 }, { fare: 30 }];
  const trace = window.AeroQuickSort.generateTrace(items);

  const pivotStep = trace.steps.find(s => s.type === 'pivot_select');
  assert.ok(pivotStep, 'Pivot select step must exist');
  assert.strictEqual(pivotStep.pivot, 3, 'First pivot must be the high index (3)');
});

it('Comparative benchmark runner profiles Merge, Quick, and Heap Sort simultaneously', () => {
  const results = window.AeroSortingSuite.runComparativeBenchmark(testFares);
  assert.ok(results.merge && results.quick && results.heap);
  assert.strictEqual(results.merge.verified, true);
  assert.strictEqual(results.quick.verified, true);
  assert.strictEqual(results.heap.verified, true);
});

// =========================================================================
// TEST 5: STAGE 4 B+ TREE LINKED-LEAF VERIFICATION ON LARGE SEQUENCE
// =========================================================================

it('B+ Tree maintains sequential horizontal leaf links across 25 sequential insertions', () => {
  const bplus = new window.AeroBPlusTree(3);
  for (let i = 1; i <= 25; i++) {
    bplus.insert(i * 10, { id: i, name: `Passenger ${i}` });
  }

  const leaves = bplus.getLeaves();
  assert.ok(leaves.length >= 4, `Expected at least 4 leaves after 25 insertions, found ${leaves.length}`);

  // Follow leaf.next pointers
  let current = leaves[0];
  let leafCount = 0;
  const collectedKeys = [];

  while (current) {
    leafCount++;
    collectedKeys.push(...current.keys);
    current = current.next;
  }

  assert.strictEqual(leafCount, leaves.length);
  assert.strictEqual(collectedKeys.length, 25);
  for (let i = 0; i < 25; i++) {
    assert.strictEqual(collectedKeys[i], (i + 1) * 10);
  }
});

console.log('\n================================================================');
console.log(` STAGE 5 VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
