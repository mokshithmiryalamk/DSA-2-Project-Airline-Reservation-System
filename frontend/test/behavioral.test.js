/**
 * AEROOPS Stage 4 Behavioral Test Suite
 *
 * Verifies real rendered component behavior with representative flat Spring Boot DTOs:
 * - Flat FlightDto (sourceCode, destinationCode, sourceCity, destinationCity, bookedSeats, availableSeats)
 * - Flat BookingDto (passengerId, passengerName, flightId, flightName, sourceCode, destinationCode, seatNumber)
 * - Flat PassengerDto (passengerId, passengerName, age, gender)
 * - Component HTML rendering via react-dom/server
 * - Offline / Error recovery state assertions
 */

import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';

// Components
import Header from '../src/components/Header.jsx';
import FlightDeck from '../src/components/FlightDeck/FlightDeck.jsx';
import FlightDetailsModal from '../src/components/FlightDeck/FlightDetailsModal.jsx';
import PassengerRegistry from '../src/components/Passengers/PassengerRegistry.jsx';
import PassengerDetailsModal from '../src/components/Passengers/PassengerDetailsModal.jsx';
import BookingTerminal from '../src/components/Bookings/BookingTerminal.jsx';
import BoardingPassModal from '../src/components/Bookings/BoardingPassModal.jsx';
import CreateBookingModal from '../src/components/Bookings/CreateBookingModal.jsx';
import PlaybackControls from '../src/components/shared/PlaybackControls.jsx';
import GraphCanvas from '../src/components/GraphStudio/GraphCanvas.jsx';
import GraphResults from '../src/components/GraphStudio/GraphResults.jsx';
import TreeCanvas from '../src/components/TreeStudio/TreeCanvas.jsx';
import SegmentTreeView from '../src/components/FareAnalytics/SegmentTreeView.jsx';
import FenwickTreeView from '../src/components/FareAnalytics/FenwickTreeView.jsx';
import SortingCanvas from '../src/components/SortingLab/SortingCanvas.jsx';
import BenchmarkView from '../src/components/SortingLab/BenchmarkView.jsx';

console.log('========================================================');
console.log('  AEROOPS STAGE 4 COMPONENT BEHAVIORAL TEST SUITE       ');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 0;

