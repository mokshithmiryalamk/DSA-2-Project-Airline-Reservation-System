package com.aeroops.dsa;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class DsaIntegrationTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    @DisplayName("DSA 1: Graph Topology exposes 10 hubs and 17 corridors")
    void testGraphTopology() throws Exception {
        mvc.perform(get("/api/v1/dsa/graph/topology"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nodeCount").value(10))
            .andExpect(jsonPath("$.edgeCount").value(17))
            .andExpect(jsonPath("$.isConnected").value(true));
    }

    @Test
    @DisplayName("DSA 2: BFS and DFS traverse all 10 airport hubs from DEL")
    void testBfsAndDfs() throws Exception {
        var req = Map.of("startNode", "DEL");

        mvc.perform(post("/api/v1/dsa/graph/bfs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.algorithm").value("BFS"))
            .andExpect(jsonPath("$.startNode").value("DEL"))
            .andExpect(jsonPath("$.totalVisited").value(10))
            .andExpect(jsonPath("$.visitedOrder[0]").value("DEL"))
            .andExpect(jsonPath("$.steps", hasSize(greaterThanOrEqualTo(10))));

        mvc.perform(post("/api/v1/dsa/graph/dfs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.algorithm").value("DFS"))
            .andExpect(jsonPath("$.totalVisited").value(10))
            .andExpect(jsonPath("$.visitedOrder[0]").value("DEL"));
    }

    @Test
    @DisplayName("DSA 3: Dijkstra and Bellman-Ford shortest paths parity (DEL->BLR: 1740, BOM->MAA: 1130)")
    void testShortestPaths() throws Exception {
        var req1 = Map.of("startNode", "DEL", "targetNode", "BLR");

        mvc.perform(post("/api/v1/dsa/graph/dijkstra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req1)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.reachable").value(true))
            .andExpect(jsonPath("$.totalDistance").value(1740))
            .andExpect(jsonPath("$.path[0]").value("DEL"))
            .andExpect(jsonPath("$.path[1]").value("BLR"));

        mvc.perform(post("/api/v1/dsa/graph/bellman-ford")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req1)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalDistance").value(1740))
            .andExpect(jsonPath("$.hasNegativeCycle").value(false));

        // BOM to MAA (1130 km)
        var req2 = Map.of("startNode", "BOM", "targetNode", "MAA");
        mvc.perform(post("/api/v1/dsa/graph/dijkstra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req2)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalDistance").value(1130));
    }

    @Test
    @DisplayName("DSA 4: Prim and Kruskal MST agreement (9 edges, 4465 km)")
    void testSpanningTrees() throws Exception {
        var primRes = mvc.perform(post("/api/v1/dsa/graph/prim"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isConnected").value(true))
            .andExpect(jsonPath("$.mstEdges", hasSize(9)))
            .andExpect(jsonPath("$.totalWeight").value(4465))
            .andReturn();

        var kruskalRes = mvc.perform(post("/api/v1/dsa/graph/kruskal"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.isConnected").value(true))
            .andExpect(jsonPath("$.mstEdges", hasSize(9)))
            .andExpect(jsonPath("$.totalWeight").value(4465))
            .andReturn();

        int primWeight = mapper.readTree(primRes.getResponse().getContentAsString()).get("totalWeight").asInt();
        int kruskalWeight = mapper.readTree(kruskalRes.getResponse().getContentAsString()).get("totalWeight").asInt();
        assertEquals(primWeight, kruskalWeight, "Prim and Kruskal total weights must match identically");
    }

    @Test
    @DisplayName("DSA 5: Floyd-Warshall all-pairs shortest paths")
    void testFloydWarshall() throws Exception {
        mvc.perform(post("/api/v1/dsa/graph/floyd-warshall"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nodeIds", hasSize(10)))
            .andExpect(jsonPath("$.distanceMatrix.DEL.DEL").value(0))
            .andExpect(jsonPath("$.distanceMatrix.DEL.BLR").value(1740))
            .andExpect(jsonPath("$.distanceMatrix.BOM.MAA").value(1130))
            .andExpect(jsonPath("$.hasNegativeCycle").value(false));
    }

    @Test
    @DisplayName("DSA 6: BST and AVL operations with rotations and traversals")
    void testBstAndAvl() throws Exception {
        // BST
        var bstReq = Map.of("searchKey", 104);
        mvc.perform(post("/api/v1/dsa/trees/bst")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(bstReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.treeType").value("BST"))
            .andExpect(jsonPath("$.nodeCount").value(7))
            .andExpect(jsonPath("$.found").value(true))
            .andExpect(jsonPath("$.traversals.inorder", contains(101, 102, 104, 105, 106, 107, 109)));

        // AVL with 3 keys triggering RR rotation
        var avlReq = Map.of("initialKeys", List.of(101, 102, 103));
        mvc.perform(post("/api/v1/dsa/trees/avl")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(avlReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.treeType").value("AVL"))
            .andExpect(jsonPath("$.nodeCount").value(3))
            .andExpect(jsonPath("$.root.key").value(102))
            .andExpect(jsonPath("$.lastRotation", containsString("Rotation")));
    }

    @Test
    @DisplayName("DSA 7: B-Tree and B+ Tree (t=3) multiway splits, sequential leaf scan, and range query")
    void testBTreeAndBPlus() throws Exception {
        // B-Tree degree 3
        mvc.perform(post("/api/v1/dsa/trees/btree"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.treeType").value("B-Tree"))
            .andExpect(jsonPath("$.height").value(2))
            .andExpect(jsonPath("$.nodeCount").value(6));

        // B+ Tree sequential leaves
        mvc.perform(post("/api/v1/dsa/trees/bplus"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.treeType").value("B+ Tree"))
            .andExpect(jsonPath("$.nodeCount").value(8))
            .andExpect(jsonPath("$.traversals.sequentialLeaves", contains(10, 20, 30, 40, 50, 60, 70, 80)));

        // B+ Tree range query [25, 65]
        var rangeReq = Map.of("rangeLow", 25, "rangeHigh", 65);
        mvc.perform(post("/api/v1/dsa/trees/bplus/range")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(rangeReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.matchedKeys", contains(30, 40, 50, 60)));
    }

    @Test
    @DisplayName("DSA 8: Segment Tree Range Minimum Query (RMQ) and dynamic point updates")
    void testSegmentTree() throws Exception {
        var req = Map.of(
            "fares", List.of(5000.0, 3000.0, 7000.0, 2000.0, 8000.0, 4000.0),
            "queryLeft", 1,
            "queryRight", 4
        );

        mvc.perform(post("/api/v1/dsa/analytics/segment-tree")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.resultMinimum").value(2000.0))
            .andExpect(jsonPath("$.steps", hasSize(greaterThan(0))));

        // Update point index 3 from 2000.0 to 9000.0 -> minimum in [1, 4] becomes 3000.0
        var updateReq = Map.of(
            "fares", List.of(5000.0, 3000.0, 7000.0, 2000.0, 8000.0, 4000.0),
            "queryLeft", 1,
            "queryRight", 4,
            "updateIndex", 3,
            "updateValue", 9000.0
        );

        mvc.perform(post("/api/v1/dsa/analytics/segment-tree")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updateReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.resultMinimum").value(3000.0));
    }

    @Test
    @DisplayName("DSA 9: Fenwick Tree (Binary Indexed Tree) prefix and range sum queries with LSB updates")
    void testFenwickTree() throws Exception {
        var req = Map.of(
            "fares", List.of(100.0, 200.0, 300.0, 400.0, 500.0),
            "queryLeft", 1,
            "queryRight", 3
        );

        // Sum of indices 1..3 = 200 + 300 + 400 = 900
        mvc.perform(post("/api/v1/dsa/analytics/fenwick-tree")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.resultSum").value(900.0));
    }

    @Test
    @DisplayName("DSA 10: Sorting algorithms (Merge, Quick Lomuto, Heap) and simultaneous benchmark")
    void testSortingSuiteAndBenchmark() throws Exception {
        List<Double> fares = List.of(5200.0, 4100.0, 6800.0, 3200.0, 4100.0, 8900.0);

        // Merge Sort (guaranteed stability on duplicate 4100.0)
        var mergeReq = Map.of("algorithm", "MERGE", "fares", fares);
        mvc.perform(post("/api/v1/dsa/sorting/sort")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(mergeReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sortedArray[0]").value(3200.0))
            .andExpect(jsonPath("$.sortedArray[5]").value(8900.0));

        // Quick Sort (Lomuto partition with fares[high] pivot)
        var quickReq = Map.of("algorithm", "QUICK", "fares", fares);
        mvc.perform(post("/api/v1/dsa/sorting/sort")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(quickReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sortedArray[0]").value(3200.0))
            .andExpect(jsonPath("$.sortedArray[5]").value(8900.0));

        // Heap Sort
        var heapReq = Map.of("algorithm", "HEAP", "fares", fares);
        mvc.perform(post("/api/v1/dsa/sorting/sort")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(heapReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sortedArray[0]").value(3200.0))
            .andExpect(jsonPath("$.sortedArray[5]").value(8900.0));

        // Benchmark Runner
        var benchReq = Map.of("datasetSize", 50, "distribution", "random");
        mvc.perform(post("/api/v1/dsa/sorting/benchmark")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(benchReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.metrics.['Merge Sort']").exists())
            .andExpect(jsonPath("$.metrics.['Quick Sort']").exists())
            .andExpect(jsonPath("$.metrics.['Heap Sort']").exists())
            .andExpect(jsonPath("$.winner").isNotEmpty());
    }

    @Test
    @DisplayName("DSA 11: Stage 5 hardening - accurate unsuccessful tree search, negative weight guards, and QuickSort 10k safety")
    void testStage5HardeningAndValidation() throws Exception {
        // 1. B+ Tree and B-Tree must return found=false when searchKey is missing
        var missingKey = Map.of("searchKey", 999);
        mvc.perform(post("/api/v1/dsa/trees/bplus")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(missingKey)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.found").value(false));

        mvc.perform(post("/api/v1/dsa/trees/btree")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(missingKey)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.found").value(false));

        // 2. Dijkstra must reject negative edge weights with HTTP 400
        var negGraphReq = Map.of(
            "startNode", "DEL",
            "targetNode", "BOM",
            "customEdges", List.of(Map.of("id", "DEL-BOM", "source", "DEL", "destination", "BOM", "weight", -250))
        );
        mvc.perform(post("/api/v1/dsa/graph/dijkstra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(negGraphReq)))
            .andExpect(status().isBadRequest());

        // 3. Bellman-Ford must detect negative cycle on undirected negative edge
        mvc.perform(post("/api/v1/dsa/graph/bellman-ford")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(negGraphReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.hasNegativeCycle").value(true));

        // 4. QuickSort 10,000 sorted elements must not StackOverflowError
        var sortedBench = Map.of("datasetSize", 10000, "distribution", "sorted");
        mvc.perform(post("/api/v1/dsa/sorting/benchmark")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(sortedBench)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.datasetSize").value(10000));

        // 5. Analytics out-of-bounds query returns HTTP 400
        var badRange = Map.of("queryLeft", 5, "queryRight", 2);
        mvc.perform(post("/api/v1/dsa/analytics/segment-tree")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(badRange)))
            .andExpect(status().isBadRequest());

        // 6. Sorting unsupported algorithm returns HTTP 400
        var badAlgo = Map.of("algorithm", "BUBBLE");
        mvc.perform(post("/api/v1/dsa/sorting/sort")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(badAlgo)))
            .andExpect(status().isBadRequest());
    }
}
