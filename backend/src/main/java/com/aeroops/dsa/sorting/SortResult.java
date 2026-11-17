package com.aeroops.dsa.sorting;

import java.util.List;

public record SortResult(
    String algorithm,
    int arraySize,
    List<Double> originalArray,
    List<Double> sortedArray,
    int comparisons,
    int swapsOrMoves,
    long executionTimeNanos,
    List<SortStep> steps
) {}
