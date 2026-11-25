package com.aeroops.dsa.graph;

import java.util.List;

public record GraphRunRequest(
    String startNode,
    String targetNode,
    Boolean syncWithFlights,
    List<GraphEdge> customEdges
) {
    public GraphRunRequest(String startNode, String targetNode, Boolean syncWithFlights) {
        this(startNode, targetNode, syncWithFlights, null);
    }
}
