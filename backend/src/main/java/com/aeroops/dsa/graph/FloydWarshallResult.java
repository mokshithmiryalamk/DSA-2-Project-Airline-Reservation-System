package com.aeroops.dsa.graph;

import java.util.List;
import java.util.Map;

public record FloydWarshallResult(
    String algorithm,
    List<String> nodeIds,
    Map<String, Map<String, Integer>> distanceMatrix,
    Map<String, Map<String, String>> nextHopMatrix,
    boolean hasNegativeCycle,
    List<GraphStep> steps
) {}
