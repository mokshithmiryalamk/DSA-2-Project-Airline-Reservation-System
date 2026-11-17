package com.aeroops.dsa.graph;

import java.util.List;
import java.util.Map;

public record ShortestPathResult(
    String algorithm,
    String startNode,
    String targetNode,
    boolean reachable,
    int totalDistance,
    List<String> path,
    Map<String, Integer> distances,
    boolean hasNegativeCycle,
    List<GraphStep> steps
) {}
