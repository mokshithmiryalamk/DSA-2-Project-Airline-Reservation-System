package com.aeroops.dsa.graph;

import java.util.List;
import java.util.Map;

public record GraphStep(
    int stepNumber,
    String type,
    String activeNode,
    List<String> visitedNodes,
    List<String> selectedEdges,
    List<String> queue,
    Map<String, Integer> distances,
    String logMessage
) {}
