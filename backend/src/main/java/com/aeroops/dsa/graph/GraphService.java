package com.aeroops.dsa.graph;

import com.aeroops.entity.Flight;
import com.aeroops.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphService {

    private final FlightRepository flightRepository;

    public GraphService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public GraphTopology getTopology(boolean syncWithFlights) {
        GraphTopology topology = GraphTopology.createDefault();
        if (syncWithFlights) {
            List<Flight> flights = flightRepository.findAllWithAirports();
            for (Flight f : flights) {
                if (f.getSourceAirport() != null && f.getDestinationAirport() != null) {
                    int approxWeight = (int) Math.round(f.getFare() / 4.0);
                    topology.addRoute(f.getSourceAirport().getAirportCode(),
                                      f.getDestinationAirport().getAirportCode(),
                                      Math.max(50, approxWeight));
                }
            }
        }
        return topology;
    }

    public GraphTraversalResult bfs(String startId, GraphTopology topology) {
        if (topology == null) topology = getTopology(false);
        String start = startId.trim().toUpperCase();
        if (!topology.getNodes().containsKey(start)) {
            throw new IllegalArgumentException("Airport hub '" + start + "' not found in route network.");
        }

        List<GraphStep> steps = new ArrayList<>();
        List<String> visitedOrder = new ArrayList<>();
        Set<String> visited = new LinkedHashSet<>();
        Queue<String> queue = new ArrayDeque<>();

        visited.add(start);
        queue.add(start);

        steps.add(new GraphStep(
            steps.size() + 1, "start", start,
            new ArrayList<>(visited), List.of(), new ArrayList<>(queue),
            Map.of(), "Initialized BFS traversal starting at hub " + start + "."
        ));

        while (!queue.isEmpty()) {
            String curr = queue.poll();
            visitedOrder.add(curr);

            steps.add(new GraphStep(
                steps.size() + 1, "dequeue_node", curr,
                new ArrayList<>(visited), List.of(), new ArrayList<>(queue),
                Map.of(), "Dequeued hub " + curr + " for neighbor corridor exploration."
            ));

            List<GraphEdge> neighbors = topology.getAdjacencyList().getOrDefault(curr, List.of());
            for (GraphEdge edge : neighbors) {
                String neighbor = edge.destination();
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.add(neighbor);
                    steps.add(new GraphStep(
                        steps.size() + 1, "discover_node", neighbor,
                        new ArrayList<>(visited), List.of(edge.id()), new ArrayList<>(queue),
                        Map.of(), "Discovered new adjacent hub " + neighbor + " via corridor " + edge.id() + " (" + edge.weight() + " km)."
                    ));
                }
            }
        }

        return new GraphTraversalResult("BFS", start, visitedOrder, visitedOrder.size(), steps);
    }

    public GraphTraversalResult dfs(String startId, GraphTopology topology) {
        if (topology == null) topology = getTopology(false);
        String start = startId.trim().toUpperCase();
        if (!topology.getNodes().containsKey(start)) {
            throw new IllegalArgumentException("Airport hub '" + start + "' not found in route network.");
        }

        List<GraphStep> steps = new ArrayList<>();
        List<String> visitedOrder = new ArrayList<>();
        Set<String> visited = new LinkedHashSet<>();

        steps.add(new GraphStep(
            steps.size() + 1, "start", start,
            List.of(start), List.of(), List.of(),
            Map.of(), "Initialized DFS traversal starting at hub " + start + "."
        ));

        dfsRecursive(start, visited, visitedOrder, steps, topology);

        return new GraphTraversalResult("DFS", start, visitedOrder, visitedOrder.size(), steps);
    }

    private void dfsRecursive(String curr, Set<String> visited, List<String> visitedOrder,
                              List<GraphStep> steps, GraphTopology topology) {
        visited.add(curr);
        visitedOrder.add(curr);

        steps.add(new GraphStep(
            steps.size() + 1, "visit_node", curr,
            new ArrayList<>(visited), List.of(), List.of(),
            Map.of(), "Visiting hub " + curr + " in DFS recursive branch."
        ));

        List<GraphEdge> neighbors = topology.getAdjacencyList().getOrDefault(curr, List.of());
        for (GraphEdge edge : neighbors) {
            String neighbor = edge.destination();
            if (!visited.contains(neighbor)) {
                steps.add(new GraphStep(
                    steps.size() + 1, "explore_edge", neighbor,
                    new ArrayList<>(visited), List.of(edge.id()), List.of(),
                    Map.of(), "Traversing unvisited branch from " + curr + " to " + neighbor + " (" + edge.weight() + " km)."
                ));
                dfsRecursive(neighbor, visited, visitedOrder, steps, topology);
            }
        }
    }

    public ShortestPathResult dijkstra(String startId, String targetId, GraphTopology topology) {
        if (topology == null) topology = getTopology(false);
        String start = startId.trim().toUpperCase();
        String target = targetId.trim().toUpperCase();

        if (!topology.getNodes().containsKey(start) || !topology.getNodes().containsKey(target)) {
            throw new IllegalArgumentException("Source or target airport not found in route network.");
        }

        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        Set<String> visited = new HashSet<>();
        List<GraphStep> steps = new ArrayList<>();

        for (String node : topology.getNodes().keySet()) {
            distances.put(node, Integer.MAX_VALUE);
        }
        distances.put(start, 0);

        PriorityQueue<NodeDistance> pq = new PriorityQueue<>(Comparator.comparingInt(nd -> nd.distance));
        pq.add(new NodeDistance(start, 0));

        steps.add(new GraphStep(
            steps.size() + 1, "start", start,
            List.of(), List.of(), List.of(start),
            new HashMap<>(distances), "Dijkstra: Initialized origin " + start + " with distance 0."
        ));

        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            String u = current.node;

            if (visited.contains(u)) continue;
            visited.add(u);

            steps.add(new GraphStep(
                steps.size() + 1, "settle_node", u,
                new ArrayList<>(visited), List.of(), pq.stream().map(nd -> nd.node).toList(),
                new HashMap<>(distances), "Dijkstra: Settled shortest distance to hub " + u + " = " + distances.get(u) + " km."
            ));

            if (u.equals(target)) {
                break;
            }

            for (GraphEdge edge : topology.getAdjacencyList().getOrDefault(u, List.of())) {
                String v = edge.destination();
                if (!visited.contains(v)) {
                    int newDist = distances.get(u) + edge.weight();
                    if (newDist < distances.get(v)) {
                        distances.put(v, newDist);
                        previous.put(v, u);
                        pq.add(new NodeDistance(v, newDist));

                        steps.add(new GraphStep(
                            steps.size() + 1, "relax_edge", v,
                            new ArrayList<>(visited), List.of(edge.id()), pq.stream().map(nd -> nd.node).toList(),
                            new HashMap<>(distances), "Dijkstra: Relaxed corridor " + u + " -> " + v + " to " + newDist + " km."
                        ));
                    }
                }
            }
        }

        boolean reachable = distances.get(target) != Integer.MAX_VALUE;
        List<String> path = new ArrayList<>();
        if (reachable) {
            String curr = target;
            while (curr != null) {
                path.add(0, curr);
                curr = previous.get(curr);
            }
        }

        return new ShortestPathResult(
            "Dijkstra", start, target, reachable,
            reachable ? distances.get(target) : -1,
            path, distances, false, steps
        );
    }

    public ShortestPathResult bellmanFord(String startId, String targetId, GraphTopology topology) {
        if (topology == null) topology = getTopology(false);
        String start = startId.trim().toUpperCase();
        String target = targetId.trim().toUpperCase();

        if (!topology.getNodes().containsKey(start) || !topology.getNodes().containsKey(target)) {
            throw new IllegalArgumentException("Source or target airport not found in route network.");
        }

        Map<String, Integer> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        List<GraphStep> steps = new ArrayList<>();

        for (String node : topology.getNodes().keySet()) {
            distances.put(node, Integer.MAX_VALUE);
        }
        distances.put(start, 0);

        List<GraphEdge> allEdges = new ArrayList<>();
        for (var entry : topology.getAdjacencyList().entrySet()) {
            allEdges.addAll(entry.getValue());
        }

        int nodeCount = topology.getNodes().size();
        for (int i = 1; i <= nodeCount - 1; i++) {
            boolean anyChange = false;
            for (GraphEdge edge : allEdges) {
                int distU = distances.get(edge.source());
                if (distU != Integer.MAX_VALUE && distU + edge.weight() < distances.get(edge.destination())) {
                    distances.put(edge.destination(), distU + edge.weight());
                    previous.put(edge.destination(), edge.source());
                    anyChange = true;
                }
            }
            steps.add(new GraphStep(
                steps.size() + 1, "iteration", start,
                List.of(), List.of(), List.of(),
                new HashMap<>(distances), "Bellman-Ford: Completed relaxation iteration " + i + "."
            ));
            if (!anyChange) break;
        }

        // Negative cycle check
        boolean hasNegativeCycle = false;
        for (GraphEdge edge : allEdges) {
            int distU = distances.get(edge.source());
            if (distU != Integer.MAX_VALUE && distU + edge.weight() < distances.get(edge.destination())) {
                hasNegativeCycle = true;
                break;
            }
        }

        boolean reachable = !hasNegativeCycle && distances.get(target) != Integer.MAX_VALUE;
        List<String> path = new ArrayList<>();
        if (reachable) {
            String curr = target;
            while (curr != null) {
                path.add(0, curr);
                curr = previous.get(curr);
            }
        }

        return new ShortestPathResult(
            "Bellman-Ford", start, target, reachable,
            reachable ? distances.get(target) : -1,
            path, distances, hasNegativeCycle, steps
        );
    }

    public SpanningTreeResult prim(String startId, GraphTopology topology) {
        if (topology == null) topology = getTopology(false);
        String start = startId.trim().toUpperCase();
        if (!topology.getNodes().containsKey(start)) {
            start = topology.getNodes().keySet().iterator().next();
        }

        Set<String> inMst = new HashSet<>();
        List<GraphEdge> mstEdges = new ArrayList<>();
        List<GraphStep> steps = new ArrayList<>();
        int totalWeight = 0;

        PriorityQueue<GraphEdge> pq = new PriorityQueue<>(Comparator.comparingInt(GraphEdge::weight));
        inMst.add(start);

        for (GraphEdge e : topology.getAdjacencyList().getOrDefault(start, List.of())) {
            pq.add(e);
        }

        steps.add(new GraphStep(
            steps.size() + 1, "start", start,
            new ArrayList<>(inMst), List.of(), List.of(),
            Map.of(), "Prim: Initialized MST starting from root hub " + start + "."
        ));

        while (!pq.isEmpty() && inMst.size() < topology.getNodes().size()) {
            GraphEdge edge = pq.poll();
            String u = edge.source();
            String v = edge.destination();

            if (inMst.contains(u) && inMst.contains(v)) {
                continue;
            }

            String newVertex = inMst.contains(u) ? v : u;
            inMst.add(newVertex);
            mstEdges.add(edge);
            totalWeight += edge.weight();

            steps.add(new GraphStep(
                steps.size() + 1, "add_edge", newVertex,
                new ArrayList<>(inMst), mstEdges.stream().map(GraphEdge::id).toList(), List.of(),
                Map.of(), "Prim: Added minimal corridor " + edge.source() + "-" + edge.destination() + " (" + edge.weight() + " km) to MST."
            ));

            for (GraphEdge next : topology.getAdjacencyList().getOrDefault(newVertex, List.of())) {
                if (!inMst.contains(next.destination())) {
                    pq.add(next);
                }
            }
        }

        boolean isConnected = inMst.size() == topology.getNodes().size();
        return new SpanningTreeResult("Prim", start, isConnected, totalWeight, mstEdges, steps);
    }

    public SpanningTreeResult kruskal(GraphTopology topology) {
        if (topology == null) topology = getTopology(false);

        List<GraphEdge> edges = new ArrayList<>(topology.getEdges());
        Collections.sort(edges);

        Map<String, String> parent = new HashMap<>();
        for (String node : topology.getNodes().keySet()) {
            parent.put(node, node);
        }

        List<GraphEdge> mstEdges = new ArrayList<>();
        List<GraphStep> steps = new ArrayList<>();
        int totalWeight = 0;

        steps.add(new GraphStep(
            steps.size() + 1, "start", "",
            List.of(), List.of(), List.of(),
            Map.of(), "Kruskal: Sorted " + edges.size() + " network corridors in ascending weight order."
        ));

        for (GraphEdge edge : edges) {
            String rootSrc = findRoot(parent, edge.source());
            String rootDst = findRoot(parent, edge.destination());

            if (!rootSrc.equals(rootDst)) {
                parent.put(rootSrc, rootDst);
                mstEdges.add(edge);
                totalWeight += edge.weight();

                steps.add(new GraphStep(
                    steps.size() + 1, "union_edge", edge.source(),
                    List.of(), mstEdges.stream().map(GraphEdge::id).toList(), List.of(),
                    Map.of(), "Kruskal: Selected corridor " + edge.source() + "-" + edge.destination() + " (" + edge.weight() + " km) without forming cycle."
                ));

                if (mstEdges.size() == topology.getNodes().size() - 1) {
                    break;
                }
            }
        }

        boolean isConnected = mstEdges.size() == topology.getNodes().size() - 1;
        return new SpanningTreeResult("Kruskal", "", isConnected, totalWeight, mstEdges, steps);
    }

    private String findRoot(Map<String, String> parent, String node) {
        if (parent.get(node).equals(node)) {
            return node;
        }
        String root = findRoot(parent, parent.get(node));
        parent.put(node, root);
        return root;
    }

    public FloydWarshallResult floydWarshall(GraphTopology topology) {
        if (topology == null) topology = getTopology(false);

        List<String> nodeIds = new ArrayList<>(topology.getNodes().keySet());
        int n = nodeIds.size();
        Map<String, Integer> indexMap = new HashMap<>();
        for (int i = 0; i < n; i++) {
            indexMap.put(nodeIds.get(i), i);
        }

        int[][] dist = new int[n][n];
        String[][] nextHop = new String[n][n];

        for (int i = 0; i < n; i++) {
            Arrays.fill(dist[i], 1_000_000_000);
            dist[i][i] = 0;
            for (int j = 0; j < n; j++) {
                nextHop[i][j] = i == j ? nodeIds.get(i) : null;
            }
        }

        for (GraphEdge edge : topology.getEdges()) {
            int u = indexMap.get(edge.source());
            int v = indexMap.get(edge.destination());
            dist[u][v] = Math.min(dist[u][v], edge.weight());
            dist[v][u] = Math.min(dist[v][u], edge.weight());
            nextHop[u][v] = edge.destination();
            nextHop[v][u] = edge.source();
        }

        List<GraphStep> steps = new ArrayList<>();
        for (int k = 0; k < n; k++) {
            String pivot = nodeIds.get(k);
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        nextHop[i][j] = nextHop[i][k];
                    }
                }
            }
            steps.add(new GraphStep(
                steps.size() + 1, "pivot_iteration", pivot,
                List.of(), List.of(), List.of(),
                Map.of(), "Floyd-Warshall: Processed intermediate hub pivot " + pivot + "."
            ));
        }

        Map<String, Map<String, Integer>> distanceMatrix = new LinkedHashMap<>();
        Map<String, Map<String, String>> nextHopMatrix = new LinkedHashMap<>();
        for (int i = 0; i < n; i++) {
            Map<String, Integer> rowDist = new LinkedHashMap<>();
            Map<String, String> rowHop = new LinkedHashMap<>();
            for (int j = 0; j < n; j++) {
                rowDist.put(nodeIds.get(j), dist[i][j] >= 1_000_000_000 ? -1 : dist[i][j]);
                rowHop.put(nodeIds.get(j), nextHop[i][j]);
            }
            distanceMatrix.put(nodeIds.get(i), rowDist);
            nextHopMatrix.put(nodeIds.get(i), rowHop);
        }

        boolean hasNegativeCycle = false;
        for (int i = 0; i < n; i++) {
            if (dist[i][i] < 0) {
                hasNegativeCycle = true;
                break;
            }
        }

        return new FloydWarshallResult("Floyd-Warshall", nodeIds, distanceMatrix, nextHopMatrix, hasNegativeCycle, steps);
    }

    private static class NodeDistance {
        final String node;
        final int distance;

        NodeDistance(String node, int distance) {
            this.node = node;
            this.distance = distance;
        }
    }
}
