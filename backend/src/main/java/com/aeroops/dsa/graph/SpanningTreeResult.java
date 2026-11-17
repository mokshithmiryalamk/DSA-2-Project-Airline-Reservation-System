package com.aeroops.dsa.graph;

import java.util.List;

public record SpanningTreeResult(
    String algorithm,
    String startNode,
    boolean isConnected,
    int totalWeight,
    List<GraphEdge> mstEdges,
    List<GraphStep> steps
) {}
