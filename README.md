# AEROOPS — Airline Reservation & Flight Network Suite

[![DSA Project](https://img.shields.io/badge/Algorithms-16%20Java%20DSA-F2A65A.svg)](#implemented-algorithms--data-structures)
[![Source Java Preserved](https://img.shields.io/badge/Java%20Source-23%20Files%20Preserved-10B981.svg)](#original-java-source--attribution)
[![Test Coverage](https://img.shields.io/badge/Automated%20Tests-394%20Passed%20(100%25)-34D399.svg)](#automated-testing--qa-verification)
[![Visual Theme](https://img.shields.io/badge/Theme-Twilight%20Runway-A995C7.svg)](#project-overview)
[![Architecture](https://img.shields.io/badge/Stack-React%2018%20%2B%20Spring%20Boot%203.3.5%20%2B%20PostgreSQL-F2A65A.svg)](#system-architecture)

**AEROOPS** is a full-stack airline reservation console and interactive Java 21 Data Structures & Algorithms (DSA) visualization laboratory. It modernizes an academic Java DSA Airline Reservation System into a production React 18 + Spring Boot + PostgreSQL application featuring real server-side Java algorithm execution, persistent operational workflows, and animated SVG/chart visualizers.

### Live Production Deployment
* **Frontend (Vercel Hobby):** [`https://aeroops-one.vercel.app`](https://aeroops-one.vercel.app)
* **Backend API (Render Free):** [`https://aeroops-backend.onrender.com`](https://aeroops-backend.onrender.com)
* **Health Endpoint:** [`https://aeroops-backend.onrender.com/api/v1/health`](https://aeroops-backend.onrender.com/api/v1/health)
* **Database:** Neon PostgreSQL 18 (Free Plan, AWS Singapore) with Flyway migrations

> **Free-Tier Cold-Start Notice:** The backend runs on Render's Free tier and suspends after inactivity. Initial requests after sleep may take **30–50 seconds** while the JVM wakes; the frontend displays a waking status banner and automatically retries transient cold-start responses.
> **Educational Portfolio Notice:** AEROOPS is a public educational demonstration using synthetic flight and passenger data. Do not enter real personal or payment information.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Original Java Source & Attribution](#original-java-source--attribution)
3. [Key Modules & Capabilities](#key-modules--capabilities)
4. [Implemented Algorithms & Data Structures](#implemented-algorithms--data-structures)
5. [Architectural Parity & Educational Enhancements](#architectural-parity--educational-enhancements)
6. [System Architecture](#system-architecture)
7. [Running AEROOPS Locally](#running-aeroops-locally)
8. [Data Persistence & Reset](#data-persistence--reset)
9. [Automated Testing & QA Verification](#automated-testing--qa-verification)
10. [Production Stack & Local Development](#production-stack--local-development)
11. [Known Limitations](#known-limitations)

---

## Project Overview

AEROOPS models real-world airline management workflows while serving as an educational laboratory for core algorithmic concepts. Built with an evocative **Twilight Runway** visual theme (Deep Charcoal-Plum `#14121A`, Runway Amber `#F2A65A`, Muted Coral `#E47B65`, Soft Lilac `#A995C7`, Warm Ivory `#F6F0E7`), the suite provides 100% distinct aesthetic separation from portfolio foundation designs while integrating five distinct operational domains:

* **Flight Deck:** Fleet schedule management, multi-criteria filtering, search, and dynamic fare adjustments.
* **Passenger Registry & Bookings:** Passenger profiles, ticket issuance with validation, printable thermal boarding pass generation, and cancellation.
* **National Route Network:** Interactive SVG network topology spanning 10 commercial Indian airport hubs with 7 graph optimization algorithms.
* **Tree Indexing Studio:** Hierarchical database indexing comparison across Binary Search Tree (BST), Self-Balancing AVL Tree, B-Tree ($t=3$), and B+ Tree ($t=3$).
* **Fare Analytics & Comparative Sorting:** Dynamic Range Minimum Query (RMQ) via Segment Tree, Range Sum Query (RSQ) via Fenwick Tree (BIT), and head-to-head sorting benchmarks (Merge Sort, Quick Sort, Heap Sort).

---

## Original Java Source & Attribution

* **Original Repository:** [`https://github.com/mokshithmiryalamk/DSA-2-Project-Airline-Reservation-System`](https://github.com/mokshithmiryalamk/DSA-2-Project-Airline-Reservation-System)
* **Pinned Reference Commit:** `cc755ec`
* **Source Preservation:** All **23 Java files match the original source after line-ending normalization** (CRLF to LF) against reference commit `cc755ec`:

| Package | Files | Core Purpose in Original Java Project |
| :--- | :--- | :--- |
| `main` | `AirlineReservationSystem.java` | Console entry point and menu-driven driver |
| `model` | `Airport.java`, `Flight.java`, `Passenger.java`, `Ticket.java` | Plain Old Java Objects (POJOs) modeling entities |
| `service` | `FlightService.java`, `PassengerService.java`, `BookingService.java` | Business logic, flight schedules, bookings, and fare manipulation |
| `graphs` | `GraphAlgorithms.java` | Core route network graph, traversals, shortest paths, MSTs, all-pairs |
| `tree` | `BST.java`, `BSTNode.java`, `AVLTree.java`, `AVLNode.java`, `BTree.java`, `BTreeNode.java`, `BPlusTree.java`, `BPlusTreeNode.java`, `SegmentTree.java`, `FenwickTree.java` | Database indexing, range query algorithms |
| `sorting` | `MergeSort.java`, `QuickSort.java`, `HeapSort.java` | Ascending fare sorting algorithms |
| *Root* | `module-info.java` | Java module declaration |

> **Full-Stack Architecture Note:** The React 18 frontend (`frontend/`) calls the live Java 21 Spring Boot REST API (`backend/`) for both operational CRUD persistence (PostgreSQL via Spring Data JPA & Flyway) and real server-side execution of all 16 DSA algorithms/data structures. All 23 original academic Java files in `src/` and the original vanilla HTML/CSS/JS showcase (`index.html`, `js/`, `css/`) are preserved unchanged.

---

## Key Modules & Capabilities

### 1. Flight Deck (`#view-flight-deck`)
* **Fleet Management:** Live flight status display (`On Time`, `Boarding`, `In Flight`, `Scheduled`, `Delayed`).
* **Instant Filtering & Searching:** Real-time query parsing across Flight ID, Airline Name, Origin, and Destination.
* **Fare Adjustment:** Point-and-click fare updates with input validation ($> 0$).
* **Safe Deletions:** Referential integrity guards prevent deleting airframes with active passenger tickets.

### 2. Passengers & Bookings (`#view-passengers`)
* **Passenger Registry:** Passenger manifests with age validation (1–120) and gender identification.
* **Ticket Issuance:** Issues sequential tickets linked to valid passenger and flight records.
* **Boarding Pass Modal:** Visual thermal boarding pass generation featuring simulated barcode, gate information, and seat allocation.
* **Cancellation Flow:** Ticket cancellation restores passenger booking capacity.

### 3. Route Network Studio (`#view-routes`)
* **Hub Topology:** SVG map spanning 10 commercial hubs (DEL, BOM, BLR, HYD, CCU, MAA, GOI, PNQ, AMD, COK).
* **Step-by-Step Algorithm Playback:** Interactive execution controls (Play, Pause, Step, Reset, Speed Slider).
* **Matrix Inspector:** All-pairs Floyd-Warshall distance matrix with cell-hover route highlighting.
* **Topology Disclaimer:** Demonstration corridor weights (km) represent published inter-city route distances for algorithmic optimization and do not reflect dynamic live air traffic control data.

### 4. Tree Indexing Studio (`#view-tree-index`)
* **Live Dynamic Canvas:** Interactive SVG tree layout with smooth node repositioning.
* **Four Indexing Engines:**
  * **BST:** Unbalanced binary search tree with left < root < right invariant.
  * **AVL Tree:** Strict height-balancing with automatic LL (Right), RR (Left), LR, and RL double rotations.
  * **B-Tree ($t=3$):** Multiway disk index splitting full nodes (5 keys) into 2-key children while promoting medians.
  * **B+ Tree ($t=3$):** Enterprise database storage model with internal routing nodes, replicated leaf data, and linked sequential leaf pointers (`leaf.next`).
* **Traversals:** In-order, Pre-order, Post-order, Level-order, and Horizontal Sequential Leaf Scan (`Sequential Leaves ➔`).
* **Passenger Manifest Sync:** One-click indexing of live passenger IDs from Stage 2 registry.

### 5. Fare Analytics & Comparative Sorting (`#view-fare-analytics`)
* **Segment Tree RMQ:** Binary interval tree computing Range Minimum Queries $[L..R]$ in $O(\log N)$ time with node pruning visualization (total overlap, partial overlap, disjoint).
* **Fenwick Tree (BIT) RSQ:** Binary Indexed Tree computing prefix and interval sums using lowest set bit (LSB) operations: `idx -= idx & (-idx)`.
* **Sorting Comparison Lab:**
  * **Merge Sort:** Divide-and-conquer merge algorithm; verified **Stable** on duplicate keys.
  * **Quick Sort:** Lomuto partition strictly selecting $fares[high]$ as pivot; $O(N \log N)$ average, $O(N^2)$ worst-case.
  * **Heap Sort:** Binary max-heap build ($O(N)$) and ascending root extraction ($O(N \log N)$) with $O(1)$ space.
* **Comparative Head-to-Head Race:** Benchmarks all three algorithms simultaneously, recording comparisons, swaps/writes, runtime in milliseconds, and verifying monotonic sorted order.

---

## Implemented Algorithms & Data Structures

| Category | Algorithm / Structure | Time Complexity (Avg) | Worst Case | Space Complexity | Stability / Invariant |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Graph** | Breadth-First Search (BFS) | $O(V + E)$ | $O(V + E)$ | $O(V)$ | Level-order queue |
| **Graph** | Depth-First Search (DFS) | $O(V + E)$ | $O(V + E)$ | $O(V)$ | Recursive stack |
| **Graph** | Dijkstra's Shortest Path | $O((V + E) \log V)$ | $O((V + E) \log V)$ | $O(V)$ | Min-Priority Queue |
| **Graph** | Bellman-Ford Pathfinding | $O(V \cdot E)$ | $O(V \cdot E)$ | $O(V)$ | Negative cycle detection |
| **Graph** | Prim's Minimum Spanning Tree | $O(E \log V)$ | $O(E \log V)$ | $O(V + E)$ | Greedy vertex cut |
| **Graph** | Kruskal's Minimum Spanning Tree | $O(E \log E)$ | $O(E \log E)$ | $O(V + E)$ | Disjoint-Set Union (DSU) |
| **Graph** | Floyd-Warshall All-Pairs | $O(V^3)$ | $O(V^3)$ | $O(V^2)$ | Dynamic Programming Matrix |
| **Trees** | Binary Search Tree (BST) | $O(\log N)$ | $O(N)$ | $O(N)$ | Left < Root < Right |
| **Trees** | AVL Self-Balancing Tree | $O(\log N)$ | $O(\log N)$ | $O(N)$ | Strict Balance Factor $\|BF\| \le 1$ |
| **Trees** | B-Tree ($t = 3$) | $O(\log_t N)$ | $O(t \log_t N)$ | $O(N)$ | Nodes hold $[t-1..2t-1]$ keys |
| **Trees** | B+ Tree ($t = 3$) | $O(\log_t N)$ | $O(t \log_t N)$ | $O(N)$ | Horizontal leaf links (`next`) |
| **Range** | Segment Tree (RMQ) | $O(\log N)$ | $O(\log N)$ | $O(4N)$ | Binary interval segmentation |
| **Range** | Fenwick Tree / BIT (RSQ) | $O(\log N)$ | $O(\log N)$ | $O(N)$ | Binary LSB decomposition |
| **Sorting** | Merge Sort | $O(N \log N)$ | $O(N \log N)$ | $O(N)$ | **Stable** divide-and-conquer |
| **Sorting** | Quick Sort (Lomuto) | $O(N \log N)$ | $O(N^2)$ | $O(\log N)$ | Unstable, pivot = $fares[high]$ |
| **Sorting** | Heap Sort | $O(N \log N)$ | $O(N \log N)$ | $O(1)$ | Unstable in-place max-heap |

---

## Architectural Parity & Educational Enhancements

AEROOPS maintains transparent honesty regarding the relationship between the original Java console source and this visual frontend:

1. **B+ Tree Splitting & Routing:**
   * *Original Java (`BPlusTree.java`):* Contained a simplified `insertSimple()` that stored keys inside a single root node without splitting.
   * *Frontend Enhancement:* Implemented full B+ Tree degree $t=3$ multiway splitting, internal index router nodes, and sequential horizontal leaf pointers (`current.next`) to demonstrate how production databases (e.g. InnoDB, Postgres) execute range scans.
2. **Quick Sort Pivot Selection:**
   * *Java Parity:* Strictly preserves the original Java `QuickSort.java` Lomuto partition logic where the pivot is ALWAYS the last element (`fares[high]`). Worst-case $O(N^2)$ behavior is demonstrated when running against reverse-sorted arrays.
3. **Merge Sort Stability:**
   * *Java Parity:* Preserves the `<=` comparison predicate from `MergeSort.java`. Tested and verified to preserve the relative order of flights with identical fares.
4. **Data Isolation Invariant:**
   * The sorting visualizer operates exclusively on deep clones of flight records. Visualizing sorting steps never mutates the underlying flight database order.

---

## System Architecture

```
Airplane_Management_System/
├── assets/                  # Icons, badges, and static imagery
├── css/
│   ├── design-tokens.css    # Colors, fonts, radius, and elevation tokens
│   └── main.css             # Component styles, cockpit layouts, animations
├── js/
│   ├── airline-data.js      # Relational DataStore with LocalStorage persistence
│   ├── flight-manager.js    # Flight Deck controller & CRUD
│   ├── passenger-manager.js # Passenger Registry controller
│   ├── booking-manager.js   # Ticket Booking & Boarding Pass modal
│   ├── app.js               # Navigation router, ARIA keyboard handler, UTC clock
│   ├── ui/
│   │   ├── modal.js         # Accessible modal dialog controller
│   │   └── toast.js         # Non-blocking notification toasts
│   ├── graph/
│   │   ├── graph-data.js    # Airport hub vertices and route corridor edges
│   │   ├── graph-algorithms.js # 7 Graph algorithm implementations
│   │   ├── graph-visualizer.js # Dynamic SVG network visualizer
│   │   └── graph-manager.js    # Graph UI controller and step playback
│   ├── trees/
│   │   ├── tree-data.js     # Tree seed datasets & passenger ID extractor
│   │   ├── bst.js           # Binary Search Tree implementation
│   │   ├── avl-tree.js      # AVL Tree with LL, RR, LR, RL rotations
│   │   ├── b-tree.js        # B-Tree (t = 3) multiway split implementation
│   │   ├── b-plus-tree.js   # B+ Tree with linked leaves
│   │   ├── tree-visualizer.js # Dynamic SVG tree renderer
│   │   └── tree-manager.js    # Tree UI controller & traversals
│   └── analytics/
│       ├── fare-data.js     # Deterministic fare test distributions
│       ├── segment-tree.js  # 4N Segment Tree RMQ implementation
│       ├── fenwick-tree.js  # 1-based Fenwick Tree (BIT) RSQ implementation
│       ├── sorting-algorithms.js # MergeSort, QuickSort, HeapSort & Benchmark
│       ├── analytics-visualizer.js # Segment SVG, Fenwick BIT & Bar Chart
│       └── analytics-manager.js    # Analytics sub-mode controller
├── src/                     # 23 PRESERVED ORIGINAL JAVA SOURCE FILES (matches cc755ec after LF normalization)
├── index.html               # Semantic HTML5 single-page application
├── README.md                # Project documentation
└── ARCHITECTURE.md          # Architectural dependency map
```

---

## Running AEROOPS Locally

Run the full-stack application locally using **H2** (PostgreSQL compatibility mode) and **Vite**:

### 1. Backend (Spring Boot 3.3.5 + Java 21)
```bash
cd backend
mvn spring-boot:run
```
Starts the REST API on `http://localhost:8080` with Flyway migrations (`V1` schema + `V2` seed data) and H2 console at `/h2-console`.

### 2. Frontend (React 18 + Vite)
```bash
cd frontend
npm install
npm run dev
```
Starts the Vite dev server on `http://localhost:5173` with `/api` proxied to `http://localhost:8080`.

*(Legacy Note: The original static vanilla HTML/CSS/JS showcase in `index.html`, `css/`, and `js/` is also preserved at the repository root for academic reference.)*

---

## Data Persistence & Reset

* **Production Database:** **Neon PostgreSQL 18** (Free Plan, AWS Singapore), managed via Spring Data JPA (`ddl-auto: validate`) and Flyway migrations.
* **Local Development Database:** In-memory **H2** (`MODE=PostgreSQL`) seeded automatically on startup.
* **Audit Integrity:** Historical cancelled bookings remain persisted for auditability; flights or passengers with booking history cannot be deleted (`409 Conflict`).

---

## Automated Testing & QA Verification

AEROOPS is verified across three automated test layers:

```bash
# 1. React Frontend Unit & SSR Behavioral Tests (62 checks) + Production Build
cd frontend && npm test && npm run build

# 2. Spring Boot Operational & DSA Integration Tests (20 tests)
cd backend && mvn test

# 3. Original Academic Preservation & Legacy Regression Suites (312 checks)
node scratch/verify_stage1.js
node scratch/test_stage2.js
node scratch/test_stage3.js
node scratch/test_stage4.js
node scratch/test_stage5.js
node scratch/test_stage6.js
```

### Cumulative Test Results:
* **React Frontend Unit & Behavioral Suite:** **62 / 62 Passed** (47 unit + 15 SSR behavioral)
* **Spring Boot Backend Suite:** **20 / 20 Passed** (9 operational/concurrency + 11 DSA integration)
* **Legacy Regression & Preservation Suite:** **312 / 312 Passed** (including SHA-256 & Git-Blob SHA-1 verification of all 23 original Java files against `cc755ec`)
* **Total Automated Checks:** **394 / 394 Passed (100% Success Rate)**

---

## Production Stack & Local Development

* **Frontend:** React 18 + Vite (`frontend/`) deployed on **Vercel Hobby** (`npm run build` -> `dist`)
* **Backend:** Java 21 + Spring Boot 3.3.5 + Spring Data JPA + Flyway (`backend/`) containerized with Docker on **Render Free**
* **Database:** **Neon PostgreSQL 18** (Free Plan, AWS Singapore) in production; **H2** (`MODE=PostgreSQL`) for local `dev` profile

### Running Locally
```bash
# 1. Start Spring Boot backend (H2 dev profile on port 8080)
cd backend
mvn spring-boot:run

# 2. Start React + Vite frontend (port 5173, proxies /api -> localhost:8080)
cd ../frontend
npm install
npm run dev
```

---

## Known Limitations

1. **Free-Tier Cold Starts:** Render Free instances sleep after inactivity (~30–50s wake time on first request).
2. **Educational Sandbox Scope:** Uses synthetic seed data with no user authentication, role-based access, or payment processing.
3. **Graph Topology vs Commercial Flights:** Default hub coordinates represent fixed demonstration waypoints across 10 Indian airports; live flight fares can optionally sync into corridor weights without altering geographic node coordinates.

---

## Author & Attribution
* **Developer:** Mokshith Miryala
* **Original Academic Repository:** `https://github.com/mokshithmiryalamk/DSA-2-Project-Airline-Reservation-System`
* **License:** MIT License
