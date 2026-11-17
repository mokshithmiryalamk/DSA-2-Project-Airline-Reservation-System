package com.aeroops.dsa.graph;

public record GraphEdge(
    String id,
    String source,
    String destination,
    int weight
) implements Comparable<GraphEdge> {

    @Override
    public int compareTo(GraphEdge other) {
        return Integer.compare(this.weight, other.weight);
    }
}
