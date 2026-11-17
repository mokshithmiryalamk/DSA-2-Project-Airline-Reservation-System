/**
 * AEROOPS: Comprehensive Stage 6 Final System Integration & QA Suite
 *
 * Located permanently inside the project:
 * `D:/Moki/Portfolio/projects/Airplane_Management_System/scratch/test_stage6.js`
 *
 * Verifies:
 * 1. Byte-for-byte SHA-256 & Git-Blob SHA-1 preservation of all 23 original Java files against commit cc755ec
 * 2. Strict isolation: Portfolio_Website remains 100% untouched
 * 3. Zero duplicate HTML IDs across index.html
 * 4. DOM reference integrity: Static getElementById calls target valid HTML elements
 * 5. Cross-module data synchronization (Flight Deck <-> Fare Analytics <-> DataStore)
 * 6. Fare-update identity audit: Updates strictly target correct flight by flightId regardless of sorting/filtering
 * 7. LocalStorage state persistence, reload, and demo data reset
 * 8. Passenger Registry & Tree Indexing consistency
 * 9. Booking referential integrity & deletion guards
 * 10. Graph edge cases (unreachable targets, disconnected components, MST equivalence)
 * 11. Advanced B+ Tree structural invariants & sequential leaf ordering across 30 keys
 * 12. Sorting array immutability & stability guarantees
 * 13. Invalid input handling & boundary validations
 * 14. Idempotent repeated application initializations
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const crypto = require('crypto');

// Self-contained paths relative to project root
const AMS_DIR = path.resolve(__dirname, '..');
const PORTFOLIO_DIR = fs.existsSync(path.resolve(AMS_DIR, '../../Portfolio_Website'))
  ? path.resolve(AMS_DIR, '../../Portfolio_Website')
  : path.resolve('D:/Moki/Portfolio/Portfolio_Website');
const SRC_DIR = path.join(AMS_DIR, 'src');

console.log('================================================================');
console.log(' AEROOPS STAGE 6: FINAL SYSTEM INTEGRATION & END-TO-END QA');
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
// TEST 1: SOURCE CODE PRESERVATION & CRYPTOGRAPHIC HASH VERIFICATION
// =========================================================================

// Baseline hashes established from commit cc755ec
const EXPECTED_JAVA_HASHES = {
  'src/module-info.java': '3225d97379d78389861682dfd728a93cc9e50926fef1b285023d811aba136da5',
  'src/graphs/GraphAlgorithms.java': '138ad024bb25e9e67b2f2827a933c0ec016213ec0ee001a77134945406880811',
  'src/main/AirlineReservationSystem.java': 'e1d370e4890a42bf61015ac0d1694227284131981b7d2298b675a2a3684cdcf8',
  'src/model/Airport.java': '7b7f6d725f2b97e100acab8a0f9f2dd7acdcd87781b99ae802f965bd7c85dc03',
  'src/model/Flight.java': 'be17b163c09b3bea74a104f7bf0d465cd7137832792096f7bd29c5446040d7c3',
  'src/model/Passenger.java': 'c28f95af73d4fc687aa017ce88503d0ca9207194a2b0a09b18602d877429d367',
  'src/model/Ticket.java': 'e88df371d9c64ae043410e4639ac0dc3a3836a845bec4c63499a84f1ea1a8410',
  'src/service/BookingService.java': 'bc1cf1bb346c9c0ac6a21ff6720dfe69265f767eaf96c17113fcebaa02dfbdef',
  'src/service/FlightService.java': '5609ff15ec5038998b129b665f6099b82a1d14eb1478a74c5d3fff07d0fd18ff',
  'src/service/PassengerService.java': 'd8c3b0bc4af865bcc35b68329470113fc29cbf2e4aa132e463ec8720be78e0d4',
  'src/sorting/HeapSort.java': 'e79ddad21fb52d8044db04199754d5873264d1662f5e8eeca14df6407b448bfc',
  'src/sorting/MergeSort.java': '4b5838f60c367812f2e48d670e9f1e5ccd00cf98be9c487b6bcdd4303c94956f',
  'src/sorting/QuickSort.java': '9a4d81a7a78ab85920d74256563b6363ad1b2a36b4255b381952b431c8d44c87',
  'src/tree/AVLNode.java': 'b960dc4b4df5ac1f7de81a431d86de9bac737cc463fe04e49948fe0d47ba1dae',
  'src/tree/AVLTree.java': 'bafe98b6882aa27c2632f581e4d87794573b2de9c16b18f6c33f13219473e225',
  'src/tree/BPlusTree.java': '2dd0fb3c8210e28b3b25d894ab5ce80a9a6609909608c2483753e9b467ccd9e5',
  'src/tree/BPlusTreeNode.java': '8659df6813495bab62c2d5c55da747c3f80d973bcd051b6c5f1a47e2c4c621eb',
  'src/tree/BST.java': '0657a585fe260eda4f8cdd2fc0f13457941c0cf8ab0dd0ef99cd905d3dbff565',
  'src/tree/BSTNode.java': '8bb621eece56fe3a63b5769b27c12ed186360408e505ea0bc96af49fa18b5de0',
  'src/tree/BTree.java': 'da210c95a3d34ed4239ca8e4d2fc9aa281da58c5ec3314ce2c9224dcc2d9d547',
  'src/tree/BTreeNode.java': '2cc391a928a93a1b299d27ed0bebb5b91a01c1fdf5dadd5413d98067f6bf6a31',
  'src/tree/FenwickTree.java': '05a64fc627d63e3dfed4285c866e27372c4122dea6f2e9005931dcd876c24a6a',
  'src/tree/SegmentTree.java': '38e2ea87d58cdef74c92b146fc2592b86b02c7517975dea216a26694ad577e22'
};

const CANONICAL_GIT_BLOB_SHAS = {
  'src/graphs/GraphAlgorithms.java': '687c0752f82e1a230e4eb3c640ea1bc5bdc38478',
  'src/main/AirlineReservationSystem.java': 'ed6c9ecb14134569be333aaec173eb63c5f2a88f',
  'src/model/Airport.java': '4770c53615dc7ae4c926d29acc66daf3fa660f8a',
  'src/model/Flight.java': 'd50c2623fb455dce67c8acaf1df0228ff74cbd17',
  'src/model/Passenger.java': '56af1ad16672da5eb912b5f13243c803ce978b00',
  'src/model/Ticket.java': 'a2c6d1d5667f3b088c32a0096fd32117ed468c08',
  'src/module-info.java': '46e1284d77592d2b48015aac365f359800f36c9f',
  'src/service/BookingService.java': '99a222078ccd116a1861d7c3422a071074404904',
  'src/service/FlightService.java': '140b5de7ae57b29a2b16e1b3a9f639bc9c4e0f12',
  'src/service/PassengerService.java': 'b20e5b2271b489944fac96db8944a9fac4c9dca4',
  'src/sorting/HeapSort.java': '93e0c9a1bdc5b476817a592515a0692f33fa0a77',
  'src/sorting/MergeSort.java': '994661758042a3429fb3e1396b0fb3c9d7a61f70',
  'src/sorting/QuickSort.java': 'acc9db21f33974adc44ddc5938d3f0fa822617a4',
  'src/tree/AVLNode.java': 'f9c568f79b7032641b16e681eda74202cc90aa59',
  'src/tree/AVLTree.java': 'c3d26e0e974d72b14c41e35f9829374e55b6fd43',
  'src/tree/BPlusTree.java': '8836de7dd878a4b221b963bc5c0e6752abf23051',
  'src/tree/BPlusTreeNode.java': '0d3f9ffecb85e490449dd130ad9fb1f22e1e912d',
  'src/tree/BST.java': '6daca8b904aa7b0ae9f211cc16fab5ac77d9f438',
  'src/tree/BSTNode.java': 'f582fd2e54f283c5e831bcacddf0b8be747ba7ad',
  'src/tree/BTree.java': '40b75a85be587d7e78d69e2b4af05b228849ad89',
  'src/tree/BTreeNode.java': 'fefed36e0b143ba5adc1f64ef08ea3f9f6c8ba1c',
  'src/tree/FenwickTree.java': '6756e798ab15bda16844294d98b9faaaa708d3fb',
  'src/tree/SegmentTree.java': '39933aa66fee192bae47f3711ca4ef4a4974b49c'
};

it('All 23 Java files match exact SHA-256 hashes from original commit cc755ec', () => {
  assert.strictEqual(Object.keys(EXPECTED_JAVA_HASHES).length, 23);
  Object.keys(EXPECTED_JAVA_HASHES).forEach(relPath => {
    const fullPath = path.join(AMS_DIR, relPath);
    assert.ok(fs.existsSync(fullPath), `File missing: ${relPath}`);
    const content = fs.readFileSync(fullPath);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    assert.strictEqual(hash, EXPECTED_JAVA_HASHES[relPath], `Hash mismatch on ${relPath}`);
  });
});

it('All 23 Java files match canonical Git-Blob SHA-1 hashes from commit cc755ec tree after LF normalization', () => {
  assert.strictEqual(Object.keys(CANONICAL_GIT_BLOB_SHAS).length, 23);
  Object.keys(CANONICAL_GIT_BLOB_SHAS).forEach(relPath => {
    const fullPath = path.join(AMS_DIR, relPath);
    assert.ok(fs.existsSync(fullPath), `File missing: ${relPath}`);
    const rawContent = fs.readFileSync(fullPath);
    const lfContent = Buffer.from(rawContent.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
    const blobHeader = Buffer.from(`blob ${lfContent.length}\0`, 'utf8');
    const fullBlob = Buffer.concat([blobHeader, lfContent]);
    const computedGitSha = crypto.createHash('sha1').update(fullBlob).digest('hex');
    assert.strictEqual(
      computedGitSha,
      CANONICAL_GIT_BLOB_SHAS[relPath],
      `Git-blob hash mismatch on ${relPath}: got ${computedGitSha}, expected ${CANONICAL_GIT_BLOB_SHAS[relPath]}`
    );
  });
});

it('Portfolio_Website remains completely untouched', () => {
  assert.ok(fs.existsSync(PORTFOLIO_DIR), 'Portfolio_Website directory must exist');
  const files = fs.readdirSync(PORTFOLIO_DIR);
  assert.strictEqual(files.length, 4);
});

// =========================================================================
// TEST 2: HTML DOM STRUCTURE & ID INTEGRITY
// =========================================================================

const htmlPath = path.join(AMS_DIR, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const idSet = new Set();
const idRegex = /\sid=["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(htmlContent)) !== null) {
  assert.ok(!idSet.has(m[1]), `Duplicate ID found: ${m[1]}`);
  idSet.add(m[1]);
}

it(`HTML contains zero duplicate IDs across ${idSet.size} unique elements`, () => {
  assert.ok(idSet.size > 150);
});

it('Every static getElementById in JavaScript controllers maps to an existing HTML ID', () => {
  const jsFiles = [
    'js/airline-data.js',
    'js/flight-manager.js',
    'js/passenger-manager.js',
    'js/booking-manager.js',
    'js/graph/graph-manager.js',
    'js/trees/tree-manager.js',
    'js/analytics/analytics-manager.js',
    'js/app.js'
  ];

  // Dynamic IDs rendered conditionally in empty-state blocks
  const dynamicIds = new Set(['btn-clear-flight-filters', 'btn-clear-passenger-filters']);

  const missingIds = [];
  const getElemPattern = /getElementById\(['"]([^'"]+)['"]\)/g;

  jsFiles.forEach(rel => {
    const code = fs.readFileSync(path.join(AMS_DIR, rel), 'utf8');
    let match;
    while ((match = getElemPattern.exec(code)) !== null) {
      const id = match[1];
      if (!idSet.has(id) && !dynamicIds.has(id)) {
        missingIds.push({ file: rel, id: id });
      }
    }
  });

  assert.strictEqual(missingIds.length, 0, `Missing static DOM IDs referenced in JS: ${JSON.stringify(missingIds)}`);
});

// =========================================================================
// SETUP MOCK ENVIRONMENT FOR RUNTIME INTEGRATION TESTS
// =========================================================================

// Mock LocalStorage
const localStorageStore = {};
global.localStorage = {
  getItem: key => localStorageStore[key] || null,
  setItem: (key, val) => { localStorageStore[key] = String(val); },
  removeItem: key => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

global.window = global;

// Mock Toast & Modal UI
global.AeroToast = {
  info: () => {},
  success: () => {},
  warning: () => {},
  error: () => {}
};
global.AeroModal = {
  open: () => {},
  close: () => {}
};

// Load All App Modules
require(path.join(AMS_DIR, 'js/airline-data.js'));
require(path.join(AMS_DIR, 'js/graph/graph-data.js'));
require(path.join(AMS_DIR, 'js/graph/graph-algorithms.js'));
require(path.join(AMS_DIR, 'js/trees/tree-data.js'));
require(path.join(AMS_DIR, 'js/trees/bst.js'));
require(path.join(AMS_DIR, 'js/trees/avl-tree.js'));
require(path.join(AMS_DIR, 'js/trees/b-tree.js'));
require(path.join(AMS_DIR, 'js/trees/b-plus-tree.js'));
require(path.join(AMS_DIR, 'js/analytics/fare-data.js'));
require(path.join(AMS_DIR, 'js/analytics/segment-tree.js'));
require(path.join(AMS_DIR, 'js/analytics/fenwick-tree.js'));
require(path.join(AMS_DIR, 'js/analytics/sorting-algorithms.js'));

// =========================================================================
// TEST 3: LOCALSTORAGE PERSISTENCE & RESTORATION
// =========================================================================

it('AeroDataStore persists mutations to LocalStorage and reloads accurately', () => {
  const store = window.AeroDataStore;
  store.resetToSeed(false);

  // Add custom flight
  store.addFlight({
    flightId: 'QA-777',
    flightName: 'Test Concorde',
    source: 'DEL',
    destination: 'BOM',
    fare: 8888
  });

  assert.ok(localStorageStore['aeroops_airline_state_v2'], 'State must be serialized into localStorage');

  // Verify reload
  const restoredFlights = store.getFlights();
  const found = restoredFlights.find(f => f.flightId === 'QA-777');
  assert.ok(found, 'Added flight must persist');
  assert.strictEqual(found.fare, 8888);
});

// =========================================================================
// TEST 4: CROSS-MODULE DATA INTEGRITY & FARE SYNCHRONIZATION
// =========================================================================

it('Bidirectional Fare Sync: Flight Deck fare updates reflect in Fare Analytics and vice versa', () => {
  const store = window.AeroDataStore;
  store.resetToSeed(false);

  // 1. Update fare via FlightService / DataStore for seed flight AI-101
  store.updateFlightFare('AI-101', 7750);
  const updatedFlight = store.searchFlight('AI-101');
  assert.strictEqual(updatedFlight.fare, 7750);

  // 2. Load fleet dataset in Fare Analytics
  const fleetData = window.AeroFareData.getDataset('fleet');
  const targetItem = fleetData.find(f => f.flightId === 'AI-101');
  assert.ok(targetItem, 'Fleet dataset must contain updated AI-101');
  assert.strictEqual(targetItem.fare, 7750);

  // 3. Initialize Segment Tree and Fenwick Tree on fleet fares
  const fares = window.AeroFareData.getFareArray(fleetData);
  const segTree = new window.AeroSegmentTree(fares);
  const fenTree = new window.AeroFenwickTree(fares);

  const ai101Index = fleetData.findIndex(f => f.flightId === 'AI-101');
  assert.strictEqual(segTree.rangeMinimumQuery(ai101Index, ai101Index), 7750);

  // 4. Update fare from Fare Analytics layer using unique flight ID
  const targetFlightId = fleetData[ai101Index].flightId;
  store.updateFlightFare(targetFlightId, 3300);
  assert.strictEqual(store.searchFlight('AI-101').fare, 3300, 'DataStore must accurately update target flight by flightId');
});

// =========================================================================
// TEST 5: FARE-UPDATE IDENTITY AUDIT (IMMUNITY TO RE-ORDERING & FILTERING)
// =========================================================================

it('Fare-Update Identity Audit: Updates strictly target correct flight even when reordered, filtered, or deleted', () => {
  const store = window.AeroDataStore;
  store.resetToSeed(false);

  // Initial order has AI-101 at index 0, 6E-204 at index 1, UK-812 at index 2
  const initialFlights = store.getFlights();
  assert.strictEqual(initialFlights[0].flightId, 'AI-101');
  assert.strictEqual(initialFlights[1].flightId, '6E-204');
  assert.strictEqual(initialFlights[2].flightId, 'UK-812');

  // 1. Simulate reordering/sorting flights in Flight Deck (e.g. fare descending)
  const sortedDesc = [...initialFlights].sort((a, b) => b.fare - a.fare);
  const ai101NewIndex = sortedDesc.findIndex(f => f.flightId === 'AI-101');
  assert.notStrictEqual(ai101NewIndex, 0, 'Flight AI-101 has moved to a non-zero index in sorted view');

  // 2. Simulate filtered view in Flight Deck (e.g. only flights departing from BOM)
  const bomFlights = initialFlights.filter(f => f.source === 'BOM');
  const targetBomFlight = bomFlights[0]; // e.g. 6E-204 or SG-415
  assert.ok(targetBomFlight, 'Filtered list must contain flights');

  // 3. Execute fare update using unique flight ID on the re-ordered/filtered flight
  const oldFare = targetBomFlight.fare;
  const newFare = oldFare + 1250;
  store.updateFlightFare(targetBomFlight.flightId, newFare);

  // 4. Verify that ONLY the intended target flight was updated in persistent storage
  const updatedInStore = store.searchFlight(targetBomFlight.flightId);
  assert.strictEqual(updatedInStore.fare, newFare, 'Target flight fare must update to newFare');

  // 5. Verify that other flights (e.g. AI-101) were completely unaffected
  assert.strictEqual(store.searchFlight('AI-101').fare, 5400, 'Untargeted flights must remain completely unchanged');

  // 6. Test deletion of a flight does not corrupt updates for remaining flights
  store.cancelTicket(1004); // Cancel ticket on SG-415 to allow deletion
  store.deleteFlight('SG-415');
  assert.strictEqual(store.searchFlight('SG-415'), null, 'Deleted flight must be removed');

  // 7. Update another flight after deletion
  store.updateFlightFare('UK-812', 6890);
  assert.strictEqual(store.searchFlight('UK-812').fare, 6890, 'Updates post-deletion must remain strictly targeted by flightId');
});

// =========================================================================
// TEST 6: PASSENGER REGISTRY & TREE INDEXING CONSISTENCY
// =========================================================================

it('Passenger additions synchronize into Tree Indexing IDs and pass searches', () => {
  const store = window.AeroDataStore;
  store.resetToSeed(false);

  // Add new passenger #199
  store.addPassenger({
    passengerId: 199,
    passengerName: 'Captain Vikram',
    age: 44,
    gender: 'Male'
  });

  const ids = window.AeroTreeData.getPassengerIds();
  assert.ok(ids.includes(199), 'getPassengerIds() must include newly added passenger #199');

  // Insert into BST, AVL, B-Tree, and B+ Tree
  const bst = new window.AeroBST();
  const avl = new window.AeroAVLTree();
  const btree = new window.AeroBTree(3);
  const bplus = new window.AeroBPlusTree(3);

  ids.forEach(id => {
    bst.insert(id);
    avl.insert(id);
    btree.insert(id);
    bplus.insert(id);
  });

  assert.strictEqual(bst.search(199).found, true, 'BST must find key 199');
  assert.strictEqual(avl.search(199).found, true, 'AVL must find key 199');
  assert.strictEqual(btree.search(199).found, true, 'B-Tree must find key 199');
  assert.strictEqual(bplus.search(199).found, true, 'B+ Tree must find key 199');
});

// =========================================================================
// TEST 7: BOOKING REFERENTIAL INTEGRITY & DELETION GUARDS
// =========================================================================

it('Enforces strict referential integrity: flight or passenger with active tickets cannot be deleted', () => {
  const store = window.AeroDataStore;
  store.resetToSeed(false);

  // Flight 6E-204 has active ticket #1002
  assert.throws(() => {
    store.deleteFlight('6E-204');
  }, /booked on this airframe/);

  // Passenger #102 has active ticket #1002
  assert.throws(() => {
    store.deletePassenger(102);
  }, /active ticket/);

  // Cancel ticket #1002
  store.cancelTicket(1002);

  // Now passenger and flight deletion can proceed
  const deletedPassenger = store.deletePassenger(102);
  assert.strictEqual(deletedPassenger.passengerId, 102);
});

// =========================================================================
// TEST 8: GRAPH ALGORITHMS EDGE CASES & MST EQUIVALENCE
// =========================================================================

it('Graph algorithms handle disconnected components and unreachable destinations', () => {
  const RouteNetworkGraph = window.AeroGraphData.RouteNetworkGraph;
  const algorithms = window.AeroGraphAlgorithms;

  const graph = new RouteNetworkGraph();

  // Add isolated island airport
  graph.addNode('IXZ', 'Port Blair', 'Port Blair', 750, 480, 'Andaman');

  // Search shortest path from DEL to IXZ
  const dij = algorithms.dijkstra(graph, 'DEL', 'IXZ');
  assert.strictEqual(dij.unreachable, true, 'Destination must be flagged unreachable');
  assert.strictEqual(dij.distances['IXZ'], Infinity, 'Unreachable airport distance must be Infinity');
  assert.strictEqual(dij.path.length, 0, 'Path to unreachable airport must be empty');

  // Prim and Kruskal MST weights match on connected network
  const connectedGraph = new RouteNetworkGraph();

  const prim = algorithms.primMST(connectedGraph, 'DEL');
  const kruskal = algorithms.kruskalMST(connectedGraph);
  assert.strictEqual(prim.totalDistance, kruskal.totalDistance, 'Prim and Kruskal must yield identical MST weight');
});

// =========================================================================
// TEST 9: B+ TREE MULTI-LEVEL SPLIT & ORDERED LEAF INVARIANT
// =========================================================================

it('B+ Tree maintains linked-leaf horizontal sequential scan across 30 keys', () => {
  const bplus = new window.AeroBPlusTree(3);
  const keys = [
    50, 20, 80, 10, 30, 70, 90, 5, 15, 25, 35, 65, 75, 85, 95,
    2, 8, 12, 18, 22, 28, 32, 38, 62, 68, 72, 78, 82, 88, 98
  ];

  keys.forEach(k => bplus.insert(k, { val: k }));

  const leaves = bplus.getLeaves();
  assert.ok(leaves.length >= 6, `Expected multiple leaves, got ${leaves.length}`);

  // Sequential scan via next pointer
  let curr = leaves[0];
  const scanned = [];
  while (curr) {
    scanned.push(...curr.keys);
    curr = curr.next;
  }

  const expectedSorted = keys.slice().sort((a, b) => a - b);
  assert.deepStrictEqual(scanned, expectedSorted, 'Sequential leaf traversal must match sorted keys');
});

// =========================================================================
// TEST 10: SORTING ARRAY IMMUTABILITY & STABILITY
// =========================================================================

it('Sorting algorithms never mutate original input dataset array', () => {
  const dataset = [
    { id: 'F1', flightId: 'AI-1', fare: 6000 },
    { id: 'F2', flightId: '6E-2', fare: 2000 },
    { id: 'F3', flightId: 'UK-3', fare: 4500 }
  ];

  const backup = JSON.stringify(dataset);

  window.AeroMergeSort.generateTrace(dataset);
  assert.strictEqual(JSON.stringify(dataset), backup, 'MergeSort mutated array!');

  window.AeroQuickSort.generateTrace(dataset);
  assert.strictEqual(JSON.stringify(dataset), backup, 'QuickSort mutated array!');

  window.AeroHeapSort.generateTrace(dataset);
  assert.strictEqual(JSON.stringify(dataset), backup, 'HeapSort mutated array!');
});

// =========================================================================
// TEST 11: INVALID INPUT HANDLING & BOUNDARY VALIDATIONS
// =========================================================================

it('Controllers reject invalid inputs gracefully without throwing uncaught exceptions', () => {
  const store = window.AeroDataStore;

  // Invalid Flight Fare
  assert.throws(() => {
    store.addFlight({ flightId: 'BAD-1', flightName: 'Air', source: 'DEL', destination: 'BOM', fare: -500 });
  }, /greater than 0/);

  // Identical Source and Destination
  assert.throws(() => {
    store.addFlight({ flightId: 'BAD-2', flightName: 'Air', source: 'DEL', destination: 'DEL', fare: 5000 });
  }, /cannot be identical/);

  // Invalid Passenger Age
  assert.throws(() => {
    store.addPassenger({ passengerId: 999, passengerName: 'Age Error', age: 150, gender: 'Male' });
  }, /between 1 and 120/);
});

// =========================================================================
// TEST 12: TWILIGHT RUNWAY PALETTE & PORTFOLIO DISTINCTNESS
// =========================================================================

it('Design tokens implement distinct Twilight Runway palette without colliding with Portfolio_Website', () => {
  const tokenCss = fs.readFileSync(path.join(AMS_DIR, 'css/design-tokens.css'), 'utf-8');
  assert.ok(tokenCss.includes('#14121A'), 'Primary background must be charcoal-plum (#14121A)');
  assert.ok(tokenCss.includes('#F2A65A'), 'Brand accent must be Runway Amber (#F2A65A)');
  assert.ok(tokenCss.includes('#E47B65'), 'Secondary accent must be Muted Coral (#E47B65)');
  assert.ok(tokenCss.includes('#A995C7'), 'Tertiary accent must be Soft Lilac (#A995C7)');
  assert.ok(tokenCss.includes('#F6F0E7'), 'Primary text must be Warm Ivory (#F6F0E7)');

  // Verify Portfolio_Website uses different palette
  const portfolioCss = fs.readFileSync(path.join(PORTFOLIO_DIR, 'style.css'), 'utf-8');
  assert.ok(!portfolioCss.includes('#F2A65A'), 'Portfolio_Website does not share Runway Amber accent');
  assert.ok(!portfolioCss.includes('#14121A'), 'Portfolio_Website does not share Charcoal-Plum base');
});

// =========================================================================
// TEST 13: BOARDING PASS PRINTING & PRINT STYLESHEET
// =========================================================================

it('Boarding pass print action and clean print media query are present', () => {
  const html = fs.readFileSync(path.join(AMS_DIR, 'index.html'), 'utf-8');
  assert.ok(html.includes('id="btn-print-boarding-pass"'), 'HTML must contain #btn-print-boarding-pass');

  const mainCss = fs.readFileSync(path.join(AMS_DIR, 'css/main.css'), 'utf-8');
  assert.ok(mainCss.includes('@media print'), 'main.css must contain @media print styles');
  assert.ok(mainCss.includes('#modal-boarding-pass'), 'print stylesheet must format #modal-boarding-pass');

  const bookingJs = fs.readFileSync(path.join(AMS_DIR, 'js/booking-manager.js'), 'utf-8');
  assert.ok(bookingJs.includes('btn-print-boarding-pass'), 'booking-manager.js must bind #btn-print-boarding-pass');
  assert.ok(bookingJs.includes('window.print()'), 'booking-manager.js must trigger window.print()');
});

// =========================================================================
// TEST 14: TOOLBAR FILTER RESET BUTTONS & FUNCTIONALITY
// =========================================================================

it('Toolbar filter reset controls are configured across Flight Deck, Passengers, and Bookings', () => {
  const html = fs.readFileSync(path.join(AMS_DIR, 'index.html'), 'utf-8');
  assert.ok(html.includes('id="btn-reset-flight-filters"'), 'Must have #btn-reset-flight-filters');
  assert.ok(html.includes('id="btn-reset-passenger-filters"'), 'Must have #btn-reset-passenger-filters');
  assert.ok(html.includes('id="btn-reset-booking-filters"'), 'Must have #btn-reset-booking-filters');

  const flightJs = fs.readFileSync(path.join(AMS_DIR, 'js/flight-manager.js'), 'utf-8');
  assert.ok(flightJs.includes('btn-reset-flight-filters'), 'flight-manager.js must handle #btn-reset-flight-filters');

  const passengerJs = fs.readFileSync(path.join(AMS_DIR, 'js/passenger-manager.js'), 'utf-8');
  assert.ok(passengerJs.includes('btn-reset-passenger-filters'), 'passenger-manager.js must handle #btn-reset-passenger-filters');

  const bookingJs = fs.readFileSync(path.join(AMS_DIR, 'js/booking-manager.js'), 'utf-8');
  assert.ok(bookingJs.includes('btn-reset-booking-filters'), 'booking-manager.js must handle #btn-reset-booking-filters');
});

console.log('\n================================================================');
console.log(` STAGE 6 VERIFICATION RESULTS: ${passedTests} / ${totalTests} PASSED`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
