package com.aeroops.dsa.graph;

import java.util.*;

public class GraphTopology {

    private final Map<String, GraphNode> nodes = new LinkedHashMap<>();
    private final List<GraphEdge> edges = new ArrayList<>();
    private final Map<String, List<GraphEdge>> adjacencyList = new LinkedHashMap<>();

    public static final List<GraphNode> DEFAULT_NODES = List.of(
        new GraphNode("DEL", "Indira Gandhi Int'l", "Delhi", 340, 120, "Delhi NCR"),
        new GraphNode("BOM", "Chhatrapati Shivaji Maharaj", "Mumbai", 220, 310, "Maharashtra"),
        new GraphNode("BLR", "Kempegowda Int'l", "Bengaluru", 380, 440, "Karnataka"),
        new GraphNode("HYD", "Rajiv Gandhi Int'l", "Hyderabad", 420, 320, "Telangana"),
        new GraphNode("MAA", "Chennai Int'l", "Chennai", 490, 430, "Tamil Nadu"),
        new GraphNode("CCU", "Netaji Subhash Chandra Bose", "Kolkata", 680, 220, "West Bengal"),
        new GraphNode("GOI", "Dabolim Airport", "Goa", 250, 400, "Goa"),
        new GraphNode("JAI", "Jaipur Int'l", "Jaipur", 300, 170, "Rajasthan"),
        new GraphNode("PNQ", "Pune Airport", "Pune", 260, 330, "Maharashtra"),
        new GraphNode("AMD", "Sardar Vallabhbhai Patel", "Ahmedabad", 210, 220, "Gujarat")
    );

    public static final List<GraphEdge> DEFAULT_CORRIDORS = List.of(
        new GraphEdge("DEL-BOM", "DEL", "BOM", 1150),
        new GraphEdge("DEL-BLR", "DEL", "BLR", 1740),
        new GraphEdge("DEL-HYD", "DEL", "HYD", 1250),
        new GraphEdge("DEL-CCU", "DEL", "CCU", 1305),
        new GraphEdge("DEL-JAI", "DEL", "JAI", 240),
        new GraphEdge("DEL-AMD", "DEL", "AMD", 775),
        new GraphEdge("BOM-BLR", "BOM", "BLR", 840),
        new GraphEdge("BOM-HYD", "BOM", "HYD", 620),
        new GraphEdge("BOM-GOI", "BOM", "GOI", 440),
        new GraphEdge("BOM-PNQ", "BOM", "PNQ", 120),
        new GraphEdge("BOM-AMD", "BOM", "AMD", 440),
        new GraphEdge("BLR-HYD", "BLR", "HYD", 500),
        new GraphEdge("BLR-MAA", "BLR", "MAA", 290),
        new GraphEdge("BLR-GOI", "BLR", "GOI", 480),
        new GraphEdge("HYD-MAA", "HYD", "MAA", 510),
        new GraphEdge("HYD-CCU", "HYD", "CCU", 1180),
        new GraphEdge("CCU-MAA", "CCU", "MAA", 1360)
    );

    public static GraphTopology createDefault() {
        GraphTopology t = new GraphTopology();
        for (GraphNode node : DEFAULT_NODES) {
            t.addNode(node);
        }
        for (GraphEdge edge : DEFAULT_CORRIDORS) {
            t.addRoute(edge.source(), edge.destination(), edge.weight());
        }
        return t;
    }

    public void addNode(GraphNode node) {
        String id = node.id().trim().toUpperCase();
        nodes.put(id, new GraphNode(id, node.name(), node.city(), node.x(), node.y(), node.state()));
        adjacencyList.putIfAbsent(id, new ArrayList<>());
    }

    public void addRoute(String source, String destination, int weight) {
        String src = source.trim().toUpperCase();
        String dst = destination.trim().toUpperCase();
        if (src.isEmpty() || dst.isEmpty() || src.equals(dst)) {
            return;
        }

        nodes.putIfAbsent(src, new GraphNode(src, src, src, 450, 260, ""));
        nodes.putIfAbsent(dst, new GraphNode(dst, dst, dst, 450, 260, ""));
        adjacencyList.putIfAbsent(src, new ArrayList<>());
        adjacencyList.putIfAbsent(dst, new ArrayList<>());

        // Check if edge already exists
        boolean updated = false;
        for (int i = 0; i < edges.size(); i++) {
            GraphEdge e = edges.get(i);
            if ((e.source().equals(src) && e.destination().equals(dst)) ||
                (e.source().equals(dst) && e.destination().equals(src))) {
                edges.set(i, new GraphEdge(src + "-" + dst, src, dst, weight));
                updated = true;
                break;
            }
        }
        if (!updated) {
            edges.add(new GraphEdge(src + "-" + dst, src, dst, weight));
        }

        // Update adjacency lists
        adjacencyList.get(src).removeIf(e -> e.destination().equals(dst));
        adjacencyList.get(dst).removeIf(e -> e.destination().equals(src));

        adjacencyList.get(src).add(new GraphEdge(src + "-" + dst, src, dst, weight));
        adjacencyList.get(dst).add(new GraphEdge(dst + "-" + src, dst, src, weight));
    }

    public Map<String, GraphNode> getNodes() {
        return Collections.unmodifiableMap(nodes);
    }

    public List<GraphEdge> getEdges() {
        return Collections.unmodifiableList(edges);
    }

    public Map<String, List<GraphEdge>> getAdjacencyList() {
        return Collections.unmodifiableMap(adjacencyList);
    }

    public boolean isConnected() {
        if (nodes.isEmpty()) return true;
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new ArrayDeque<>();
        String first = nodes.keySet().iterator().next();
        queue.add(first);
        visited.add(first);

        while (!queue.isEmpty()) {
            String curr = queue.poll();
            List<GraphEdge> neighbors = adjacencyList.getOrDefault(curr, List.of());
            for (GraphEdge e : neighbors) {
                if (visited.add(e.destination())) {
                    queue.add(e.destination());
                }
            }
        }
        return visited.size() == nodes.size();
    }
}
