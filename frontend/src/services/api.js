const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL)
    ? process.env.VITE_API_BASE_URL
    : '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    const networkError = new Error('Backend service unreachable. Please ensure the Spring Boot server is running on port 8080.');
    networkError.status = 0;
    networkError.isNetworkError = true;
    throw networkError;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = (data && typeof data === 'object' && (data.message || data.error))
      ? (data.message || data.error)
      : (typeof data === 'string' && data.length > 0 ? data : `HTTP ${response.status} ${response.statusText}`);
    
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Airports
  getAirports: () => request('/airports'),

  // Flights
  getFlights: (params = {}) => {
    const q = new URLSearchParams();
    if (params.source) q.append('source', params.source);
    if (params.destination) q.append('destination', params.destination);
    if (params.status) q.append('status', params.status);
    if (params.query) q.append('query', params.query);
    const qs = q.toString();
    return request(`/flights${qs ? `?${qs}` : ''}`);
  },
  getFlight: (id) => request(`/flights/${encodeURIComponent(id)}`),
  createFlight: (flight) => request('/flights', { method: 'POST', body: JSON.stringify(flight) }),
  updateFlight: (id, flight) => request(`/flights/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(flight) }),
  deleteFlight: (id) => request(`/flights/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Passengers
  getPassengers: (query = '') => {
    const qs = query ? `?query=${encodeURIComponent(query)}` : '';
    return request(`/passengers${qs}`);
  },
  getPassenger: (id) => request(`/passengers/${encodeURIComponent(id)}`),
  createPassenger: (passenger) => request('/passengers', { method: 'POST', body: JSON.stringify(passenger) }),
  updatePassenger: (id, passenger) => request(`/passengers/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(passenger) }),
  deletePassenger: (id) => request(`/passengers/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Bookings
  getBookings: (params = {}) => {
    const q = new URLSearchParams();
    if (params.flightId) q.append('flightId', params.flightId);
    if (params.passengerId) q.append('passengerId', params.passengerId);
    if (params.status) q.append('status', params.status);
    const qs = q.toString();
    return request(`/bookings${qs ? `?${qs}` : ''}`);
  },
  getBooking: (id) => request(`/bookings/${encodeURIComponent(id)}`),
  createBooking: (booking) => request('/bookings', { method: 'POST', body: JSON.stringify(booking) }),
  cancelBooking: (id) => request(`/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST' }),

  // Stage 3/5 DSA Endpoints (Java 21 Engine)
  getDsaTopology: (sync = false) => request(`/dsa/graph/topology?sync=${sync}`),

  // Graph Algorithms
  runBfs: (payload = {}) => request('/dsa/graph/bfs', { method: 'POST', body: JSON.stringify(payload) }),
  runDfs: (payload = {}) => request('/dsa/graph/dfs', { method: 'POST', body: JSON.stringify(payload) }),
  runDijkstra: (payload = {}) => request('/dsa/graph/dijkstra', { method: 'POST', body: JSON.stringify(payload) }),
  runBellmanFord: (payload = {}) => request('/dsa/graph/bellman-ford', { method: 'POST', body: JSON.stringify(payload) }),
  runPrim: (payload = {}) => request('/dsa/graph/prim', { method: 'POST', body: JSON.stringify(payload) }),
  runKruskal: (payload = {}) => request('/dsa/graph/kruskal', { method: 'POST', body: JSON.stringify(payload) }),
  runFloydWarshall: (payload = {}) => request('/dsa/graph/floyd-warshall', { method: 'POST', body: JSON.stringify(payload) }),

  // Tree Indexing
  runBst: (payload = {}) => request('/dsa/trees/bst', { method: 'POST', body: JSON.stringify(payload) }),
  runAvl: (payload = {}) => request('/dsa/trees/avl', { method: 'POST', body: JSON.stringify(payload) }),
  runBTree: (payload = {}) => request('/dsa/trees/btree', { method: 'POST', body: JSON.stringify(payload) }),
  runBPlusTree: (payload = {}) => request('/dsa/trees/bplus', { method: 'POST', body: JSON.stringify(payload) }),
  runBPlusRange: (payload = {}) => request('/dsa/trees/bplus/range', { method: 'POST', body: JSON.stringify(payload) }),

  // Fare Analytics (Segment Tree & Fenwick Tree)
  getDsaFares: () => request('/dsa/analytics/fares'),
  runSegmentTree: (payload = {}) => request('/dsa/analytics/segment-tree', { method: 'POST', body: JSON.stringify(payload) }),
  runFenwickTree: (payload = {}) => request('/dsa/analytics/fenwick-tree', { method: 'POST', body: JSON.stringify(payload) }),

  // Sorting Laboratory
  runSort: (payload = {}) => request('/dsa/sorting/sort', { method: 'POST', body: JSON.stringify(payload) }),
  runSortBenchmark: (payload = {}) => request('/dsa/sorting/benchmark', { method: 'POST', body: JSON.stringify(payload) }),
};
