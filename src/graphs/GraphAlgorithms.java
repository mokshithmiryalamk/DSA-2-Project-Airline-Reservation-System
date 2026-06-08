package graphs;

import java.util.*;

public class GraphAlgorithms {
    private Map<String, List<Edge>> graph = new HashMap<>();

    static class Edge {
        String destination;
        int weight;

        Edge(String destination, int weight) {
            this.destination = destination;
            this.weight = weight;
        }
    }

    static class RouteEdge implements Comparable<RouteEdge> {
        String source, destination;
        int weight;

        RouteEdge(String source, String destination, int weight) {
            this.source = source;
            this.destination = destination;
            this.weight = weight;
        }

        @Override
        public int compareTo(RouteEdge other) {
            return Integer.compare(this.weight, other.weight);
        }
    }

    public void addRoute(String source, String destination, int weight) {
        source = source.trim();
        destination = destination.trim();

        if(source.isEmpty() || destination.isEmpty()) {
            System.out.println("City names cannot be empty.");
            return;
        }

        if(weight <= 0) {
            System.out.println("Distance/Fare must be greater than 0.");
            return;
        }

        if(source.equalsIgnoreCase(destination)) {
            System.out.println("Source and destination cannot be same.");
            return;
        }

        for(Edge edge : graph.getOrDefault(source, new ArrayList<>())) {
            if(edge.destination.equalsIgnoreCase(destination)) {
                System.out.println("Route already exists.");
                return;
            }
        }

        graph.putIfAbsent(source, new ArrayList<>());
        graph.putIfAbsent(destination, new ArrayList<>());

        graph.get(source).add(new Edge(destination, weight));
        graph.get(destination).add(new Edge(source, weight));

        System.out.println("Route added successfully.");
    }

    public void viewRoutes() {
        if(graph.isEmpty()) {
            System.out.println("No routes available.");
            return;
        }

        for(String city : graph.keySet()) {
            System.out.print(city + " -> ");
            for(Edge edge : graph.get(city)) {
                System.out.print(edge.destination + "(" + edge.weight + ") ");
            }
            System.out.println();
        }
    }

    public void bfs(String start) {
        start = start.trim();

        if(!graph.containsKey(start)) {
            System.out.println("City not found.");
            return;
        }

        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();

        visited.add(start);
        queue.add(start);

        System.out.print("BFS Traversal: ");

        while(!queue.isEmpty()) {
            String city = queue.poll();
            System.out.print(city + " ");

            for(Edge edge : graph.get(city)) {
                if(!visited.contains(edge.destination)) {
                    visited.add(edge.destination);
                    queue.add(edge.destination);
                }
            }
        }

        System.out.println();
    }

    public void dfs(String start) {
        start = start.trim();

        if(!graph.containsKey(start)) {
            System.out.println("City not found.");
            return;
        }

        Set<String> visited = new HashSet<>();

        System.out.print("DFS Traversal: ");
        dfsHelper(start, visited);
        System.out.println();
    }

    private void dfsHelper(String city, Set<String> visited) {
        visited.add(city);
        System.out.print(city + " ");

        for(Edge edge : graph.get(city)) {
            if(!visited.contains(edge.destination)) {
                dfsHelper(edge.destination, visited);
            }
        }
    }

    public void primMST(String start) {
        start = start.trim();

        if(!graph.containsKey(start)) {
            System.out.println("City not found.");
            return;
        }

        Set<String> visited = new HashSet<>();
        PriorityQueue<RouteEdge> pq = new PriorityQueue<>();

        visited.add(start);

        for(Edge edge : graph.get(start)) {
            pq.add(new RouteEdge(start, edge.destination, edge.weight));
        }

        int totalCost = 0;
        System.out.println("Prim's Minimum Spanning Tree:");

        while(!pq.isEmpty()) {
            RouteEdge route = pq.poll();

            if(visited.contains(route.destination)) {
                continue;
            }

            visited.add(route.destination);
            totalCost += route.weight;

            System.out.println(route.source + " -> " + route.destination + " : " + route.weight);

            for(Edge edge : graph.get(route.destination)) {
                if(!visited.contains(edge.destination)) {
                    pq.add(new RouteEdge(route.destination, edge.destination, edge.weight));
                }
            }
        }

        System.out.println("Total Minimum Cost: " + totalCost);
    }