function it(desc, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${desc}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${desc}: ${err.message}`);
    throw err;
  }
}

const clean = (str) => str.replace(/<!--.*?-->/g, '');

// -----------------------------------------------------------------------------
// Real Flat Spring Boot DTO Fixtures
// -----------------------------------------------------------------------------
const mockAirports = [
  { airportCode: 'DEL', airportName: 'Indira Gandhi International', city: 'Delhi', state: 'Delhi' },
  { airportCode: 'BOM', airportName: 'Chhatrapati Shivaji International', city: 'Mumbai', state: 'Maharashtra' },
  { airportCode: 'BLR', airportName: 'Kempegowda International', city: 'Bengaluru', state: 'Karnataka' },
];

const mockFlights = [
  {
    flightId: 'AI-101',
    flightName: 'Air India Boeing 787-9',
    sourceCode: 'DEL',
    sourceCity: 'Delhi',
    destinationCode: 'BOM',
    destinationCity: 'Mumbai',
    fare: 5500.0,
    capacity: 180,
    bookedSeats: 2,
    availableSeats: 178,
    status: 'SCHEDULED',
    departureTime: '06:00',
    arrivalTime: '08:15',
  },
  {
    flightId: '6E-202',
    flightName: 'IndiGo Airbus A321',
    sourceCode: 'BOM',
    sourceCity: 'Mumbai',
    destinationCode: 'BLR',
    destinationCity: 'Bengaluru',
    fare: 3200.0,
    capacity: 186,
    bookedSeats: 1,
    availableSeats: 185,
    status: 'BOARDING',
    departureTime: '09:30',
    arrivalTime: '11:15',
  },
];

const mockPassengers = [
  { passengerId: 101, passengerName: 'Aarav Sharma', age: 29, gender: 'Male' },
  { passengerId: 102, passengerName: 'Diya Patel', age: 24, gender: 'Female' },
  { passengerId: 103, passengerName: 'Rohan Iyer', age: 35, gender: 'Male' },
];

const mockBookings = [
  {
    ticketId: 1001,
    bookingReference: 'AERO-AI101-1001',
    passengerId: 101,
    passengerName: 'Aarav Sharma',
    flightId: 'AI-101',
    flightName: 'Air India Boeing 787-9',
    sourceCode: 'DEL',
    sourceCity: 'Delhi',
    destinationCode: 'BOM',
    destinationCity: 'Mumbai',
    seatNumber: '1A',
    bookedAt: '2026-03-29T10:00:00Z',
    status: 'CONFIRMED',
    fare: 5500.0,
  },
  {
    ticketId: 1002,
    bookingReference: 'AERO-AI101-1002',
    passengerId: 102,
    passengerName: 'Diya Patel',
    flightId: 'AI-101',
    flightName: 'Air India Boeing 787-9',
    sourceCode: 'DEL',
    sourceCity: 'Delhi',
    destinationCode: 'BOM',
    destinationCity: 'Mumbai',
    seatNumber: '1B',
    bookedAt: '2026-03-29T10:05:00Z',
    status: 'CONFIRMED',
    fare: 5500.0,
  },
  {
    ticketId: 1003,
    bookingReference: 'AERO-6E202-1003',
    passengerId: 103,
    passengerName: 'Rohan Iyer',
    flightId: '6E-202',
    flightName: 'IndiGo Airbus A321',
    sourceCode: 'BOM',
    sourceCity: 'Mumbai',
    destinationCode: 'BLR',
    destinationCity: 'Bengaluru',
    seatNumber: '2F',
    bookedAt: '2026-03-29T10:15:00Z',
    status: 'CONFIRMED',
    fare: 3200.0,
  },
];

// -----------------------------------------------------------------------------
// 1. Header Behavioral Tests
// -----------------------------------------------------------------------------
console.log('--- 1. Header Component & Telemetry Status ---');

it('Header displays RADAR ACTIVE when backendConnected is true', () => {
  const html = renderToString(React.createElement(Header, { backendConnected: true }));
  assert.ok(html.includes('RADAR ACTIVE'), 'Should display RADAR ACTIVE');
  assert.ok(!html.includes('API OFFLINE'), 'Should not display API OFFLINE');
  assert.ok(html.includes('AEROOPS'), 'Should contain brand title');
});

it('Header displays API OFFLINE with alert indicator when backendConnected is false', () => {
  const html = renderToString(React.createElement(Header, { backendConnected: false }));
  assert.ok(html.includes('API OFFLINE'), 'Should display API OFFLINE');
  assert.ok(!html.includes('RADAR ACTIVE'), 'Should not display RADAR ACTIVE');
  assert.ok(html.includes('Offline'), 'Aria-label should reflect offline status');
});

// -----------------------------------------------------------------------------
// 2. FlightDeck Component Behavioral Tests (Flat FlightDto Contract)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Flight Deck with Flat FlightDto Responses ---');

it('FlightDeck renders flat DTO flight records, hubs, and live KPIs', () => {
  const html = clean(renderToString(React.createElement(FlightDeck, {
    flights: mockFlights,
    passengers: mockPassengers,
    bookings: mockBookings,
    airports: mockAirports,
    loading: false,
    error: null,
    onCreateFlight: () => {},
    onUpdateFare: () => {},
    onDeleteFlight: () => {},
    onRefresh: () => {},
  })));

  // Assert flight codes and carriers
  assert.ok(html.includes('AI-101'), 'Must render AI-101');
  assert.ok(html.includes('Air India Boeing 787-9'), 'Must render carrier description');
  assert.ok(html.includes('6E-202'), 'Must render 6E-202');
  assert.ok(html.includes('IndiGo Airbus A321'), 'Must render carrier description');

  // Assert flat origin/dest codes
  assert.ok(html.includes('>DEL<'), 'Must render DEL from sourceCode');
  assert.ok(html.includes('>BOM<'), 'Must render BOM from destinationCode');
  assert.ok(html.includes('>BLR<'), 'Must render BLR from destinationCode');

  // Assert occupancy from flat bookedSeats / capacity
  assert.ok(html.includes('2/180'), 'Must render 2/180 occupancy for AI-101');
  assert.ok(html.includes('1/186'), 'Must render 1/186 occupancy for 6E-202');

  // Assert live calculated KPIs
  assert.ok(html.includes('id="kpi-active-fleet">2<'), 'Active fleet count must be 2');
  assert.ok(html.includes('id="kpi-route-hubs">3<'), 'Unique route hubs must be 3 (DEL, BOM, BLR)');
  assert.ok(html.includes('id="kpi-total-passengers">3<'), 'Total passengers count must be 3');
  assert.ok(html.includes('₹4,350'), 'Average fare must be calculated correctly ((5500+3200)/2)');
});

it('FlightDeck renders error notice and retry trigger when API fails', () => {
  const errorMsg = 'Failed to fetch flight sectors: HTTP 500 Internal Error';
  const html = clean(renderToString(React.createElement(FlightDeck, {
    flights: [],
    passengers: [],
    bookings: [],
    airports: [],
    loading: false,
    error: errorMsg,
    onCreateFlight: () => {},
    onUpdateFare: () => {},
    onDeleteFlight: () => {},
    onRefresh: () => {},
  })));

  assert.ok(html.includes(errorMsg), 'Must display error message');
  assert.ok(html.includes('Retry API'), 'Must include Retry API button');
});

// -----------------------------------------------------------------------------
// 3. FlightDetailsModal Behavioral Tests (Manifest Telemetry)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Flight Details Modal & Booked Manifest ---');

it('FlightDetailsModal displays flat flight details and passenger manifest without undefined fallbacks', () => {
  const html = clean(renderToString(React.createElement(FlightDetailsModal, {
    isOpen: true,
    flight: mockFlights[0],
    bookings: mockBookings,
    onClose: () => {},
  })));

  assert.ok(html.includes('AI-101'), 'Must show flight ID');
  assert.ok(html.includes('DEL ➔ BOM'), 'Must show flat sector route');
  assert.ok(html.includes('₹5,500'), 'Must show base fare');
  assert.ok(html.includes('178 free'), 'Must show available seats');

  // Booked manifest rows (using b.passengerName and b.passengerId directly)
  assert.ok(html.includes('Aarav Sharma'), 'Must show passenger name from b.passengerName');
  assert.ok(html.includes('#101'), 'Must show passenger ID from b.passengerId');
  assert.ok(html.includes('1A'), 'Must show seat 1A');
  assert.ok(html.includes('Diya Patel'), 'Must show second passenger name');
  assert.ok(html.includes('#102'), 'Must show second passenger ID');
  assert.ok(html.includes('1B'), 'Must show seat 1B');

  // Zero occurrences of fallback 'Passenger' or 'undefined'
  assert.ok(!html.includes('<td>Passenger</td>'), 'Must not fall back to generic "Passenger"');
  assert.ok(!html.includes('undefined'), 'Must not contain literal "undefined"');
});

// -----------------------------------------------------------------------------
// 4. PassengerRegistry Component Behavioral Tests
// -----------------------------------------------------------------------------
console.log('\n--- 4. Passenger Registry & Active Bookings Count ---');

it('PassengerRegistry renders passenger records, demographics, and counts active bookings', () => {
  const html = clean(renderToString(React.createElement(PassengerRegistry, {
    passengers: mockPassengers,
    bookings: mockBookings,
    loading: false,
    error: null,
    onCreatePassenger: () => {},
    onUpdatePassenger: () => {},
    onDeletePassenger: () => {},
    onRefresh: () => {},
  })));

  assert.ok(html.includes('Aarav Sharma'), 'Must render Aarav Sharma');
  assert.ok(html.includes('Diya Patel'), 'Must render Diya Patel');
  assert.ok(html.includes('Rohan Iyer'), 'Must render Rohan Iyer');

  // Active bookings calculation (Aarav has 1 active booking: ticket 1001)
  assert.ok(html.includes('1 Active'), 'Must count active bookings for passenger');

  // Demographic KPIs
  assert.ok(html.includes('id="kpi-passenger-total">3<'), 'Total registered must be 3');
  assert.ok(html.includes('29 yrs'), 'Average age should be (29+24+35)/3 = 29.3 -> 29 yrs');
  assert.ok(html.includes('2M : 1F'), 'Gender ratio should be 2 Male, 1 Female');
});

// -----------------------------------------------------------------------------
// 5. PassengerDetailsModal Behavioral Tests
// -----------------------------------------------------------------------------
console.log('\n--- 5. Passenger Details Modal & History Manifest ---');

it('PassengerDetailsModal renders flat booking history for the specified passenger', () => {
  const html = clean(renderToString(React.createElement(PassengerDetailsModal, {
    isOpen: true,
    passenger: mockPassengers[0], // Aarav Sharma (#101)
    bookings: mockBookings,
    onClose: () => {},
  })));

  assert.ok(html.includes('Aarav Sharma'), 'Must show passenger name');
  assert.ok(html.includes('#101'), 'Must show passenger ID');
  assert.ok(html.includes('1 Reservations'), 'Must show reservation count');

  // Booking row
  assert.ok(html.includes('#1001'), 'Must show ticket #1001');
  assert.ok(html.includes('AI-101'), 'Must show flightId from b.flightId');
  assert.ok(html.includes('Air India Boeing 787-9'), 'Must show flightName from b.flightName');
  assert.ok(html.includes('DEL ➔ BOM'), 'Must show flat sector route from b.sourceCode and b.destinationCode');
  assert.ok(html.includes('1A'), 'Must show seatNumber from b.seatNumber');
  assert.ok(html.includes('₹5,500'), 'Must show fare from b.fare');
});

// -----------------------------------------------------------------------------
// 6. BookingTerminal Component Behavioral Tests
// -----------------------------------------------------------------------------
console.log('\n--- 6. Booking Terminal with Flat BookingDto Contract ---');

it('BookingTerminal renders flat booking records, ticketing KPIs, and status badges', () => {
  const html = clean(renderToString(React.createElement(BookingTerminal, {
    bookings: mockBookings,
    passengers: mockPassengers,
    flights: mockFlights,
    loading: false,
    error: null,
    onCreateBooking: () => {},
    onCancelBooking: () => {},
    onRefresh: () => {},
  })));

  // Tickets
  assert.ok(html.includes('#1001'), 'Must show ticket #1001');
  assert.ok(html.includes('Aarav Sharma'), 'Must show passengerName');
  assert.ok(html.includes('AI-101'), 'Must show flightId');
  assert.ok(html.includes('DEL ➔ BOM'), 'Must show route from sourceCode and destinationCode');
  assert.ok(html.includes('1A'), 'Must show seat 1A');
  assert.ok(html.includes('₹5,500'), 'Must show fare');

  // KPIs: 3 confirmed bookings, total revenue 5500 + 5500 + 3200 = 14200
  assert.ok(html.includes('id="kpi-booking-total">3<'), 'Confirmed tickets KPI must be 3');
  assert.ok(html.includes('₹14,200'), 'Gross revenue must be ₹14,200');
  assert.ok(html.includes('₹4,733'), 'Average ticket value must be ₹4,733');
});

// -----------------------------------------------------------------------------
// 7. BoardingPassModal Authoritative Fields Verification (Zero Fallbacks)
// -----------------------------------------------------------------------------
console.log('\n--- 7. Boarding Pass Modal Authoritative Attributes ---');

it('BoardingPassModal renders flat authoritative attributes without fictitious fallbacks', () => {
  const booking = mockBookings[0];
  const html = clean(renderToString(React.createElement(BoardingPassModal, {
    isOpen: true,
    booking,
    onClose: () => {},
  })));

  // Authoritative fields
  assert.ok(html.includes('#1001'), 'Ticket ID must match exactly');
  assert.ok(html.includes('id="pass-source">DEL<'), 'Source hub must be DEL from booking.sourceCode');
  assert.ok(html.includes('id="pass-dest">BOM<'), 'Dest hub must be BOM from booking.destinationCode');
  assert.ok(html.includes('id="pass-passenger-name">Aarav Sharma<'), 'Passenger name must be Aarav Sharma');
  assert.ok(html.includes('id="pass-flight-id">AI-101<'), 'Flight ID must be AI-101');
  assert.ok(html.includes('id="pass-seat">1A<'), 'Seat must be 1A');
  assert.ok(html.includes('id="pass-carrier-name">Air India Boeing 787-9<'), 'Carrier airframe must match flightName');
  assert.ok(html.includes('₹5,500'), 'Fare must match booking.fare');
  assert.ok(html.includes('AERO-AI101-1001'), 'Booking reference must match booking.bookingReference');

  // Test with another flight sector to ensure no hardcoded DEL/BOM fallback
  const blrBooking = mockBookings[2]; // BOM to BLR, 6E-202
  const html2 = clean(renderToString(React.createElement(BoardingPassModal, {
    isOpen: true,
    booking: blrBooking,
    onClose: () => {},
  })));

  assert.ok(html2.includes('id="pass-source">BOM<'), 'Source must be BOM');
  assert.ok(html2.includes('id="pass-dest">BLR<'), 'Dest must be BLR');
  assert.ok(html2.includes('id="pass-flight-id">6E-202<'), 'Flight ID must be 6E-202');
  assert.ok(html2.includes('id="pass-seat">2F<'), 'Seat must be 2F');
  assert.ok(html2.includes('AERO-6E202-1003'), 'Reference must match');
});

// -----------------------------------------------------------------------------
// 8. CreateBookingModal Sector Formatting
// -----------------------------------------------------------------------------
console.log('\n--- 8. Create Booking Modal Sector Selection ---');

it('CreateBookingModal formats active flight choices with flat sourceCode and destinationCode', () => {
  const html = clean(renderToString(React.createElement(CreateBookingModal, {
    isOpen: true,
    passengers: mockPassengers,
    flights: mockFlights,
    onClose: () => {},
    onSubmit: () => {},
  })));

  assert.ok(html.includes('AI-101 • DEL ➔ BOM • ₹5,500 (Air India Boeing 787-9)'),
    'Flight select option must format flat sector and carrier properly');
  assert.ok(html.includes('6E-202 • BOM ➔ BLR • ₹3,200 (IndiGo Airbus A321)'),
    'Flight select option must format second sector properly');
});

// -----------------------------------------------------------------------------
// 9. Stage 5 Interactive DSA Visualizer Behavioral Tests
// -----------------------------------------------------------------------------
console.log('\n--- 9. Stage 5 DSA Visualizers & Playback Engine ---');

it('PlaybackControls renders step counter, speed slider, and step explanation', () => {
  const html = clean(renderToString(React.createElement(PlaybackControls, {
    playback: {
      stepIndex: 1,
      totalSteps: 4,
      currentStep: { action: 'relax_edge', description: 'Relaxed DEL -> BLR to 1740 km.' },
      isPlaying: false,
      isComplete: false,
      speedMs: 550,
      setSpeedMs: () => {},
      togglePlay: () => {},
      stepForward: () => {},
      stepBack: () => {},
      reset: () => {},
      jumpToEnd: () => {},
    },
    title: 'Dijkstra Trace',
  })));

  assert.ok(html.includes('Step 2 / 4'), 'Must show 1-based step counter');
  assert.ok(html.includes('Relaxed DEL') && html.includes('1740 km.'), 'Must show current step explanation');
  assert.ok(html.includes('550ms'), 'Must show speed setting');
});

it('GraphCanvas and GraphResults render airport hubs, corridors, and Dijkstra shortest path', () => {
  const nodes = [
    { id: 'DEL', name: 'Indira Gandhi', city: 'Delhi', x: 340, y: 120, state: 'Delhi' },
    { id: 'BLR', name: 'Kempegowda', city: 'Bengaluru', x: 380, y: 440, state: 'Karnataka' },
  ];
  const edges = [{ id: 'DEL-BLR', source: 'DEL', destination: 'BLR', weight: 1740 }];

  const canvasHtml = clean(renderToString(React.createElement(GraphCanvas, {
    nodes,
    edges,
    startNode: 'DEL',
    targetNode: 'BLR',
    currentStep: { currentNode: 'BLR', visitedNodes: ['DEL', 'BLR'], highlightedEdges: ['DEL-BLR'] },
    finalPath: ['DEL', 'BLR'],
    isComplete: true,
  })));

  assert.ok(canvasHtml.includes('DEL'), 'Must render DEL node');
  assert.ok(canvasHtml.includes('BLR'), 'Must render BLR node');
  assert.ok(canvasHtml.includes('1740 km'), 'Must render edge weight badge');

  const resHtml = clean(renderToString(React.createElement(GraphResults, {
    algorithm: 'dijkstra',
    result: {
      algorithm: 'Dijkstra',
      startNode: 'DEL',
      targetNode: 'BLR',
      reachable: true,
      totalDistance: 1740,
      path: ['DEL', 'BLR'],
    },
    currentStep: { distances: { DEL: 0, BLR: 1740 } },
  })));

  assert.ok(resHtml.includes('1,740 km'), 'Must render optimal distance');
  assert.ok(resHtml.includes('DEL ➔ BLR'), 'Must render path header');
});

it('TreeCanvas renders AVL binary nodes with balance factor and B+ Tree leaf chain', () => {
  const avlRoot = {
    key: 102, height: 2, balanceFactor: 0,
    left: { key: 101, height: 1, balanceFactor: 0, left: null, right: null, isLeaf: true },
    right: { key: 103, height: 1, balanceFactor: 0, left: null, right: null, isLeaf: true },
    isLeaf: false,
  };
  const avlHtml = clean(renderToString(React.createElement(TreeCanvas, {
    treeType: 'avl',
    root: avlRoot,
    currentStep: { highlightedKeys: [102] },
    searchPath: [102],
    found: true,
  })));

  assert.ok(avlHtml.includes('102'), 'Must render root key 102');
  assert.ok(avlHtml.includes('BF:0'), 'Must render AVL balance factor');

  const bplusRoot = {
    keys: [30],
    isLeaf: false,
    children: [
      { keys: [10, 20], isLeaf: true, children: [], nextLeafKey: 30 },
      { keys: [30, 40], isLeaf: true, children: [], nextLeafKey: null },
    ],
  };
  const bplusHtml = clean(renderToString(React.createElement(TreeCanvas, {
    treeType: 'bplus',
    root: bplusRoot,
    matchedKeys: [20, 30],
  })));

  assert.ok(bplusHtml.includes('tree-leaf-arrow'), 'B+ Tree must render sequential leaf pointer arrows');
  assert.ok(bplusHtml.includes('40'), 'Must render B+ Tree leaf keys');
});

it('SegmentTreeView and FenwickTreeView render RMQ intervals and BIT binary indices', () => {
  const segHtml = clean(renderToString(React.createElement(SegmentTreeView, {
    result: { arraySize: 2, treeArray: [3000, 5000, 3000, 0, 0, 0, 0, 0] },
    steps: [{ nodeIndex: 0, overlapState: 'PARTIAL_OVERLAP' }],
    stepIndex: 0,
  })));
  assert.ok(segHtml.includes('[0..1]'), 'Must render root segment interval');
  assert.ok(segHtml.includes('₹3,000'), 'Must render segment min fare');

  const bitHtml = clean(renderToString(React.createElement(FenwickTreeView, {
    result: {
      currentFares: [100, 200],
      treeArray: [0, 100, 300],
      queryLeft: 0,
      queryRight: 1,
    },
    steps: [{ nodeIndex: 2 }],
    stepIndex: 0,
  })));
  assert.ok(bitHtml.includes('BIT[1]'), 'Must render 1-based BIT index 1');
  assert.ok(bitHtml.includes('0010'), 'Must render binary representation for BIT[2]');
});

it('SortingCanvas and BenchmarkView render animated fare bars and 3-way JVM metrics', () => {
  const sortHtml = clean(renderToString(React.createElement(SortingCanvas, {
    result: { originalArray: [5200, 3200], sortedArray: [3200, 5200] },
    currentStep: { action: 'lomuto_partition', index1: 0, index2: 1, currentArray: [3200, 5200] },
    isComplete: false,
  })));
  assert.ok(sortHtml.includes('sorting-bar--pivot'), 'Must highlight pivot bar');
  assert.ok(sortHtml.includes('₹3200'), 'Must render fare bar value');

  const benchHtml = clean(renderToString(React.createElement(BenchmarkView, {
    benchmark: {
      datasetSize: 500,
      distribution: 'random',
      winner: 'Quick Sort',
      metrics: {
        'Merge Sort': { timeFormatted: '18.40 µs', comparisons: 3500, swapsOrMoves: 4400 },
        'Quick Sort': { timeFormatted: '11.20 µs', comparisons: 3100, swapsOrMoves: 1600 },
        'Heap Sort': { timeFormatted: '22.10 µs', comparisons: 5200, swapsOrMoves: 2900 },
      },
    },
  })));
  assert.ok(benchHtml.includes('Fastest: Quick Sort'), 'Must display benchmark winner');
  assert.ok(benchHtml.includes('11.20 µs'), 'Must display formatted JVM runtime');
});

console.log('\n========================================================');
console.log(`BEHAVIORAL TEST RESULTS: ${passedTests}/${totalTests} PASSED (100% Success)`);
console.log('========================================================\n');
