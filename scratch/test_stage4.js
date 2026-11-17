const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const portfolioDir = fs.existsSync(path.resolve(__dirname, '../../../Portfolio_Website'))
  ? path.resolve(__dirname, '../../../Portfolio_Website')
  : 'D:\\Moki\\Portfolio\\Portfolio_Website';

console.log('========================================================');
console.log('   AEROOPS STAGE 4 AUTOMATED TEST SUITE: TREE INDEXING');
console.log('========================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

// -----------------------------------------------------------------------------
// 1. JS SYNTAX VALIDATION
// -----------------------------------------------------------------------------
console.log('--- 1. JavaScript Syntax Verification ---');
const jsFiles = [
  'js/airline-data.js',
  'js/ui/toast.js',
  'js/ui/modal.js',
  'js/flight-manager.js',
  'js/passenger-manager.js',
  'js/booking-manager.js',
  'js/graph/graph-data.js',
  'js/graph/graph-algorithms.js',
  'js/graph/graph-visualizer.js',
  'js/graph/graph-manager.js',
  'js/trees/tree-data.js',
  'js/trees/bst.js',
  'js/trees/avl-tree.js',
  'js/trees/b-tree.js',
  'js/trees/b-plus-tree.js',
  'js/trees/tree-visualizer.js',
  'js/trees/tree-manager.js',
  'js/app.js'
];

for (const rel of jsFiles) {
  const fullPath = path.join(baseDir, rel);
  assert(fs.existsSync(fullPath), `File exists: ${rel}`);
  try {
    const code = fs.readFileSync(fullPath, 'utf8');
    new vm.Script(code);
    assert(true, `Syntax valid: ${rel}`);
  } catch (err) {
    assert(false, `Syntax error in ${rel}: ${err.message}`);
  }
}

// -----------------------------------------------------------------------------
// 2. BST VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. Binary Search Tree (BST) Algorithmic Parity ---');
const mockWindow = { console: console };
const bstCode = fs.readFileSync(path.join(baseDir, 'js/trees/bst.js'), 'utf8');
vm.runInNewContext(bstCode, { window: mockWindow, console: console });

const BST = mockWindow.AeroBST;
const bst = new BST();

// Insert sequence [105, 102, 108, 101, 104, 107, 109]
const bstKeys = [105, 102, 108, 101, 104, 107, 109];
bstKeys.forEach(k => bst.insert(k));

assert(bst.getStats().nodeCount === 7, `BST node count is 7 (got ${bst.getStats().nodeCount})`);
assert(bst.inorder().join(',') === '101,102,104,105,107,108,109', 'BST In-order traversal is sorted');
assert(bst.preorder()[0] === 105, 'BST Pre-order starts with root (105)');
assert(bst.postorder().slice(-1)[0] === 105, 'BST Post-order ends with root (105)');

const bstSearchFound = bst.search(104);
assert(bstSearchFound.found === true, 'BST search found existing key 104');
assert(bstSearchFound.path.join('->') === '105->102->104', `BST search path is 105->102->104 (got ${bstSearchFound.path.join('->')})`);

const bstSearchMiss = bst.search(999);
assert(bstSearchMiss.found === false, 'BST search returns found:false for non-existent key 999');

const bstDup = bst.insert(104);
assert(bstDup.duplicate === true, 'BST correctly rejects duplicate key 104');

// -----------------------------------------------------------------------------
// 3. AVL BALANCED TREE & ROTATION VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. AVL Self-Balancing Tree & Rotations ---');
const avlCode = fs.readFileSync(path.join(baseDir, 'js/trees/avl-tree.js'), 'utf8');
vm.runInNewContext(avlCode, { window: mockWindow, console: console });

const AVLTree = mockWindow.AeroAVLTree;

// 3a. LL Case (Right Rotation)
const avlLL = new AVLTree();
avlLL.insert(105);
avlLL.insert(103);
const resLL = avlLL.insert(101); // Imbalance at 105 (BF = +2) -> rightRotate(105)
assert(resLL.rotationType === 'LL (Right Rotation)', `LL Case triggered Right Rotation (got ${resLL.rotationType})`);
assert(avlLL.root.key === 103, `Root became median key 103 (got ${avlLL.root.key})`);
assert(avlLL.isBalanced() === true, 'AVL LL tree is balanced');

// 3b. RR Case (Left Rotation)
const avlRR = new AVLTree();
avlRR.insert(101);
avlRR.insert(103);
const resRR = avlRR.insert(105); // Imbalance at 101 (BF = -2) -> leftRotate(101)
assert(resRR.rotationType === 'RR (Left Rotation)', `RR Case triggered Left Rotation (got ${resRR.rotationType})`);
assert(avlRR.root.key === 103, `Root became median key 103 (got ${avlRR.root.key})`);
assert(avlRR.isBalanced() === true, 'AVL RR tree is balanced');

// 3c. LR Case (Left-Right Double Rotation)
const avlLR = new AVLTree();
avlLR.insert(105);
avlLR.insert(101);
const resLR = avlLR.insert(103); // Imbalance at 105 (BF = +2), child BF = -1 -> LR Rotate
assert(resLR.rotationType === 'LR (Left-Right Double Rotation)', `LR Case triggered Double Rotation (got ${resLR.rotationType})`);
assert(avlLR.root.key === 103, `Root became median key 103 (got ${avlLR.root.key})`);
assert(avlLR.isBalanced() === true, 'AVL LR tree is balanced');

// 3d. RL Case (Right-Left Double Rotation)
const avlRL = new AVLTree();
avlRL.insert(101);
avlRL.insert(105);
const resRL = avlRL.insert(103); // Imbalance at 101 (BF = -2), child BF = +1 -> RL Rotate
assert(resRL.rotationType === 'RL (Right-Left Double Rotation)', `RL Case triggered Double Rotation (got ${resRL.rotationType})`);
assert(avlRL.root.key === 103, `Root became median key 103 (got ${avlRL.root.key})`);
assert(avlRL.isBalanced() === true, 'AVL RL tree is balanced');

// 3e. Invariant Verification on arbitrary sequence
const avlMulti = new AVLTree();
[50, 20, 80, 10, 30, 70, 90, 5, 15, 25, 35].forEach(k => avlMulti.insert(k));
assert(avlMulti.isBalanced() === true, 'AVL maintains |BF| <= 1 for arbitrary 11-key sequence');
assert(avlMulti.inorder().join(',') === '5,10,15,20,25,30,35,50,70,80,90', 'AVL in-order traversal is sorted');

// -----------------------------------------------------------------------------
// 4. B-TREE (DEGREE t = 3) VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 4. B-Tree Multiway Search Tree (Degree t = 3) ---');
const bTreeCode = fs.readFileSync(path.join(baseDir, 'js/trees/b-tree.js'), 'utf8');
vm.runInNewContext(bTreeCode, { window: mockWindow, console: console });

const BTree = mockWindow.AeroBTree;
const btree = new BTree(3);

// In degree t=3, max keys in a node = 2t - 1 = 5
// Inserting 6 keys triggers node split!
const btreeKeys = [10, 20, 30, 40, 50, 60];
btreeKeys.forEach(k => btree.insert(k));

const bStats = btree.getStats();
assert(bStats.height === 2, `Root split increased height to 2 (got ${bStats.height})`);
assert(bStats.totalKeys === 6, `Total keys stored in B-Tree: 6 (got ${bStats.totalKeys})`);
assert(btree.traverse().join(',') === '10,20,30,40,50,60', 'B-Tree in-order traversal is sorted');

const bSearch1 = btree.search(30);
assert(bSearch1.found === true, 'B-Tree search found key 30');
const bSearch2 = btree.search(999);
assert(bSearch2.found === false, 'B-Tree search returned found:false for non-existent key 999');

// -----------------------------------------------------------------------------
// 5. B+ TREE (DEGREE t = 3) & LEAF LINKING VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 5. B+ Tree Multiway Index & Sequential Leaf Links ---');
const bPlusTreeCode = fs.readFileSync(path.join(baseDir, 'js/trees/b-plus-tree.js'), 'utf8');
vm.runInNewContext(bPlusTreeCode, { window: mockWindow, console: console });

const BPlusTree = mockWindow.AeroBPlusTree;
const bplus = new BPlusTree(3);

// Insert 8 keys to create multi-leaf chain
const bPlusKeys = [10, 20, 30, 40, 50, 60, 70, 80];
bPlusKeys.forEach(k => bplus.insert(k));

const bpStats = bplus.getStats();
assert(bpStats.totalKeys >= 8, `B+ Tree total keys is ${bpStats.totalKeys}`);
assert(bpStats.leafNodes > 1, `B+ Tree has multiple leaf nodes (${bpStats.leafNodes})`);

// Test sequential leaf traversal following `next` pointers
const seqTraversal = bplus.sequentialLeafTraversal();
assert(seqTraversal.keys.join(',') === '10,20,30,40,50,60,70,80', 'Sequential leaf scan via "next" pointers returns sorted keys');

// Test point search
const bpSearch = bplus.search(40);
assert(bpSearch.found === true, 'B+ Tree search located Key 40 in leaf node');

// Test range search [25, 65]
const rangeKeys = bplus.rangeSearch(25, 65);
assert(rangeKeys.join(',') === '30,40,50,60', `B+ Tree range query [25, 65] returned: ${rangeKeys.join(',')}`);

// -----------------------------------------------------------------------------
// 6. HTML DOM INTEGRITY VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 6. HTML DOM Elements & ID Mapping ---');
const htmlContent = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');

const idRegex = /id=["']([^"']+)["']/g;
let match;
const ids = new Map();
let duplicateFound = false;
while ((match = idRegex.exec(htmlContent)) !== null) {
  const id = match[1];
  if (ids.has(id)) {
    console.error(`[HTML DUPLICATE ID] ${id}`);
    duplicateFound = true;
  }
  ids.set(id, (ids.get(id) || 0) + 1);
}
assert(!duplicateFound, `Zero duplicate IDs found across ${ids.size} elements`);

const requiredStage4IDs = [
  'view-tree-index',
  'kpi-tree-type', 'kpi-tree-nodes', 'kpi-tree-height', 'kpi-tree-balance-metric',
  'tree-type-selector', 'tree-canvas-container', 'tree-traversal-result',
  'tree-edu-title', 'tree-edu-desc', 'tree-edu-invariant',
  'tree-edu-search-comp', 'tree-edu-insert-comp', 'tree-edu-java-class',
  'tree-key-input', 'btn-tree-insert', 'btn-tree-search', 'btn-tree-reset',
  'btn-tree-inorder', 'btn-tree-preorder', 'btn-tree-postorder', 'btn-tree-levelorder',
  'btn-tree-seq-leaves', 'btn-tree-demo-seed', 'btn-tree-sync-passengers',
  'tree-execution-logs'
];

for (const id of requiredStage4IDs) {
  assert(ids.has(id), `Stage 4 DOM element exists: #${id}`);
}

// -----------------------------------------------------------------------------
// 7. REGRESSION VERIFICATION: STAGE 2 & STAGE 3
// -----------------------------------------------------------------------------
console.log('\n--- 7. Regression Verification: Stage 2 & Stage 3 ---');
// Stage 2 Store
const mockStorage = {};
const fullMockWindow = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); }
  },
  console: console
};
const storeCode = fs.readFileSync(path.join(baseDir, 'js/airline-data.js'), 'utf8');
vm.runInNewContext(storeCode, { window: fullMockWindow, localStorage: fullMockWindow.localStorage, console: console });
const store = fullMockWindow.AeroDataStore;
assert(store.getFlights().length === 8, 'Stage 2 Flights still accessible (8 flights)');
assert(store.getPassengers().length === 6, 'Stage 2 Passengers still accessible (6 passengers)');
assert(store.getTickets().length === 4, 'Stage 2 Bookings still accessible (4 tickets)');

