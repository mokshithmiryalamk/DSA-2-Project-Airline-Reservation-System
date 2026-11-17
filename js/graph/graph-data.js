/**
 * AEROOPS: Route Network Data Architecture (Stage 3)
 *
 * Models airport hub nodes and weighted flight corridors across the Indian subcontinent.
 * Coordinates are normalized for a responsive 900x520 SVG canvas.
 * Faithfully connects with the original Java `graphs.GraphAlgorithms` route model.
 */

(function (window) {
  'use strict';

  // Authentic Hub Nodes with geographical SVG positions
  const DEFAULT_AIRPORT_NODES = [
    { id: 'DEL', name: 'Indira Gandhi Int\'l', city: 'Delhi', x: 340, y: 120, state: 'Delhi NCR' },
    { id: 'BOM', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', x: 220, y: 310, state: 'Maharashtra' },
    { id: 'BLR', name: 'Kempegowda Int\'l', city: 'Bengaluru', x: 380, y: 440, state: 'Karnataka' },
    { id: 'HYD', name: 'Rajiv Gandhi Int\'l', city: 'Hyderabad', x: 420, y: 320, state: 'Telangana' },
    { id: 'MAA', name: 'Chennai Int\'l', city: 'Chennai', x: 490, y: 430, state: 'Tamil Nadu' },
    { id: 'CCU', name: 'Netaji Subhash Chandra Bose', city: 'Kolkata', x: 680, y: 220, state: 'West Bengal' },
    { id: 'GOI', name: 'Dabolim Airport', city: 'Goa', x: 250, y: 400, state: 'Goa' },
    { id: 'JAI', name: 'Jaipur Int\'l', city: 'Jaipur', x: 300, y: 170, state: 'Rajasthan' },
    { id: 'PNQ', name: 'Pune Airport', city: 'Pune', x: 260, y: 330, state: 'Maharashtra' },
    { id: 'AMD', name: 'Sardar Vallabhbhai Patel', city: 'Ahmedabad', x: 210, y: 220, state: 'Gujarat' }
  ];

  // Authentic National Air Corridors (undirected edge weights in km distance)
  const DEFAULT_CORRIDORS = [
    { source: 'DEL', destination: 'BOM', weight: 1150 },
    { source: 'DEL', destination: 'BLR', weight: 1740 },
    { source: 'DEL', destination: 'HYD', weight: 1250 },
    { source: 'DEL', destination: 'CCU', weight: 1305 },
    { source: 'DEL', destination: 'JAI', weight: 240 },
    { source: 'DEL', destination: 'AMD', weight: 775 },
    { source: 'BOM', destination: 'BLR', weight: 840 },
    { source: 'BOM', destination: 'HYD', weight: 620 },
    { source: 'BOM', destination: 'GOI', weight: 440 },
    { source: 'BOM', destination: 'PNQ', weight: 120 },
    { source: 'BOM', destination: 'AMD', weight: 440 },
    { source: 'BLR', destination: 'HYD', weight: 500 },
    { source: 'BLR', destination: 'MAA', weight: 290 },
    { source: 'BLR', destination: 'GOI', weight: 480 },
    { source: 'HYD', destination: 'MAA', weight: 510 },
    { source: 'HYD', destination: 'CCU', weight: 1180 },
    { source: 'CCU', destination: 'MAA', weight: 1360 }
  ];

  class RouteNetworkGraph {
    constructor() {
      this.nodes = new Map();
      this.adjacencyList = new Map();
      this.edges = [];
      this.resetToDefault();
    }

    /**
     * Resets graph to the default national corridor network
     */
    resetToDefault() {
      this.nodes.clear();
      this.adjacencyList.clear();
      this.edges = [];

      DEFAULT_AIRPORT_NODES.forEach(node => {
        this.addNode(node.id, node.name, node.city, node.x, node.y, node.state);
      });

      DEFAULT_CORRIDORS.forEach(corridor => {
        this.addRoute(corridor.source, corridor.destination, corridor.weight);
      });
    }

    /**
     * Adds an airport hub node
     */
    addNode(id, name, city, x, y, state = '') {
      const cleanId = String(id).trim().toUpperCase();
      this.nodes.set(cleanId, {
        id: cleanId,
        name: name || cleanId,
        city: city || cleanId,
        x: x || 450,
        y: y || 260,
        state: state
      });
      if (!this.adjacencyList.has(cleanId)) {
        this.adjacencyList.set(cleanId, []);
      }
    }

    /**
     * Adds an undirected weighted route corridor (mirrors GraphAlgorithms.addRoute)
     * @param {string} source
     * @param {string} destination
     * @param {number} weight
     * @param {boolean} [allowNegative=false]
     */
    addRoute(source, destination, weight, allowNegative = false) {
      const src = String(source).trim().toUpperCase();
      const dst = String(destination).trim().toUpperCase();
      const w = parseInt(weight, 10);

      if (!src || !dst) throw new Error('City names cannot be empty.');
      if (src === dst) throw new Error('Source and destination cannot be identical.');
      if (isNaN(w)) throw new Error('Distance/Weight must be a valid number.');
      if (!allowNegative && w <= 0) throw new Error('Distance/Weight must be greater than 0.');

      if (!this.nodes.has(src)) this.addNode(src, src, src);
      if (!this.nodes.has(dst)) this.addNode(dst, dst, dst);

      // Check if route already exists
      const existing = this.adjacencyList.get(src).find(e => e.destination === dst);
      if (existing) {
        existing.weight = w;
        const rev = this.adjacencyList.get(dst).find(e => e.destination === src);
        if (rev) rev.weight = w;
        const edgeInList = this.edges.find(e => 
          (e.source === src && e.destination === dst) || (e.source === dst && e.destination === src)
        );
        if (edgeInList) edgeInList.weight = w;
        return;
      }

      this.adjacencyList.get(src).push({ destination: dst, weight: w });
      this.adjacencyList.get(dst).push({ destination: src, weight: w });

      this.edges.push({
        id: `${src}-${dst}`,
        source: src,
        destination: dst,
        weight: w
      });
    }

    /**
     * Sync routes from active flights in Stage 2 AeroDataStore
     */
    syncFromFlights(flights = []) {
      if (!Array.isArray(flights) || flights.length === 0) return;

      flights.forEach(f => {
        if (f.source && f.destination && f.fare) {
          const src = f.source.trim().toUpperCase();
          const dst = f.destination.trim().toUpperCase();
          // Use fare or distance approximation
          const weight = Math.round(f.fare / 4); // Normalizes ~₹5000 fare to ~1250km equivalent
          try {
            this.addRoute(src, dst, weight);
          } catch (e) {
            // ignore self-loops or bad inputs
          }
        }
      });
    }

    getNode(id) {
      return this.nodes.get(String(id).trim().toUpperCase()) || null;
    }

    getNodes() {
      return Array.from(this.nodes.values());
    }

    getEdges() {
      return [...this.edges];
    }

    getNeighbors(id) {
      return this.adjacencyList.get(String(id).trim().toUpperCase()) || [];
    }

    getAdjacencyMap() {
      return this.adjacencyList;
    }

    isGraphConnected() {
      const nodeList = this.getNodes();
      if (nodeList.length === 0) return true;

      const visited = new Set();
      const queue = [nodeList[0].id];
      visited.add(nodeList[0].id);

      while (queue.length > 0) {
        const curr = queue.shift();
        const neighbors = this.getNeighbors(curr);
        for (const n of neighbors) {
          if (!visited.has(n.destination)) {
            visited.add(n.destination);
            queue.push(n.destination);
          }
        }
      }

      return visited.size === nodeList.length;
    }

    getStats() {
      return {
        nodeCount: this.nodes.size,
        edgeCount: this.edges.length,
        isConnected: this.isGraphConnected()
      };
    }
  }

  window.AeroGraphData = {
    RouteNetworkGraph: RouteNetworkGraph,
    instance: new RouteNetworkGraph()
  };

})(window);
