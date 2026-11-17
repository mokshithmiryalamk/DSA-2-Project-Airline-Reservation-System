package com.aeroops.dsa.graph;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dsa/graph")
@CrossOrigin(origins = "*")
public class DsaGraphController {

    private final GraphService graphService;

    public DsaGraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/topology")
    public ResponseEntity<Map<String, Object>> getTopology(
            @RequestParam(name = "sync", defaultValue = "false") boolean sync) {
        GraphTopology topology = graphService.getTopology(sync);
        return ResponseEntity.ok(Map.of(
            "nodes", topology.getNodes().values(),
            "edges", topology.getEdges(),
            "nodeCount", topology.getNodes().size(),
            "edgeCount", topology.getEdges().size(),
            "isConnected", topology.isConnected()
        ));
    }

    @PostMapping("/bfs")
    public ResponseEntity<GraphTraversalResult> runBfs(@RequestBody(required = false) GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        boolean sync = req != null && Boolean.TRUE.equals(req.syncWithFlights());
        return ResponseEntity.ok(graphService.bfs(start, graphService.getTopology(sync)));
    }

    @PostMapping("/dfs")
    public ResponseEntity<GraphTraversalResult> runDfs(@RequestBody(required = false) GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        boolean sync = req != null && Boolean.TRUE.equals(req.syncWithFlights());
        return ResponseEntity.ok(graphService.dfs(start, graphService.getTopology(sync)));
    }

    @PostMapping("/dijkstra")
    public ResponseEntity<ShortestPathResult> runDijkstra(@RequestBody GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        String target = req != null && req.targetNode() != null ? req.targetNode() : "BLR";
        boolean sync = req != null && Boolean.TRUE.equals(req.syncWithFlights());
        return ResponseEntity.ok(graphService.dijkstra(start, target, graphService.getTopology(sync)));
    }

    @PostMapping("/bellman-ford")
    public ResponseEntity<ShortestPathResult> runBellmanFord(@RequestBody GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        String target = req != null && req.targetNode() != null ? req.targetNode() : "BLR";
        boolean sync = req != null && Boolean.TRUE.equals(req.syncWithFlights());
        return ResponseEntity.ok(graphService.bellmanFord(start, target, graphService.getTopology(sync)));
    }

    @PostMapping("/prim")
    public ResponseEntity<SpanningTreeResult> runPrim(@RequestBody(required = false) GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        boolean sync = req != null && Boolean.TRUE.equals(req.syncWithFlights());
        return ResponseEntity.ok(graphService.prim(start, graphService.getTopology(sync)));
    }

    @PostMapping("/kruskal")
    public ResponseEntity<SpanningTreeResult> runKruskal(@RequestBody(required = false) GraphRunRequest req) {
        boolean sync = req != null && Boolean.TRUE.equals(req.syncWithFlights());
        return ResponseEntity.ok(graphService.kruskal(graphService.getTopology(sync)));
    }

    @PostMapping("/floyd-warshall")
    public ResponseEntity<FloydWarshallResult> runFloydWarshall(@RequestBody(required = false) GraphRunRequest req) {
        boolean sync = req != null && Boolean.TRUE.equals(req.syncWithFlights());
        return ResponseEntity.ok(graphService.floydWarshall(graphService.getTopology(sync)));
    }
}
