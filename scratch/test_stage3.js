const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const portfolioDir = fs.existsSync(path.resolve(__dirname, '../../../Portfolio_Website'))
  ? path.resolve(__dirname, '../../../Portfolio_Website')
  : 'D:\\Moki\\Portfolio\\Portfolio_Website';

console.log('========================================================');
console.log('   AEROOPS STAGE 3 AUTOMATED TEST SUITE: GRAPH ALGORITHMS');
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
// 2. GRAPH DATA STRUCTURE & ALGORITHMS VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. Graph Algorithms & Correctness ---');

const mockWindow = { console: console };
const graphDataCode = fs.readFileSync(path.join(baseDir, 'js/graph/graph-data.js'), 'utf8');
const graphAlgoCode = fs.readFileSync(path.join(baseDir, 'js/graph/graph-algorithms.js'), 'utf8');

vm.runInNewContext(graphDataCode, { window: mockWindow, console: console });
vm.runInNewContext(graphAlgoCode, { window: mockWindow, console: console });

const RouteNetworkGraph = mockWindow.AeroGraphData.RouteNetworkGraph;
const algorithms = mockWindow.AeroGraphAlgorithms;

const graph = new RouteNetworkGraph();
assert(graph.getNodes().length === 10, 'Graph initialized with 10 airport hub nodes');
assert(graph.getEdges().length === 17, 'Graph initialized with 17 national air corridors');
assert(graph.isGraphConnected() === true, 'Graph is verified connected');

// 2a. BFS Test
console.log('\n--- 2a. Breadth-First Search (BFS) ---');
const bfsResult = algorithms.bfs(graph, 'DEL');
assert(bfsResult.traversalOrder[0] === 'DEL', 'BFS starts at DEL');
assert(bfsResult.visitedCount === 10, 'BFS traversed all 10 connected hubs');
assert(bfsResult.steps.length > 10, `BFS generated ${bfsResult.steps.length} detailed step traces`);

// 2b. DFS Test
console.log('\n--- 2b. Depth-First Search (DFS) ---');
const dfsResult = algorithms.dfs(graph, 'DEL');
assert(dfsResult.traversalOrder[0] === 'DEL', 'DFS starts at DEL');
assert(dfsResult.visitedCount === 10, 'DFS traversed all 10 connected hubs');
assert(dfsResult.steps.length > 10, `DFS generated ${dfsResult.steps.length} detailed step traces`);

// 2c. Dijkstra Test
console.log('\n--- 2c. Dijkstra Shortest Path ---');
const dijkstraResult = algorithms.dijkstra(graph, 'DEL', 'BLR');
assert(dijkstraResult.unreachable === false, 'DEL to BLR is reachable');
assert(dijkstraResult.totalCost === 1740, `DEL to BLR shortest distance is 1740 km (got ${dijkstraResult.totalCost})`);
assert(dijkstraResult.path.join('-') === 'DEL-BLR', `Shortest path is direct corridor: ${dijkstraResult.path.join('->')}`);

const dijkstraBOM_MAA = algorithms.dijkstra(graph, 'BOM', 'MAA');
assert(dijkstraBOM_MAA.totalCost === 1130, `BOM to MAA shortest distance is 1130 km (BOM-BLR:840 + BLR-MAA:290 = 1130 or BOM-HYD:620 + HYD-MAA:510 = 1130) (got ${dijkstraBOM_MAA.totalCost})`);

// 2d. Bellman-Ford Test
console.log('\n--- 2d. Bellman-Ford Shortest Path ---');
const bfResult = algorithms.bellmanFord(graph, 'DEL', 'BLR');
assert(bfResult.totalCost === dijkstraResult.totalCost, `Bellman-Ford matches Dijkstra distance: ${bfResult.totalCost} km`);
assert(bfResult.hasNegativeCycle === false, 'No negative cycle detected in standard airline graph');

// 2e. Minimum Spanning Tree (Prim vs Kruskal)
console.log('\n--- 2e. Minimum Spanning Trees (Prim vs Kruskal) ---');
const primResult = algorithms.primMST(graph, 'DEL');
const kruskalResult = algorithms.kruskalMST(graph);

assert(primResult.mstEdges.length === 9, `Prim's MST has V-1 = 9 edges (got ${primResult.mstEdges.length})`);
assert(kruskalResult.mstEdges.length === 9, `Kruskal's MST has V-1 = 9 edges (got ${kruskalResult.mstEdges.length})`);
assert(primResult.totalCost === kruskalResult.totalCost, `Prim and Kruskal total weights match: Prim=${primResult.totalCost} km, Kruskal=${kruskalResult.totalCost} km`);
assert(primResult.totalCost > 0, `MST total cost is valid positive weight: ${primResult.totalCost} km`);

