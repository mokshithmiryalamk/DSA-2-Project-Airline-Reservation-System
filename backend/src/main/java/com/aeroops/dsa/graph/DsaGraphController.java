package com.aeroops.dsa.graph;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dsa/graph")
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
        return ResponseEntity.ok(graphService.bfs(start, graphService.resolveTopology(req)));
    }

    @PostMapping("/dfs")
    public ResponseEntity<GraphTraversalResult> runDfs(@RequestBody(required = false) GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        return ResponseEntity.ok(graphService.dfs(start, graphService.resolveTopology(req)));
    }

    @PostMapping("/dijkstra")
    public ResponseEntity<ShortestPathResult> runDijkstra(@RequestBody(required = false) GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        String target = req != null && req.targetNode() != null ? req.targetNode() : "BLR";
        return ResponseEntity.ok(graphService.dijkstra(start, target, graphService.resolveTopology(req)));
    }

    @PostMapping("/bellman-ford")
    public ResponseEntity<ShortestPathResult> runBellmanFord(@RequestBody(required = false) GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        String target = req != null && req.targetNode() != null ? req.targetNode() : "BLR";
        return ResponseEntity.ok(graphService.bellmanFord(start, target, graphService.resolveTopology(req)));
    }

    @PostMapping("/prim")
    public ResponseEntity<SpanningTreeResult> runPrim(@RequestBody(required = false) GraphRunRequest req) {
        String start = req != null && req.startNode() != null ? req.startNode() : "DEL";
        return ResponseEntity.ok(graphService.prim(start, graphService.resolveTopology(req)));
    }

    @PostMapping("/kruskal")
    public ResponseEntity<SpanningTreeResult> runKruskal(@RequestBody(required = false) GraphRunRequest req) {
        return ResponseEntity.ok(graphService.kruskal(graphService.resolveTopology(req)));
    }

    @PostMapping("/floyd-warshall")
    public ResponseEntity<FloydWarshallResult> runFloydWarshall(@RequestBody(required = false) GraphRunRequest req) {
        return ResponseEntity.ok(graphService.floydWarshall(graphService.resolveTopology(req)));
    }
}
