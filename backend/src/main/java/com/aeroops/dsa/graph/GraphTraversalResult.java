package com.aeroops.dsa.graph;

import java.util.List;

public record GraphTraversalResult(
    String algorithm,
    String startNode,
    List<String> visitedOrder,
    int totalVisited,
    List<GraphStep> steps
) {}
