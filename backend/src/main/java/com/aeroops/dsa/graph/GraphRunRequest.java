package com.aeroops.dsa.graph;

public record GraphRunRequest(
    String startNode,
    String targetNode,
    Boolean syncWithFlights
) {}
