/**
 * AEROOPS: Graph Algorithm Engine (Stage 3)
 *
 * Implements faithful equivalents of `graphs.GraphAlgorithms.java`:
 * 1. Breadth-First Search (BFS)
 * 2. Depth-First Search (DFS)
 * 3. Dijkstra's Shortest Path Algorithm
 * 4. Bellman-Ford Shortest Path Algorithm (with negative cycle detection)
 * 5. Prim's Minimum Spanning Tree (MST)
 * 6. Kruskal's Minimum Spanning Tree (MST with DSU / Union-Find)
 * 7. Floyd-Warshall All-Pairs Shortest Paths
 *
 * Each algorithm generates:
 * - Direct solution output (distances, optimal path, MST edges, total weight)
 * - Fine-grained execution step trace for interactive step-by-step playback.
 */

(function (window) {
  'use strict';

  // Helper Priority Queue for Dijkstra and Prim's
  class MinPriorityQueue {
    constructor() {
      this.elements = [];
    }
    enqueue(item, priority) {
      this.elements.push({ item, priority });
      this.elements.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
      return this.elements.shift()?.item;
    }
    isEmpty() {
      return this.elements.length === 0;
    }
  }

  // Disjoint Set Union (DSU) with path compression for Kruskal
  class UnionFind {
    constructor(elements) {
      this.parent = new Map();
      elements.forEach(el => this.parent.set(el, el));
    }
    find(i) {
      if (this.parent.get(i) === i) return i;
      const root = this.find(this.parent.get(i));
      this.parent.set(i, root);
      return root;
    }
    union(i, j) {
      const rootI = this.find(i);
      const rootJ = this.find(j);
      if (rootI !== rootJ) {
        this.parent.set(rootI, rootJ);
        return true;
      }
      return false;
    }
  }

  const GraphAlgorithms = {

    /**
     * Breadth-First Search (BFS) Traversal
     * Corresponds to GraphAlgorithms.bfs(String start)
     */
    bfs: function (graph, startId) {
      const start = String(startId).trim().toUpperCase();
      if (!graph.getNode(start)) {
        throw new Error(`Start airport node "${start}" not found in route network.`);
      }

      const steps = [];
      const visited = new Set();
      const queue = [start];
      visited.add(start);
      const traversalOrder = [];

      steps.push({
        stepNumber: steps.length + 1,
        type: 'start',
        activeNode: start,
        visitedNodes: [start],
        selectedEdges: [],
        queue: [...queue],
        logMessage: `Initialized BFS traversal starting at hub ${start}.`
      });

      while (queue.length > 0) {
        const curr = queue.shift();
        traversalOrder.push(curr);

        steps.push({
          stepNumber: steps.length + 1,
          type: 'dequeue_node',
          activeNode: curr,
          visitedNodes: Array.from(visited),
          selectedEdges: [],
          queue: [...queue],
          logMessage: `Dequeued hub ${curr} for neighbor corridor exploration.`
        });

        const neighbors = graph.getNeighbors(curr);
        for (const edge of neighbors) {
          const neighborId = edge.destination;
          const isNew = !visited.has(neighborId);

          if (isNew) {
            visited.add(neighborId);
            queue.push(neighborId);
            steps.push({
              stepNumber: steps.length + 1,
              type: 'visit_neighbor',
              activeNode: neighborId,
              activeEdge: { source: curr, destination: neighborId, weight: edge.weight },
              visitedNodes: Array.from(visited),
              selectedEdges: [],
              queue: [...queue],
              logMessage: `Discovered unvisited corridor: ${curr} ➔ ${neighborId} (${edge.weight} km). Enqueued ${neighborId}.`
            });
          }
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        type: 'complete',
        activeNode: null,
        visitedNodes: Array.from(visited),
        selectedEdges: [],
        logMessage: `BFS Traversal finished. Reached ${visited.size} total airport hubs.`
      });

      return {
        algorithm: 'Breadth-First Search (BFS)',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        startNode: start,
        traversalOrder: traversalOrder,
        visitedCount: visited.size,
        steps: steps
      };
    },

    /**
     * Depth-First Search (DFS) Traversal
     * Corresponds to GraphAlgorithms.dfs(String start)
     */
    dfs: function (graph, startId) {
      const start = String(startId).trim().toUpperCase();
      if (!graph.getNode(start)) {
        throw new Error(`Start airport node "${start}" not found in route network.`);
      }

      const steps = [];
      const visited = new Set();
      const traversalOrder = [];

      steps.push({
        stepNumber: steps.length + 1,
        type: 'start',
        activeNode: start,
        visitedNodes: [],
        selectedEdges: [],
        logMessage: `Initiated recursive DFS traversal from hub ${start}.`
      });

      function dfsHelper(curr) {
        visited.add(curr);
        traversalOrder.push(curr);

        steps.push({
          stepNumber: steps.length + 1,
          type: 'visit_node',
          activeNode: curr,
          visitedNodes: Array.from(visited),
          selectedEdges: [],
          logMessage: `Deep-traversed to airport hub ${curr}.`
        });

        const neighbors = graph.getNeighbors(curr);
        for (const edge of neighbors) {
          if (!visited.has(edge.destination)) {
            steps.push({
              stepNumber: steps.length + 1,
              type: 'explore_corridor',
              activeNode: edge.destination,
              activeEdge: { source: curr, destination: edge.destination, weight: edge.weight },
              visitedNodes: Array.from(visited),
              selectedEdges: [],
              logMessage: `Exploring corridor from ${curr} ➔ ${edge.destination} (${edge.weight} km).`
            });
            dfsHelper(edge.destination);
          }
        }
      }

      dfsHelper(start);

      steps.push({
        stepNumber: steps.length + 1,
        type: 'complete',
        activeNode: null,
        visitedNodes: Array.from(visited),
        selectedEdges: [],
        logMessage: `DFS Traversal complete. Explored branch of ${visited.size} hubs.`
      });

      return {
        algorithm: 'Depth-First Search (DFS)',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
        startNode: start,
        traversalOrder: traversalOrder,
        visitedCount: visited.size,
        steps: steps
      };
    },

    /**
     * Dijkstra's Single-Source Shortest Path
     * Corresponds to GraphAlgorithms.dijkstra(String start)
     */
    dijkstra: function (graph, startId, targetId = null) {
      const start = String(startId).trim().toUpperCase();
      const target = targetId ? String(targetId).trim().toUpperCase() : null;

      if (!graph.getNode(start)) {
        throw new Error(`Origin hub "${start}" not found in network.`);
      }

      const steps = [];
      const distances = {};
      const previous = {};
      const visited = new Set();

      graph.getNodes().forEach(n => {
        distances[n.id] = Infinity;
        previous[n.id] = null;
      });
      distances[start] = 0;

      const pq = new MinPriorityQueue();
      pq.enqueue({ city: start, from: null }, 0);

      steps.push({
        stepNumber: steps.length + 1,
        type: 'init',
        activeNode: start,
        distances: { ...distances },
        visitedNodes: [],
        selectedEdges: [],
        logMessage: `Initialized Dijkstra from ${start}. Set distance(start) = 0, all others = ∞.`
      });

      while (!pq.isEmpty()) {
        const { city } = pq.dequeue();

        if (visited.has(city)) continue;
        visited.add(city);

        steps.push({
          stepNumber: steps.length + 1,
          type: 'settle_node',
          activeNode: city,
          distances: { ...distances },
          visitedNodes: Array.from(visited),
          selectedEdges: this._buildCurrentPathEdges(previous),
          logMessage: `Settled minimum distance for ${city}: ${distances[city]} km.`
        });

        // Early exit if target node is reached and settled
        if (target && city === target) {
          break;
        }

        const neighbors = graph.getNeighbors(city);
        for (const edge of neighbors) {
          const neighbor = edge.destination;
          const weight = edge.weight;

          if (!visited.has(neighbor)) {
            const newDist = distances[city] + weight;
            if (newDist < distances[neighbor]) {
              distances[neighbor] = newDist;
              previous[neighbor] = city;
              pq.enqueue({ city: neighbor, from: city }, newDist);

              steps.push({
                stepNumber: steps.length + 1,
                type: 'relax_edge',
                activeNode: neighbor,
                activeEdge: { source: city, destination: neighbor, weight: weight },
                distances: { ...distances },
                visitedNodes: Array.from(visited),
                selectedEdges: this._buildCurrentPathEdges(previous),
                logMessage: `Relaxed edge ${city} ➔ ${neighbor}: Updated distance from ∞ to ${newDist} km.`
              });
            }
          }
        }
      }

      // Reconstruct Path if target specified
      let path = [];
      let totalCost = 0;
      let unreachable = false;

      if (target) {
        if (distances[target] === Infinity) {
          unreachable = true;
        } else {
          let curr = target;
          const cycleGuard = new Set();
          while (curr && !cycleGuard.has(curr)) {
            cycleGuard.add(curr);
            path.unshift(curr);
            curr = previous[curr];
          }
          totalCost = distances[target];
        }
      }

      const finalPathEdges = [];
      if (path.length > 1) {
        for (let i = 0; i < path.length - 1; i++) {
          finalPathEdges.push({ source: path[i], destination: path[i + 1] });
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        type: 'complete',
        activeNode: target || start,
        distances: { ...distances },
        visitedNodes: Array.from(visited),
        selectedEdges: finalPathEdges,
        logMessage: unreachable 
          ? `Destination ${target} is unreachable from ${start}.`
          : target 
            ? `Optimal path found: ${path.join(' ➔ ')} (Total: ${totalCost} km).`
            : `Dijkstra single-source distances computed for all reachable nodes.`
      });

      return {
        algorithm: "Dijkstra's Shortest Path",
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        startNode: start,
        targetNode: target,
        distances: distances,
        previous: previous,
        path: path,
        pathEdges: finalPathEdges,
        totalCost: totalCost,
        unreachable: unreachable,
        steps: steps
      };
    },

    /**
     * Bellman-Ford Shortest Path Algorithm
     * Corresponds to GraphAlgorithms.bellmanFord(String start)
     */
    bellmanFord: function (graph, startId, targetId = null) {
      const start = String(startId).trim().toUpperCase();
      const target = targetId ? String(targetId).trim().toUpperCase() : null;

      if (!graph.getNode(start)) {
        throw new Error(`Origin hub "${start}" not found in network.`);
      }

      const steps = [];
      const distances = {};
      const previous = {};
      const nodes = graph.getNodes();
      const edges = graph.getEdges();

      nodes.forEach(n => {
        distances[n.id] = Infinity;
        previous[n.id] = null;
      });
      distances[start] = 0;

      steps.push({
        stepNumber: steps.length + 1,
        type: 'init',
        activeNode: start,
        distances: { ...distances },
        selectedEdges: [],
        logMessage: `Initialized Bellman-Ford. Set distance(${start}) = 0. Starting (V-1) relaxation passes.`
      });

      const V = nodes.length;

      // V - 1 relaxation iterations
      for (let i = 1; i < V; i++) {
        let changedInPass = false;

        for (const edge of edges) {
          // Check both directions since graph is undirected
          const pairs = [
            { u: edge.source, v: edge.destination, w: edge.weight },
            { u: edge.destination, v: edge.source, w: edge.weight }
          ];

          for (const { u, v, w } of pairs) {
            if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
              distances[v] = distances[u] + w;
              previous[v] = u;
              changedInPass = true;

              steps.push({
                stepNumber: steps.length + 1,
                type: 'relax_edge',
                activeNode: v,
                activeEdge: { source: u, destination: v, weight: w },
                distances: { ...distances },
                selectedEdges: this._buildCurrentPathEdges(previous),
                logMessage: `Pass ${i}/${V - 1}: Relaxed ${u} ➔ ${v} to ${distances[v]} km.`
              });
            }
          }
        }

        if (!changedInPass) {
          steps.push({
            stepNumber: steps.length + 1,
            type: 'early_termination',
            activeNode: null,
            distances: { ...distances },
            selectedEdges: this._buildCurrentPathEdges(previous),
            logMessage: `Pass ${i}: No distances changed. Terminating passes early (Optimal convergence).`
          });
          break;
        }
      }

      // Negative Cycle Detection Check (Vth pass)
      let hasNegativeCycle = false;
      for (const edge of edges) {
        const pairs = [
          { u: edge.source, v: edge.destination, w: edge.weight },
          { u: edge.destination, v: edge.source, w: edge.weight }
        ];
        for (const { u, v, w } of pairs) {
          if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
            hasNegativeCycle = true;
            break;
          }
        }
        if (hasNegativeCycle) break;
      }

      let path = [];
      let totalCost = 0;
      let unreachable = false;

      if (target) {
        if (distances[target] === Infinity) {
          unreachable = true;
        } else {
          let curr = target;
          const cycleGuard = new Set();
          while (curr && !cycleGuard.has(curr)) {
            cycleGuard.add(curr);
            path.unshift(curr);
            curr = previous[curr];
          }
          totalCost = distances[target];
        }
      }

      const finalPathEdges = [];
      if (path.length > 1) {
        for (let i = 0; i < path.length - 1; i++) {
          finalPathEdges.push({ source: path[i], destination: path[i + 1] });
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        type: 'complete',
        activeNode: target || start,
        distances: { ...distances },
        selectedEdges: finalPathEdges,
        logMessage: hasNegativeCycle
          ? `Warning: Negative weight cycle detected in route network!`
          : unreachable 
            ? `Destination ${target} is unreachable from ${start}.`
            : target 
              ? `Bellman-Ford converged. Optimal route: ${path.join(' ➔ ')} (${totalCost} km).`
              : `Bellman-Ford completed convergence across all airport hubs.`
      });

      return {
        algorithm: 'Bellman-Ford Shortest Path',
        timeComplexity: 'O(V · E)',
        spaceComplexity: 'O(V)',
        startNode: start,
        targetNode: target,
        distances: distances,
        previous: previous,
        path: path,
        pathEdges: finalPathEdges,
        totalCost: totalCost,
        unreachable: unreachable,
        hasNegativeCycle: hasNegativeCycle,
        steps: steps
      };
    },

    /**
     * Prim's Minimum Spanning Tree
     * Corresponds to GraphAlgorithms.primMST(String start)
     */
    primMST: function (graph, startId) {
      const start = String(startId).trim().toUpperCase();
      if (!graph.getNode(start)) {
        throw new Error(`Start hub "${start}" not found in network.`);
      }

      const steps = [];
      const visited = new Set();
      const pq = new MinPriorityQueue();
      const mstEdges = [];
      let totalCost = 0;

      visited.add(start);

      steps.push({
        stepNumber: steps.length + 1,
        type: 'init',
        activeNode: start,
        visitedNodes: [start],
        selectedEdges: [],
        totalCost: 0,
        logMessage: `Initialized Prim's MST starting with seed hub ${start}.`
      });

      // Enqueue all initial edges from start
      for (const edge of graph.getNeighbors(start)) {
        pq.enqueue({ source: start, destination: edge.destination, weight: edge.weight }, edge.weight);
      }

      while (!pq.isEmpty()) {
        const edge = pq.dequeue();

        if (visited.has(edge.destination)) {
          continue;
        }

        visited.add(edge.destination);
        mstEdges.push(edge);
        totalCost += edge.weight;

        steps.push({
          stepNumber: steps.length + 1,
          type: 'add_mst_edge',
          activeNode: edge.destination,
          activeEdge: edge,
          visitedNodes: Array.from(visited),
          selectedEdges: [...mstEdges],
          totalCost: totalCost,
          logMessage: `Added MST corridor: ${edge.source} ➔ ${edge.destination} (${edge.weight} km). Subtotal: ${totalCost} km.`
        });

        // Enqueue neighbors from the newly added node
        for (const nextEdge of graph.getNeighbors(edge.destination)) {
          if (!visited.has(nextEdge.destination)) {
            pq.enqueue({
              source: edge.destination,
              destination: nextEdge.destination,
              weight: nextEdge.weight
            }, nextEdge.weight);
          }
        }
      }

      const totalNodes = graph.getNodes().length;
      const isConnected = visited.size === totalNodes;

      steps.push({
        stepNumber: steps.length + 1,
        type: 'complete',
        activeNode: null,
        visitedNodes: Array.from(visited),
        selectedEdges: [...mstEdges],
        totalCost: totalCost,
        logMessage: isConnected
          ? `Prim's MST complete! Connected all ${visited.size} hubs with ${mstEdges.length} corridors for ${totalCost} km total.`
          : `Prim's finished component (${visited.size} of ${totalNodes} hubs reached). Graph is disconnected.`
      });

      return {
        algorithm: "Prim's Minimum Spanning Tree",
        timeComplexity: 'O(E log V)',
        spaceComplexity: 'O(V + E)',
        startNode: start,
        mstEdges: mstEdges,
        totalCost: totalCost,
        visitedCount: visited.size,
        isConnected: isConnected,
        steps: steps
      };
    },

    /**
     * Kruskal's Minimum Spanning Tree
     * Corresponds to GraphAlgorithms.kruskalMST()
     */
    kruskalMST: function (graph) {
      const edges = graph.getEdges().slice();
      // Sort edges ascending by weight
      edges.sort((a, b) => a.weight - b.weight);

      const nodes = graph.getNodes();
      const nodeIds = nodes.map(n => n.id);
      const uf = new UnionFind(nodeIds);

      const steps = [];
      const mstEdges = [];
      let totalCost = 0;

      steps.push({
        stepNumber: steps.length + 1,
        type: 'init',
        selectedEdges: [],
        totalCost: 0,
        logMessage: `Initialized Kruskal's MST. Sorted all ${edges.length} air corridors ascending by weight.`
      });

      for (const edge of edges) {
        const rootU = uf.find(edge.source);
        const rootV = uf.find(edge.destination);

        if (rootU !== rootV) {
          uf.union(edge.source, edge.destination);
          mstEdges.push(edge);
          totalCost += edge.weight;

          steps.push({
            stepNumber: steps.length + 1,
            type: 'accept_edge',
            activeEdge: edge,
            selectedEdges: [...mstEdges],
            totalCost: totalCost,
            logMessage: `Accepted corridor ${edge.source} ➔ ${edge.destination} (${edge.weight} km) into MST without cycle.`
          });

          // Early exit if MST has V-1 edges
          if (mstEdges.length === nodes.length - 1) {
            break;
          }
        } else {
          steps.push({
            stepNumber: steps.length + 1,
            type: 'reject_edge',
            activeEdge: edge,
            selectedEdges: [...mstEdges],
            totalCost: totalCost,
            logMessage: `Rejected ${edge.source} ➔ ${edge.destination} (${edge.weight} km): Forms cycle in same component.`
          });
        }
      }

      const isConnected = mstEdges.length === nodes.length - 1;

      steps.push({
        stepNumber: steps.length + 1,
        type: 'complete',
        selectedEdges: [...mstEdges],
        totalCost: totalCost,
        logMessage: isConnected
          ? `Kruskal's MST optimal solution found: ${mstEdges.length} edges spanning all hubs for ${totalCost} km.`
          : `Kruskal's created forest with ${mstEdges.length} edges. Graph contains disconnected components.`
      });

      return {
        algorithm: "Kruskal's Minimum Spanning Tree",
        timeComplexity: 'O(E log E)',
        spaceComplexity: 'O(V + E)',
        mstEdges: mstEdges,
        totalCost: totalCost,
        isConnected: isConnected,
        steps: steps
      };
    },

    /**
     * Floyd-Warshall All-Pairs Shortest Path
     * Corresponds to GraphAlgorithms.floydWarshall()
     */
    floydWarshall: function (graph) {
      const nodes = graph.getNodes();
      const n = nodes.length;
      const cities = nodes.map(nd => nd.id);

      // Distance matrix
      const dist = [];
      for (let i = 0; i < n; i++) {
        dist[i] = new Array(n).fill(Infinity);
        dist[i][i] = 0;
      }

      // Populate direct edge weights
      for (let i = 0; i < n; i++) {
        const u = cities[i];
        for (const edge of graph.getNeighbors(u)) {
          const j = cities.indexOf(edge.destination);
          if (j !== -1) {
            dist[i][j] = edge.weight;
          }
        }
      }

      const steps = [];

      steps.push({
        stepNumber: 1,
        type: 'init',
        matrix: JSON.parse(JSON.stringify(dist)),
        cities: [...cities],
        logMessage: `Initialized Floyd-Warshall distance matrix with direct corridor weights.`
      });

      // Triple loop over k, i, j
      for (let k = 0; k < n; k++) {
        const intermediate = cities[k];
        let changesInK = 0;

        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
              if (dist[i][k] + dist[k][j] < dist[i][j]) {
                dist[i][j] = dist[i][k] + dist[k][j];
                changesInK++;
              }
            }
          }
        }

        steps.push({
          stepNumber: steps.length + 1,
          type: 'k_iteration',
          activeNode: intermediate,
          k: k,
          changes: changesInK,
          matrix: JSON.parse(JSON.stringify(dist)),
          cities: [...cities],
          logMessage: `Completed evaluation via intermediate hub ${intermediate} (Iteration ${k + 1}/${n}). Updated ${changesInK} sector paths.`
        });
      }

      steps.push({
        stepNumber: steps.length + 1,
        type: 'complete',
        matrix: dist,
        cities: [...cities],
        logMessage: `Floyd-Warshall computed all ${n * n} shortest path pairs across national route topology.`
      });

      return {
        algorithm: 'Floyd-Warshall All-Pairs',
        timeComplexity: 'O(V³)',
        spaceComplexity: 'O(V²)',
        cities: cities,
        matrix: dist,
        steps: steps
      };
    },

    /**
     * Internal helper to extract selected edges from predecessor map
     */
    _buildCurrentPathEdges: function (previousMap) {
      const edges = [];
      for (const [node, parent] of Object.entries(previousMap)) {
        if (parent) {
          edges.push({ source: parent, destination: node });
        }
      }
      return edges;
    }
  };

  window.AeroGraphAlgorithms = GraphAlgorithms;

})(window);
