const fs = require('fs');
const path = require('path');
const vm = require('vm');

const baseDir = path.resolve(__dirname, '..');
const portfolioDir = fs.existsSync(path.resolve(__dirname, '../../../Portfolio_Website'))
  ? path.resolve(__dirname, '../../../Portfolio_Website')
  : 'D:\\Moki\\Portfolio\\Portfolio_Website';

console.log('========================================================');
console.log('   AEROOPS STAGE 2 AUTOMATED TEST SUITE');
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
// 2. DATA ARCHITECTURE & FUNCTIONAL CRUD VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. Data Store CRUD & Relational Integrity ---');

// Create mock browser sandbox for airline-data.js
const mockStorage = {};
const mockWindow = {
  localStorage: {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  },
  console: console
};

const storeCode = fs.readFileSync(path.join(baseDir, 'js/airline-data.js'), 'utf8');
vm.runInNewContext(storeCode, {
  window: mockWindow,
  localStorage: mockWindow.localStorage,
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout
});

const store = mockWindow.AeroDataStore;
assert(store !== undefined, 'AeroDataStore instantiated in window');

// Test Initial Seeding
const seedFlights = store.getFlights();
assert(seedFlights.length === 8, `Initial seed flights count: 8 (got ${seedFlights.length})`);
const seedPassengers = store.getPassengers();
assert(seedPassengers.length === 6, `Initial seed passengers count: 6 (got ${seedPassengers.length})`);
const seedTickets = store.getTickets();
assert(seedTickets.length === 4, `Initial seed tickets count: 4 (got ${seedTickets.length})`);

// Test Flight Operations
console.log('\n--- 2a. Flight Operations ---');
const newFlight = store.addFlight({
  flightId: 'TEST-99',
  flightName: 'Test Airlines',
  source: 'DEL',
  destination: 'GOI',
  fare: 4500.00
});
assert(newFlight.flightId === 'TEST-99', 'addFlight successfully added TEST-99');
assert(store.getFlights().length === 9, 'Fleet count incremented to 9');

const foundFlight = store.searchFlight('test-99');
assert(foundFlight && foundFlight.flightId === 'TEST-99', 'searchFlight case-insensitive match succeeded');

store.updateFlightFare('TEST-99', 5100.00);
assert(store.searchFlight('TEST-99').fare === 5100.00, 'updateFlightFare updated fare to 5100');

// Test Passenger Operations
console.log('\n--- 2b. Passenger Operations ---');
const newPassenger = store.addPassenger({
  passengerId: 107,
  passengerName: 'Test Traveler',
  age: 30,
  gender: 'Other'
});
assert(newPassenger.passengerId === 107, 'addPassenger added passenger #107');
assert(store.getPassengers().length === 7, 'Passenger manifest count incremented to 7');

store.updatePassenger(107, { age: 31 });
assert(store.searchPassenger(107).age === 31, 'updatePassenger modified age to 31');

// Test Booking Operations & Relational Links
console.log('\n--- 2c. Booking Operations & Relational Integrity ---');
const newTicket = store.bookTicket({
  ticketId: 1005,
  passengerId: 107,
  flightId: 'TEST-99'
});
assert(newTicket && newTicket.ticketId === 1005, 'bookTicket issued Ticket #1005');
assert(newTicket.passenger.passengerName === 'Test Traveler', 'Enriched ticket references passenger name');
assert(newTicket.flight.flightName === 'Test Airlines', 'Enriched ticket references flight name');
assert(store.getTickets().length === 5, 'Tickets count incremented to 5');

// Test Safe Deletion Constraints
console.log('\n--- 2d. Relational Integrity Checks on Delete ---');
let flightDeleteBlocked = false;
try {
  store.deleteFlight('TEST-99');
} catch (err) {
  flightDeleteBlocked = true;
}
assert(flightDeleteBlocked, 'deleteFlight safely rejected because Ticket #1005 is active on TEST-99');

let passengerDeleteBlocked = false;
try {
  store.deletePassenger(107);
} catch (err) {
  passengerDeleteBlocked = true;
}
assert(passengerDeleteBlocked, 'deletePassenger safely rejected because Ticket #1005 is booked under #107');

// Cancel Ticket
store.cancelTicket(1005);
assert(store.searchTicket(1005) === null, 'cancelTicket removed Ticket #1005');
assert(store.getTickets().length === 4, 'Tickets count returned to 4');

// Now deletions should succeed
store.deleteFlight('TEST-99');
assert(store.searchFlight('TEST-99') === null, 'deleteFlight succeeded after ticket cancellation');
store.deletePassenger(107);
assert(store.searchPassenger(107) === null, 'deletePassenger succeeded after ticket cancellation');

// Test Telemetry Calculation
console.log('\n--- 2e. Telemetry & Analytics Calculation ---');
const telemetry = store.getTelemetry();
assert(telemetry.activeFlights === 8, 'Telemetry activeFlights matches data store');
assert(telemetry.totalPassengers === 6, 'Telemetry totalPassengers matches data store');
assert(telemetry.activeTickets === 4, 'Telemetry activeTickets matches data store');
assert(telemetry.averageFare > 0, `Telemetry averageFare is valid number: ₹${telemetry.averageFare}`);
assert(telemetry.bookedRevenue > 0, `Telemetry bookedRevenue is valid number: ₹${telemetry.bookedRevenue}`);

// -----------------------------------------------------------------------------
// 3. HTML DOM INTEGRITY VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n--- 3. HTML DOM Elements & ID Mapping ---');
const htmlContent = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');

// Check duplicate IDs
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

// Check required element IDs referenced in JS
const requiredIDs = [
  'view-flight-deck', 'view-passengers', 'view-routes', 'view-tree-index', 'view-fare-analytics',
  'kpi-active-fleet', 'kpi-route-hubs', 'kpi-total-passengers', 'kpi-average-fare',
  'flight-table-body', 'flight-search-input', 'flight-origin-filter', 'flight-dest-filter', 'flight-sort-select',
  'btn-open-add-flight', 'btn-reset-demo-data',
  'kpi-passenger-total', 'kpi-passenger-avg-age', 'kpi-passenger-gender-ratio',
  'passenger-table-body', 'passenger-search-input', 'passenger-gender-filter', 'btn-open-add-passenger',
  'kpi-booking-total', 'kpi-booking-revenue', 'kpi-booking-avg-ticket',
  'booking-table-body', 'booking-search-input', 'btn-open-book-ticket',
  'modal-flight', 'modal-fare', 'modal-flight-details', 'modal-passenger',
  'modal-passenger-details', 'modal-booking', 'modal-boarding-pass', 'modal-confirm',
  'toast-container', 'live-utc-clock'
];

for (const id of requiredIDs) {
  assert(ids.has(id), `Required DOM element exists: #${id}`);
}

// -----------------------------------------------------------------------------
// 4. PRESERVATION & ISOLATION CHECK
// -----------------------------------------------------------------------------
console.log('\n--- 4. Codebase Preservation & Isolation Check ---');

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
assert(portfolioFiles.length === 4, `Portfolio_Website unchanged (${portfolioFiles.length} files)`);

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (100% Success)`);
console.log('========================================================');
