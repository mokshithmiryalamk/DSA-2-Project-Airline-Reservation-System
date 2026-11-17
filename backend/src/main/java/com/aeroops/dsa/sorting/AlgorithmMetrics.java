package com.aeroops.dsa.sorting;

public record AlgorithmMetrics(
    String algorithm,
    int comparisons,
    int swapsOrMoves,
    long timeNanos,
    double timeMicros,
    String timeFormatted
) {}