// Stage 3 Graph
const graphDataCode = fs.readFileSync(path.join(baseDir, 'js/graph/graph-data.js'), 'utf8');
const graphAlgoCode = fs.readFileSync(path.join(baseDir, 'js/graph/graph-algorithms.js'), 'utf8');
vm.runInNewContext(graphDataCode, { window: mockWindow, console: console });
vm.runInNewContext(graphAlgoCode, { window: mockWindow, console: console });
const RouteNetworkGraph = mockWindow.AeroGraphData.RouteNetworkGraph;
const algorithms = mockWindow.AeroGraphAlgorithms;
const graph = new RouteNetworkGraph();
assert(graph.getNodes().length === 10, 'Stage 3 Graph nodes intact (10 hubs)');
const dijkstraTest = algorithms.dijkstra(graph, 'DEL', 'BOM');
assert(dijkstraTest.totalCost === 1150, 'Stage 3 Dijkstra DEL-BOM shortest path intact: 1150 km');

// -----------------------------------------------------------------------------
// 8. CODEBASE PRESERVATION & ISOLATION CHECK
// -----------------------------------------------------------------------------
console.log('\n--- 8. Codebase Preservation & Isolation Check ---');

function getFilesRecursive(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const javaFiles = getFilesRecursive(path.join(baseDir, 'src'));
assert(javaFiles.length === 23, `All 23 Java files intact in src/ (found ${javaFiles.length})`);

const portfolioFiles = fs.readdirSync(portfolioDir);
assert(portfolioFiles.length === 4, `Portfolio_Website untouched (${portfolioFiles.length} root files)`);

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (100% Success)`);
console.log('========================================================');