    public void kruskalMST() {
        if(graph.isEmpty()) {
            System.out.println("No routes available.");
            return;
        }

        List<RouteEdge> edges = new ArrayList<>();

        for(String source : graph.keySet()) {
            for(Edge edge : graph.get(source)) {
                if(source.compareTo(edge.destination) < 0) {
                    edges.add(new RouteEdge(source, edge.destination, edge.weight));
                }
            }
        }

        Collections.sort(edges);

        Map<String, String> parent = new HashMap<>();

        for(String city : graph.keySet()) {
            parent.put(city, city);
        }

        int totalCost = 0;
        System.out.println("Kruskal's Minimum Spanning Tree:");

        for(RouteEdge edge : edges) {
            String root1 = find(parent, edge.source);
            String root2 = find(parent, edge.destination);

            if(!root1.equals(root2)) {
                System.out.println(edge.source + " -> " + edge.destination + " : " + edge.weight);
                totalCost += edge.weight;
                parent.put(root1, root2);
            }
        }

        System.out.println("Total Minimum Cost: " + totalCost);
    }

    private String find(Map<String, String> parent, String city) {
        if(!parent.get(city).equals(city)) {
            parent.put(city, find(parent, parent.get(city)));
        }

        return parent.get(city);
    }

    public void dijkstra(String start) {
        start = start.trim();

        if(!graph.containsKey(start)) {
            System.out.println("City not found.");
            return;
        }

        Map<String, Integer> distance = new HashMap<>();

        for(String city : graph.keySet()) {
            distance.put(city, Integer.MAX_VALUE);
        }

        distance.put(start, 0);

        PriorityQueue<RouteEdge> pq = new PriorityQueue<>();
        pq.add(new RouteEdge(start, start, 0));

        while(!pq.isEmpty()) {
            RouteEdge current = pq.poll();
            String city = current.destination;

            for(Edge edge : graph.get(city)) {
                int newDist = distance.get(city) + edge.weight;

                if(newDist < distance.get(edge.destination)) {
                    distance.put(edge.destination, newDist);
                    pq.add(new RouteEdge(city, edge.destination, newDist));
                }
            }
        }

        System.out.println("Shortest distances from " + start + ":");

        for(String city : distance.keySet()) {
            System.out.println(start + " -> " + city + " : " + distance.get(city));
        }
    }

    public void bellmanFord(String start) {
        start = start.trim();

        if(!graph.containsKey(start)) {
            System.out.println("City not found.");
            return;
        }

        Map<String, Integer> distance = new HashMap<>();

        for(String city : graph.keySet()) {
            distance.put(city, Integer.MAX_VALUE);
        }

        distance.put(start, 0);

        int vertices = graph.size();

        for(int i = 1; i < vertices; i++) {
            for(String source : graph.keySet()) {
                for(Edge edge : graph.get(source)) {
                    if(distance.get(source) != Integer.MAX_VALUE &&
                       distance.get(source) + edge.weight < distance.get(edge.destination)) {
                        distance.put(edge.destination, distance.get(source) + edge.weight);
                    }
                }
            }
        }

        System.out.println("Bellman-Ford shortest distances from " + start + ":");

        for(String city : distance.keySet()) {
            System.out.println(start + " -> " + city + " : " + distance.get(city));
        }
    }

    public void floydWarshall() {
        if(graph.isEmpty()) {
            System.out.println("No routes available.");
            return;
        }

        List<String> cities = new ArrayList<>(graph.keySet());
        int n = cities.size();

        int[][] dist = new int[n][n];

        for(int i = 0; i < n; i++) {
            Arrays.fill(dist[i], Integer.MAX_VALUE / 2);
            dist[i][i] = 0;
        }

        for(int i = 0; i < n; i++) {
            String source = cities.get(i);

            for(Edge edge : graph.get(source)) {
                int j = cities.indexOf(edge.destination);
                dist[i][j] = edge.weight;
            }
        }

        for(int k = 0; k < n; k++) {
            for(int i = 0; i < n; i++) {
                for(int j = 0; j < n; j++) {
                    dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);
                }
            }
        }

        System.out.println("Floyd-Warshall All-Pairs Shortest Paths:");

        for(int i = 0; i < n; i++) {
            for(int j = 0; j < n; j++) {
                System.out.println(cities.get(i) + " -> " + cities.get(j) + " : " + dist[i][j]);
            }
        }
    }
}