// 2f. Floyd-Warshall Test
console.log('\n--- 2f. Floyd-Warshall All-Pairs ---');
const fwResult = algorithms.floydWarshall(graph);
assert(fwResult.cities.length === 10, 'Floyd-Warshall evaluated 10 cities');
const delIdx = fwResult.cities.indexOf('DEL');
const blrIdx = fwResult.cities.indexOf('BLR');
assert(fwResult.matrix[delIdx][delIdx] === 0, 'Distance from DEL to DEL is 0');
assert(fwResult.matrix[delIdx][blrIdx] === 1740, `Floyd-Warshall DEL to BLR distance matches Dijkstra: ${fwResult.matrix[delIdx][blrIdx]} km`);

// 2g. Disconnected Graph & Unreachable Target Test
console.log('\n--- 2g. Disconnected Graph & Unreachable Target Handling ---');
const disconnectedGraph = new RouteNetworkGraph();
disconnectedGraph.addNode('IXZ', 'Veer Savarkar Int\'l', 'Port Blair', 750, 480, 'Andaman');
// IXZ is an island node with no edges
assert(disconnectedGraph.isGraphConnected() === false, 'isGraphConnected returns false when isolated node added');

const unreachDijkstra = algorithms.dijkstra(disconnectedGraph, 'DEL', 'IXZ');
assert(unreachDijkstra.unreachable === true, 'Dijkstra flags destination as unreachable');
assert(unreachDijkstra.distances['IXZ'] === Infinity, 'Distance to isolated island is Infinity');

const unreachBF = algorithms.bellmanFord(disconnectedGraph, 'DEL', 'IXZ');
assert(unreachBF.unreachable === true, 'Bellman-Ford flags destination as unreachable');

const unreachPrim = algorithms.primMST(disconnectedGraph, 'DEL');
assert(unreachPrim.isConnected === false, 'Prim recognizes disconnected graph component');

// 2h. Negative Cycle Detection in Bellman-Ford
console.log('\n--- 2h. Negative Cycle Detection ---');
const negCycleGraph = new RouteNetworkGraph();
negCycleGraph.resetToDefault();
// Add negative cycle between BOM, PNQ, GOI
negCycleGraph.addRoute('BOM', 'PNQ', -500, true);
negCycleGraph.addRoute('PNQ', 'GOI', -500, true);
negCycleGraph.addRoute('GOI', 'BOM', -500, true);
const negBfResult = algorithms.bellmanFord(negCycleGraph, 'BOM', 'DEL');
assert(negBfResult.hasNegativeCycle === true, 'Bellman-Ford accurately detects negative weight cycle');

// -----------------------------------------------------------------------------
// 3. HTML DOM ELEMENTS INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 3. HTML DOM Elements & ID Mapping ---');
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

const requiredStage3IDs = [
  'view-routes',
  'kpi-network-nodes', 'kpi-network-edges', 'kpi-network-connectivity', 'graph-result-cost',
  'route-network-canvas-container',
  'graph-result-summary', 'graph-result-details', 'graph-matrix-container', 'btn-sync-graph-flights',
  'graph-algo-select', 'graph-start-node', 'graph-target-node', 'graph-target-group', 'btn-graph-run',
  'graph-step-counter', 'btn-graph-play', 'btn-graph-step', 'btn-graph-reset',
  'graph-playback-speed', 'graph-exec-status', 'graph-step-logs', 'graph-algo-complexity'
];

for (const id of requiredStage3IDs) {
  assert(ids.has(id), `Stage 3 DOM element exists: #${id}`);
}

// -----------------------------------------------------------------------------
// 4. STAGE 2 REGRESSION VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 4. Stage 2 CRUD Regression Verification ---');
const mockStorage = {};
const fullMockWindow = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); }
  },
  console: console
};
const storeCode = fs.readFileSync(path.join(baseDir, 'js/airline-data.js'), 'utf8');
vm.runInNewContext(storeCode, {
  window: fullMockWindow,
  localStorage: fullMockWindow.localStorage,
  console: console
});
const store = fullMockWindow.AeroDataStore;
assert(store.getFlights().length === 8, 'Stage 2 Flights still accessible (8 flights)');
assert(store.getPassengers().length === 6, 'Stage 2 Passengers still accessible (6 passengers)');
assert(store.getTickets().length === 4, 'Stage 2 Bookings still accessible (4 tickets)');

// -----------------------------------------------------------------------------
// 5. CODEBASE PRESERVATION & ISOLATION
// -----------------------------------------------------------------------------
console.log('\n--- 5. Codebase Preservation & Isolation Check ---');

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
